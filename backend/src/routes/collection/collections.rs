use actix_web::{error::InternalError, web, HttpResponse};
use chrono::serde::ts_seconds_option;
use serde::Serialize;
use sqlx::{
    types::chrono::{DateTime, Utc},
    PgPool,
};
use std::collections::HashMap;

use crate::{authentication::UserId, routes::error_chain_fmt, session_state::ID};

#[derive(Debug, sqlx::FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct Collection {
    id: ID,
    title: String,
    icon: String,
    order: i32,
    description: Option<String>,
    url: Option<String>,
    #[serde(with = "ts_seconds_option")]
    date_updated: Option<DateTime<Utc>>,
    refresh_interval: i32,
    layout: String,
    filter: String,
    grouping: String,
    sort_by: String,
    is_home: bool,
    level: i32,
    order_path: Vec<i32>,
    parents: Vec<ID>,
    parent_id: Option<ID>,
    children: Vec<ID>,
    unread_count: i32,
    parent_order: Option<i32>,
    is_last_child: Option<bool>,
}

#[tracing::instrument(skip(pool))]
pub async fn get_collections(
    pool: web::Data<PgPool>,
    user_id: web::ReqData<UserId>,
) -> Result<HttpResponse, InternalError<CollectionsError>> {
    let user_id: ID = user_id.into_inner().into();

    let mut collections = sqlx::query_as::<_, Collection>(include_str!("collections_query.sql"))
        .bind(user_id)
        .fetch_all(pool.as_ref())
        .await
        .map_err(Into::into)
        .map_err(CollectionsError::UnexpectedError)
        .map_err(Into::<InternalError<CollectionsError>>::into)?;

    calculate_unread_count(&mut collections);
    Ok(HttpResponse::Ok().json(collections))
}

fn calculate_unread_count(collections: &mut Vec<Collection>) {
    let map: HashMap<ID, i32> = collections
        .into_iter()
        .map(|collection| (collection.id, collection.unread_count))
        .collect();

    for mut collection in collections {
        let children = &collection.children;
        let children_unread_count = children
            .into_iter()
            .fold(0, |acc, c| acc + map.get(&c).unwrap_or(&0));
        collection.unread_count = children_unread_count;
    }
}

#[derive(thiserror::Error)]
pub enum CollectionsError {
    #[error("Something went wrong")]
    UnexpectedError(#[from] anyhow::Error),
}

impl std::fmt::Debug for CollectionsError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        error_chain_fmt(self, f)
    }
}

impl From<CollectionsError> for InternalError<CollectionsError> {
    fn from(error: CollectionsError) -> Self {
        let response = match error {
            CollectionsError::UnexpectedError(_) => HttpResponse::InternalServerError(),
        }
        .finish();
        InternalError::from_response(error, response)
    }
}
