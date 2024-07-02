use sqlx::{PgPool, Postgres, Transaction};

use crate::primitives::{LoanId, UserId};

use super::{error::LoanError, Loan, NewLoan};

#[derive(Clone)]
pub struct LoanRepo {
    _pool: PgPool,
}

impl LoanRepo {
    pub(super) fn new(pool: &PgPool) -> Self {
        Self {
            _pool: pool.clone(),
        }
    }

    pub async fn create_in_tx(
        &self,
        db: &mut Transaction<'_, Postgres>,
        new_loan: NewLoan,
    ) -> Result<Loan, LoanError> {
        sqlx::query!(
            r#"INSERT INTO loans (id, user_id)
            VALUES ($1, $2)"#,
            new_loan.id as LoanId,
            new_loan.user_id as UserId,
        )
        .execute(&mut **db)
        .await?;
        let mut events = new_loan.initial_events();
        events.persist(db).await?;
        Ok(Loan::try_from(events)?)
    }
}
