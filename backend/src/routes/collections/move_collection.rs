use actix_web::{error::InternalError, web, HttpResponse};
use serde::Deserialize;
use sqlx::PgPool;

use crate::{authentication::UserId, routes::error::GenericError, session_state::ID};

use super::get::get_collections_impl;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MoveCollectionData {
    collection_id: ID,
    new_parent_id: Option<ID>,
    new_order: i32,
}

#[tracing::instrument(skip(pool, body))]
pub async fn move_collection(
    pool: web::Data<PgPool>,
    body: web::Json<MoveCollectionData>,
    user_id: UserId,
) -> Result<HttpResponse, InternalError<GenericError>> {
    let user_id: ID = user_id.into();

    let parent_id = match body.new_parent_id {
        Some(id) => id,
        None => sqlx::query_scalar!(
            r#"
            SELECT home_id
            FROM users
            WHERE id = $1"#,
            user_id
        )
        .fetch_one(pool.as_ref())
        .await
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)?,
    };

    sqlx::query!(
        r#"
CALL move_collection($1, $2, $3)
    "#,
        body.collection_id,
        parent_id,
        body.new_order
    )
    .execute(pool.as_ref())
    .await
    .map_err(Into::into)
    .map_err(GenericError::UnexpectedError)?;

    sqlx::query!(
        r#"
CALL preferences_prune_expanded_collections($1)
    "#,
        user_id
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

    Ok(HttpResponse::Ok().json(collections))
}
