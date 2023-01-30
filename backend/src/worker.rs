use crate::queue::queue::{Job, Message, Queue};
use futures::{stream, StreamExt};
use std::{sync::Arc, time::Duration};

const CONCURRENCY: usize = 4;

pub async fn run_worker_until_stopped(queue: Arc<dyn Queue>) -> Result<(), anyhow::Error> {
    run_worker(queue).await
}

async fn run_worker(queue: Arc<dyn Queue>) -> Result<(), anyhow::Error> {
    loop {
        let jobs = match queue.pull(CONCURRENCY as u32).await {
            Ok(jobs) => jobs,
            Err(err) => {
                println!("run_worker: pulling jobs: {}", err);
                tokio::time::sleep(Duration::from_millis(500)).await;
                Vec::new()
            }
        };

        let number_of_jobs = jobs.len();
        if number_of_jobs > 0 {
            println!("Fetched {} jobs", number_of_jobs);
        }

        stream::iter(jobs)
            .for_each_concurrent(CONCURRENCY, |job| async {
                let job_id = job.id;

                let res = match handle_job(job).await {
                    Ok(_) => queue.delete_job(job_id).await,
                    Err(err) => {
                        println!("run_worker: handling job({}): {}", job_id, &err);
                        queue.fail_job(job_id).await
                    }
                };

                match res {
                    Ok(_) => {}
                    Err(err) => {
                        println!("run_worker: deleting / failing job: {}", &err);
                    }
                }
            })
            .await;

        // sleep not to overload our database
        tokio::time::sleep(Duration::from_secs(30)).await;
    }
}

async fn handle_job(job: Job) -> Result<(), anyhow::Error> {
    match job.message {
        message @ Message::RefreshFeed { .. } => {
            println!("Refresh feed: {:?}", &message);
        }
    };

    Ok(())
}
