use secrecy::{ExposeSecret, Secret};
use sqlx::postgres::{PgConnectOptions, PgSslMode};
use std::env::var;
use std::fs::read_to_string;
use std::io;
use std::num::ParseIntError;

#[derive(Debug)]
pub struct AppConfig {
    pub database: DBConfig,
    pub host: String,
    pub port: u16,
    pub cookie_secret: Secret<String>,
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
    IOError(io::Error),
}

impl From<ParseIntError> for AppConfigError {
    fn from(err: ParseIntError) -> Self {
        AppConfigError::PortParseError(err)
    }
}

pub fn read_config() -> Result<AppConfig, AppConfigError> {
    let host = read_var("HOST", "0.0.0.0".to_string());
    let port = read_var("PORT", "5000".to_string()).parse()?;

    let cookie_secret = read_var_from_file(
        "COOKIE_SECRET",
        "gIFu/XtobXNB+iqbndgHualAe/a2k43w76VukhbG2s+q1CJst9BghwtQtD5/YUEwDmdGG8mea9QKcOjNU1ktSg==".to_string(),
    )?;

    let db_pass = read_var_from_file("DB_PASS", "".to_string())?;
    let db_host = read_var_from_file("DB_HOST", "0.0.0.0".to_string())?;
    let db_port = read_var("DB_PORT", "5432".to_string()).parse()?;

    Ok(AppConfig {
        host,
        port,
        cookie_secret: Secret::new(cookie_secret),
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
