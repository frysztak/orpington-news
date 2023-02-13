use actix_web::{web, Scope};
use actix_web_lab::middleware::from_fn;

use self::verify_owner::verify_owner_mw;

mod clean_html;
mod date_read;
mod delete;
mod get;
mod get_item;
mod get_items;
mod mark_as_read;
mod move_collection;
mod post;
mod preferences;
mod put;
mod refresh;
pub mod types;
pub mod update_collection;
mod verify_owner;
mod verify_url;

pub fn collections() -> Scope {
    web::scope("/collections")
        .route("", web::get().to(get::get_collections))
        .route("", web::post().to(post::post_collection))
        .route("", web::put().to(put::put_collection))
        .route("/verifyUrl", web::post().to(verify_url::verify_url))
        .route("/move", web::post().to(move_collection::move_collection))
        .route(
            "/{collection_id}",
            web::delete()
                .to(delete::delete_collection)
                .wrap(from_fn(verify_owner_mw)),
        )
        .route(
            "/{collection_id}/markAsRead",
            web::post()
                .to(mark_as_read::mark_as_read)
                .wrap(from_fn(verify_owner_mw)),
        )
        .route(
            "/{collection_id}/items",
            web::get()
                .to(get_items::get_collection_items)
                .wrap(from_fn(verify_owner_mw)),
        )
        .route(
            "/{collection_id}/refresh",
            web::post()
                .to(refresh::refresh_collection)
                .wrap(from_fn(verify_owner_mw)),
        )
        .route(
            "/{collection_id}/preferences",
            web::put()
                .to(preferences::preferences)
                .wrap(from_fn(verify_owner_mw)),
        )
        .route(
            "/{collection_id}/item/{item_id}",
            web::get()
                .to(get_item::get_item)
                .wrap(from_fn(verify_owner_mw)),
        )
        .route(
            "/{collection_id}/item/{item_id}/dateRead",
            web::put()
                .to(date_read::date_read)
                .wrap(from_fn(verify_owner_mw)),
        )
}
