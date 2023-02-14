use serde::Serialize;

use crate::session_state::ID;

#[derive(Debug, sqlx::FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct Preferences {
    expanded_collection_ids: Vec<ID>,
    default_collection_layout: String,
    avatar_style: String,
    active_collection_id: ID,
    active_collection_title: String,
    active_collection_layout: String,
    active_collection_filter: String,
    active_collection_grouping: String,
    active_collection_sort_by: String,
}