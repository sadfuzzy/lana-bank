use serde::{de::DeserializeOwned, Serialize};
use sqlx::{PgPool, Postgres, Transaction};

use super::error::JobError;
use crate::primitives::JobId;

pub struct CurrentJob {
    id: JobId,
    pool: PgPool,
    payload_json: Option<serde_json::Value>,
}

impl CurrentJob {
    pub(super) fn new(id: JobId, pool: PgPool, state: Option<serde_json::Value>) -> Self {
        Self {
            id,
            pool,
            payload_json: state,
        }
    }

    pub fn state<T: DeserializeOwned>(&self) -> Result<Option<T>, serde_json::Error> {
        if let Some(state) = self.payload_json.as_ref() {
            serde_json::from_value(state.clone()).map(Some)
        } else {
            Ok(None)
        }
    }

    pub async fn update_payload<T: Serialize>(
        &mut self,
        tx: &mut Transaction<'_, Postgres>,
        payload: T,
    ) -> Result<(), JobError> {
        let payload_json =
            serde_json::to_value(payload).map_err(JobError::CouldNotSerializeState)?;
        sqlx::query!(
            r#"
          UPDATE job_executions
          SET payload_json = $1
          WHERE id = $2
        "#,
            payload_json,
            self.id as JobId
        )
        .execute(&mut **tx)
        .await?;
        self.payload_json = Some(payload_json);
        Ok(())
    }

    pub fn id(&self) -> JobId {
        self.id
    }

    pub fn pool(&self) -> &PgPool {
        &self.pool
    }
}
