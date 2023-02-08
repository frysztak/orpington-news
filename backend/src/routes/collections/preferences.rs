use actix_web::{error::InternalError, web, HttpResponse};
use serde::Deserialize;
use sqlx::PgPool;

use crate::{authentication::UserId, routes::error::GenericError, session_state::ID};

#[derive(Deserialize)]
pub struct PathParams {
    collection_id: ID,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Body {
    layout: Option<String>,
    filter: Option<String>,
    grouping: Option<String>,
    sort_by: Option<String>,
}

#[tracing::instrument(skip(pool, path, body))]
pub async fn preferences(
    pool: web::Data<PgPool>,
    path: web::Path<PathParams>,
    body: web::Json<Body>,
    _user_id: UserId,
) -> Result<HttpResponse, InternalError<GenericError>> {
    sqlx::query!(
        r#"
WITH old AS (
  SELECT * FROM collections WHERE id = $1
)
UPDATE collections
SET
  layout   = COALESCE($2, old.layout),
  filter   = COALESCE($3, old.filter),
  grouping = COALESCE($4, old.grouping),
  sort_by  = COALESCE($5, old.sort_by)
FROM old
WHERE collections.id = $1
"#,
        path.collection_id,
        body.layout,
        body.filter,
        body.grouping,
        body.sort_by,
    )
    .execute(pool.as_ref())
    .await
    .map_err(Into::into)
    .map_err(GenericError::UnexpectedError)?;

    Ok(HttpResponse::Ok().json(true))
}
