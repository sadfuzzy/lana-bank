use serde::{de::DeserializeOwned, Serialize};
use sqlx::{PgPool, Postgres, Transaction};

use super::{error::JobError, JobId};

pub struct CurrentJob {
    id: JobId,
    attempt: u32,
    pool: PgPool,
    execution_data_json: Option<serde_json::Value>,
}

impl CurrentJob {
    pub(super) fn new(
        id: JobId,
        attempt: u32,
        pool: PgPool,
        execution_data: Option<serde_json::Value>,
    ) -> Self {
        Self {
            id,
            attempt,
            pool,
            execution_data_json: execution_data,
        }
    }

    pub fn attempt(&self) -> u32 {
        self.attempt
    }

    pub fn execution_data<T: DeserializeOwned>(&self) -> Result<Option<T>, serde_json::Error> {
        if let Some(execution_data) = self.execution_data_json.as_ref() {
            serde_json::from_value(execution_data.clone()).map(Some)
        } else {
            Ok(None)
        }
    }

    pub async fn update_execution_data<T: Serialize>(
        &mut self,
        db: &mut Transaction<'_, Postgres>,
        execution_data: T,
    ) -> Result<(), JobError> {
        let execution_data_json = serde_json::to_value(execution_data)
            .map_err(JobError::CouldNotSerializeExecutionData)?;
        sqlx::query!(
            r#"
          UPDATE job_executions
          SET execution_data_json = $1
          WHERE id = $2
        "#,
            execution_data_json,
            &self.id as &JobId
        )
        .execute(&mut **db)
        .await?;
        self.execution_data_json = Some(execution_data_json);
        Ok(())
    }

    pub fn id(&self) -> &JobId {
        &self.id
    }

    pub fn pool(&self) -> &PgPool {
        &self.pool
    }
}
