use crate::session_state::TypedSession;
use actix_web::{cookie::Cookie, error::HttpError, HttpResponse};

#[tracing::instrument(
    skip(session),
    fields(username=tracing::field::Empty, user_id=tracing::field::Empty)
)]
pub async fn logout(session: TypedSession) -> Result<HttpResponse, HttpError> {
    session.log_out();

    let mut response = HttpResponse::Ok().json(true);
    let mut cookie = Cookie::new("sessionId", "");
    cookie.set_domain("/");
    response.add_removal_cookie(&cookie)?;
    Ok(response)
}
