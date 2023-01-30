use serde::{Deserialize, Serialize};
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
    RefreshFeed { feed_id: ID, url: String },
}

#[derive(Debug, Clone, sqlx::Type, PartialEq)]
#[repr(i32)]
pub enum TaskPriority {
    Regular,
    High,
}

#[async_trait::async_trait]
pub trait Queue: Send + Sync + Debug {
    async fn push(
        &self,
        job: Message,
        scheduled_for: Option<chrono::DateTime<chrono::Utc>>,
        priority: Option<TaskPriority>,
    ) -> Result<(), anyhow::Error>;
    /// pull fetches at most `number_of_jobs` from the queue.
    async fn pull(&self, number_of_jobs: u32) -> Result<Vec<Job>, anyhow::Error>;
    async fn delete_job(&self, job_id: Uuid) -> Result<(), anyhow::Error>;
    async fn fail_job(&self, job_id: Uuid) -> Result<(), anyhow::Error>;
    async fn clear(&self) -> Result<(), anyhow::Error>;
}
