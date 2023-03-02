use crate::{
    authentication::{validate_credentials, AuthError, Credentials},
    routes::{error_chain_fmt, error::JSONError},
    session_state::{TypedSession},
};
use actix_identity::Identity;
use actix_web::{error::InternalError, web, HttpResponse, HttpRequest, HttpMessage};
use serde::Deserialize;
use sqlx::PgPool;

#[derive(Deserialize)]
pub struct LoginData {
    username: String,
    password: String,
}

#[tracing::instrument(
    skip(body, pool, session),
    fields(username=tracing::field::Empty, user_id=tracing::field::Empty)
)]
pub async fn login(
    body: web::Json<LoginData>,
    pool: web::Data<PgPool>,
    session: TypedSession,
    request: HttpRequest
) -> Result<HttpResponse, InternalError<LoginError>> {
    let credentials = Credentials {
        username: body.username.clone(),
        password: body.password.clone().into(),
    };
    tracing::Span::current().record("username", &tracing::field::display(&credentials.username));

    let error_response = HttpResponse::Forbidden().json(JSONError {
        status_code: 403,
        message: "Wrong username or password.".to_string(),
    });

    match validate_credentials(credentials, &pool).await {
        Ok(user_id) => {
            tracing::Span::current().record("user_id", &tracing::field::display(&user_id));
            session.renew();
            session.insert_user_id(user_id).map_err(|e| {
                InternalError::from_response(LoginError::UnexpectedError(e.into()), error_response)
            })?;
            Identity::login(&request.extensions(), user_id.to_string()).unwrap();
            Ok(HttpResponse::Ok().json(true))
        }
        Err(e) => {
            let e = match e {
                AuthError::InvalidCredentials(_) => LoginError::AuthError(e.into()),
                AuthError::UnexpectedError(_) => LoginError::UnexpectedError(e.into()),
            };
            Err(InternalError::from_response(e, error_response))
        }
    }
}

#[derive(thiserror::Error)]
pub enum LoginError {
    #[error("Authentication failed")]
    AuthError(#[source] anyhow::Error),
    #[error("Something went wrong")]
    UnexpectedError(#[from] anyhow::Error),
}

impl std::fmt::Debug for LoginError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        error_chain_fmt(self, f)
    }
}
