use std::fmt::{Debug, Display};
use backend::telemetry::{get_subscriber, init_subscriber};
use tokio::task::JoinError;
use backend::config::read_config;
use backend::startup::Application;
use dotenvy::dotenv;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let subscriber = get_subscriber("backend".into(), "info".into(), std::io::stdout);
    init_subscriber(subscriber);

    dotenv().expect("Missing .env file");
    let config = read_config().expect("Failed to read app config");
    let application = Application::build(&config).await?;
    let application_task = tokio::spawn(application.run_until_stopped());
    
    tokio::select! {
        o = application_task => report_exit("API", o),
        // o = worker_task =>  report_exit("Background worker", o),
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