use actix_web::{web, Scope};

mod login;
mod logout;
mod password;
mod register;
mod user;
mod utils;

pub fn auth() -> Scope {
    web::scope("/auth")
        .route("/register", web::post().to(register::register))
        .route("/login", web::post().to(login::login))
        .route("/session", web::delete().to(logout::logout))
        .route("/password", web::put().to(password::password))
        .route("/user", web::get().to(user::get_user))
        .route("/user", web::put().to(user::put_user))
        .route("/user/avatar", web::get().to(user::user_avatar))
}
