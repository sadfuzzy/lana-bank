use sqlx::{PgPool, Postgres, Transaction};

use super::{entity::*, error::*};
use crate::{entity::*, primitives::JobId};

#[derive(Debug, Clone)]
pub struct Jobs {
    pool: PgPool,
}

impl Jobs {
    pub fn new(pool: &PgPool) -> Self {
        Self { pool: pool.clone() }
    }

    pub async fn create_in_tx(
        &self,
        tx: &mut Transaction<'_, Postgres>,
        new_job: NewJob,
    ) -> Result<Job, JobError> {
        let id = new_job.id;
        sqlx::query!(
            r#"INSERT INTO jobs (id, name)
            VALUES ($1, $2)"#,
            id as JobId,
            new_job.name,
        )
        .execute(&mut **tx)
        .await?;
        let mut events = new_job.initial_events();
        events.persist(tx).await?;
        let job = Job::try_from(events)?;
        Ok(job)
    }

    pub async fn find_by_id(&self, id: JobId) -> Result<Job, JobError> {
        let rows = sqlx::query_as!(
            GenericEvent,
            r#"SELECT a.id, e.sequence, e.event,
                      a.created_at AS entity_created_at, e.recorded_at AS event_recorded_at
            FROM jobs a
            JOIN job_events e ON a.id = e.id
            WHERE a.id = $1
            ORDER BY e.sequence"#,
            id as JobId
        )
        .fetch_all(&self.pool)
        .await?;

        let res = EntityEvents::load_first::<Job>(rows)?;
        Ok(res)
    }
}
