use sqlx::PgPool;
use uuid::Uuid;

use crate::primitives::CreditFacilityId;

use super::{entry::*, error::*};

// use super::{error::*, values::*};

#[derive(Clone)]
pub struct HistoryRepo {
    pool: PgPool,
}

impl HistoryRepo {
    pub fn new(pool: &PgPool) -> Self {
        Self { pool: pool.clone() }
    }

    pub async fn begin(
        &self,
    ) -> Result<sqlx::Transaction<'_, sqlx::Postgres>, CreditFacilityHistoryError> {
        Ok(self.pool.begin().await?)
    }

    pub async fn persist_in_tx(
        &self,
        tx: &mut sqlx::Transaction<'_, sqlx::Postgres>,
        credit_facility_id: CreditFacilityId,
        entries: Vec<CreditFacilityHistoryEntry>,
    ) -> Result<(), CreditFacilityHistoryError> {
        let values = serde_json::to_value(entries).expect("Could not serialize dashboard");
        let credit_facility_id: Uuid = credit_facility_id.into();
        sqlx::query!(
            r#"
            INSERT INTO credit_facility_histories (id, history)
            VALUES ($1, $2)
            ON CONFLICT (id) DO UPDATE
              SET history = EXCLUDED.history || $2
            "#,
            credit_facility_id,
            values
        )
        .execute(&mut **tx)
        .await?;
        Ok(())
    }
}
