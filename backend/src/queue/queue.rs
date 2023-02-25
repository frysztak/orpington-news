use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{
    postgres::{PgHasArrayType, PgListener, PgTypeInfo},
    Postgres, Transaction,
};
use std::fmt::Debug;
use uuid::Uuid;

use crate::session_state::ID;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Job {
    pub id: Uuid,
    pub message: Message,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Message {
    RefreshFeed {
        feed_id: ID,
        url: String,
        etag: Option<String>,
    },
}

#[derive(Debug, Clone, sqlx::Type, PartialEq)]
#[repr(i32)]
pub enum TaskPriority {
    Regular,
    High,
}

impl PgHasArrayType for TaskPriority {
    fn array_type_info() -> sqlx::postgres::PgTypeInfo {
        PgTypeInfo::with_name("_int4")
    }
}

#[async_trait::async_trait]
pub trait Queue: Send + Sync + Debug {
    async fn push_bulk(
        &self,
        jobs: Vec<Message>,
        scheduled_for: Option<DateTime<Utc>>,
        priority: Option<TaskPriority>,
    ) -> Result<(), anyhow::Error>;
    async fn get_listener(&self) -> Result<PgListener, anyhow::Error>;
    async fn pull(&self) -> Result<Vec<Job>, anyhow::Error>;
    async fn delete_job(
        &self,
        job_id: Uuid,
        transaction: Option<&mut Transaction<'_, Postgres>>,
    ) -> Result<(), anyhow::Error>;
    async fn fail_job(
        &self,
        job_id: Uuid,
        transaction: Option<&mut Transaction<'_, Postgres>>,
    ) -> Result<(), anyhow::Error>;
    async fn clear(&self) -> Result<(), anyhow::Error>;
    async fn clear_running_jobs(&self) -> Result<(), anyhow::Error>;
}
