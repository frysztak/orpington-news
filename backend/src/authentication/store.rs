use actix_session::storage::{LoadError, SaveError, SessionKey, SessionStore, UpdateError};
use actix_web::{
    cookie::time::{Duration, OffsetDateTime},
    web::Data,
};
use anyhow::Error;
use rand::{distributions::Alphanumeric, rngs::OsRng, Rng as _};
use sqlx::{types::chrono::NaiveDateTime, PgPool};
use std::{collections::HashMap, sync::Arc};

#[derive(Clone)]
pub struct PostgresSessionStore {
    pool: Data<PgPool>,
    configuration: CacheConfiguration,
}

impl PostgresSessionStore {
    pub fn new(pool: Data<PgPool>) -> Self {
        Self {
            pool,
            configuration: CacheConfiguration::default(),
        }
    }
}

#[derive(Clone)]
struct CacheConfiguration {
    cache_keygen: Arc<dyn Fn(&str) -> String + Send + Sync>,
}

impl Default for CacheConfiguration {
    fn default() -> Self {
        Self {
            cache_keygen: Arc::new(str::to_owned),
        }
    }
}

#[allow(dead_code)]
struct SessionRow {
    sid: String,
    sess: sqlx::types::JsonValue,
    expire: NaiveDateTime,
}

type SessionState = HashMap<String, String>;

// https://github.com/bbogdan95/actix-extras/blob/a35d50f440da77a4a1d9bb2fd89f66880a96caab/actix-session/src/storage/utils.rs#L10
fn generate_session_key() -> SessionKey {
    let value = std::iter::repeat(())
        .map(|()| OsRng.sample(Alphanumeric))
        .take(64)
        .collect::<Vec<_>>();

    // These unwraps will never panic because pre-conditions are always verified
    // (i.e. length and character set)
    String::from_utf8(value).unwrap().try_into().unwrap()
}

#[async_trait::async_trait(?Send)]
impl SessionStore for PostgresSessionStore {
    async fn load(&self, session_key: &SessionKey) -> Result<Option<SessionState>, LoadError> {
        let cache_key = (self.configuration.cache_keygen)(session_key.as_ref());

        sqlx::query_as!(
            SessionRow,
            r"SELECT * FROM session WHERE sid = $1",
            cache_key
        )
        .fetch_optional(self.pool.as_ref())
        .await
        .map(|row| match row {
            Some(row_data) => {
                let deserialized_session_state =
                    serde_json::from_value::<HashMap<String, String>>(row_data.sess)
                        .map_err(Into::into)
                        .map_err(LoadError::Deserialization)
                        .ok()?;
                Some(deserialized_session_state)
            }
            None => None,
        })
        .map_err(Into::into)
        .map_err(LoadError::Other)
    }

    async fn save(
        &self,
        session_state: SessionState,
        ttl: &Duration,
    ) -> Result<SessionKey, SaveError> {
        let session_key = generate_session_key();
        let cache_key = (self.configuration.cache_keygen)(session_key.as_ref());
        let body = serde_json::to_value(&session_state)
            .map_err(Into::into)
            .map_err(SaveError::Serialization)?;

        let expire_timestamp = OffsetDateTime::now_utc()
            .checked_add(*ttl)
            .unwrap()
            .unix_timestamp();
        let expire = NaiveDateTime::from_timestamp_millis(expire_timestamp * 1000);

        sqlx::query!(
            r"INSERT INTO session(sid, sess, expire) VALUES ($1, $2, $3)",
            cache_key,
            body,
            expire
        )
        .execute(self.pool.as_ref())
        .await
        .map(|_| session_key)
        .map_err(Into::into)
        .map_err(SaveError::Other)
    }

    async fn update(
        &self,
        session_key: SessionKey,
        session_state: SessionState,
        ttl: &Duration,
    ) -> Result<SessionKey, UpdateError> {
        let cache_key = (self.configuration.cache_keygen)(session_key.as_ref());
        let body = serde_json::to_value(&session_state)
            .map_err(Into::into)
            .map_err(UpdateError::Serialization)?;

        let expire_timestamp = OffsetDateTime::now_utc()
            .checked_add(*ttl)
            .unwrap()
            .unix_timestamp();
        let expire = NaiveDateTime::from_timestamp_millis(expire_timestamp * 1000);

        let update_result = sqlx::query!(
            r"UPDATE session
              SET sess = $1,
                  expire = $2
              WHERE sid = $3 AND expire < now()",
            body,
            expire,
            cache_key,
        )
        .execute(self.pool.as_ref())
        .await
        .map_err(Into::into)
        .map_err(UpdateError::Other)?;

        match update_result.rows_affected() {
            0 => {
                // No rows were updated in the database because the session expired
                // between the load operation and the update operation.
                // Fallback to the `save` routine
                self.save(session_state, ttl)
                    .await
                    .map_err(|err| match err {
                        SaveError::Serialization(err) => UpdateError::Serialization(err),
                        SaveError::Other(err) => UpdateError::Other(err),
                    })
            }
            _ => Ok(session_key),
        }
    }

    async fn update_ttl(
        &self,
        session_key: &SessionKey,
        ttl: &Duration,
    ) -> Result<(), anyhow::Error> {
        let cache_key = (self.configuration.cache_keygen)(session_key.as_ref());
        let expire_timestamp = OffsetDateTime::now_utc()
            .checked_add(*ttl)
            .unwrap()
            .unix_timestamp();
        let expire = NaiveDateTime::from_timestamp_millis(expire_timestamp * 1000);

        sqlx::query!(
            r"UPDATE session
              SET expire = $1
              WHERE sid = $2",
            expire,
            cache_key,
        )
        .execute(self.pool.as_ref())
        .await
        .map(|_| ())
        .map_err(Into::into)
        .map_err(UpdateError::Other)
        .map_err(Error::new)
    }

    async fn delete(&self, session_key: &SessionKey) -> Result<(), anyhow::Error> {
        let cache_key = (self.configuration.cache_keygen)(session_key.as_ref());

        sqlx::query!(r"DELETE FROM session WHERE sid = $1", cache_key,)
            .execute(self.pool.as_ref())
            .await
            .map(|_| ())
            .map_err(Into::into)
    }
}
