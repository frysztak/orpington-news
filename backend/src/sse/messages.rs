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
        feed_ids: Vec<ID>,
    },
}
