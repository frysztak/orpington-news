use crate::{
    queue::queue::{Job, Message, Queue},
    routes::collections::{
        get::get_collections_impl, types::CollectionToRefresh, update_collection::update_collection,
    },
    session_state::ID,
    sse::{
        broadcast::Broadcaster,
        messages::{SSEMessage, UnreadCount},
    },
};
use chrono::Utc;
use futures::{stream, StreamExt};
use sqlx::PgPool;
use std::{sync::Arc, time::Duration};
use tracing::{info, span, warn, Level};

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
    let concurrency = num_cpus::get();

    loop {
        {
            let span = span!(Level::INFO, "Queue Task");
            let _enter = span.enter();

            let jobs = match queue.pull(concurrency as u32 * 2).await {
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
                .for_each_concurrent(concurrency, |job| async {
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
                pool.clone(),
            )
            .await;

            let unread_count = match get_unread_map(*feed_id, &pool).await {
                Ok(unread_count) => Some(unread_count),
                _ => None,
            };

            broadcaster
                .broadcast(SSEMessage::UpdatedFeeds {
                    feed_ids: vec![*feed_id],
                    unread_count,
                })
                .await;

            update_result.map_err(Into::into)
        }
    }
}

async fn get_unread_map(feed_id: ID, pool: &PgPool) -> Result<UnreadCount, sqlx::Error> {
    let collection_owner =
        sqlx::query_scalar!(r#"SELECT user_id FROM collections WHERE id = $1"#, feed_id)
            .fetch_one(pool)
            .await?;

    let updated_at = Utc::now();
    let collections = get_collections_impl(pool, collection_owner).await?;

    let counts = collections
        .into_iter()
        .map(|c| (c.id, c.unread_count))
        .collect();

    Ok(UnreadCount { counts, updated_at })
}
