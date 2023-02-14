use actix_web::{error::InternalError, web, HttpResponse};
use serde::Deserialize;
use sqlx::{Acquire, PgPool, Postgres};

use crate::{authentication::UserId, routes::error::GenericError, session_state::ID};

use super::{get::get_preferences_impl, types::Preferences};

#[derive(Deserialize)]
pub struct PathParams {
    collection_id: ID,
}

#[tracing::instrument(skip(pool, path))]
pub async fn expand_collection(
    pool: web::Data<PgPool>,
    path: web::Path<PathParams>,
    user_id: UserId,
) -> Result<HttpResponse, InternalError<GenericError>> {
    let user_id: ID = user_id.into();

    expand_collapse_impl(pool.as_ref(), "add", user_id, path.collection_id)
        .await
        .map(|preferences| HttpResponse::Ok().json(preferences))
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)
        .map_err(Into::<InternalError<GenericError>>::into)
}

#[tracing::instrument(skip(pool, path))]
pub async fn collapse_collection(
    pool: web::Data<PgPool>,
    path: web::Path<PathParams>,
    user_id: UserId,
) -> Result<HttpResponse, InternalError<GenericError>> {
    let user_id: ID = user_id.into();

    expand_collapse_impl(pool.as_ref(), "remove", user_id, path.collection_id)
        .await
        .map(|preferences| HttpResponse::Ok().json(preferences))
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)
        .map_err(Into::<InternalError<GenericError>>::into)
}

pub async fn expand_collapse_impl<'a, A>(
    conn: A,
    direction: &str,
    user_id: ID,
    collection_id: ID,
) -> Result<Preferences, sqlx::Error>
where
    A: Acquire<'a, Database = Postgres>,
{
    let mut conn = conn.acquire().await?;
    let mut transaction = conn.begin().await?;

    sqlx::query_file!(
        "src/routes/preferences/expand_collapse.sql",
        direction,
        collection_id,
        user_id
    )
    .execute(&mut transaction)
    .await?;

    sqlx::query!(
        r#"
CALL preferences_prune_expanded_collections($1)
"#,
        user_id
    )
    .execute(&mut transaction)
    .await?;

    let preferences = get_preferences_impl(&mut transaction, user_id).await?;

    transaction.commit().await?;

    Ok(preferences)
}
