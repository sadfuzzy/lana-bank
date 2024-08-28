use sqlx::PgPool;

use crate::{
    data_export::Export,
    entity::*,
    primitives::{CustomerId, WithdrawId},
};

use super::{cursor::WithdrawCursor, entity::*, error::*};

const BQ_TABLE_NAME: &str = "withdraw_events";

#[derive(Clone)]
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

    pub(super) async fn create_in_tx(
        &self,
        db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
        new_withdraw: NewWithdraw,
    ) -> Result<Withdraw, WithdrawError> {
        sqlx::query!(
            r#"INSERT INTO withdraws (id, customer_id, reference)
            VALUES ($1, $2, $3)"#,
            new_withdraw.id as WithdrawId,
            new_withdraw.customer_id as CustomerId,
            new_withdraw.reference()
        )
        .execute(&mut **db)
        .await?;
        let mut events = new_withdraw.initial_events();
        let n_events = events.persist(db).await?;
        self.export
            .export_last(db, BQ_TABLE_NAME, n_events, &events)
            .await?;
        let withdraw = Withdraw::try_from(events)?;
        Ok(withdraw)
    }

    pub async fn find_by_id(&self, id: WithdrawId) -> Result<Withdraw, WithdrawError> {
        let rows = sqlx::query_as!(
            GenericEvent,
            r#"SELECT w.id, e.sequence, e.event,
                      w.created_at AS entity_created_at, e.recorded_at AS event_recorded_at
            FROM withdraws w
            JOIN withdraw_events e ON w.id = e.id
            WHERE w.id = $1
            ORDER BY e.sequence"#,
            id as WithdrawId,
        )
        .fetch_all(&self.pool)
        .await?;

        let res = EntityEvents::load_first::<Withdraw>(rows)?;
        Ok(res)
    }

    pub async fn persist_in_tx(
        &self,
        db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
        withdraw: &mut Withdraw,
    ) -> Result<(), WithdrawError> {
        let n_events = withdraw.events.persist(db).await?;
        self.export
            .export_last(db, BQ_TABLE_NAME, n_events, &withdraw.events)
            .await?;
        Ok(())
    }

    pub async fn list_for_customer(
        &self,
        customer_id: CustomerId,
    ) -> Result<Vec<Withdraw>, WithdrawError> {
        let rows = sqlx::query_as!(
            GenericEvent,
            r#"SELECT w.id, e.sequence, e.event,
               w.created_at AS entity_created_at, e.recorded_at AS event_recorded_at
               FROM withdraws w
               JOIN withdraw_events e ON w.id = e.id
               WHERE w.customer_id = $1
               ORDER BY w.id, e.sequence"#,
            customer_id as CustomerId,
        )
        .fetch_all(&self.pool)
        .await?;

        let n = rows.len();
        let deposits = EntityEvents::load_n(rows, n)?;
        Ok(deposits.0)
    }

    pub async fn list(
        &self,
        query: crate::query::PaginatedQueryArgs<WithdrawCursor>,
    ) -> Result<crate::query::PaginatedQueryRet<Withdraw, WithdrawCursor>, WithdrawError> {
        let rows = sqlx::query_as!(
            GenericEvent,
            r#"
        WITH withdraws AS (
            SELECT id, created_at
            FROM withdraws
            WHERE created_at < $1 OR $1 IS NULL
            ORDER BY created_at DESC
            LIMIT $2
        )
        SELECT d.id, e.sequence, e.event,
            d.created_at AS entity_created_at, e.recorded_at AS event_recorded_at
        FROM withdraws d
        JOIN withdraw_events e ON d.id = e.id
        ORDER BY d.created_at DESC, d.id, e.sequence"#,
            query.after.map(|c| c.withdrawal_created_at),
            query.first as i64 + 1
        )
        .fetch_all(&self.pool)
        .await?;

        let (entities, has_next_page) = EntityEvents::load_n::<Withdraw>(rows, query.first)?;

        let mut end_cursor = None;
        if let Some(last) = entities.last() {
            end_cursor = Some(WithdrawCursor {
                withdrawal_created_at: last.created_at(),
            });
        }

        Ok(crate::query::PaginatedQueryRet {
            entities,
            has_next_page,
            end_cursor,
        })
    }
}
