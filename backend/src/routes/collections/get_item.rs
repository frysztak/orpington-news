use actix_web::{error::InternalError, http::StatusCode, web, HttpResponse};

use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::{
    authentication::UserId,
    routes::{error::JSONError, error_chain_fmt},
    session_state::ID,
};

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

#[derive(thiserror::Error)]
pub enum GetItemError {
    #[error("Article not found")]
    ArticleNotFound(),
    #[error("Something went wrong")]
    UnexpectedError(#[from] anyhow::Error),
}

impl std::fmt::Debug for GetItemError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        error_chain_fmt(self, f)
    }
}

#[tracing::instrument(skip(pool, _user_id, path))]
pub async fn get_item(
    path: web::Path<PathParams>,
    pool: web::Data<PgPool>,
    _user_id: UserId,
) -> Result<HttpResponse, InternalError<GetItemError>> {
    let item = sqlx::query_as::<_, DBCollectionItem>(
        r#"
SELECT
  articles.*
FROM (
  SELECT
    collection_items.*,
    collections.id as collection_id,
    collections.title as collection_title,
    collections.icon as collection_icon
  FROM collections
  INNER JOIN (
  SELECT
    *
  FROM collection_items) collection_items ON collections.id = collection_items.collection_id
WHERE collections.id = $1) articles
WHERE
  articles.id = $2
    "#,
    )
    .bind(path.collection_id)
    .bind(path.item_id)
    .fetch_one(pool.as_ref())
    .await;

    match item {
        Err(e) => match e {
            sqlx::Error::RowNotFound => {
                let response = HttpResponse::NotFound().json(JSONError {
                    status_code: 404,
                    message: "Article not found.".to_string(),
                });
                return Err(InternalError::from_response(
                    GetItemError::ArticleNotFound(),
                    response,
                ));
            }
            _ => {
                return Err(InternalError::new(
                    GetItemError::UnexpectedError(e.into()),
                    StatusCode::INTERNAL_SERVER_ERROR,
                ))
            }
        },
        Ok(item) => Ok(HttpResponse::Ok().json(Into::<CollectionItem>::into(&item))),
    }
}
