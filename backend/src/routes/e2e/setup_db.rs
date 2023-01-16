use actix_web::{error::InternalError, web, HttpResponse};
use sqlx::PgPool;

use crate::routes::error::GenericError;

#[tracing::instrument(skip(pool))]
pub async fn setup_db(
    pool: web::Data<PgPool>,
) -> Result<HttpResponse, InternalError<GenericError>> {
    sqlx::migrate!("./migrations")
        .run(pool.as_ref())
        .await
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)?;

    Ok(HttpResponse::Ok().json(true))
}
