use sqlx::{PgPool, Postgres, Transaction};

use super::{entity::*, error::*};
use crate::{entity::*, primitives::*};

#[derive(Clone)]
pub(super) struct FixedTermLoanRepo {
    _pool: PgPool,
}

impl FixedTermLoanRepo {
    pub fn new(pool: &PgPool) -> Self {
        Self {
            _pool: pool.clone(),
        }
    }

    pub async fn create_in_tx(
        &self,
        tx: &mut Transaction<'_, Postgres>,
        new_loan: NewFixedTermLoan,
    ) -> Result<EntityUpdate<FixedTermLoan>, FixedTermLoanError> {
        let id = new_loan.id;
        sqlx::query!(
            r#"INSERT INTO fixed_term_loans (id)
            VALUES ($1)"#,
            id as FixedTermLoanId,
        )
        .execute(&mut **tx)
        .await?;
        let mut events = new_loan.initial_events();
        let n_new_events = events.persist(tx).await?;
        let loan = FixedTermLoan::try_from(events)?;
        Ok(EntityUpdate {
            entity: loan,
            n_new_events,
        })
    }
}
