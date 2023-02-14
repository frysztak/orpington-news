use std::fmt::Display;

use actix_web::{error::InternalError, HttpResponse};
use serde::Serialize;

use super::error_chain_fmt;

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct JSONError {
    pub status_code: u32,
    pub message: String,
}

impl Display for JSONError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.message)
    }
}

#[derive(thiserror::Error)]
pub enum GenericError {
    #[error("Something went wrong")]
    UnexpectedError(#[from] anyhow::Error),
}

impl std::fmt::Debug for GenericError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        error_chain_fmt(self, f)
    }
}

impl From<GenericError> for InternalError<GenericError> {
    fn from(error: GenericError) -> Self {
        let response = match &error {
            GenericError::UnexpectedError(err) => {
                HttpResponse::InternalServerError().json(JSONError {
                    status_code: 500,
                    message: err.to_string(),
                })
            }
        };
        InternalError::from_response(error, response)
    }
}
