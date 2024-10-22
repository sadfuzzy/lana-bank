use sqlx::PgPool;

use es_entity::*;

use crate::{
    data_export::Export,
    primitives::{CustomerId, WithdrawId},
};

use super::{entity::*, error::*};

const BQ_TABLE_NAME: &str = "withdraw_events";

#[derive(EsRepo, Clone)]
#[es_repo(
    entity = "Withdraw",
    err = "WithdrawError",
    columns(
        customer_id = "CustomerId",
        reference(ty = "String", create(accessor = "reference()")),
    ),
    post_persist_hook = "export"
)]
pub struct WithdrawRepo {
    pool: PgPool,
    export: Export,
}

impl WithdrawRepo {
    pub(super) fn new(pool: &PgPool, export: &Export) -> Self {
        Self {
            pool: pool.clone(),
            export: export.clone(),
        }
    }

    pub async fn list_for_customer(
        &self,
        customer_id: CustomerId,
    ) -> Result<Vec<Withdraw>, WithdrawError> {
        let (withdraws, _) = es_entity::es_query!(
            &self.pool,
            "SELECT id FROM withdraws WHERE customer_id = $1",
            customer_id as CustomerId,
        )
        .fetch_n(usize::MAX)
        .await?;

        Ok(withdraws)
    }

    async fn export(
        &self,
        db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
        events: impl Iterator<Item = &PersistedEvent<WithdrawEvent>>,
    ) -> Result<(), WithdrawError> {
        self.export
            .es_entity_export(db, BQ_TABLE_NAME, events)
            .await?;
        Ok(())
    }
}
