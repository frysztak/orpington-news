use actix_web::{error::InternalError, web, HttpResponse};
use serde::Deserialize;
use sqlx::PgPool;

use super::get::get_preferences_impl;
use crate::{authentication::UserId, routes::error::GenericError, session_state::ID};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct PutPreferencesData {
    default_collection_layout: String,
    avatar_style: String,
}

#[tracing::instrument(skip(pool, user_id, body))]
pub async fn put_preferences(
    pool: web::Data<PgPool>,
    user_id: UserId,
    body: web::Json<PutPreferencesData>,
) -> Result<HttpResponse, InternalError<GenericError>> {
    let user_id: ID = user_id.into();

    let mut transaction = pool
        .begin()
        .await
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)?;

    sqlx::query!(
        r#"
UPDATE
  preferences p
SET
  default_collection_layout = $1,
  avatar_style = $2
WHERE
  p.user_id = $3
"#,
        body.default_collection_layout,
        body.avatar_style,
        user_id,
    )
    .execute(&mut *transaction)
    .await
    .map_err(Into::into)
    .map_err(GenericError::UnexpectedError)?;

    let preferences = get_preferences_impl(&mut transaction, user_id)
        .await
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)?;

    transaction
        .commit()
        .await
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)?;

    Ok(HttpResponse::Ok().json(preferences))
}
