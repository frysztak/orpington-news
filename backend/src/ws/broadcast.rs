use std::{collections::HashMap, sync::Arc, time::Duration};

use actix_web::rt::time::interval;
use actix_ws::Session;
use futures_util::{stream::FuturesUnordered, StreamExt};
use parking_lot::Mutex;
use serde_json::json;
use tracing::{info, warn};

use crate::session_state::ID;

use super::messages::WSMessage;

pub struct Broadcaster {
    inner: Mutex<BroadcasterInner>,
}

type ClientMap = HashMap<ID, Session>;

#[derive(Clone, Default)]
struct BroadcasterInner {
    clients: ClientMap,
}

impl Broadcaster {
    /// Constructs new broadcaster and spawns ping loop.
    pub fn create() -> Arc<Self> {
        let this = Arc::new(Broadcaster {
            inner: Mutex::new(BroadcasterInner::default()),
        });

        Broadcaster::spawn_ping(Arc::clone(&this));

        this
    }

    /// Pings clients every 10 seconds to see if they are alive and remove them from the broadcast
    /// list if not.
    fn spawn_ping(this: Arc<Self>) {
        actix_web::rt::spawn(async move {
            let mut interval = interval(Duration::from_secs(10));

            loop {
                interval.tick().await;
                this.remove_stale_clients().await;
            }
        });
    }

    /// Removes all non-responsive clients from broadcast list.
    async fn remove_stale_clients(&self) {
        let clients = self.inner.lock().clients.clone();

        let mut ok_clients = ClientMap::new();

        for (id, mut client) in clients {
            if client.ping(b"").await.is_ok() {
                ok_clients.insert(id, client.clone());
            }
        }

        self.inner.lock().clients = ok_clients;
    }

    /// Registers client with broadcaster, returning an SSE response body.
    pub async fn new_client(&self, user_id: ID, session: Session) {
        self.inner.lock().clients.insert(user_id, session);
    }

    /// Broadcasts `msg` to all clients.
    pub async fn broadcast(&self, msg: WSMessage) {
        let mut inner = self.inner.lock();

        let mut unordered = FuturesUnordered::new();
        let msg = json!(msg).to_string();

        for (user_id, mut session) in inner.clients.drain() {
            let msg = msg.clone();
            unordered.push(async move {
                let res = session.text(msg).await;
                res.map(|_| (user_id, session))
                    .map_err(|_| info!("Dropping session"))
            });
        }

        while let Some(res) = unordered.next().await {
            if let Ok((user_id, session)) = res {
                inner.clients.insert(user_id, session);
            }
        }
    }

    /// Send `msg` to a specific client.
    pub async fn send(&self, user_id: ID, msg: WSMessage) {
        let mut clients = self.inner.lock().clients.clone();
        let client = clients.get_mut(&user_id);

        match client {
            Some(c) => {
                let result = c.text(json!(&msg).to_string()).await;
                if let Err(e) = result {
                    warn!("Failed to send WS message: {}", e);
                };
            }
            None => {
                warn!("WS client with user ID {} not found", user_id);
            }
        };
    }
}
