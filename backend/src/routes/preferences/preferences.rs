use actix_web::{error::InternalError, web, HttpResponse};
use serde::Serialize;
use sqlx::PgPool;

use crate::{authentication::UserId, routes::error_chain_fmt, session_state::ID};

#[derive(Debug, sqlx::FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct Preferences {
    expanded_collection_ids: Vec<ID>,
    default_collection_layout: String,
    avatar_style: String,
    active_collection_id: ID,
    active_collection_title: String,
    active_collection_layout: String,
    active_collection_filter: String,
    active_collection_grouping: String,
    active_collection_sort_by: String,
}

#[tracing::instrument(skip(pool))]
pub async fn get_preferences(
    pool: web::Data<PgPool>,
    user_id: UserId
) -> Result<HttpResponse, InternalError<PreferencesError>> {
    let user_id: ID = user_id.into();

    sqlx::query_as::<_, Preferences>(include_str!("preferences_query.sql"))
        .bind(user_id)
        .fetch_all(pool.as_ref())
        .await
        .map(|preferences| HttpResponse::Ok().json(preferences))
        .map_err(Into::into)
        .map_err(PreferencesError::UnexpectedError)
        .map_err(Into::<InternalError<PreferencesError>>::into)
}

#[derive(thiserror::Error)]
pub enum PreferencesError {
    #[error("Something went wrong")]
    UnexpectedError(#[from] anyhow::Error),
}

impl std::fmt::Debug for PreferencesError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        error_chain_fmt(self, f)
    }
}

impl From<PreferencesError> for InternalError<PreferencesError> {
    fn from(error: PreferencesError) -> Self {
        let response = match error {
            PreferencesError::UnexpectedError(_) => HttpResponse::InternalServerError(),
        }
        .finish();
        InternalError::from_response(error, response)
    }
}
