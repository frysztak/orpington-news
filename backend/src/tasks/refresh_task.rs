use std::{sync::Arc, time::Duration};

use sqlx::PgPool;
use tracing::{info, span, warn, Level};

use crate::{
    queue::queue::{Message, Queue},
    routes::collections::types::CollectionToRefresh,
};

pub async fn run_refresh_until_stopped(
    queue: Arc<dyn Queue>,
    pool: PgPool,
) -> Result<(), anyhow::Error> {
    run_refresh(queue, pool).await
}

async fn run_refresh(queue: Arc<dyn Queue>, pool: PgPool) -> Result<(), anyhow::Error> {
    loop {
        {
            let span = span!(Level::INFO, "Collection Refresh Task");
            let _enter = span.enter();

            let collections = sqlx::query_as!(
                CollectionToRefresh,
                r#"
SELECT
  id,
  user_id as "owner_id",
  url as "url!",
  etag
FROM
  collections
WHERE
  url IS NOT NULL
  AND (date_updated + refresh_interval * interval '1 minute' <= now()
    OR date_updated IS NULL);
        "#
            )
            .fetch_all(&pool)
            .await;

            let collections = match collections {
                Ok(jobs) => jobs,
                Err(err) => {
                    warn!("Failed to pull Collections: {}", err);
                    tokio::time::sleep(Duration::from_millis(500)).await;
                    Vec::new()
                }
            };

            let number_of_collections = collections.len();
            if number_of_collections > 0 {
                info!("Fetched {} Collections", number_of_collections);
            };

            let jobs: Vec<Message> = collections
                .into_iter()
                .map(|c| Message::RefreshFeed {
                    user_id: c.owner_id,
                    feed_id: c.id,
                    url: c.url,
                    etag: c.etag,
                })
                .collect();

            if let Err(err) = queue.push_bulk(jobs, None, None).await {
                warn!("Failed to push tasks into queue: {}", err);
            }
        }

        tokio::time::sleep(Duration::from_secs(60*5)).await;
    }
}
