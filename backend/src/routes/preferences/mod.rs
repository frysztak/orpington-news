use actix_web::{web, Scope};

mod get;

pub fn preferences() -> Scope {
    web::scope("/preferences").route("", web::get().to(get::get_preferences))
}
