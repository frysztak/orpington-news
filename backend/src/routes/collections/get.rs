use actix_web::{error::InternalError, web, HttpResponse};

use sqlx::PgPool;
use std::collections::HashMap;

use crate::{authentication::UserId, routes::error::GenericError, session_state::ID};

use super::types::Collection;

#[tracing::instrument(skip(pool, user_id))]
pub async fn get_collections(
    pool: web::Data<PgPool>,
    user_id: UserId,
) -> Result<HttpResponse, InternalError<GenericError>> {
    let user_id: ID = user_id.into();

    let mut collections = sqlx::query_as::<_, Collection>(include_str!("get.sql"))
        .bind(user_id)
        .fetch_all(pool.as_ref())
        .await
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)
        .map_err(Into::<InternalError<GenericError>>::into)?;

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
