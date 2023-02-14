use crate::{
    queue::queue::{Job, Message, Queue},
    routes::collections::{types::CollectionToRefresh, update_collection::update_collection},
    sse::{broadcast::Broadcaster, messages::SSEMessage},
};
use futures::{stream, StreamExt};
use sqlx::PgPool;
use std::{sync::Arc, time::Duration};
use tracing::{info, span, warn, Level};

const CONCURRENCY: usize = 4;

pub async fn run_queue_until_stopped(
    queue: Arc<dyn Queue>,
    broadcaster: Arc<Broadcaster>,
    pool: PgPool,
) -> Result<(), anyhow::Error> {
    run_queue(queue, broadcaster, pool).await
}

async fn run_queue(
    queue: Arc<dyn Queue>,
    broadcaster: Arc<Broadcaster>,
    pool: PgPool,
) -> Result<(), anyhow::Error> {
    loop {
        {
            let span = span!(Level::INFO, "Queue Task");
            let _enter = span.enter();

            let jobs = match queue.pull(CONCURRENCY as u32).await {
                Ok(jobs) => jobs,
                Err(err) => {
                    warn!("Failed to pull jobs: {}", err);
                    tokio::time::sleep(Duration::from_millis(500)).await;
                    Vec::new()
                }
            };

            let number_of_jobs = jobs.len();
            if number_of_jobs > 0 {
                info!("Fetched {} jobs", number_of_jobs);
            }

            stream::iter(jobs)
                .for_each_concurrent(CONCURRENCY, |job| async {
                    let job_id = job.id;

                    let res = match handle_job(job, broadcaster.clone(), pool.clone()).await {
                        Ok(_) => queue.delete_job(job_id).await,
                        Err(err) => {
                            warn!("Job failed: {}", err);
                            queue.fail_job(job_id).await
                        }
                    };

                    match res {
                        Ok(_) => {}
                        Err(err) => {
                            warn!("Deleting job failed: {}", err);
                        }
                    }
                })
                .await;
        }

        // sleep not to overload our database
        tokio::time::sleep(Duration::from_secs(1)).await;
    }
}

async fn handle_job(
    job: Job,
    broadcaster: Arc<Broadcaster>,
    pool: PgPool,
) -> Result<(), anyhow::Error> {
    match &job.message {
        Message::RefreshFeed { feed_id, etag, url } => {
            let update_result = update_collection(
                CollectionToRefresh {
                    id: *feed_id,
                    url: url.clone(),
                    etag: etag.clone(),
                },
                pool,
            )
            .await;

            broadcaster
                .broadcast(SSEMessage::UpdatedFeeds {
                    feed_ids: vec![*feed_id],
                })
                .await;

            update_result.map_err(Into::into)
        }
    }
}
