use crate::authentication::store::PostgresSessionStore;
use crate::config::AppConfig;
use crate::queue::queue::Queue;
use crate::routes::{auth, collections, e2e, events, preferences, spa};
use crate::ws::broadcast::Broadcaster;
use actix_cors::Cors;
use actix_identity::IdentityMiddleware;
use actix_session::config::PersistentSession;
use actix_session::SessionMiddleware;
use actix_web::cookie::{self, Key};
use actix_web::dev::Server;
use actix_web::http::header;
use actix_web::web::{self, Data};
use actix_web::{App, HttpServer};
use secrecy::ExposeSecret;
use sqlx::PgPool;
use std::net::TcpListener;
use std::sync::Arc;
use tracing_actix_web::TracingLogger;

pub struct Application {
    port: u16,
    server: Server,
}

impl Application {
    pub async fn build(
        config: &AppConfig,
        db_pool: &PgPool,
        task_queue: Arc<dyn Queue>,
        broadcaster: Arc<Broadcaster>,
    ) -> Result<Self, anyhow::Error> {
        let address = format!("{}:{}", config.host, config.port);
        let listener = TcpListener::bind(&address)?;
        let port = listener.local_addr().unwrap().port();
        let server = run(listener, db_pool, config, task_queue, broadcaster).await?;

        Ok(Self { port, server })
    }

    pub fn port(&self) -> u16 {
        self.port
    }

    pub async fn run_until_stopped(self) -> Result<(), std::io::Error> {
        self.server.await
    }
}

async fn run(
    listener: TcpListener,
    db_pool: &PgPool,
    config: &AppConfig,
    task_queue: Arc<dyn Queue>,
    broadcaster: Arc<Broadcaster>,
) -> Result<Server, anyhow::Error> {
    let db_pool = Data::new(db_pool.to_owned());
    let task_queue = Data::from(task_queue.to_owned());
    let session_store = PostgresSessionStore::new(db_pool.clone());
    let secret_key = Key::from(config.cookie_secret.expose_secret().as_bytes());
    let app_url = config.app_url.clone();
    let disable_secure_cookie = config.disable_secure_cookie;

    let server = HttpServer::new(move || {
        App::new()
            .wrap(
                Cors::default()
                    .allowed_origin(&app_url)
                    .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"])
                    .allowed_headers(vec![header::AUTHORIZATION, header::ACCEPT])
                    .allowed_header(header::CONTENT_TYPE)
                    .supports_credentials(),
            )
            .wrap(IdentityMiddleware::default())
            .wrap(
                SessionMiddleware::builder(session_store.clone(), secret_key.clone())
                    .cookie_name("sessionId".to_string())
                    .cookie_secure(!disable_secure_cookie)
                    .session_lifecycle(
                        PersistentSession::default()
                            .session_ttl(cookie::time::Duration::weeks(1))
                            .session_ttl_extension_policy(
                                actix_session::config::TtlExtensionPolicy::OnEveryRequest,
                            ),
                    )
                    .build(),
            )
            .wrap(TracingLogger::default())
            .service(
                web::scope("/api")
                    .service(auth())
                    .service(collections())
                    .service(preferences())
                    .service(e2e())
                    .service(events()),
            )
            .service(spa())
            .app_data(db_pool.clone())
            .app_data(task_queue.clone())
            .app_data(Data::from(broadcaster.clone()))
    })
    .listen(listener)?
    .run();

    Ok(server)
}
