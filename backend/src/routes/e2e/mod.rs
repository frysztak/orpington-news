use actix_web::{web, Scope};

mod reset_db;
mod setup_db;

#[cfg(feature = "e2e")]
pub fn e2e() -> Scope {
    web::scope("/e2e")
        .route("/reset_db", web::post().to(reset_db::reset_db))
        .route("/setup_db", web::post().to(setup_db::setup_db))
}

#[cfg(not(feature = "e2e"))]
pub fn e2e() -> Scope {
    web::scope("/e2e")
}
