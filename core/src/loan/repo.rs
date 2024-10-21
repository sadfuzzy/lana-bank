use sqlx::{PgPool, Postgres, Transaction};
use tracing::instrument;

use crate::{
    data_export::Export,
    entity::*,
    primitives::{CustomerId, LoanId},
};

use super::{cursor::*, entity::*, error::LoanError};

const BQ_TABLE_NAME: &str = "loan_events";

#[derive(Clone)]
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

    pub async fn create_in_tx(
        &self,
        db: &mut Transaction<'_, Postgres>,
        new_loan: NewLoan,
    ) -> Result<Loan, LoanError> {
        sqlx::query!(
            r#"INSERT INTO loans (id, customer_id)
            VALUES ($1, $2)"#,
            new_loan.id as LoanId,
            new_loan.customer_id as CustomerId,
        )
        .execute(&mut **db)
        .await?;
        let mut events = new_loan.initial_events();
        let n_events = events.persist(db).await?;
        self.export
            .export_last(db, BQ_TABLE_NAME, n_events, &events)
            .await?;
        Ok(Loan::try_from(events)?)
    }

    pub async fn find_by_id(&self, id: LoanId) -> Result<Loan, LoanError> {
        let rows = sqlx::query_as!(
            GenericEvent,
            r#"SELECT l.id, e.sequence, e.event,
                      l.created_at AS entity_created_at, e.recorded_at AS event_recorded_at
            FROM loans l
            JOIN loan_events e ON l.id = e.id
            WHERE l.id = $1
            ORDER BY e.sequence"#,
            id as LoanId,
        )
        .fetch_all(&self.pool)
        .await?;

        let res = EntityEvents::load_first::<Loan>(rows)?;
        Ok(res)
    }

    pub async fn persist(&self, loan: &mut Loan) -> Result<(), LoanError> {
        let mut tx = self.pool.begin().await?;
        self.update_in_tx(&mut tx, loan).await?;
        tx.commit().await?;
        Ok(())
    }

    pub async fn update_in_tx(
        &self,
        db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
        loan: &mut Loan,
    ) -> Result<(), LoanError> {
        sqlx::query!(
            r#"UPDATE loans SET collateralization_ratio = $2 WHERE id = $1"#,
            loan.id as LoanId,
            loan.collateralization_ratio(),
        )
        .execute(&mut **db)
        .await?;
        let n_events = loan.events.persist(db).await?;
        self.export
            .export_last(db, BQ_TABLE_NAME, n_events, &loan.events)
            .await?;
        Ok(())
    }

    pub async fn find_for_customer(&self, customer_id: CustomerId) -> Result<Vec<Loan>, LoanError> {
        let rows = sqlx::query_as!(
            GenericEvent,
            r#"SELECT l.id, e.sequence, e.event,
                      l.created_at AS entity_created_at, e.recorded_at AS event_recorded_at
            FROM loans l
            JOIN loan_events e ON l.id = e.id
            WHERE l.customer_id = $1
            ORDER BY l.id, e.sequence"#,
            customer_id as CustomerId,
        )
        .fetch_all(&self.pool)
        .await?;

        let n = rows.len();
        let res = EntityEvents::load_n::<Loan>(rows, n)?;
        Ok(res.0)
    }

    #[instrument(name = "lava.loan.repo.list", skip(self), err)]
    pub async fn list(
        &self,
        query: crate::query::PaginatedQueryArgs<LoanByCreatedAtCursor>,
    ) -> Result<crate::query::PaginatedQueryRet<Loan, LoanByCreatedAtCursor>, LoanError> {
        let rows = sqlx::query_as!(
            GenericEvent,
            r#"
            WITH loans AS (
              SELECT id, customer_id, created_at
              FROM loans
              WHERE ((created_at, id) < ($2, $1)) OR ($1 IS NULL AND $2 IS NULL)
              ORDER BY created_at DESC, id DESC
              LIMIT $3
            )
            SELECT l.id, e.sequence, e.event,
              l.created_at AS entity_created_at, e.recorded_at AS event_recorded_at
            FROM loans l
            JOIN loan_events e ON l.id = e.id
            ORDER BY l.created_at DESC, l.id DESC, e.sequence;
            "#,
            query.after.as_ref().map(|c| c.id) as Option<LoanId>,
            query.after.map(|l| l.created_at),
            query.first as i64 + 1
        )
        .fetch_all(&self.pool)
        .await?;
        let (entities, has_next_page) = EntityEvents::load_n::<Loan>(rows, query.first)?;
        let mut end_cursor = None;
        if let Some(last) = entities.last() {
            end_cursor = Some(LoanByCreatedAtCursor {
                id: last.id,
                created_at: last.created_at(),
            });
        }
        Ok(crate::query::PaginatedQueryRet {
            entities,
            has_next_page,
            end_cursor,
        })
    }

    #[instrument(
        name = "lava.loan.repo.list_by_collateralization_ratio",
        skip(self),
        err
    )]
    pub async fn list_by_collateralization_ratio(
        &self,
        query: crate::query::PaginatedQueryArgs<LoanByCollateralizationRatioCursor>,
    ) -> Result<crate::query::PaginatedQueryRet<Loan, LoanByCollateralizationRatioCursor>, LoanError>
    {
        let rows = sqlx::query_as!(
            GenericEvent,
            r#"
            WITH loans AS (
              SELECT id, customer_id, created_at, collateralization_ratio
              FROM loans
              WHERE ((COALESCE(collateralization_ratio, -1::NUMERIC), id) > (COALESCE($2, -1::NUMERIC), $1)) OR ($1 IS NULL)
              ORDER BY collateralization_ratio NULLS FIRST, id
              LIMIT $3
            )
            SELECT l.id, e.sequence, e.event,
              l.created_at AS entity_created_at, e.recorded_at AS event_recorded_at
            FROM loans l
            JOIN loan_events e ON l.id = e.id
            ORDER BY l.collateralization_ratio NULLS FIRST, l.id, e.sequence;
            "#,
            query.after.as_ref().map(|c| c.id) as Option<LoanId>,
            query.after.and_then(|l| l.ratio),
            query.first as i64 + 1
        )
        .fetch_all(&self.pool)
        .await?;
        let (entities, has_next_page) = EntityEvents::load_n::<Loan>(rows, query.first)?;
        let mut end_cursor = None;
        if let Some(last) = entities.last() {
            end_cursor = Some(LoanByCollateralizationRatioCursor::from(last))
        }
        Ok(crate::query::PaginatedQueryRet {
            entities,
            has_next_page,
            end_cursor,
        })
    }
}
