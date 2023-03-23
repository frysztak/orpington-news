use actix_multipart::Multipart;
use actix_web::{
    error::InternalError,
    web::{self},
    HttpResponse,
};
use async_recursion::async_recursion;
use futures_util::TryStreamExt as _;
use normalize_url_rs::normalize_url;
use opml::{Outline, OPML};
use sqlx::{PgConnection, PgPool};
use tracing::info;

use crate::{
    authentication::UserId,
    defaults::{DEFAULT_COLLECTION_ICON, DEFAULT_REFRESH_INTERVAL},
    queue::queue::{Message, Queue, TaskPriority},
    routes::{collections::get::get_collections_impl, error::GenericError},
    session_state::ID,
    ws::{broadcast::Broadcaster, messages::WSMessage},
};

use super::types::CollectionToRefresh;

#[tracing::instrument(skip(pool, payload, broadcaster, task_queue))]
pub async fn import_opml(
    pool: web::Data<PgPool>,
    task_queue: web::Data<dyn Queue>,
    broadcaster: web::Data<Broadcaster>,
    mut payload: Multipart,
    user_id: UserId,
) -> Result<HttpResponse, InternalError<GenericError>> {
    let user_id: ID = user_id.into();

    let mut opml_bytes: Vec<u8> = vec![];

    while let Some(mut field) = payload
        .try_next()
        .await
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)?
    {
        // Field in turn is stream of *Bytes* object
        while let Some(chunk) = field
            .try_next()
            .await
            .map_err(Into::into)
            .map_err(GenericError::UnexpectedError)?
        {
            opml_bytes.extend(chunk);
        }
    }

    let opml_str = String::from_utf8(opml_bytes)
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)?;

    let opml = OPML::from_str(&opml_str)
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)?;

    let home_id = sqlx::query_scalar!(
        r#"
    SELECT home_id
    FROM users
    WHERE id = $1"#,
        user_id
    )
    .fetch_one(pool.as_ref())
    .await
    .map_err(Into::into)
    .map_err(GenericError::UnexpectedError)?;

    let default_collection_layout = sqlx::query_scalar!(
        r#"
        SELECT default_collection_layout
        FROM preferences 
        WHERE user_id = $1"#,
        user_id
    )
    .fetch_one(pool.as_ref())
    .await
    .map_err(Into::into)
    .map_err(GenericError::UnexpectedError)?;

    let mut transaction = pool
        .begin()
        .await
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)?;

    let opml_title = opml
        .head
        .and_then(|head| head.title)
        .unwrap_or("Imported OPML".to_string());

    let root_id = sqlx::query_scalar!(
        r#"
    INSERT INTO collections (
      "user_id",
      "title",
      "icon",
      "order",
      "parent_id",
      "layout")
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
        "#,
        user_id,
        opml_title,
        DEFAULT_COLLECTION_ICON.to_string(),
        i32::MAX, // // put new collection at the end
        home_id,
        default_collection_layout,
    )
    .fetch_one(&mut transaction)
    .await
    .map_err(Into::into)
    .map_err(GenericError::UnexpectedError)?;

    let mut inserted_collections: Vec<CollectionToRefresh> = vec![];

    insert_outlines(
        &mut transaction,
        &mut inserted_collections,
        opml.body.outlines,
        user_id,
        root_id,
        &default_collection_layout,
    )
    .await
    .map_err(Into::into)
    .map_err(GenericError::UnexpectedError)?;

    sqlx::query!("CALL collections_recalculate_order()")
        .execute(&mut transaction)
        .await
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)?;

    let collections = get_collections_impl(&mut transaction, user_id)
        .await
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)?;

    transaction
        .commit()
        .await
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)?;

    info!("Inserted {} collections", inserted_collections.len());

    let jobs = inserted_collections
        .iter()
        .map(|c| Message::RefreshFeed {
            user_id,
            feed_id: c.id,
            url: c.url.clone(),
            etag: c.etag.clone(),
        })
        .collect();

    task_queue
        .push_bulk(jobs, None, Some(TaskPriority::Regular))
        .await
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)?;

    let feed_ids = inserted_collections.iter().map(|c| c.id).collect();
    broadcaster
        .send(user_id, WSMessage::UpdatingFeeds { feed_ids })
        .await;

    Ok(HttpResponse::Ok().json(collections))
}

#[async_recursion]
async fn insert_outlines(
    conn: &mut PgConnection,
    inserted_collections: &mut Vec<CollectionToRefresh>,
    outlines: Vec<Outline>,
    user_id: ID,
    parent_id: ID,
    default_collection_layout: &String,
) -> Result<(), anyhow::Error> {
    for outline in outlines {
        let title = &outline.text;
        let url = match outline.xml_url {
            Some(url) => normalize_url(
                &url,
                normalize_url_rs::OptionsBuilder::default().build().unwrap(),
            )
            .ok(),
            None => None,
        };

        if url.is_some() {
            let is_url_already_used = sqlx::query_scalar!(
                r#"
        SELECT id
        FROM collections
        WHERE url = $1 AND user_id = $2"#,
                url,
                user_id
            )
            .fetch_optional(&mut *conn)
            .await?;

            if is_url_already_used.is_some() {
                continue;
            }
        }

        let collection_id = sqlx::query_scalar!(
            r#"
    INSERT INTO collections (
      "user_id",
      "title",
      "icon",
      "order",
      "parent_id",
      "url",
      "refresh_interval",
      "layout")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id
        "#,
            user_id,
            title,
            DEFAULT_COLLECTION_ICON.to_string(),
            i32::MAX, // // put new collection at the end
            parent_id,
            url,
            DEFAULT_REFRESH_INTERVAL,
            default_collection_layout,
        )
        .fetch_one(&mut *conn)
        .await?;

        if let Some(url) = url {
            inserted_collections.push(CollectionToRefresh {
                owner_id: user_id,
                id: collection_id,
                url,
                etag: None,
            });
        }

        insert_outlines(
            conn,
            inserted_collections,
            outline.outlines,
            user_id,
            collection_id,
            default_collection_layout,
        )
        .await?;
    }

    Ok(())
}
