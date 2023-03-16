use std::collections::HashMap;

use chrono::{serde::ts_seconds, DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::session_state::ID;

#[derive(Serialize, Deserialize)]
#[serde(tag = "type", content = "data", rename_all = "camelCase")]
pub enum SSEMessage {
    Ping,
    #[serde(rename_all = "camelCase")]
    UpdatingFeeds {
        feed_ids: Vec<ID>,
    },
    #[serde(rename_all = "camelCase")]
    UpdatedFeeds {
        // those feeds finished refreshing
        refreshed_feed_ids: Vec<ID>,
        // those feeds where affected by refreshing - frontend needs to reload collection items for those
        affected_feed_ids: Vec<ID>,
        unread_count: Option<UnreadCount>,
    },
}

#[derive(Serialize, Deserialize)]
pub struct UnreadCount {
    pub counts: HashMap<ID, i32>,
    #[serde(with = "ts_seconds")]
    pub updated_at: DateTime<Utc>,
}
