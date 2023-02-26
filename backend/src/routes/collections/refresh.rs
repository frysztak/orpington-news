use actix_web::{error::InternalError, web, HttpResponse};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::{
    queue::queue::{Message, Queue, TaskPriority},
    routes::{collections::types::CollectionToRefresh, error::GenericError},
    session_state::ID,
    sse::{broadcast::Broadcaster, messages::SSEMessage}, authentication::UserId,
};

#[derive(Deserialize)]
pub struct PathParams {
    collection_id: ID,
}

#[derive(Serialize)]
struct Response {
    ids: Vec<ID>,
}

#[tracing::instrument(skip(pool, path, broadcaster))]
pub async fn refresh_collection(
    path: web::Path<PathParams>,
    pool: web::Data<PgPool>,
    broadcaster: web::Data<Broadcaster>,
    task_queue: web::Data<dyn Queue>,
    user_id: UserId,
) -> Result<HttpResponse, InternalError<GenericError>> {
    let user_id: ID = user_id.into();

    let collections = sqlx::query_as!(
        CollectionToRefresh,
        r#"
WITH children_ids AS (
    SELECT * FROM get_collection_children_ids($1)
  )
  SELECT
    collections.user_id as "owner_id",
    collections.id,
    url as "url!",
    etag
  FROM
    collections, children_ids
  WHERE
    url IS NOT NULL
    AND collections.id = children_ids.id
"#,
        path.collection_id
    )
    .fetch_all(pool.as_ref())
    .await
    .map_err(Into::into)
    .map_err(GenericError::UnexpectedError)?;

    let feed_ids = collections.iter().map(|c| c.id).collect();
    broadcaster
        .send(user_id, SSEMessage::UpdatingFeeds { feed_ids })
        .await;

    let jobs = collections
        .iter()
        .map(|c| Message::RefreshFeed {
            user_id,
            feed_id: c.id,
            etag: c.etag.clone(),
            url: c.url.clone(),
        })
        .collect();

    task_queue
        .push_bulk(jobs, None, Some(TaskPriority::High))
        .await
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)?;

    Ok(HttpResponse::Ok().json(true))
}
