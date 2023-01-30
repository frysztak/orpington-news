use backend::config::read_config;
use backend::queue::postgres::PostgresQueue;
use backend::startup::Application;
use backend::telemetry::{get_subscriber, init_subscriber};
use backend::worker::run_worker_until_stopped;
use dotenvy::dotenv;
use sqlx::postgres::PgPoolOptions;
use std::fmt::{Debug, Display};
use std::sync::Arc;
use tokio::task::JoinError;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let subscriber = get_subscriber("backend".into(), "info".into(), std::io::stdout);
    init_subscriber(subscriber);

    if let Err(err) = dotenv() {
        tracing::warn!("Reading .env failed with {}", err);
    }
    let config = read_config().expect("Failed to read app config");

    let db_pool = PgPoolOptions::new()
        .acquire_timeout(std::time::Duration::from_secs(2))
        .connect_with(config.database.get_db_options())
        .await?;

    sqlx::migrate!("./migrations").run(&db_pool).await?;

    let queue = Arc::new(PostgresQueue::new(db_pool.clone()));
    let worker_task = tokio::spawn(run_worker_until_stopped(queue.clone()));

    let application = Application::build(&config, &db_pool, queue.clone()).await?;
    let application_task = tokio::spawn(application.run_until_stopped());

    tokio::select! {
        o = application_task => report_exit("API", o),
        o = worker_task => report_exit("Background worker", o),
    };

    Ok(())
}

fn report_exit(task_name: &str, outcome: Result<Result<(), impl Debug + Display>, JoinError>) {
    match outcome {
        Ok(Ok(())) => {
            tracing::info!("{} has exited", task_name)
        }
        Ok(Err(e)) => {
            tracing::error!(
                error.cause_chain = ?e,
                error.message = %e,
                "{} failed",
                task_name
            )
        }
        Err(e) => {
            tracing::error!(
                error.cause_chain = ?e,
                error.message = %e,
                "{}' task failed to complete",
                task_name
            )
        }
    }
}
