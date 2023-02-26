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
use futures_util::stream;
use sqlx::PgPool;
use std::time::Duration;
use std::{collections::HashMap, sync::Arc};
use tracing::{info, warn};
use uuid::Uuid;

pub async fn run_queue_until_stopped(
    queue: Arc<dyn Queue>,
    broadcaster: Arc<Broadcaster>,
    pool: PgPool,
) -> Result<(), anyhow::Error> {
    run_queue(queue, broadcaster, pool).await
}

struct UpdateResultWithJobId(Uuid, ID, UpdateCollectionResult);

async fn run_queue(
    queue: Arc<dyn Queue>,
    broadcaster: Arc<Broadcaster>,
    pool: PgPool,
) -> Result<(), anyhow::Error> {
    let concurrency = num_cpus::get();

    let mut listener = queue.get_listener().await?;
    listener.listen("queue.new_task").await?;

    let existing_tasks_vec = queue.pull().await?;
    info!("Pulled {} existing queue tasks", existing_tasks_vec.len());

    let existing_tasks = stream::iter(existing_tasks_vec);
    let incoming_tasks = listener
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
        });

    existing_tasks
        .chain(incoming_tasks)
        .map(|job| async move {
            match &job.message {
                Message::RefreshFeed {
                    user_id,
                    feed_id,
                    etag,
                    url,
                } => {
                    let update_result = update_collection(CollectionToRefresh {
                        owner_id: *user_id,
                        id: *feed_id,
                        url: url.clone(),
                        etag: etag.clone(),
                    })
                    .await;

                    UpdateResultWithJobId(job.id, *user_id, update_result)
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
    // let mut feed_ids = vec![];

    let mut unread_counts = HashMap::<ID, Option<UnreadCount>>::new();
    let mut feed_ids = HashMap::<ID, Vec<ID>>::new();

    for UpdateResultWithJobId(job_id, user_id, result) in results {
        let collection_id: ID;

        match result {
            Ok(data) => {
                collection_id = (&data).get_collection_id();
                commit_update_collection(data, &mut transaction).await?;
                queue.delete_job(job_id, Some(&mut transaction)).await?;
            }
            Err(e) => {
                collection_id = e.get_collection_id();
                warn!("Feed failed to update: {}", e);
                queue.fail_job(job_id, Some(&mut transaction)).await?;
            }
        }

        unread_counts.insert(user_id, None);
        feed_ids
            .entry(user_id)
            .or_insert(vec![])
            .push(collection_id);
    }

    let user_ids: Vec<ID> = unread_counts.keys().cloned().collect();
    for user_id in user_ids {
        unread_counts.insert(user_id, get_unread_map(user_id, &pool).await.ok());
    }

    info!("Committing {:#?}", feed_ids);
    transaction.commit().await?;

    for ((user_id, unread_count), (_, feed_ids)) in
        unread_counts.into_iter().zip(feed_ids.into_iter())
    {
        broadcaster
            .send(
                user_id,
                SSEMessage::UpdatedFeeds {
                    feed_ids,
                    unread_count,
                },
            )
            .await;
    }

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
