use actix_web::{error::InternalError, HttpResponse};

use crate::routes::error::GenericError;

#[tracing::instrument()]
pub async fn exit() -> Result<HttpResponse, InternalError<GenericError>> {
    std::process::exit(0);
}
