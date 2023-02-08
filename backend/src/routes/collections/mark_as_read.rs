use actix_web::{error::InternalError, web, HttpResponse};
use chrono::{serde::ts_seconds, DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::{authentication::UserId, routes::error::GenericError, session_state::ID};

use super::{get::get_collections_impl, types::Collection};

#[derive(Deserialize)]
pub struct PathParams {
    collection_id: ID,
}

#[derive(Serialize)]
pub struct Response {
    ids: Vec<ID>,
    collections: Vec<Collection>,
    #[serde(with = "ts_seconds")]
    timestamp: DateTime<Utc>,
}

#[tracing::instrument(skip(pool, path))]
pub async fn mark_as_read(
    pool: web::Data<PgPool>,
    path: web::Path<PathParams>,
    user_id: UserId,
) -> Result<HttpResponse, InternalError<GenericError>> {
    let user_id: ID = user_id.into();

    let ids = sqlx::query_scalar!(
        r#"SELECT id as "id!" FROM get_collection_children_ids($1)"#,
        path.collection_id
    )
    .fetch_all(pool.as_ref())
    .await
    .map_err(Into::into)
    .map_err(GenericError::UnexpectedError)?;

    let timestamp = Utc::now();

    sqlx::query!(
        r#"
UPDATE
  collection_items
SET
  date_read = $1
WHERE
  collection_id = ANY($2)
"#,
        timestamp,
        &ids
    )
    .execute(pool.as_ref())
    .await
    .map_err(Into::into)
    .map_err(GenericError::UnexpectedError)?;

    let collections = get_collections_impl(pool.as_ref(), user_id)
        .await
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)
        .map_err(Into::<InternalError<GenericError>>::into)?;

    Ok(HttpResponse::Ok().json(Response {
        ids,
        collections,
        timestamp,
    }))
}
