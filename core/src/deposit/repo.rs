use sqlx::PgPool;

use es_entity::*;

use crate::{
    data_export::Export,
    primitives::{CustomerId, DepositId},
};

use super::{entity::*, error::*};

const BQ_TABLE_NAME: &str = "deposit_events";

#[derive(EsRepo, Clone)]
#[es_repo(
    entity = "Deposit",
    err = "DepositError",
    columns(
        customer_id = "CustomerId",
        reference(ty = "String", accessor(new = "reference()"))
    ),
    post_persist_hook = "export"
)]
pub struct DepositRepo {
    pool: PgPool,
    export: Export,
}

impl DepositRepo {
    pub(super) fn new(pool: &PgPool, export: &Export) -> Self {
        Self {
            pool: pool.clone(),
            export: export.clone(),
        }
    }

    pub async fn list_for_customer(
        &self,
        customer_id: CustomerId,
    ) -> Result<Vec<Deposit>, DepositError> {
        let (deposits, _) = es_entity::es_query!(
            &self.pool,
            "SELECT id FROM deposits WHERE customer_id = $1",
            customer_id as CustomerId,
        )
        .fetch_n(usize::MAX)
        .await?;

        Ok(deposits)
    }

    async fn export(
        &self,
        db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
        events: impl Iterator<Item = &PersistedEvent<DepositEvent>>,
    ) -> Result<(), DepositError> {
        self.export
            .es_entity_export(db, BQ_TABLE_NAME, events)
            .await?;
        Ok(())
    }
}
