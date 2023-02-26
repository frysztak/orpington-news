use std::{collections::HashMap, sync::Arc, time::Duration};

use actix_web::rt::time::interval;
use actix_web_lab::sse::{self, ChannelStream, Sse};
use futures_util::future;
use parking_lot::Mutex;
use tracing::warn;

use crate::session_state::ID;

use super::messages::SSEMessage;

pub struct Broadcaster {
    inner: Mutex<BroadcasterInner>,
}

type ClientMap = HashMap<ID, sse::Sender>;

#[derive(Debug, Clone, Default)]
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

        for (id, client) in clients {
            if client
                .send(sse::Data::new_json(SSEMessage::Ping).unwrap())
                .await
                .is_ok()
            {
                ok_clients.insert(id, client.clone());
            }
        }

        self.inner.lock().clients = ok_clients;
    }

    /// Registers client with broadcaster, returning an SSE response body.
    pub async fn new_client(&self, user_id: ID) -> Sse<ChannelStream> {
        let (tx, rx) = sse::channel(10);

        tx.send(sse::Data::new_json(SSEMessage::Ping).unwrap())
            .await
            .unwrap();

        self.inner.lock().clients.insert(user_id, tx);

        rx
    }

    /// Broadcasts `msg` to all clients.
    pub async fn broadcast(&self, msg: SSEMessage) {
        let clients = self.inner.lock().clients.clone();

        let send_futures = clients
            .values()
            .map(|client| client.send(sse::Data::new_json(&msg).unwrap()));

        // try to send to all clients, ignoring failures
        // disconnected clients will get swept up by `remove_stale_clients`
        let _x = future::join_all(send_futures).await;
    }

    /// Send `msg` to a specific client.
    pub async fn send(&self, user_id: ID, msg: SSEMessage) {
        let clients = self.inner.lock().clients.clone();
        let client = clients.get(&user_id).clone();

        match client {
            Some(c) => {
                let result = c.send(sse::Data::new_json(&msg).unwrap()).await;
                if let Err(e) = result {
                    warn!("Failed to send SSE message: {}", e);
                };
            }
            None => {
                warn!("SSE client with user ID {} not found", user_id);
            }
        };
    }
}
