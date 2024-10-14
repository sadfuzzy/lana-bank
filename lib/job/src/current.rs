use serde::{de::DeserializeOwned, Serialize};
use sqlx::{PgPool, Postgres, Transaction};

use super::{error::JobError, JobId};

pub struct CurrentJob {
    id: JobId,
    attempt: u32,
    pool: PgPool,
    data_json: Option<serde_json::Value>,
}

impl CurrentJob {
    pub(super) fn new(
        id: JobId,
        attempt: u32,
        pool: PgPool,
        data: Option<serde_json::Value>,
    ) -> Self {
        Self {
            id,
            attempt,
            pool,
            data_json: data,
        }
    }

    pub fn attempt(&self) -> u32 {
        self.attempt
    }

    pub fn data<T: DeserializeOwned>(&self) -> Result<Option<T>, serde_json::Error> {
        if let Some(data) = self.data_json.as_ref() {
            serde_json::from_value(data.clone()).map(Some)
        } else {
            Ok(None)
        }
    }

    pub async fn update_data<T: Serialize>(
        &mut self,
        db: &mut Transaction<'_, Postgres>,
        data: T,
    ) -> Result<(), JobError> {
        let data_json = serde_json::to_value(data).map_err(JobError::CouldNotSerializeData)?;
        sqlx::query!(
            r#"
          UPDATE jobs
          SET data_json = $1
          WHERE id = $2
        "#,
            data_json,
            self.id as JobId
        )
        .execute(&mut **db)
        .await?;
        self.data_json = Some(data_json);
        Ok(())
    }

    pub fn id(&self) -> JobId {
        self.id
    }

    pub fn pool(&self) -> &PgPool {
        &self.pool
    }
}
