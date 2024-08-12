use sqlx::PgPool;

use super::{entity::*, error::*, DepositCursor};
use crate::{
    entity::*,
    primitives::{CustomerId, DepositId},
};

#[derive(Clone)]
pub struct DepositRepo {
    pool: PgPool,
}

impl DepositRepo {
    pub(super) fn new(pool: &PgPool) -> Self {
        Self { pool: pool.clone() }
    }

    pub(super) async fn create_in_tx(
        &self,
        db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
        new_deposit: NewDeposit,
    ) -> Result<Deposit, DepositError> {
        sqlx::query!(
            r#"INSERT INTO deposits (id, customer_id, reference)
            VALUES ($1, $2, $3)"#,
            new_deposit.id as DepositId,
            new_deposit.customer_id as CustomerId,
            new_deposit.reference()
        )
        .execute(&mut **db)
        .await?;
        let mut events = new_deposit.initial_events();
        events.persist(db).await?;
        let deposit = Deposit::try_from(events)?;
        Ok(deposit)
    }

    pub async fn find_by_id(&self, id: DepositId) -> Result<Deposit, DepositError> {
        let rows = sqlx::query_as!(
            GenericEvent,
            r#"SELECT w.id, e.sequence, e.event,
               w.created_at AS entity_created_at, e.recorded_at AS event_recorded_at
               FROM deposits w
               JOIN deposit_events e ON w.id = e.id
               WHERE w.id = $1"#,
            id as DepositId,
        )
        .fetch_all(&self.pool)
        .await?;

        match EntityEvents::load_first(rows) {
            Ok(deposit) => Ok(deposit),
            Err(EntityError::NoEntityEventsPresent) => Err(DepositError::CouldNotFindById(id)),
            Err(e) => Err(e.into()),
        }
    }

    pub async fn list_for_customer(
        &self,
        customer_id: CustomerId,
    ) -> Result<Vec<Deposit>, DepositError> {
        let rows = sqlx::query_as!(
            GenericEvent,
            r#"SELECT w.id, e.sequence, e.event,
               w.created_at AS entity_created_at, e.recorded_at AS event_recorded_at
               FROM deposits w
               JOIN deposit_events e ON w.id = e.id
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
        query: crate::query::PaginatedQueryArgs<DepositCursor>,
    ) -> Result<crate::query::PaginatedQueryRet<Deposit, DepositCursor>, DepositError> {
        let rows = sqlx::query_as!(
            GenericEvent,
            r#"
        WITH deposits AS (
            SELECT id, created_at
            FROM deposits
            WHERE created_at < $1 OR $1 IS NULL
            ORDER BY created_at DESC
            LIMIT $2
        )
        SELECT d.id, e.sequence, e.event,
            d.created_at AS entity_created_at, e.recorded_at AS event_recorded_at
        FROM deposits d
        JOIN deposit_events e ON d.id = e.id
        ORDER BY d.created_at DESC, d.id, e.sequence"#,
            query.after.map(|c| c.deposit_created_at),
            query.first as i64 + 1
        )
        .fetch_all(&self.pool)
        .await?;

        let (entities, has_next_page) = EntityEvents::load_n::<Deposit>(rows, query.first)?;

        let mut end_cursor = None;
        if let Some(last) = entities.last() {
            end_cursor = Some(DepositCursor {
                deposit_created_at: last.created_at(),
            });
        }

        Ok(crate::query::PaginatedQueryRet {
            entities,
            has_next_page,
            end_cursor,
        })
    }
}
