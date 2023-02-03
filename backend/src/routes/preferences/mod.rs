use actix_web::{web, Scope};

mod active_view;
pub mod expand_collapse;
mod get;
mod put;
mod types;

pub fn preferences() -> Scope {
    web::scope("/preferences")
        .route("", web::get().to(get::get_preferences))
        .route("", web::put().to(put::put_preferences))
        .route("/activeView", web::put().to(active_view::active_view))
        .route(
            "/expand/{collection_id}",
            web::put().to(expand_collapse::expand_collection),
        )
        .route(
            "/collapse/{collection_id}",
            web::put().to(expand_collapse::collapse_collection),
        )
}
