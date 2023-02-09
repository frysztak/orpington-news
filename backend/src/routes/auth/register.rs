use crate::defaults::*;
use crate::preferences::Preferences;
use crate::routes::auth::utils::map_avatar;
use crate::{
    authentication::compute_password_hash,
    routes::{error::JSONError, error_chain_fmt},
};
use actix_web::{error::InternalError, web, HttpRequest, HttpResponse};
use secrecy::{ExposeSecret, Secret};
use serde::Deserialize;
use sqlx::PgPool;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RegisterData {
    username: String,
    password: String,
    display_name: String,
    avatar: Option<String>,
}

#[tracing::instrument(
    skip(body, pool),
    fields(username=tracing::field::Empty, user_id=tracing::field::Empty)
)]
pub async fn register(
    web::Json(body): web::Json<RegisterData>,
    pool: web::Data<PgPool>,
    request: HttpRequest,
) -> Result<HttpResponse, InternalError<RegisterError>> {
    let user_exists = sqlx::query!(r"SELECT id FROM users WHERE name = $1", body.username)
        .fetch_optional(pool.as_ref())
        .await
        .map_err(Into::into)
        .map_err(RegisterError::UnexpectedError)?;
    if user_exists.is_some() {
        return Err(RegisterError::UserExists().into());
    }

    let default_preferences = Preferences::default();

    let hash = compute_password_hash(Secret::new(body.password.clone()))
        .map_err(Into::into)
        .map_err(RegisterError::UnexpectedError)?;

    let mut transaction = pool
        .begin()
        .await
        .map_err(Into::into)
        .map_err(RegisterError::UnexpectedError)?;

    let user_id = sqlx::query_scalar!(
        r#"
INSERT INTO "users" (
  name,
  password,
  display_name,
  avatar,
  home_id)
VALUES (
  $1,
  $2,
  $3,
  $4,
  $5)
RETURNING
  id
    "#,
        body.username,
        hash.expose_secret(),
        body.display_name,
        map_avatar(body.avatar.as_ref()),
        2137
    )
    .fetch_one(&mut transaction)
    .await
    .map_err(Into::into)
    .map_err(RegisterError::UnexpectedError)?;

    let home_collection_id = sqlx::query_scalar!(
        r#"
INSERT INTO collections (
  "user_id",
  "title",
  "is_home",
  "order",
  "icon",
  "layout"
  )
VALUES (
  $1, $2, $3, $4, $5, $6
)
RETURNING
  id
    "#,
        user_id,
        "Home".to_string(),
        true,
        0,
        DEFAULT_COLLECTION_ICON,
        default_preferences.default_collection_layout.to_string(),
    )
    .fetch_one(&mut transaction)
    .await
    .map_err(Into::into)
    .map_err(RegisterError::UnexpectedError)?;

    sqlx::query!(
        r#"
INSERT INTO preferences (
  "user_id",
  "active_collection_id",
  "expanded_collection_ids",
  "default_collection_layout",
  "avatar_style")
VALUES (
  $1, $2, $3, $4, $5
)
    "#,
        user_id,
        home_collection_id,
        &default_preferences.expanded_collection_ids,
        default_preferences.default_collection_layout.to_string(),
        default_preferences.avatar_style.to_string(),
    )
    .execute(&mut transaction)
    .await
    .map_err(Into::into)
    .map_err(RegisterError::UnexpectedError)?;

    sqlx::query!(
        r#"
UPDATE
  users
SET
  home_id = $1
WHERE
  users.id = $2
        "#,
        home_collection_id,
        user_id
    )
    .execute(&mut transaction)
    .await
    .map_err(Into::into)
    .map_err(RegisterError::UnexpectedError)?;

    transaction
        .commit()
        .await
        .map_err(Into::into)
        .map_err(RegisterError::UnexpectedError)?;

    Ok(HttpResponse::Ok().json(true))
}

#[derive(thiserror::Error)]
pub enum RegisterError {
    #[error("User already exists")]
    UserExists(),
    #[error("Something went wrong")]
    UnexpectedError(#[from] anyhow::Error),
}

impl std::fmt::Debug for RegisterError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        error_chain_fmt(self, f)
    }
}

impl From<RegisterError> for InternalError<RegisterError> {
    fn from(error: RegisterError) -> Self {
        let response = match &error {
            RegisterError::UserExists() => HttpResponse::InternalServerError().json(JSONError {
                status_code: 500,
                message: "Username is already taken.".to_string(),
            }),
            RegisterError::UnexpectedError(err) => {
                HttpResponse::InternalServerError().json(JSONError {
                    status_code: 500,
                    message: err.to_string(),
                })
            }
        };
        InternalError::from_response(error, response)
    }
}
