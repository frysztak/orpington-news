use actix_web::{web, Responder, Scope};

use crate::{authentication::UserId, session_state::ID, sse::broadcast::Broadcaster};

async fn get_events(broadcaster: web::Data<Broadcaster>, user_id: UserId) -> impl Responder {
    let user_id: ID = user_id.into();
    broadcaster.new_client(user_id).await
}

pub fn events() -> Scope {
    web::scope("/events").route("", web::get().to(get_events))
}
