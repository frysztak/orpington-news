use actix_web::{error::InternalError, web, HttpResponse};
use futures::future::join_all;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::{
    routes::{collections::types::CollectionToRefresh, error::GenericError},
    session_state::ID,
};

use super::update_collection::update_collection;

#[derive(Deserialize)]
pub struct PathParams {
    collection_id: ID,
}

#[derive(Serialize)]
struct Response {
    ids: Vec<ID>,
}

#[tracing::instrument(skip(pool, path))]
pub async fn refresh_collection(
    path: web::Path<PathParams>,
    pool: web::Data<PgPool>,
) -> Result<HttpResponse, InternalError<GenericError>> {
    let collections = sqlx::query_as!(
        CollectionToRefresh,
        r#"
WITH children_ids AS (
    SELECT * FROM get_collection_children_ids($1)
  )
  SELECT
    collections.id, url as "url!", etag
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

    let results = join_all(
        collections
            .into_iter()
            .map(|c| update_collection(c.to_owned(), pool.as_ref()))
            .collect::<Vec<_>>(),
    )
    .await;

    for failed_update in results.iter().filter_map(|r| match &r {
        Ok(_) => None,
        Err(err) => Some(err),
    }) {
        tracing::warn!("{}", failed_update);
    }

    let ids = sqlx::query_scalar!(
        r#"
SELECT id as "id!" FROM get_collection_children_ids($1)
"#,
        path.collection_id
    )
    .fetch_all(pool.as_ref())
    .await
    .map_err(Into::into)
    .map_err(GenericError::UnexpectedError)?;

    Ok(HttpResponse::Ok().json(Response { ids }))
}
