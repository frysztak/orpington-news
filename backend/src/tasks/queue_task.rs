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
use futures::StreamExt;
use sqlx::PgPool;
use std::sync::Arc;
use tracing::warn;

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

    let mut listener = queue.get_listener().await?;
    listener.listen("queue.new_task").await?;

    listener
        .into_stream()
        .filter_map(|notification| async move {
            match notification {
                Ok(n) => match serde_json::from_str::<Job>(n.payload()) {
                    Ok(job) => Some(job),
                    Err(e) => {
                        warn!(
                            "Failed to parse notification: {}. Payload: {}",
                            e,
                            n.payload()
                        );
                        None
                    }
                },
                Err(e) => {
                    warn!("Failed to read notification: {}", e);
                    None
                }
            }
        })
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

    Ok(())
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
