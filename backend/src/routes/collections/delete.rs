use actix_web::{error::InternalError, web, HttpResponse};

use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use tracing::warn;

use crate::{authentication::UserId, routes::error::GenericError, session_state::ID};

#[derive(Deserialize)]
pub struct PathParams {
    collection_id: ID,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Response {
    ids: Vec<ID>,
    navigate_home: bool,
}

#[tracing::instrument(skip(pool, path, user_id))]
pub async fn delete_collection(
    pool: web::Data<PgPool>,
    path: web::Path<PathParams>,
    user_id: UserId,
) -> Result<HttpResponse, InternalError<GenericError>> {
    let user_id: ID = user_id.into();

    let ids_to_delete = sqlx::query_scalar!(
        r#"
    SELECT id as "id!" FROM get_collection_children_ids($1)"#,
        path.collection_id
    )
    .fetch_all(pool.as_ref())
    .await
    .map_err(Into::into)
    .map_err(GenericError::UnexpectedError)?;

    let active_collection_id = sqlx::query_scalar!(
        r#"
    SELECT active_collection_id FROM preferences WHERE user_id = $1"#,
        user_id
    )
    .fetch_one(pool.as_ref())
    .await
    .map_err(Into::into)
    .map_err(GenericError::UnexpectedError)?;

    if let None = active_collection_id {
        warn!("Active Collection ID is NULL");
        return Ok(HttpResponse::InternalServerError().finish());
    }

    let active_collection_id = active_collection_id.unwrap();

    let mut transaction = pool
        .begin()
        .await
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)?;

    let deleting_currently_active_collection = ids_to_delete.contains(&active_collection_id);
    if deleting_currently_active_collection {
        let home_id = sqlx::query_scalar!(r#"SELECT home_id FROM users WHERE id = $1"#, user_id)
            .fetch_one(&mut *transaction)
            .await
            .map_err(Into::into)
            .map_err(GenericError::UnexpectedError)?;

        sqlx::query!(
            r#"UPDATE preferences
            SET active_collection_id = $1
            WHERE user_id = $2"#,
            home_id,
            user_id
        )
        .execute(&mut *transaction)
        .await
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)?;
    }

    let deleted_ids = sqlx::query_scalar!(
        r#"
    DELETE FROM collections
    WHERE id = ANY($1)
    RETURNING id"#,
        &ids_to_delete
    )
    .fetch_all(&mut *transaction)
    .await
    .map_err(Into::into)
    .map_err(GenericError::UnexpectedError)?;

    sqlx::query!(
        r#"
CALL collections_recalculate_order()
    "#
    )
    .execute(&mut *transaction)
    .await
    .map_err(Into::into)
    .map_err(GenericError::UnexpectedError)?;

    sqlx::query!(
        r#"
CALL preferences_prune_expanded_collections($1)
    "#,
        user_id
    )
    .execute(&mut *transaction)
    .await
    .map_err(Into::into)
    .map_err(GenericError::UnexpectedError)?;

    transaction
        .commit()
        .await
        .map_err(Into::into)
        .map_err(GenericError::UnexpectedError)?;

    Ok(HttpResponse::Ok().json(Response {
        ids: deleted_ids,
        navigate_home: deleting_currently_active_collection,
    }))
}
