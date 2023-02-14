use actix_web::{error::InternalError, web, HttpResponse};
use sqlx::PgPool;

use crate::routes::error::GenericError;

#[tracing::instrument(skip(pool))]
pub async fn reset_db(
    pool: web::Data<PgPool>,
) -> Result<HttpResponse, InternalError<GenericError>> {
    sqlx::query!(
        r#"
TRUNCATE TABLE users, session, queue, preferences, collections, collection_items
RESTART IDENTITY
CASCADE"#
    )
    .execute(pool.as_ref())
    .await
    .map_err(Into::into)
    .map_err(GenericError::UnexpectedError)?;

    Ok(HttpResponse::Ok().json(true))
}
