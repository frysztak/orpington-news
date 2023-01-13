use actix_web::{web, Scope};

mod register;
mod login;
mod logout;
mod user;

pub fn auth() -> Scope {
    web::scope("/auth")
        .route("/register", web::post().to(register::register))
        .route("/login", web::post().to(login::login))
        .route("/session", web::delete().to(logout::logout))
        .route("/user", web::get().to(user::user_info))
        .route("/user/avatar", web::get().to(user::user_avatar))
}
