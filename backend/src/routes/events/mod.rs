use actix_web::{web, Responder, Scope};

use crate::sse::broadcast::Broadcaster;

async fn get_events(broadcaster: web::Data<Broadcaster>) -> impl Responder {
    broadcaster.new_client().await
}

pub fn events() -> Scope {
    web::scope("/events").route("", web::get().to(get_events))
}
