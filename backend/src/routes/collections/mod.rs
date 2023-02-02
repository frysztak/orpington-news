use actix_web::{web, Scope};

pub mod types;
mod get;
mod get_items;
mod refresh;
mod verify_url;
pub mod update_collection;
mod clean_html;

pub fn collections() -> Scope {
    web::scope("/collections")
        .route("", web::get().to(get::get_collections))
        .route("/verifyUrl", web::post().to(verify_url::verify_url))
        .route(
            "/{collection_id}/items",
            web::get().to(get_items::get_collection_items),
        )
        .route(
            "/{collection_id}/refresh",
            web::post().to(refresh::refresh_collection),
        )
}
