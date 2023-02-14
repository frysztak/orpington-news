use actix_web::{error::InternalError, web, HttpResponse};
use chrono::{serde::ts_seconds, DateTime, Utc};
use serde::Deserialize;
use sqlx::PgPool;

use crate::{
    authentication::UserId,
    routes::error::{GenericError, JSONError},
    session_state::ID,
};

#[derive(Deserialize)]
pub struct PathParams {
    collection_id: ID,
    item_id: ID,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Body {
    #[serde(with = "ts_seconds")]
    date_read: DateTime<Utc>,
}

#[tracing::instrument(skip(pool, path, body))]
pub async fn date_read(
    pool: web::Data<PgPool>,
    path: web::Path<PathParams>,
    body: web::Json<Body>,
    _user_id: UserId,
) -> Result<HttpResponse, InternalError<GenericError>> {
    let count = sqlx::query_scalar!(
        r#"
WITH rows AS (
  UPDATE
    collection_items
  SET
    date_read = $1 
  WHERE
    id = $2
    AND collection_id = $3
  RETURNING 1
)
SELECT count(*) as "count!" FROM rows
"#,
        body.date_read,
        path.item_id,
        path.collection_id
    )
    .fetch_one(pool.as_ref())
    .await
    .map_err(Into::into)
    .map_err(GenericError::UnexpectedError)?;

    match count {
        0 => Ok(HttpResponse::NotFound().json(JSONError {
            status_code: 404,
            message: "Article not found.".to_string(),
        })),
        _ => Ok(HttpResponse::Ok().json(true)),
    }
}
