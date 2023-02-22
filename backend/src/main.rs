use backend::config::read_config;
use backend::dedicated_executor::DedicatedExecutor;
use backend::queue::postgres::PostgresQueue;
use backend::queue::queue::Queue;
use backend::sse::broadcast::Broadcaster;
use backend::startup::Application;
use backend::tasks::queue_task::run_queue_until_stopped;
use backend::tasks::refresh_task::run_refresh_until_stopped;
use backend::telemetry::{get_subscriber, init_subscriber};
use dotenvy::dotenv;
use sqlx::postgres::PgPoolOptions;
use std::fmt::{Debug, Display};
use std::sync::Arc;

#[actix_web::main]
async fn main() -> anyhow::Result<()> {
    let subscriber = get_subscriber("backend".into(), "info".into(), std::io::stdout);
    init_subscriber(subscriber);

    if let Err(err) = dotenv() {
        tracing::warn!("Reading .env failed with {}", err);
    }
    let config = read_config().expect("Failed to read app config");

    let db_pool = PgPoolOptions::new()
        .acquire_timeout(std::time::Duration::from_secs(2))
        .connect_with(config.database.get_db_options())
        .await?;

    sqlx::migrate!("./migrations").run(&db_pool).await?;

    let queue = Arc::new(PostgresQueue::new(db_pool.clone()));
    // clear jobs stuck in 'running' state (because e.g. backend process got killed)
    queue.clear_running_jobs().await?;

    let broadcaster = Broadcaster::create();
    let queue_exec = DedicatedExecutor::new("TaskQueue DedicatedExecutor", num_cpus::get());
    let queue_task = queue_exec.spawn(run_queue_until_stopped(
        queue.clone(),
        broadcaster.clone(),
        db_pool.clone(),
    ));
    let refresh_task = tokio::spawn(run_refresh_until_stopped(queue.clone(), db_pool.clone()));

    let application =
        Application::build(&config, &db_pool, queue.clone(), broadcaster.clone()).await?;
    let application_task = tokio::spawn(application.run_until_stopped());

    tokio::select! {
        o = application_task => report_exit("API", o),
        o = queue_task => report_exit("Queue worker", o),
        o = refresh_task => report_exit("Refresh worker", o),
    };

    Ok(())
}

fn report_exit(
    task_name: &str,
    outcome: Result<Result<(), impl Debug + Display>, impl Debug + Display>,
) {
    match outcome {
        Ok(Ok(())) => {
            tracing::info!("{} has exited", task_name)
        }
        Ok(Err(e)) => {
            tracing::error!(
                error.cause_chain = ?e,
                error.message = %e,
                "{} failed",
                task_name
            )
        }
        Err(e) => {
            tracing::error!(
                error.cause_chain = ?e,
                error.message = %e,
                "{}' task failed to complete",
                task_name
            )
        }
    }
}
