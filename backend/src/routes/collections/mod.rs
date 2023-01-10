use actix_web::{web, Scope};

mod get;

pub fn collections() -> Scope {
    web::scope("/collections").route("", web::get().to(get::get_collections))
}
