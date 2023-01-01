use actix_web::{
    body::MessageBody,
    dev::{ServiceRequest, ServiceResponse},
    error::InternalError,
    FromRequest, HttpMessage, HttpResponse,
};
use actix_web_lab::middleware::Next;

use crate::session_state::{TypedSession, ID};

#[derive(Copy, Clone, Debug, sqlx::Type)]
#[sqlx(transparent)]
pub struct UserId(pub ID);

impl From<UserId> for ID {
    fn from(user_id: UserId) -> Self {
        user_id.0
    }
}

pub async fn reject_anonymous_users(
    mut req: ServiceRequest,
    next: Next<impl MessageBody>,
) -> Result<ServiceResponse<impl MessageBody>, actix_web::Error> {
    let session = {
        let (http_request, payload) = req.parts_mut();
        TypedSession::from_request(http_request, payload).await
    }?;

    match session
        .get_user_id()
        .map_err(actix_web::error::ErrorInternalServerError)?
    {
        Some(user_id) => {
            req.extensions_mut().insert(UserId(user_id));
            next.call(req).await
        }
        None => {
            let response = HttpResponse::Unauthorized().finish();
            let e = anyhow::anyhow!("The user has not logged in");
            Err(InternalError::from_response(e, response).into())
        }
    }
}
