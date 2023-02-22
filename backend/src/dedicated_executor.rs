// borrowed from https://github.com/influxdata/influxdb_iox/blob/fe155e15fb2ad166aee66b0458e63c24a8128dd4/query/src/exec/task.rs#L101-L118
//
use parking_lot::Mutex;
use pin_project::{pin_project, pinned_drop};
use std::{pin::Pin, sync::Arc};
use tokio::sync::oneshot::Receiver;
use tokio_util::sync::CancellationToken;
use tracing::log::warn;

use futures::Future;

/// Task that can be added to the executor-internal queue.
///
/// Every task within the executor is represented by a [`Job`] that can be polled by the API user.
struct Task {
    fut: Pin<Box<dyn Future<Output = ()> + Send>>,
    cancel: CancellationToken,

    #[allow(dead_code)]
    task_ref: Arc<()>,
}

impl Task {
    /// Run task.
    ///
    /// This runs the payload or cancels if the linked [`Job`] is dropped.
    async fn run(self) {
        tokio::select! {
            _ = self.cancel.cancelled() => (),
            _ = self.fut => (),
        }
    }
}

/// The type of error that is returned from tasks in this module
#[allow(dead_code)]
pub type Error = tokio::sync::oneshot::error::RecvError;

/// Job within the executor.
///
/// Dropping the job will cancel its linked task.
#[pin_project(PinnedDrop)]
pub struct Job<T> {
    cancel: CancellationToken,
    #[pin]
    rx: Receiver<T>,
}

impl<T> Future for Job<T> {
    type Output = Result<T, Error>;

    fn poll(
        self: Pin<&mut Self>,
        cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Self::Output> {
        let this = self.project();
        this.rx.poll(cx)
    }
}

#[pinned_drop]
impl<T> PinnedDrop for Job<T> {
    fn drop(self: Pin<&mut Self>) {
        self.cancel.cancel();
    }
}

/// Runs futures (and any `tasks` that are `tokio::task::spawned` by
/// them) on a separate tokio Executor
#[derive(Clone)]
pub struct DedicatedExecutor {
    state: Arc<Mutex<State>>,
}

/// Runs futures (and any `tasks` that are `tokio::task::spawned` by
/// them) on a separate tokio Executor
struct State {
    /// Channel for requests -- the dedicated executor takes requests
    /// from here and runs them.
    requests: Option<std::sync::mpsc::Sender<Task>>,

    /// The thread that is doing the work
    thread: Option<std::thread::JoinHandle<()>>,

    /// Task counter (uses Arc strong count).
    task_refs: Arc<()>,
}

impl std::fmt::Debug for DedicatedExecutor {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        // Avoid taking the mutex in debug formatting
        write!(f, "DedicatedExecutor")
    }
}

impl DedicatedExecutor {
    /// Creates a new `DedicatedExecutor` with a dedicated tokio
    /// executor that is separate from the threadpool created via
    /// `[tokio::main]` or similar.
    ///
    /// The worker thread priority is set to low so that such tasks do
    /// not starve other more important tasks (such as answering health checks)
    ///
    /// Follows the example from to stack overflow and spawns a new
    /// thread to install a Tokio runtime "context"
    /// <https://stackoverflow.com/questions/62536566>
    ///
    /// If you try to do this from a async context you see something like
    /// thread 'plan::stringset::tests::test_builder_plan' panicked at 'Cannot
    /// drop a runtime in a context where blocking is not allowed. This
    /// happens when a runtime is dropped from within an asynchronous
    /// context.', .../tokio-1.4.0/src/runtime/blocking/shutdown.rs:51:21
    pub fn new(thread_name: &str, num_threads: usize) -> Self {
        let thread_name = thread_name.to_string();

        let (tx, rx) = std::sync::mpsc::channel::<Task>();

        let thread = std::thread::spawn(move || {
            let runtime = tokio::runtime::Builder::new_multi_thread()
                .enable_all()
                .thread_name(&thread_name)
                .worker_threads(num_threads)
                // .on_thread_start(move || set_current_thread_priority(WORKER_PRIORITY))
                .build()
                .expect("Creating tokio runtime");

            runtime.block_on(async move {
                // Dropping the tokio runtime only waits for tasks to yield not to complete
                //
                // We therefore use a RwLock to wait for tasks to complete
                let join = Arc::new(tokio::sync::RwLock::new(()));

                while let Ok(task) = rx.recv() {
                    let join = Arc::clone(&join);
                    let handle = join.read_owned().await;

                    tokio::task::spawn(async move {
                        task.run().await;
                        std::mem::drop(handle);
                    });
                }

                // Wait for all tasks to finish
                let _ = join.write().await;
            })
        });

        let state = State {
            requests: Some(tx),
            thread: Some(thread),
            task_refs: Arc::new(()),
        };

        Self {
            state: Arc::new(Mutex::new(state)),
        }
    }

    /// Runs the specified Future (and any tasks it spawns) on the
    /// `DedicatedExecutor`.
    ///
    /// Currently all tasks are added to the tokio executor
    /// immediately and compete for the threadpool's resources.
    pub fn spawn<T>(&self, task: T) -> Job<T::Output>
    where
        T: Future + Send + 'static,
        T::Output: Send + 'static,
    {
        let (tx, rx) = tokio::sync::oneshot::channel();

        let fut = Box::pin(async move {
            let task_output = task.await;
            if tx.send(task_output).is_err() {
                warn!("Spawned task output ignored: receiver dropped")
            }
        });
        let cancel = CancellationToken::new();
        let mut state = self.state.lock();
        let task = Task {
            fut,
            cancel: cancel.clone(),
            task_ref: Arc::clone(&state.task_refs),
        };

        if let Some(requests) = &mut state.requests {
            // would fail if someone has started shutdown
            requests.send(task).ok();
        } else {
            warn!("tried to schedule task on an executor that was shutdown");
        }

        Job { rx, cancel }
    }

    /// Number of currently active tasks.
    pub fn tasks(&self) -> usize {
        let state = self.state.lock();

        // the strong count is always `1 + jobs` because of the Arc we hold within Self
        Arc::strong_count(&state.task_refs).saturating_sub(1)
    }

    /// signals shutdown of this executor and any Clones
    pub fn shutdown(&self) {
        // hang up the channel which will cause the dedicated thread
        // to quit
        let mut state = self.state.lock();
        state.requests = None;
    }

    /// Stops all subsequent task executions, and waits for the worker
    /// thread to complete. Note this will shutdown all clones of this
    /// `DedicatedExecutor` as well.
    ///
    /// Only the first all to `join` will actually wait for the
    /// executing thread to complete. All other calls to join will
    /// complete immediately.
    pub fn join(&self) {
        self.shutdown();

        // take the thread out when mutex is held
        let thread = {
            let mut state = self.state.lock();
            state.thread.take()
        };

        // wait for completion while not holding the mutex to avoid
        // deadlocks
        if let Some(thread) = thread {
            thread.join().ok();
        }
    }
}
