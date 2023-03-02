use actix_web::{
    body::MessageBody,
    dev::{ServiceRequest, ServiceResponse},
    web, Error,
};
use actix_web_lab::middleware::Next;
use serde::Deserialize;
use sqlx::PgPool;

use crate::{authentication::UserId, routes::error::JSONError, session_state::ID};

#[derive(Deserialize)]
pub struct PathParams {
    collection_id: ID,
}

pub async fn verify_owner_mw(
    user_id: UserId,
    pool: web::Data<PgPool>,
    path: web::Path<PathParams>,
    req: ServiceRequest,
    next: Next<impl MessageBody>,
) -> Result<ServiceResponse<impl MessageBody>, Error> {
    let user_id: ID = user_id.into();
    let collection_owner_id = sqlx::query_scalar!(
        r#"SELECT user_id FROM collections WHERE id = $1"#,
        path.collection_id
    )
    .fetch_one(pool.as_ref())
    .await
    .map_err(|err| actix_web::error::ErrorInternalServerError(err))?;

    if user_id != collection_owner_id {
        return Err(actix_web::error::ErrorForbidden(JSONError {
            status_code: 403,
            message: "Access forbidden.".to_owned(),
        }));
    }

    next.call(req).await
}
