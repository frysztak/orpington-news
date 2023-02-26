use actix_web::{error::InternalError, web, HttpResponse};
use serde::Deserialize;
use sqlx::PgPool;

use crate::{
    authentication::UserId,
    defaults::{DEFAULT_COLLECTION_ICON, DEFAULT_REFRESH_INTERVAL},
    routes::{error::GenericError, preferences::expand_collapse::expand_collapse_impl},
    session_state::ID,
};

use super::{
    get::get_collections_impl,
    types::CollectionToRefresh,
    update_collection::{commit_update_collection, update_collection},
};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PostCollectionData {
    title: String,
    icon: Option<String>,
    parent_id: Option<ID>,
    description: Option<String>,
    url: String,
    refresh_interval: Option<i32>,
    layout: Option<String>,
    order: Option<i32>,
}

#[tracing::instrument(skip(pool, body))]
pub async fn post_collection(
    pool: web::Data<PgPool>,
    body: web::Json<PostCollectionData>,
    user_id: UserId,
) -> Result<HttpResponse, InternalError<GenericError>> {
    let user_id: ID = user_id.into();

    let default_collection_layout = sqlx::query_scalar!(
        r#"
SELECT
  default_collection_layout
FROM
  preferences
WHERE
  user_id = $1
    "#,
        user_id
    )
    .fetch_one(pool.as_ref())
    .await
    .map_err(Into::into)
    .map_err(GenericError::UnexpectedError)?;

    let home_id = sqlx::query_scalar!(
        r#"
SELECT
  home_id
FROM
  users
WHERE
  id = $1
    "#,
        user_id
    )
    .fetch_one(pool.as_ref())
    .await
    .map_err(Into::into)
    .map_err(GenericError::UnexpectedError)?;

    let mut transaction = pool
        .begin()
        .await
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)?;

    let collection_id = sqlx::query_scalar!(
        r#"
INSERT INTO collections (
  "user_id",
  "title",
  "icon",
  "order",
  "parent_id",
  "description",
  "url",
  "refresh_interval",
  "layout")
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING id
    "#,
        user_id,
        body.title,
        body.icon
            .to_owned()
            .unwrap_or(DEFAULT_COLLECTION_ICON.to_string()),
        body.order.unwrap_or(i32::MAX), // // put new collection at the end
        body.parent_id.unwrap_or(home_id),
        body.description,
        body.url,
        body.refresh_interval.unwrap_or(DEFAULT_REFRESH_INTERVAL),
        body.layout.to_owned().unwrap_or(default_collection_layout)
    )
    .fetch_one(&mut transaction)
    .await
    .map_err(Into::into)
    .map_err(GenericError::UnexpectedError)?;

    sqlx::query!(
        r#"
CALL collections_recalculate_order()
    "#
    )
    .execute(&mut transaction)
    .await
    .map_err(Into::into)
    .map_err(GenericError::UnexpectedError)?;

    if let Some(parent_id) = body.parent_id {
        expand_collapse_impl(&mut transaction, "add", user_id, parent_id)
            .await
            .map_err(Into::into)
            .map_err(GenericError::UnexpectedError)?;

        sqlx::query!(
            r#"
CALL preferences_prune_expanded_collections($1)
            "#,
            user_id
        )
        .execute(&mut transaction)
        .await
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)?;
    }

    let update_result = update_collection(CollectionToRefresh {
        owner_id: user_id,
        id: collection_id,
        url: body.url.clone(),
        etag: None,
    })
    .await
    .map_err(Into::into)
    .map_err(GenericError::UnexpectedError)?;

    commit_update_collection(update_result, &mut transaction)
        .await
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)?;

    transaction
        .commit()
        .await
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)?;

    let collections = get_collections_impl(pool.as_ref(), user_id)
        .await
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)
        .map_err(Into::<InternalError<GenericError>>::into)?;

    Ok(HttpResponse::Ok().json(collections))
}
