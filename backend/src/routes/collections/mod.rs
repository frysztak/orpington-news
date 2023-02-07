use actix_web::{web, Scope};

mod clean_html;
mod delete;
mod get;
mod get_items;
mod post;
mod refresh;
pub mod types;
pub mod update_collection;
mod verify_url;

pub fn collections() -> Scope {
    web::scope("/collections")
        .route("", web::get().to(get::get_collections))
        .route("", web::post().to(post::post_collection))
        .route("/verifyUrl", web::post().to(verify_url::verify_url))
        .route(
            "/{collection_id}",
            web::delete().to(delete::delete_collection),
        )
        .route(
            "/{collection_id}/items",
            web::get().to(get_items::get_collection_items),
        )
        .route(
            "/{collection_id}/refresh",
            web::post().to(refresh::refresh_collection),
        )
}
