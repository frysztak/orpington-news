use crate::{
    queue::queue::{Job, Message, Queue},
    routes::collections::{
        get::get_collections_impl,
        types::CollectionToRefresh,
        update_collection::{commit_update_collection, update_collection, UpdateCollectionResult},
    },
    session_state::ID,
    sse::{
        broadcast::Broadcaster,
        messages::{SSEMessage, UnreadCount},
    },
};
use chrono::Utc;
use futures::StreamExt;
use futures_batch::ChunksTimeoutStreamExt;
use sqlx::PgPool;
use std::sync::Arc;
use std::time::Duration;
use tracing::{info, warn};
use uuid::Uuid;

pub async fn run_queue_until_stopped(
    queue: Arc<dyn Queue>,
    broadcaster: Arc<Broadcaster>,
    pool: PgPool,
) -> Result<(), anyhow::Error> {
    run_queue(queue, broadcaster, pool).await
}

struct UpdateResultWithJobId(Uuid, UpdateCollectionResult);

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
        .map(|job| async move {
            match &job.message {
                Message::RefreshFeed { feed_id, etag, url } => {
                    let update_result = update_collection(CollectionToRefresh {
                        id: *feed_id,
                        url: url.clone(),
                        etag: etag.clone(),
                    })
                    .await;

                    UpdateResultWithJobId(job.id, update_result)
                }
            }
        })
        .buffer_unordered(concurrency)
        .chunks_timeout(20, Duration::from_millis(500))
        .for_each(|results| async {
            match commit_batch(results, &pool, broadcaster.clone(), queue.clone()).await {
                Err(e) => warn!("Failed to commit updates: {}", e),
                _ => {}
            }
        })
        .await;

    Ok(())
}

#[tracing::instrument(skip(results, pool, broadcaster, queue))]
async fn commit_batch(
    results: Vec<UpdateResultWithJobId>,
    pool: &PgPool,
    broadcaster: Arc<Broadcaster>,
    queue: Arc<dyn Queue>,
) -> Result<(), anyhow::Error> {
    let mut transaction = pool.begin().await?;
    let mut feed_ids = vec![];

    for UpdateResultWithJobId(job_id, result) in results {
        match result {
            Ok(data) => {
                let collection_id = (&data).get_collection_id();
                commit_update_collection(data, &mut transaction).await?;
                queue.delete_job(job_id).await?;
                feed_ids.push(collection_id);
            }
            Err(e) => {
                warn!("Feed failed to update: {}", e);
                queue.fail_job(job_id).await?;
                feed_ids.push(e.get_collection_id());
            }
        }
    }

    let unread_count = match get_unread_map(2, &pool).await {
        Ok(unread_count) => Some(unread_count),
        _ => None,
    };

    info!("Committing {:#?}", feed_ids);
    transaction.commit().await?;

    broadcaster
        .broadcast(SSEMessage::UpdatedFeeds {
            feed_ids,
            unread_count,
        })
        .await;

    Ok(())
}

async fn get_unread_map(user_id: ID, pool: &PgPool) -> Result<UnreadCount, sqlx::Error> {
    let updated_at = Utc::now();
    let collections = get_collections_impl(pool, user_id).await?;

    let counts = collections
        .into_iter()
        .map(|c| (c.id, c.unread_count))
        .collect();

    Ok(UnreadCount { counts, updated_at })
}
