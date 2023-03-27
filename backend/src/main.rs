use backend::config::read_config;
use backend::dedicated_executor::DedicatedExecutor;
use backend::queue::postgres::PostgresQueue;
use backend::queue::queue::Queue;
use backend::ws::broadcast::Broadcaster;
use backend::startup::Application;
use backend::tasks::queue_task::run_queue_until_stopped;
use backend::tasks::refresh_task::run_refresh_until_stopped;
use dotenvy::dotenv;
use sqlx::postgres::PgPoolOptions;
use std::fmt::{Debug, Display};
use std::sync::Arc;

#[cfg(not(feature = "tracing"))]
fn setup_tracing() -> Result<(), anyhow::Error> {
    use backend::telemetry::{get_subscriber, init_subscriber};

    let subscriber = get_subscriber("backend".into(), "info".into(), std::io::stdout);
    init_subscriber(subscriber);

    Ok(())
}

#[cfg(feature = "tracing")]
fn setup_tracing() -> Result<(), anyhow::Error> {
    use opentelemetry::global;
    use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

    // Allows you to pass along context (i.e., trace IDs) across services
    global::set_text_map_propagator(opentelemetry_jaeger::Propagator::new());
    // Sets up the machinery needed to export data to Jaeger
    // There are other OTel crates that provide pipelines for the vendors
    // mentioned earlier.
    let tracer = opentelemetry_jaeger::new_agent_pipeline()
        .with_service_name("API")
        .with_auto_split_batch(true)
        .install_batch(opentelemetry::runtime::Tokio)?;

    // Create a tracing layer with the configured tracer
    let opentelemetry = tracing_opentelemetry::layer().with_tracer(tracer);

    let env_filter =
        EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info"));

    // The SubscriberExt and SubscriberInitExt traits are needed to extend the
    // Registry to accept `opentelemetry (the OpenTelemetryLayer type).
    tracing_subscriber::registry()
        .with(opentelemetry)
        // Continue logging to stdout
        .with(fmt::Layer::default())
        .with(env_filter)
        .try_init()?;

    Ok(())
}

#[actix_web::main]
async fn main() -> anyhow::Result<()> {
    setup_tracing()?;

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
    // clear jobs stuck in 'running' state (because e.g. backend process got killed)
    queue.clear_running_jobs().await?;

    let broadcaster = Broadcaster::create();
    let queue_exec = DedicatedExecutor::new("Orpington News Task Queue", num_cpus::get());
    let queue_task = queue_exec.spawn(run_queue_until_stopped(
        queue.clone(),
        broadcaster.clone(),
        db_pool.clone(),
    ));
    let refresh_task = tokio::spawn(run_refresh_until_stopped(queue.clone(), db_pool.clone()));

    let application =
        Application::build(&config, &db_pool, queue.clone(), broadcaster.clone()).await?;
    let application_task = tokio::spawn(application.run_until_stopped());

    tokio::select! {
        o = application_task => report_exit("API", o),
        o = queue_task => report_exit("Queue worker", o),
        o = refresh_task => report_exit("Refresh worker", o),
    };

    Ok(())
}

fn report_exit(
    task_name: &str,
    outcome: Result<Result<(), impl Debug + Display>, impl Debug + Display>,
) {
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
