use actix_session::Session;
use actix_session::SessionExt;
use actix_session::SessionGetError;
use actix_session::SessionInsertError;
use actix_web::dev::Payload;
use actix_web::{FromRequest, HttpRequest};
use std::future::{ready, Ready};

pub struct TypedSession(Session);

// TODO: move somewhere
pub type ID = i32;

impl TypedSession {
    const USER_ID_KEY: &'static str = "user_id";

    pub fn renew(&self) {
        self.0.renew();
    }

    pub fn insert_user_id(&self, user_id: ID) -> Result<(), SessionInsertError> {
        self.0.insert(Self::USER_ID_KEY, user_id)
    }

    pub fn get_user_id(&self) -> Result<Option<ID>, SessionGetError> {
        self.0.get(Self::USER_ID_KEY)
    }

    pub fn log_out(self) {
        self.0.purge()
    }
}

impl FromRequest for TypedSession {
    type Error = <Session as FromRequest>::Error;
    type Future = Ready<Result<TypedSession, Self::Error>>;

    fn from_request(req: &HttpRequest, _payload: &mut Payload) -> Self::Future {
        ready(Ok(TypedSession(req.get_session())))
    }
}
