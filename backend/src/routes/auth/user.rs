use crate::routes::auth::utils::map_avatar;
use actix_web::{error::InternalError, web, HttpResponse};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::{
    authentication::UserId,
    routes::{error::GenericError, error_chain_fmt},
    session_state::ID,
};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct UserInfo {
    username: String,
    display_name: Option<String>,
    avatar_url: Option<String>,
    home_id: ID,
}

#[tracing::instrument(skip(pool, user_id))]
pub async fn get_user(
    pool: web::Data<PgPool>,
    user_id: UserId,
) -> Result<HttpResponse, InternalError<UserInfoError>> {
    let user_id: ID = user_id.into();

    get_user_impl(pool.as_ref(), user_id)
        .await
        .map(|user| HttpResponse::Ok().json(user))
        .map_err(Into::into)
        .map_err(UserInfoError::UnexpectedError)
        .map_err(Into::into)
}

async fn get_user_impl(pool: &PgPool, user_id: ID) -> Result<UserInfo, sqlx::Error> {
    sqlx::query_as!(
        UserInfo,
        r#"
SELECT
  name as username,
  display_name,
  (
    CASE WHEN avatar IS NULL THEN
     NULL 
    ELSE
      '/api/auth/user/avatar'
    END) as avatar_url,
  home_id
FROM
  "users"
WHERE
  id = $1
    "#,
        user_id
    )
    .fetch_one(pool)
    .await
}

impl From<UserInfoError> for InternalError<UserInfoError> {
    fn from(error: UserInfoError) -> Self {
        let response = match error {
            UserInfoError::UnexpectedError(_) => HttpResponse::InternalServerError(),
        }
        .finish();
        InternalError::from_response(error, response)
    }
}

#[derive(thiserror::Error)]
pub enum UserInfoError {
    #[error("Something went wrong")]
    UnexpectedError(#[from] anyhow::Error),
}

impl std::fmt::Debug for UserInfoError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        error_chain_fmt(self, f)
    }
}

#[tracing::instrument(skip(pool, user_id))]
pub async fn user_avatar(
    pool: web::Data<PgPool>,
    user_id: UserId,
) -> Result<HttpResponse, InternalError<UserAvatarError>> {
    let user_id: ID = user_id.into();

    let avatar_result = sqlx::query!(
        r#"
SELECT
  avatar
FROM
  "users"
WHERE
  id = $1
    "#,
        user_id
    )
    .fetch_one(pool.as_ref())
    .await
    .map(|row| row.avatar)
    .map_err(Into::into)
    .map_err(UserAvatarError::UnexpectedError)
    .map_err(Into::<InternalError<UserAvatarError>>::into)?;

    match avatar_result {
        None => Err(UserAvatarError::NoAvatar.into()),
        Some(avatar_buf) => infer::get(&avatar_buf)
            .map(|kind| {
                HttpResponse::Ok()
                    .content_type(kind.mime_type())
                    .body(avatar_buf)
            })
            .ok_or(UserAvatarError::UnknownMimeType.into()),
    }
}

#[derive(thiserror::Error)]
pub enum UserAvatarError {
    #[error("Unknown MIME type")]
    UnknownMimeType,
    #[error("User has no avatar")]
    NoAvatar,
    #[error("Something went wrong")]
    UnexpectedError(#[from] anyhow::Error),
}

impl std::fmt::Debug for UserAvatarError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        error_chain_fmt(self, f)
    }
}

impl From<UserAvatarError> for InternalError<UserAvatarError> {
    fn from(error: UserAvatarError) -> Self {
        let response = match error {
            UserAvatarError::UnknownMimeType => HttpResponse::InternalServerError(),
            UserAvatarError::NoAvatar => HttpResponse::NotFound(),
            UserAvatarError::UnexpectedError(_) => HttpResponse::InternalServerError(),
        }
        .finish();
        InternalError::from_response(error, response)
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PutUserData {
    display_name: String,
    avatar_url: Option<String>,
}

#[tracing::instrument(skip(pool, body, user_id))]
pub async fn put_user(
    pool: web::Data<PgPool>,
    body: web::Json<PutUserData>,
    user_id: UserId,
) -> Result<HttpResponse, InternalError<GenericError>> {
    let user_id: ID = user_id.into();

    sqlx::query!(
        r#"
WITH old AS (
  SELECT *
  FROM users
  WHERE id = $1
)
UPDATE
  users
SET
  display_name = COALESCE($2, old.display_name),
  avatar = CASE
    WHEN $3 = TRUE THEN COALESCE($4, old.avatar)
    WHEN $3 = FALSE THEN NULL
    END
FROM old
WHERE users.id = $1
    "#,
        user_id,
        body.display_name,
        body.avatar_url.is_some(),
        map_avatar(body.avatar_url.as_ref())
    )
    .execute(pool.as_ref())
    .await
    .map_err(Into::into)
    .map_err(GenericError::UnexpectedError)?;

    get_user_impl(pool.as_ref(), user_id)
        .await
        .map(|user| HttpResponse::Ok().json(user))
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)
        .map_err(Into::into)
}
