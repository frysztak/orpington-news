use crate::authentication::store::PostgresSessionStore;
use crate::config::AppConfig;
use crate::queue::queue::Queue;
use crate::routes::{auth, collections, e2e, preferences, spa};
use actix_cors::Cors;
use actix_identity::IdentityMiddleware;
use actix_session::config::PersistentSession;
use actix_session::SessionMiddleware;
use actix_web::cookie::{self, Key};
use actix_web::dev::Server;
use actix_web::web::{self, Data};
use actix_web::{App, HttpServer};
use secrecy::{ExposeSecret, Secret};
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
    ) -> Result<Self, anyhow::Error> {
        let address = format!("{}:{}", config.host, config.port);
        let listener = TcpListener::bind(&address)?;
        let port = listener.local_addr().unwrap().port();
        let server = run(
            listener,
            db_pool,
            config.cookie_secret.clone(),
            // config.application.base_url,
            task_queue,
        )
        .await?;

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
    // base_url: String,
    cookie_secret: Secret<String>,
    task_queue: Arc<dyn Queue>,
) -> Result<Server, anyhow::Error> {
    let db_pool = Data::new(db_pool.to_owned());
    let task_queue = Data::new(task_queue.to_owned());
    let session_store = PostgresSessionStore::new(db_pool.clone());
    // let base_url = Data::new(ApplicationBaseUrl(base_url));
    let secret_key = Key::from(cookie_secret.expose_secret().as_bytes());
    let server = HttpServer::new(move || {
        App::new()
            .wrap(
                Cors::permissive(), //.allowed_origin("http://localhost:3000")
                                    //.allowed_methods(vec!["GET", "POST"])
                                    //.allowed_headers(vec![header::AUTHORIZATION, header::ACCEPT])
                                    //.allowed_header(header::CONTENT_TYPE)
                                    //.supports_credentials()
                                    // .allowed_headers(&[header::AUTHORIZATION, header::ACCEPT])
                                    // .allowed_header(header::CONTENT_TYPE)
                                    // .expose_headers(&[header::CONTENT_DISPOSITION])
                                    // .supports_credentials(), // .max_age(3600),
            )
            .wrap(IdentityMiddleware::default())
            .wrap(
                SessionMiddleware::builder(session_store.clone(), secret_key.clone())
                    .cookie_name("sessionId".to_string())
                    .cookie_secure(false)
                    .session_lifecycle(
                        PersistentSession::default().session_ttl(cookie::time::Duration::weeks(1)),
                    )
                    .build(),
            )
            .wrap(TracingLogger::default())
            .service(
                web::scope("/api")
                    .service(auth())
                    .service(collections())
                    .service(preferences())
                    .service(e2e()),
            )
            .service(spa())
            .app_data(db_pool.clone())
            .app_data(task_queue.clone())
        //.app_data(email_client.clone())
        //.app_data(base_url.clone())
        //.app_data(Data::new(HmacSecret(hmac_secret.clone())))
    })
    .listen(listener)?
    .run();
    Ok(server)
}
