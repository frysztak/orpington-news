use actix_web::{web, Scope};

mod get;
mod get_items;
mod verify_url;

pub fn collections() -> Scope {
    web::scope("/collections")
        .route("", web::get().to(get::get_collections))
        .route(
            "/{collection_id}/items",
            web::get().to(get_items::get_collection_items),
        )
        .route("/verifyUrl", web::post().to(verify_url::verify_url))
}
