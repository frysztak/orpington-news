use secrecy::{ExposeSecret, Secret};
use sqlx::postgres::{PgConnectOptions, PgSslMode};
use std::env::var;
use std::fs::read_to_string;
use std::io;
use std::num::ParseIntError;
use std::str::ParseBoolError;
use tracing::warn;

#[derive(Debug)]
pub struct AppConfig {
    pub database: DBConfig,
    pub host: String,
    pub port: u16,
    pub cookie_secret: Secret<String>,
    pub app_url: String,
    pub disable_secure_cookie: bool,
}

#[derive(Debug)]
pub struct DBConfig {
    pub username: String,
    pub password: Secret<String>,
    pub port: u16,
    pub host: String,
    pub name: String,
}

#[derive(Debug)]
pub enum AppConfigError {
    ExclusiveOptions(String),
    PortParseError(ParseIntError),
    BoolParseError(ParseBoolError),
    IOError(io::Error),
}

impl From<ParseIntError> for AppConfigError {
    fn from(err: ParseIntError) -> Self {
        AppConfigError::PortParseError(err)
    }
}

impl From<ParseBoolError> for AppConfigError {
    fn from(err: ParseBoolError) -> Self {
        AppConfigError::BoolParseError(err)
    }
}

static DEFAULT_COOKIE_SECRET: &'static str =
    "gIFu/XtobXNB+iqbndgHualAe/a2k43w76VukhbG2s+q1CJst9BghwtQtD5/YUEwDmdGG8mea9QKcOjNU1ktSg==";

pub fn read_config() -> Result<AppConfig, AppConfigError> {
    let host = read_var("HOST", "0.0.0.0".to_string());
    let port = read_var("PORT", "5000".to_string()).parse()?;

    let cookie_secret =
        match read_var_from_file("COOKIE_SECRET", DEFAULT_COOKIE_SECRET.to_string())? {
            str if str.len() < 64 => {
                warn!("Cookie secret must be at least 64 characters, using default one");
                DEFAULT_COOKIE_SECRET.to_string()
            }
            str => str,
        };

    let app_url = var("APP_URL").expect("Missing APP_URL env var");
    let disable_secure_cookie = read_var("DISABLE_SECURE_COOKIE", "false".to_string()).parse()?;

    let db_pass = read_var_from_file("DB_PASS", "".to_string())?;
    let db_host = read_var_from_file("DB_HOST", "0.0.0.0".to_string())?;
    let db_port = read_var("DB_PORT", "5432".to_string()).parse()?;

    Ok(AppConfig {
        host,
        port,
        cookie_secret: Secret::new(cookie_secret),
        app_url,
        disable_secure_cookie,
        database: DBConfig {
            username: read_var("DB_USER", "postgres".to_string()),
            password: Secret::new(db_pass),
            host: db_host,
            port: db_port,
            name: read_var("DB_NAME", "postgres".to_string()),
        },
    })
}

fn read_var_from_file(var_name: &str, default_value: String) -> Result<String, AppConfigError> {
    let var_file_name = &format!("{}_FILE", var_name);
    let var_result = var(var_name);
    let var_file_result = var(var_file_name);

    match (var_result, var_file_result) {
        (Ok(_), Ok(__)) => Err(AppConfigError::ExclusiveOptions(format!(
            "Both {} and {} exist, please use just one",
            var_name, var_file_name
        ))),
        (Err(_), Ok(file_path)) => read_to_string(file_path)
            .map(|x| x.trim().to_string())
            .map_err(|err| AppConfigError::IOError(err)),
        (Ok(var_value), Err(_)) => Ok(var_value),
        (Err(_), Err(_)) => Ok(default_value),
    }
}

fn read_var(var_name: &str, default_value: String) -> String {
    let var_result = var(var_name);

    match var_result {
        Ok(var_value) => var_value,
        Err(_) => default_value,
    }
}

impl DBConfig {
    pub fn get_db_options(&self) -> PgConnectOptions {
        let ssl_mode = PgSslMode::Prefer;
        PgConnectOptions::new()
            .host(&self.host.to_string())
            .username(&self.username)
            .password(self.password.expose_secret())
            .port(self.port)
            .database(&self.name)
            .ssl_mode(ssl_mode)
    }
}
