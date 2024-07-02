mod entity;
pub mod error;
mod repo;
mod terms;

use sqlx::PgPool;

use crate::primitives::*;

use entity::*;
use error::*;
use repo::*;
use terms::*;

pub struct Loans {
    loan_repo: LoanRepo,
    term_repo: TermRepo,
    pool: PgPool,
}

impl Loans {
    pub fn new(pool: &PgPool) -> Self {
        let loan_repo = LoanRepo::new(pool);
        let term_repo = TermRepo::new(pool);
        Self {
            loan_repo,
            term_repo,
            pool: pool.clone(),
        }
    }

    pub async fn update_current_terms(&self, terms: TermValues) -> Result<Terms, LoanError> {
        self.term_repo.update_current(terms).await
    }

    pub async fn create_loan_for_user(
        &self,
        user_id: impl Into<UserId> + std::fmt::Debug,
    ) -> Result<Loan, LoanError> {
        let current_terms = self.term_repo.find_current().await?;
        let new_loan = NewLoan::builder()
            .id(LoanId::new())
            .user_id(user_id)
            .terms(current_terms.values)
            .build()
            .expect("could not build new loan");
        let mut tx = self.pool.begin().await?;
        let loan = self.loan_repo.create_in_tx(&mut tx, new_loan).await?;
        tx.commit().await?;
        Ok(loan)
    }
}
