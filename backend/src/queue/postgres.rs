use chrono::{DateTime, Utc};
use serde_json::{json, Value};
use sqlx::{
    postgres::{PgHasArrayType, PgListener, PgTypeInfo},
    types::{Json, Uuid},
    Pool, Postgres, Transaction,
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
    async fn get_listener(&self) -> Result<PgListener, anyhow::Error> {
        PgListener::connect_with(&self.db).await.map_err(Into::into)
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
        .execute(&mut *transaction)
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
        .execute(&mut *transaction)
        .await?;

        transaction.commit().await?;

        Ok(())
    }

    async fn pull(&self) -> Result<Vec<Job>, anyhow::Error> {
        let now = chrono::Utc::now();

        let jobs: Vec<PostgresJob> = sqlx::query_as::<_, PostgresJob>(
            r#"
UPDATE queue
SET status = $1, updated_at = $2
WHERE id IN (
    SELECT id
    FROM queue
    WHERE status = $3 AND scheduled_for <= $4 AND failed_attempts < $5
    ORDER BY priority DESC, scheduled_for
    FOR UPDATE SKIP LOCKED
)
RETURNING *
"#,
        )
        .bind(PostgresJobStatus::Running)
        .bind(now)
        .bind(PostgresJobStatus::Queued)
        .bind(now)
        .bind(MAX_FAILED_ATTEMPTS)
        .fetch_all(&self.db)
        .await?;

        Ok(jobs.into_iter().map(Into::into).collect())
    }

    async fn delete_job(
        &self,
        job_id: Uuid,
        transaction: Option<&mut Transaction<'_, Postgres>>,
    ) -> Result<(), anyhow::Error> {
        let query = sqlx::query!(
            r#"
DELETE FROM queue WHERE id = $1
"#,
            job_id
        );

        match transaction {
            Some(t) => query.execute(&mut **t).await,
            None => query.execute(&self.db).await,
        }?;

        Ok(())
    }

    async fn fail_job(
        &self,
        job_id: Uuid,
        transaction: Option<&mut Transaction<'_, Postgres>>,
    ) -> Result<(), anyhow::Error> {
        let now = chrono::Utc::now();

        let query = sqlx::query!(
            r#"
UPDATE queue
SET
  status = $1,
  updated_at = $2,
  failed_attempts = failed_attempts + 1
WHERE id = $3
"#,
            PostgresJobStatus::Queued as i32,
            now,
            job_id
        );

        match transaction {
            Some(t) => query.execute(&mut **t).await,
            None => query.execute(&self.db).await,
        }?;

        Ok(())
    }

    async fn clear(&self) -> Result<(), anyhow::Error> {
        sqlx::query!(
            r#"
DELETE FROM queue
"#
        )
        .execute(&self.db)
        .await?;

        Ok(())
    }

    async fn clear_running_jobs(&self) -> Result<(), anyhow::Error> {
        sqlx::query!(
            r#"
UPDATE queue
SET status = $1
WHERE status = $2
        "#,
            PostgresJobStatus::Queued as i32,
            PostgresJobStatus::Running as i32
        )
        .execute(&self.db)
        .await?;

        Ok(())
    }
}
