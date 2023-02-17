use actix_web::{error::InternalError, web, HttpResponse};
use serde::Deserialize;
use sqlx::PgPool;

use crate::{
    authentication::UserId,
    defaults::{DEFAULT_COLLECTION_ICON, DEFAULT_REFRESH_INTERVAL},
    routes::{
        error::{GenericError, JSONError},
        preferences::expand_collapse::expand_collapse_impl,
    },
    session_state::ID,
};

use super::get::get_collections_impl;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PutCollectionData {
    id: ID,
    title: String,
    icon: Option<String>,
    parent_id: Option<ID>,
    description: Option<String>,
    url: String,
    refresh_interval: Option<i32>,
}

#[tracing::instrument(skip(pool, body))]
pub async fn put_collection(
    pool: web::Data<PgPool>,
    body: web::Json<PutCollectionData>,
    user_id: UserId,
) -> Result<HttpResponse, InternalError<GenericError>> {
    let user_id: ID = user_id.into();

    if Some(body.id) == body.parent_id {
        return Ok(HttpResponse::InternalServerError().json(JSONError {
            message: "Collection cannot be its own parent".to_string(),
            status_code: 500,
        }));
    }

    let mut transaction = pool
        .begin()
        .await
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)?;

    let current_parent_id = sqlx::query_scalar!(
        r#"
SELECT parent_id
FROM collections
WHERE id = $1
    "#,
        body.id,
    )
    .fetch_one(&mut transaction)
    .await
    .map_err(Into::into)
    .map_err(GenericError::UnexpectedError)?;

    if current_parent_id != body.parent_id {
        sqlx::query!(
            r#"
            CALL move_collection($1, $2, $3)
            "#,
            body.id,
            body.parent_id,
            i32::MAX
        )
        .execute(&mut transaction)
        .await
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)?;
    }

    let normalized_url = normalize_url_rs::normalize_url(
        &body.url,
        normalize_url_rs::OptionsBuilder::default().build().unwrap(),
    )
    .map_err(Into::into)
    .map_err(GenericError::UnexpectedError)?;

    sqlx::query!(
        r#"
UPDATE
  collections
SET
  title = $1,
  icon = $2,
  parent_id = $3,
  description = $4,
  url = $5,
  refresh_interval = $6
WHERE
  id = $7
            "#,
        body.title,
        body.icon
            .to_owned()
            .unwrap_or(DEFAULT_COLLECTION_ICON.to_string()),
        body.parent_id,
        body.description,
        normalized_url,
        body.refresh_interval.unwrap_or(DEFAULT_REFRESH_INTERVAL),
        body.id
    )
    .execute(&mut transaction)
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
