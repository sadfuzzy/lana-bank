use rust_decimal::Decimal;
use sqlx::PgPool;

use es_entity::*;

use crate::{
    data_export::Export,
    primitives::{CustomerId, LoanId},
};

use super::{entity::*, error::LoanError};

const BQ_TABLE_NAME: &str = "loan_events";

#[derive(EsRepo, Clone)]
#[es_repo(
    entity = "Loan",
    err = "LoanError",
    columns(
        customer_id(ty = "CustomerId", list_for),
        collateralization_ratio(
            ty = "Option<Decimal>",
            create(persist = false),
            update(accessor = "collateralization_ratio()")
        ),
    ),
    post_persist_hook = "export"
)]
pub struct LoanRepo {
    pool: PgPool,
    export: Export,
}

impl LoanRepo {
    pub(super) fn new(pool: &PgPool, export: &Export) -> Self {
        Self {
            pool: pool.clone(),
            export: export.clone(),
        }
    }

    //     #[instrument(
    //         name = "lava.loan.repo.list_by_collateralization_ratio",
    //         skip(self),
    //         err
    //     )]
    //     pub async fn list_by_collateralization_ratio(
    //         &self,
    //         query: crate::query::PaginatedQueryArgs<LoanByCollateralizationRatioCursor>,
    //     ) -> Result<crate::query::PaginatedQueryRet<Loan, LoanByCollateralizationRatioCursor>, LoanError>
    //     {
    //         let rows = sqlx::query_as!(
    //             GenericEvent,
    //             r#"
    //             WITH loans AS (
    //               SELECT id, customer_id, created_at, collateralization_ratio
    //               FROM loans
    //               WHERE ((COALESCE(collateralization_ratio, -1::NUMERIC), id) > (COALESCE($2, -1::NUMERIC), $1)) OR ($1 IS NULL)
    //               ORDER BY collateralization_ratio NULLS FIRST, id
    //               LIMIT $3
    //             )
    //             SELECT l.id, e.sequence, e.event,
    //               l.created_at AS entity_created_at, e.recorded_at AS event_recorded_at
    //             FROM loans l
    //             JOIN loan_events e ON l.id = e.id
    //             ORDER BY l.collateralization_ratio NULLS FIRST, l.id, e.sequence;
    //             "#,
    //             query.after.as_ref().map(|c| c.id) as Option<LoanId>,
    //             query.after.and_then(|l| l.ratio),
    //             query.first as i64 + 1
    //         )
    //         .fetch_all(&self.pool)
    //         .await?;
    //         let (entities, has_next_page) = EntityEvents::load_n::<Loan>(rows, query.first)?;
    //         let mut end_cursor = None;
    //         if let Some(last) = entities.last() {
    //             end_cursor = Some(LoanByCollateralizationRatioCursor::from(last))
    //         }
    //         Ok(crate::query::PaginatedQueryRet {
    //             entities,
    //             has_next_page,
    //             end_cursor,
    //         })
    //     }

    async fn export(
        &self,
        db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
        events: impl Iterator<Item = &PersistedEvent<LoanEvent>>,
    ) -> Result<(), LoanError> {
        self.export
            .es_entity_export(db, BQ_TABLE_NAME, events)
            .await?;
        Ok(())
    }
}
