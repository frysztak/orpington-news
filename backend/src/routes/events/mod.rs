use actix_web::{web, Error, HttpRequest, HttpResponse, Scope};
use actix_ws::Message;
use futures_util::StreamExt;
use tracing::{info, warn};

use crate::{authentication::UserId, ws::broadcast::Broadcaster};

async fn ws(
    req: HttpRequest,
    body: web::Payload,
    broadcaster: web::Data<Broadcaster>,
    user_id: UserId,
) -> Result<HttpResponse, Error> {
    let (response, mut session, mut msg_stream) = actix_ws::handle(&req, body)?;

    broadcaster
        .new_client(user_id.into(), session.clone())
        .await;

    actix_web::rt::spawn(async move {
        while let Some(Ok(msg)) = msg_stream.next().await {
            match msg {
                Message::Ping(bytes) => {
                    if let Err(e) = session.pong(&bytes).await {
                        warn!("Failed to pong, {}", e);
                        return;
                    }
                }
                Message::Close(reason) => {
                    info!("Got close, bailing");
                    if let Err(e) = session.close(reason).await {
                        warn!("Failed to close session, {}", e);
                    }
                    return;
                }
                Message::Pong(_) => continue,
                Message::Text(_) => continue,
                _ => break,
            }
        }

        let _ = session.close(None).await;
    });

    Ok(response)
}

pub fn events() -> Scope {
    web::scope("/events").route("", web::get().to(ws))
}
