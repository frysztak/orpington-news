use actix_web::{error::InternalError, web, HttpResponse};
use sqlx::{Acquire, PgPool, Postgres};

use crate::{authentication::UserId, routes::error::GenericError, session_state::ID};

use super::types::Preferences;

#[tracing::instrument(skip(pool))]
pub async fn get_preferences(
    pool: web::Data<PgPool>,
    user_id: UserId,
) -> Result<HttpResponse, InternalError<GenericError>> {
    let user_id: ID = user_id.into();

    get_preferences_impl(pool.as_ref(), user_id)
        .await
        .map(|preferences| HttpResponse::Ok().json(preferences))
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)
        .map_err(Into::<InternalError<GenericError>>::into)
}

pub async fn get_preferences_impl<'a, A>(conn: A, user_id: ID) -> Result<Preferences, sqlx::Error>
where
    A: Acquire<'a, Database = Postgres>,
{
    let mut conn = conn.acquire().await?;

    sqlx::query_as::<_, Preferences>(include_str!("get.sql"))
        .bind(user_id)
        .fetch_one(&mut *conn)
        .await
}
