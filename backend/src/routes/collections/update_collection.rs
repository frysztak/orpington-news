use std::{collections::HashSet, time::Duration};

use chrono::{DateTime, TimeZone, Utc};
use feed_rs::{
    model::{Content, Feed, Text},
    parser,
};
use reqwest::{
    header::{HeaderMap, HeaderValue, USER_AGENT},
    StatusCode,
};
use serde_json::json;
use sqlx::{postgres::PgQueryResult, Acquire, PgConnection, Postgres, Transaction};
use thiserror::Error;
use tracing::{info, warn};
use url::Url;
use voca_rs::chop::limit_words;

use crate::{session_state::ID, utils::strip_html_tags::strip_html_tags};

use super::{
    clean_html::clean_html,
    types::{CollectionToRefresh, InsertCollectionItem},
};

#[derive(Error, Debug)]
#[allow(dead_code)]
enum FetchFeedError {
    #[error("Failed to fetch feed: {0}")]
    FetchError(#[source] anyhow::Error),
    #[error("Failed to parse feed: {0}")]
    ParseError(#[source] anyhow::Error),
    #[error("Unexpected error: {0}")]
    UnexpectedError(#[source] anyhow::Error),
}

enum FetchFeedSuccess {
    NotModified,
    Fetched { feed: Feed, etag: Option<String> },
}

#[tracing::instrument()]
async fn fetch_feed(collection: &CollectionToRefresh) -> Result<FetchFeedSuccess, FetchFeedError> {
    let mut headers = HeaderMap::new();
    headers.insert(USER_AGENT, "Orpington News".parse().unwrap());

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(60))
        .default_headers(headers)
        .build()
        .map_err(Into::into)
        .map_err(FetchFeedError::UnexpectedError)?;

    let response = client
        .get(&collection.url)
        .header(
            "If-None-Match",
            HeaderValue::from_str(collection.etag.as_ref().unwrap_or(&"".to_string()))
                .map_err(Into::into)
                .map_err(FetchFeedError::FetchError)?,
        )
        .send()
        .await
        .map_err(Into::into)
        .map_err(FetchFeedError::FetchError)?
        .error_for_status()
        .map_err(Into::into)
        .map_err(FetchFeedError::FetchError)?;

    if response.status() == StatusCode::NOT_MODIFIED {
        return Ok(FetchFeedSuccess::NotModified);
    }

    let etag = response
        .headers()
        .clone()
        .get("ETag")
        .and_then(|value| match value.to_str() {
            Ok(etag) => Some(etag.to_string()),
            Err(_) => None,
        });

    let bytes = response
        .bytes()
        .await
        .map_err(Into::into)
        .map_err(FetchFeedError::FetchError)?;

    let feed = parser::parse(bytes.as_ref())
        .map_err(Into::into)
        .map_err(FetchFeedError::ParseError)?;

    Ok(FetchFeedSuccess::Fetched { feed, etag })
}

#[tracing::instrument(skip(feed))]
fn map_feed_items(
    feed: &Feed,
    collection: &CollectionToRefresh,
    date_updated: DateTime<Utc>,
) -> Vec<InsertCollectionItem> {
    let epoch = Utc.with_ymd_and_hms(1970, 1, 1, 0, 0, 0).unwrap();

    let mut items: Vec<InsertCollectionItem> = feed
        .entries
        .iter()
        .filter_map(|entry| {
            let title = match &entry.title {
                Some(Text { content, .. }) => html_escape::decode_html_entities(content)
                    .trim()
                    .to_string(),
                _ => "".to_string(),
            };
            let url = entry.links.first()?.href.clone();
            let root_url = Url::parse(&url).ok()?.origin().ascii_serialization();
            let raw_content = match &entry.content {
                Some(Content {
                    body: Some(text), ..
                }) => text.clone(),
                _ => match &entry.summary {
                    Some(Text { content, .. }) => content.clone(),
                    _ => "".to_string(),
                },
            };
            let content = clean_html(&raw_content, &root_url).ok()?;
            let pure_text = strip_html_tags(&content);
            let full_text = ammonia::clean(&content);
            let summary = match &entry.summary {
                Some(Text { content, .. }) => strip_html_tags(content).trim().to_string(),
                None => limit_words(&pure_text, 20, ""),
            };
            let thumbnail_url = match entry.media.first() {
                Some(media) => match &media.thumbnails[..] {
                    [thumbnail, ..] => Some(thumbnail.image.uri.clone()),
                    _ => None,
                },
                _ => None,
            };

            let read_tech_doc = estimated_read_time::Options::new()
                .technical_document(true)
                .build()
                .unwrap_or_default();
            let time_taken = estimated_read_time::text(&pure_text, &read_tech_doc);
            let reading_time = time_taken.seconds() as f32 / 60f32;

            let categories: Option<Vec<String>> = match entry.categories.is_empty() {
                true => None,
                false => Some(entry.categories.iter().map(|c| c.term.clone()).collect()),
            };

            let date_published = entry.published.or(entry.updated)?;
            if date_published < epoch {
                warn!(
                    "Article published before epoch. Article URL: {}, publish date: {}",
                    url, date_published
                );
                return None;
            }

            Some(InsertCollectionItem {
                title,
                url,
                full_text,
                summary,
                thumbnail_url,
                date_published,
                categories,
                reading_time,
                date_updated,
                collection_id: collection.id,
            })
        })
        .collect();

    let mut uniques = HashSet::new();
    let len_before = items.len();
    items.retain(|e| uniques.insert(e.url.clone()));
    let len_after = items.len();

    if len_after != len_before {
        warn!(
            "{}: dropped {} items with identical URLs",
            collection,
            len_before - len_after
        );
    }

    items
}

#[tracing::instrument(skip(conn))]
async fn set_collection_date_updated(
    conn: &mut PgConnection,
    collection_id: ID,
    date_updated: DateTime<Utc>,
) -> Result<PgQueryResult, sqlx::Error> {
    sqlx::query!(
        r#"
UPDATE
  collections
SET
  date_updated = $1
WHERE
  id = $2
"#,
        date_updated,
        collection_id
    )
    .execute(&mut *conn)
    .await
}

#[tracing::instrument(skip(conn))]
async fn set_collection_etag(
    conn: &mut PgConnection,
    collection_id: ID,
    etag: &str,
) -> Result<PgQueryResult, sqlx::Error> {
    let conn = conn.acquire().await?;

    sqlx::query!(
        r#"
UPDATE
  collections
SET
  etag = $1
WHERE
  id = $2
"#,
        etag,
        collection_id
    )
    .execute(&mut *conn)
    .await
}

#[tracing::instrument(skip(conn, items))]
async fn insert_collection_items(
    conn: &mut PgConnection,
    items: &Vec<InsertCollectionItem>,
) -> Result<PgQueryResult, sqlx::Error> {
    let conn = conn.acquire().await?;

    sqlx::query!(
        r#"
INSERT INTO collection_items (
  "url",
  title,
  summary,
  full_text,
  thumbnail_url,
  date_published,
  date_updated,
  categories,
  reading_time,
  collection_id)
SELECT
  "url",
  title,
  summary,
  full_text,
  thumbnail_url,
  to_timestamp(date_published) as date_published,
  to_timestamp(date_updated) as date_updated,
  categories,
  reading_time,
  collection_id
FROM jsonb_to_recordset($1) AS t(
    "url" text,
    title text,
    summary text,
    full_text text,
    thumbnail_url text,
    date_published integer,
    date_updated integer,
    categories text[],
    reading_time float4,
    collection_id integer)
ON CONFLICT (collection_id, "url")
DO UPDATE SET
    "url" = EXCLUDED. "url",
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    full_text = EXCLUDED.full_text,
    thumbnail_url = EXCLUDED.thumbnail_url,
    date_published = GREATEST (collection_items.date_published, EXCLUDED.date_published),
    date_updated = GREATEST (collection_items.date_updated, EXCLUDED.date_updated),
    categories = EXCLUDED.categories,
    reading_time = EXCLUDED.reading_time
"#,
        json!(items),
    )
    .execute(&mut *conn)
    .await
}

#[derive(Error, Debug)]
#[allow(dead_code)]
pub enum UpdateCollectionError {
    #[error("Failed to fetch feed (ID {}) with error {}", collection_id, source)]
    FetchError {
        collection_id: ID,
        #[source]
        source: anyhow::Error,
    },
    #[error("Unexpected error (ID {}): {}", collection_id, source)]
    UnexpectedError {
        collection_id: ID,
        #[source]
        source: anyhow::Error,
    },
}

impl UpdateCollectionError {
    pub fn get_collection_id(&self) -> ID {
        match self {
            UpdateCollectionError::FetchError { collection_id, .. } => *collection_id,
            UpdateCollectionError::UnexpectedError { collection_id, .. } => *collection_id,
        }
    }
}

pub enum UpdateCollectionData {
    NoChanges {
        collection_id: ID,
        date: DateTime<Utc>,
    },
    Insert {
        collection_id: ID,
        items: Vec<InsertCollectionItem>,
        etag: Option<String>,
        date: DateTime<Utc>,
    },
}

impl UpdateCollectionData {
    pub fn get_collection_id(&self) -> ID {
        match self {
            UpdateCollectionData::NoChanges { collection_id, .. } => *collection_id,
            UpdateCollectionData::Insert { collection_id, .. } => *collection_id,
        }
    }
}

pub type UpdateCollectionResult = Result<UpdateCollectionData, UpdateCollectionError>;

#[tracing::instrument()]
pub async fn update_collection(collection: CollectionToRefresh) -> UpdateCollectionResult {
    let now = Utc::now();

    let fetch_result =
        fetch_feed(&collection)
            .await
            .map_err(|e| UpdateCollectionError::FetchError {
                collection_id: collection.id,
                source: e.into(),
            })?;

    match &fetch_result {
        FetchFeedSuccess::NotModified => {
            info!("Received 304");
            Ok(UpdateCollectionData::NoChanges {
                collection_id: collection.id,
                date: now,
            })
        }
        FetchFeedSuccess::Fetched { feed, etag } => {
            let items = map_feed_items(feed, &collection, now);
            if items.len() != feed.entries.len() {
                warn!(
                    "{}: dropped {} feed entries",
                    collection,
                    feed.entries.len() - items.len()
                );
            }

            Ok(UpdateCollectionData::Insert {
                collection_id: collection.id,
                date: now,
                etag: etag.clone(),
                items,
            })
        }
    }
}

#[tracing::instrument(skip(transaction, update_result))]
pub async fn commit_update_collection(
    update_result: UpdateCollectionData,
    transaction: &mut Transaction<'_, Postgres>,
) -> Result<(), sqlx::Error> {
    match update_result {
        UpdateCollectionData::NoChanges {
            collection_id,
            date,
        } => {
            set_collection_date_updated(transaction, collection_id, date).await?;
        }
        UpdateCollectionData::Insert {
            collection_id,
            items,
            etag,
            date,
        } => {
            insert_collection_items(transaction, &items).await?;

            if let Some(etag) = etag {
                set_collection_etag(transaction, collection_id, &etag).await?;
            }

            set_collection_date_updated(transaction, collection_id, date).await?;
        }
    }

    Ok(())
}
