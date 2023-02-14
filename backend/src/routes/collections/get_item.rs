use actix_web::{error::InternalError, web, HttpResponse};

use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::{authentication::UserId, routes::error::GenericError, session_state::ID};

use super::get_items::{CollectionItem, DBCollectionItem};

#[derive(Debug, sqlx::FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct CollectionItemCollection {
    id: ID,
    title: String,
    icon: String,
}

#[derive(Deserialize)]
pub struct PathParams {
    collection_id: ID,
    item_id: ID,
}

#[tracing::instrument(skip(pool, _user_id, path))]
pub async fn get_item(
    path: web::Path<PathParams>,
    pool: web::Data<PgPool>,
    _user_id: UserId,
) -> Result<HttpResponse, InternalError<GenericError>> {
    let item = sqlx::query_as::<_, DBCollectionItem>(r#"
SELECT
  articles.*
FROM (
  SELECT
    collection_items.*,
    collections.id as collection_id,
    collections.title as collection_title,
    collections.icon as collection_icon,
    lag(collection_items.id, 1) OVER (PARTITION BY collection_items.collection_id ORDER BY date_published DESC) previous_id,
    lead(collection_items.id, 1) OVER (PARTITION BY collection_items.collection_id ORDER BY date_published DESC) next_id
  FROM collections
  INNER JOIN (
  SELECT
    *
  FROM collection_items) collection_items ON collections.id = collection_items.collection_id
WHERE collections.id = $1) articles
WHERE
  articles.id = $2
    "#).bind(path.collection_id).bind(path.item_id)
    .fetch_one(pool.as_ref())
    .await
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)?;

    Ok(HttpResponse::Ok().json(Into::<CollectionItem>::into(&item)))
}
