use actix_identity::Identity;
use actix_session::Session;
use actix_web::dev::Payload;
use actix_web::http::StatusCode;
use actix_web::{FromRequest, HttpRequest, HttpResponse};

use std::future::{ready, Ready};
use std::str::FromStr;

use crate::session_state::{JSONError, ID};

#[derive(Copy, Clone, Debug, sqlx::Type)]
#[sqlx(transparent)]
pub struct UserId(pub ID);

impl From<UserId> for ID {
    fn from(user_id: UserId) -> Self {
        user_id.0
    }
}

impl FromStr for UserId {
    type Err = anyhow::Error;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        s.parse().map(UserId).map_err(Into::into)
    }
}

impl FromRequest for UserId {
    type Error = <Session as FromRequest>::Error;
    type Future = Ready<Result<UserId, Self::Error>>;

    fn from_request(req: &HttpRequest, payload: &mut Payload) -> Self::Future {
        ready(
            Identity::from_request(req, payload)
                .into_inner()
                .map(|identity| identity.id())
                .map(|id| id.unwrap())
                .map(|id| id.parse().unwrap())
                .map_err(|err| {
                    let res = actix_web::error::InternalError::from_response(
                        err,
                        HttpResponse::build(StatusCode::UNAUTHORIZED).json(JSONError {
                            status_code: 401,
                            message: "Unauthorized".to_string(),
                        }),
                    );

                    actix_web::Error::from(res)
                }),
        )
    }
}
