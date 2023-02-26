use chrono::{
    serde::{ts_seconds, ts_seconds_option},
    DateTime, Utc,
};
use serde::Serialize;

use crate::session_state::ID;

#[derive(Debug, sqlx::FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct Collection {
    pub id: ID,
    pub title: String,
    pub icon: String,
    pub order: i32,
    pub description: Option<String>,
    pub url: Option<String>,
    #[serde(with = "ts_seconds_option")]
    pub date_updated: Option<DateTime<Utc>>,
    pub refresh_interval: i32,
    pub layout: String,
    pub filter: String,
    pub grouping: String,
    pub sort_by: String,
    pub is_home: bool,
    pub level: i32,
    pub order_path: Vec<i32>,
    pub parents: Vec<ID>,
    pub parent_id: Option<ID>,
    pub children: Vec<ID>,
    pub unread_count: i32,
    pub parent_order: Option<i32>,
    pub is_last_child: Option<bool>,
}

#[derive(Debug, Serialize)]
#[allow(dead_code)]
pub struct InsertCollectionItem {
    pub url: String,
    pub title: String,
    pub full_text: String,
    pub summary: String,
    pub thumbnail_url: Option<String>,
    #[serde(with = "ts_seconds")]
    pub date_published: DateTime<Utc>,
    #[serde(with = "ts_seconds")]
    pub date_updated: DateTime<Utc>,
    pub reading_time: f32,
    pub categories: Option<Vec<String>>,
    pub collection_id: ID
}

#[derive(Debug, sqlx::FromRow, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct CollectionToRefresh {
    pub owner_id: ID,
    pub id: ID,
    pub url: String,
    pub etag: Option<String>,
}
