use strum::{EnumString, Display};

use crate::session_state::ID;

#[derive(Debug, EnumString, sqlx::Type, Display)]
#[sqlx(type_name = "text", rename_all = "camelCase")]
#[strum(serialize_all = "camelCase")]
pub enum CollectionLayout {
    Card,
    Magazine,
    List,
}

#[derive(Debug, EnumString, sqlx::Type, Display)]
#[sqlx(type_name = "text", rename_all = "camelCase")]
#[strum(serialize_all = "camelCase")]
pub enum AvatarStyle {
    Initials,
    Fallback,
}

#[derive(Debug, EnumString, sqlx::Type, Display)]
#[sqlx(type_name = "text", rename_all = "camelCase")]
#[strum(serialize_all = "camelCase")]
pub enum CollectionFilter {
    All,
    Unread,
    Read,
}

#[derive(Debug, EnumString, sqlx::Type, Display)]
#[sqlx(type_name = "text", rename_all = "camelCase")]
#[strum(serialize_all = "camelCase")]
pub enum CollectionGrouping {
    None,
    Feed,
    Date,
}

#[derive(Debug, EnumString, sqlx::Type, Display)]
#[sqlx(type_name = "text", rename_all = "camelCase")]
#[strum(serialize_all = "camelCase")]
pub enum CollectionSortBy {
    NewestFirst,
    OldestFirst,
}

pub struct Preferences {
    pub expanded_collection_ids: Vec<ID>,
    pub default_collection_layout: CollectionLayout,
    pub avatar_style: AvatarStyle,
    pub active_collection_id: ID,
    pub active_collection_title: String,
    pub active_collection_layout: CollectionLayout,
    pub active_collection_filter: CollectionFilter,
    pub active_collection_grouping: CollectionGrouping,
    pub active_collection_sort_by: CollectionSortBy,
}

impl Default for Preferences {
    fn default() -> Self {
        Self {
            expanded_collection_ids: vec![],
            default_collection_layout: CollectionLayout::List,
            avatar_style: AvatarStyle::Fallback,
            active_collection_id: 0,
            active_collection_title: "Home".to_string(),
            active_collection_layout: CollectionLayout::List,
            active_collection_filter: CollectionFilter::All,
            active_collection_grouping: CollectionGrouping::None,
            active_collection_sort_by: CollectionSortBy::NewestFirst,
        }
    }
}
