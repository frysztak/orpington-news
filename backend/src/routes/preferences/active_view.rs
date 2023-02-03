use actix_web::{error::InternalError, web, HttpResponse};
use serde::Deserialize;
use sqlx::PgPool;

use crate::{authentication::UserId, routes::error::GenericError, session_state::ID};

use super::get::get_preferences_impl;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ActiveViewData {
    active_collection_id: ID,
}

#[tracing::instrument(skip(pool, body))]
pub async fn active_view(
    pool: web::Data<PgPool>,
    body: web::Json<ActiveViewData>,
    user_id: UserId,
) -> Result<HttpResponse, InternalError<GenericError>> {
    let user_id: ID = user_id.into();

    sqlx::query!(
        r#"
UPDATE
  preferences p
SET
  active_collection_id = $1
WHERE
  p.user_id = $2
    "#,
        body.active_collection_id,
        user_id
    )
    .execute(pool.as_ref())
    .await
    .map_err(Into::into)
    .map_err(GenericError::UnexpectedError)?;

    get_preferences_impl(pool.as_ref(), user_id)
        .await
        .map(|preferences| HttpResponse::Ok().json(preferences))
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)
        .map_err(Into::<InternalError<GenericError>>::into)
}
