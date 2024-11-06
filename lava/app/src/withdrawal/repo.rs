use sqlx::PgPool;

use es_entity::*;

use crate::{
    data_export::Export,
    primitives::{ApprovalProcessId, CustomerId, WithdrawalId},
};

use super::{entity::*, error::*};

const BQ_TABLE_NAME: &str = "withdraw_events";

#[derive(EsRepo, Clone)]
#[es_repo(
    entity = "Withdrawal",
    err = "WithdrawalError",
    columns(
        customer_id(ty = "CustomerId", list_for),
        approval_process_id(ty = "ApprovalProcessId", update(persist = "false")),
        reference(ty = "String", create(accessor = "reference()")),
    ),
    post_persist_hook = "export"
)]
pub struct WithdrawalRepo {
    pool: PgPool,
    export: Export,
}

impl WithdrawalRepo {
    pub(super) fn new(pool: &PgPool, export: &Export) -> Self {
        Self {
            pool: pool.clone(),
            export: export.clone(),
        }
    }

    async fn export(
        &self,
        db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
        _: &Withdrawal,
        events: impl Iterator<Item = &PersistedEvent<WithdrawalEvent>>,
    ) -> Result<(), WithdrawalError> {
        self.export
            .es_entity_export(db, BQ_TABLE_NAME, events)
            .await?;
        Ok(())
    }
}
