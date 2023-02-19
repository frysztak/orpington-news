use chrono::{DateTime, Utc};
use serde_json::{json, Value};
use sqlx::{
    postgres::{PgHasArrayType, PgTypeInfo},
    types::{Json, Uuid},
    Pool, Postgres,
};
use ulid::Ulid;

use super::queue::{Job, Message, Queue, TaskPriority};

const MAX_FAILED_ATTEMPTS: i32 = 3;

#[derive(sqlx::FromRow, Debug, Clone)]
#[allow(dead_code)]
struct PostgresJob {
    id: Uuid,
    created_at: chrono::DateTime<chrono::Utc>,
    updated_at: chrono::DateTime<chrono::Utc>,

    scheduled_for: chrono::DateTime<chrono::Utc>,
    failed_attempts: i32,
    status: PostgresJobStatus,
    priority: i32,
    message: Json<Message>,
}

// We use a INT as Postgres representation for performance reasons
#[derive(Debug, Clone, sqlx::Type, PartialEq)]
#[repr(i32)]
enum PostgresJobStatus {
    Queued,
    Running,
    Failed,
}

impl PgHasArrayType for PostgresJobStatus {
    fn array_type_info() -> sqlx::postgres::PgTypeInfo {
        PgTypeInfo::with_name("_int4")
    }
}

impl From<PostgresJob> for Job {
    fn from(item: PostgresJob) -> Self {
        Job {
            id: item.id,
            message: item.message.0,
        }
    }
}

#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct PostgresQueue {
    db: Pool<Postgres>,
    max_attempts: u32,
}

impl PostgresQueue {
    pub fn new(db: Pool<Postgres>) -> PostgresQueue {
        let queue = PostgresQueue {
            db,
            max_attempts: 5,
        };

        queue
    }
}

#[async_trait::async_trait]
impl Queue for PostgresQueue {
    async fn push(
        &self,
        job: Message,
        date: Option<chrono::DateTime<chrono::Utc>>,
        priority: Option<TaskPriority>,
    ) -> Result<(), anyhow::Error> {
        let scheduled_for = date.unwrap_or(chrono::Utc::now());
        let failed_attempts: i32 = 0;
        let message = Json(job);
        let status = PostgresJobStatus::Queued;
        let priority = priority.unwrap_or(TaskPriority::Regular);
        let now = chrono::Utc::now();
        let job_id: Uuid = Ulid::new().into(); // ULID to UUID
        let query = "INSERT INTO queue
            (id, created_at, updated_at, scheduled_for, failed_attempts, status, priority, message)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";

        sqlx::query(query)
            .bind(job_id)
            .bind(now)
            .bind(now)
            .bind(scheduled_for)
            .bind(failed_attempts)
            .bind(status)
            .bind(priority)
            .bind(message)
            .execute(&self.db)
            .await?;
        Ok(())
    }

    async fn push_bulk(
        &self,
        jobs: Vec<Message>,
        date: Option<chrono::DateTime<chrono::Utc>>,
        priority: Option<TaskPriority>,
    ) -> Result<(), anyhow::Error> {
        let n = jobs.len();

        let scheduled_for = date.unwrap_or(chrono::Utc::now());
        let scheduled_for_vec: Vec<DateTime<Utc>> = (0..n).map(|_| scheduled_for).collect();

        let failed_attempts: Vec<i32> = (0..n).map(|_| 0).collect();
        let messages: Vec<Value> = jobs.iter().map(|job| json!(job)).collect();
        let statuses: Vec<PostgresJobStatus> = (0..n).map(|_| PostgresJobStatus::Queued).collect();
        let priority = priority.unwrap_or(TaskPriority::Regular);
        let priorities: Vec<TaskPriority> = (0..n).map(|_| priority.clone()).collect();
        let now = chrono::Utc::now();
        let now_vec: Vec<DateTime<Utc>> = (0..n).map(|_| now).collect();
        let job_ids: Vec<Uuid> = (0..n).map(|_| Ulid::new().into()).collect(); // ULID to UUID

        let mut transaction = self.db.begin().await?;

        sqlx::query!(
            r#"
INSERT INTO queue
  (id, created_at, updated_at, scheduled_for, failed_attempts, status, priority, message)
SELECT * FROM UNNEST(
  $1::UUID[],
  $2::TIMESTAMP[],
  $3::TIMESTAMP[],
  $4::TIMESTAMP[],
  $5::INT[],
  $6::INT[],
  $7::INT[],
  $8::JSONB[]
)
        "#,
            &job_ids[..],
            &now_vec[..]: Vec<NaiveDateTime>,
            &now_vec[..]: Vec<NaiveDateTime>,
            &scheduled_for_vec[..]: Vec<NaiveDateTime>,
            &failed_attempts[..],
            &statuses[..]: Vec<i32>,
            &priorities[..]: Vec<i32>,
            &messages[..]
        )
        .execute(&mut transaction)
        .await?;

        sqlx::query!(
            r#"
        DELETE FROM queue a
        USING queue b
        WHERE
            a.id < b.id
            AND a.message = b.message
        "#
        )
        .execute(&mut transaction)
        .await?;

        transaction.commit().await?;

        Ok(())
    }

    async fn pull(&self, number_of_jobs: u32) -> Result<Vec<Job>, anyhow::Error> {
        let now = chrono::Utc::now();
        let query = "UPDATE queue
            SET status = $1, updated_at = $2
            WHERE id IN (
                SELECT id
                FROM queue
                WHERE status = $3 AND scheduled_for <= $4 AND failed_attempts < $5
                ORDER BY priority DESC, scheduled_for
                FOR UPDATE SKIP LOCKED
                LIMIT $6
            )
            RETURNING *";

        let jobs: Vec<PostgresJob> = sqlx::query_as::<_, PostgresJob>(query)
            .bind(PostgresJobStatus::Running)
            .bind(now)
            .bind(PostgresJobStatus::Queued)
            .bind(now)
            .bind(MAX_FAILED_ATTEMPTS)
            .bind(number_of_jobs as i32)
            .fetch_all(&self.db)
            .await?;
        Ok(jobs.into_iter().map(Into::into).collect())
    }

    async fn delete_job(&self, job_id: Uuid) -> Result<(), anyhow::Error> {
        let query = "DELETE FROM queue WHERE id = $1";

        sqlx::query(query).bind(job_id).execute(&self.db).await?;
        Ok(())
    }

    async fn fail_job(&self, job_id: Uuid) -> Result<(), anyhow::Error> {
        let now = chrono::Utc::now();
        let query = "UPDATE queue
            SET status = $1, updated_at = $2, failed_attempts = failed_attempts + 1
            WHERE id = $3";

        sqlx::query(query)
            .bind(PostgresJobStatus::Queued)
            .bind(now)
            .bind(job_id)
            .execute(&self.db)
            .await?;
        Ok(())
    }

    async fn clear(&self) -> Result<(), anyhow::Error> {
        let query = "DELETE FROM queue";

        sqlx::query(query).execute(&self.db).await?;
        Ok(())
    }

    async fn clear_running_jobs(&self) -> Result<(), anyhow::Error> {
        sqlx::query(
            r#"
UPDATE queue
SET status = $1
WHERE status = $2
        "#,
        )
        .bind(PostgresJobStatus::Queued)
        .bind(PostgresJobStatus::Running)
        .execute(&self.db)
        .await?;

        Ok(())
    }
}
