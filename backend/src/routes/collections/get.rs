use actix_web::{error::InternalError, web, HttpResponse};

use sqlx::{Acquire, PgPool, Postgres};
use std::collections::HashMap;

use crate::{authentication::UserId, routes::error::GenericError, session_state::ID};

use super::types::Collection;

#[tracing::instrument(skip(pool, user_id))]
pub async fn get_collections(
    pool: web::Data<PgPool>,
    user_id: UserId,
) -> Result<HttpResponse, InternalError<GenericError>> {
    let user_id: ID = user_id.into();

    get_collections_impl(pool.as_ref(), user_id)
        .await
        .map(|collections| HttpResponse::Ok().json(collections))
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)
        .map_err(Into::<InternalError<GenericError>>::into)
}

fn calculate_unread_count(collections: &mut Vec<Collection>) {
    let map: HashMap<ID, i32> = collections
        .into_iter()
        .map(|collection| (collection.id, collection.unread_count))
        .collect();

    for mut collection in collections {
        let children = &collection.children;
        if children.len() > 0 {
            let children_unread_count = children
                .into_iter()
                .fold(0, |acc, c| acc + map.get(&c).unwrap_or(&0));
            collection.unread_count = children_unread_count;
        }
    }
}

pub async fn get_collections_impl<'a, A>(
    conn: A,
    user_id: ID,
) -> Result<Vec<Collection>, sqlx::Error>
where
    A: Acquire<'a, Database = Postgres>,
{
    let mut conn = conn.acquire().await?;

    let mut collections = sqlx::query_as::<_, Collection>(include_str!("get.sql"))
        .bind(user_id)
        .fetch_all(&mut *conn)
        .await?;

    calculate_unread_count(&mut collections);

    Ok(collections)
}
