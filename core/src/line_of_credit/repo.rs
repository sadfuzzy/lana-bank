use sqlx::{PgPool, Postgres, Transaction};

use super::{entity::*, error::*};
use crate::{entity::*, primitives::*};

#[derive(Clone)]
pub(super) struct LineOfCreditContractRepo {
    pool: PgPool,
}

impl LineOfCreditContractRepo {
    pub fn new(pool: &PgPool) -> Self {
        Self { pool: pool.clone() }
    }

    pub async fn create_in_tx(
        &self,
        tx: &mut Transaction<'_, Postgres>,
        new_contract: NewLineOfCreditContract,
    ) -> Result<EntityUpdate<LineOfCreditContract>, LineOfCreditContractError> {
        sqlx::query!(
            r#"INSERT INTO line_of_credit_contracts (id, user_id)
            VALUES ($1, $2)"#,
            new_contract.id as LineOfCreditContractId,
            new_contract.user_id as UserId
        )
        .execute(&mut **tx)
        .await?;
        let mut events = new_contract.initial_events();
        let n_new_events = events.persist(tx).await?;
        let loan = LineOfCreditContract::try_from(events)?;
        Ok(EntityUpdate {
            entity: loan,
            n_new_events,
        })
    }

    pub async fn find_by_id(
        &self,
        id: LineOfCreditContractId,
    ) -> Result<LineOfCreditContract, LineOfCreditContractError> {
        let rows = sqlx::query_as!(
            GenericEvent,
            r#"SELECT l.id, e.sequence, e.event,
                      l.created_at AS entity_created_at, e.recorded_at AS event_recorded_at
            FROM line_of_credit_contracts l
            JOIN line_of_credit_contract_events e ON l.id = e.id
            WHERE l.id = $1
            ORDER BY e.sequence"#,
            id as LineOfCreditContractId,
        )
        .fetch_all(&self.pool)
        .await?;

        let res = EntityEvents::load_first::<LineOfCreditContract>(rows)?;
        Ok(res)
    }
}
