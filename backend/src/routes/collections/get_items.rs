use actix_web::{error::InternalError, web, HttpResponse};
use chrono::serde::{ts_seconds, ts_seconds_option};
use serde::{Deserialize, Serialize};
use sqlx::{
    types::chrono::{DateTime, Utc},
    PgPool,
};

use crate::{authentication::UserId, routes::error::GenericError, session_state::ID};

#[derive(Debug, sqlx::FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct DBCollectionItem {
    pub id: ID,
    pub url: String,
    pub title: String,
    pub full_text: String,
    pub summary: String,
    pub thumbnail_url: Option<String>,
    #[serde(with = "ts_seconds")]
    pub date_published: DateTime<Utc>,
    #[serde(with = "ts_seconds")]
    pub date_updated: DateTime<Utc>,
    #[serde(with = "ts_seconds_option")]
    pub date_read: Option<DateTime<Utc>>,
    pub reading_time: f32,
    pub collection_id: ID,
    pub collection_title: String,
    pub collection_icon: String,
}

#[derive(Debug, sqlx::FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct CollectionItemCollection {
    id: ID,
    title: String,
    icon: String,
}

#[derive(Debug, sqlx::FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct CollectionItem {
    id: ID,
    url: String,
    title: String,
    full_text: String,
    summary: String,
    thumbnail_url: Option<String>,
    #[serde(with = "ts_seconds")]
    date_published: DateTime<Utc>,
    #[serde(with = "ts_seconds")]
    date_updated: DateTime<Utc>,
    #[serde(with = "ts_seconds_option")]
    date_read: Option<DateTime<Utc>>,
    reading_time: f32,
    collection: CollectionItemCollection,
}

impl From<&DBCollectionItem> for CollectionItem {
    fn from(value: &DBCollectionItem) -> Self {
        CollectionItem {
            id: value.id,
            url: value.url.clone(),
            title: value.title.clone(),
            full_text: value.full_text.clone(),
            summary: value.summary.clone(),
            thumbnail_url: value.thumbnail_url.clone(),
            date_published: value.date_published,
            date_read: value.date_read,
            date_updated: value.date_updated,
            reading_time: value.reading_time,
            collection: CollectionItemCollection {
                id: value.collection_id,
                icon: value.collection_icon.clone(),
                title: value.collection_title.clone(),
            },
        }
    }
}

#[derive(Deserialize)]
pub struct PathParams {
    collection_id: ID,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QueryParams {
    page_index: Option<i32>,
    page_size: Option<i32>,
    filter: Option<String>,
    grouping: Option<String>,
    sort_by: Option<String>,
}

#[tracing::instrument(skip(pool, user_id, query, path))]
pub async fn get_collection_items(
    path: web::Path<PathParams>,
    web::Query(query): web::Query<QueryParams>,
    pool: web::Data<PgPool>,
    user_id: UserId,
) -> Result<HttpResponse, InternalError<GenericError>> {
    let user_id: ID = user_id.into();
    let page_size = query.page_size.unwrap_or(30);
    let page_index = query.page_index.unwrap_or(0);

    sqlx::query_as::<_, DBCollectionItem>(include_str!("get_items.sql"))
        .bind(user_id)
        .bind(path.collection_id)
        .bind(query.filter.unwrap_or("all".to_string()))
        .bind(query.sort_by.unwrap_or("newestFirst".to_string()))
        .bind(query.grouping.unwrap_or("none".to_string()))
        .bind(page_size)
        .bind(page_index * page_size)
        .fetch_all(pool.as_ref())
        .await
        .map(|data| {
            Ok(HttpResponse::Ok()
                .json(data.iter().map(Into::into).collect::<Vec<CollectionItem>>()))
        })
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)
        .map_err(Into::<InternalError<GenericError>>::into)?
}
