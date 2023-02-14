use crate::{
    authentication::{compute_password_hash, verify_password_hash, UserId},
    routes::{error::JSONError, error_chain_fmt},
    session_state::ID,
};
use actix_web::{error::InternalError, web, HttpResponse};
use secrecy::{ExposeSecret, Secret};
use serde::Deserialize;
use sqlx::PgPool;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PasswordData {
    current_password: String,
    new_password: String,
}

#[tracing::instrument(
    skip(body, pool, user_id),
    fields(username=tracing::field::Empty, user_id=tracing::field::Empty)
)]
pub async fn password(
    body: web::Json<PasswordData>,
    pool: web::Data<PgPool>,
    user_id: UserId,
) -> Result<HttpResponse, InternalError<PasswordError>> {
    let user_id: ID = user_id.into();

    let current_password =
        sqlx::query_scalar!(r#"SELECT password FROM users WHERE id = $1"#, user_id)
            .fetch_one(pool.as_ref())
            .await
            .map_err(Into::into)
            .map_err(PasswordError::UnexpectedError)?;

    if let Err(_) = verify_password_hash(
        Secret::new(current_password),
        Secret::new(body.current_password.to_owned()),
    ) {
        return Err(PasswordError::IncorrectPassword().into());
    };

    let new_hash = compute_password_hash(Secret::new(body.new_password.to_owned()))
        .map_err(Into::into)
        .map_err(PasswordError::UnexpectedError)?;

    sqlx::query!(
        r#"
    UPDATE users
    SET password = $1
    WHERE id = $2"#,
        new_hash.expose_secret(),
        user_id
    )
    .execute(pool.as_ref())
    .await
    .map_err(Into::into)
    .map_err(PasswordError::UnexpectedError)?;

    Ok(HttpResponse::Ok().json(true))
}

#[derive(thiserror::Error)]
pub enum PasswordError {
    #[error("Current password is incorrect")]
    IncorrectPassword(),
    #[error("Something went wrong")]
    UnexpectedError(#[from] anyhow::Error),
}

impl std::fmt::Debug for PasswordError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        error_chain_fmt(self, f)
    }
}

impl From<PasswordError> for InternalError<PasswordError> {
    fn from(error: PasswordError) -> Self {
        let response = match &error {
            PasswordError::IncorrectPassword() => {
                HttpResponse::InternalServerError().json(JSONError {
                    status_code: 500,
                    message: "Current password is incorrect.".to_string(),
                })
            }
            PasswordError::UnexpectedError(err) => {
                HttpResponse::InternalServerError().json(JSONError {
                    status_code: 500,
                    message: err.to_string(),
                })
            }
        };
        InternalError::from_response(error, response)
    }
}
