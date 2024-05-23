mod entity;
pub mod error;
// mod job;
mod repo;

use sqlx::PgPool;
use tracing::instrument;

use crate::{
    entity::{EntityError, EntityUpdate},
    job::{JobRegistry, Jobs},
    ledger::{fixed_term_loan::FixedTermLoanAccountIds, Ledger},
    primitives::*,
    user::UserRepo,
};

pub use entity::*;
use error::*;
use repo::*;

#[derive(Clone)]
pub struct FixedTermLoans {
    repo: FixedTermLoanRepo,
    users: UserRepo,
    ledger: Ledger,
    jobs: Option<Jobs>,
    pool: PgPool,
}

impl FixedTermLoans {
    pub fn new(
        pool: &PgPool,
        _registry: &mut JobRegistry,
        users: &UserRepo,
        ledger: &Ledger,
    ) -> Self {
        let repo = FixedTermLoanRepo::new(pool);
        Self {
            repo,
            users: users.clone(),
            ledger: ledger.clone(),
            jobs: None,
            pool: pool.clone(),
        }
    }

    pub fn set_jobs(&mut self, jobs: &Jobs) {
        self.jobs = Some(jobs.clone());
    }

    #[instrument(name = "lava.fixed_term_loans.create_loan_for_user", skip(self), err)]
    pub async fn create_loan_for_user(
        &self,
        user_id: impl Into<UserId> + std::fmt::Debug,
    ) -> Result<FixedTermLoan, FixedTermLoanError> {
        let mut tx = self.pool.begin().await?;
        let loan_id = FixedTermLoanId::new();
        let new_loan = NewFixedTermLoan::builder()
            .id(loan_id)
            .user_id(user_id)
            .account_ids(FixedTermLoanAccountIds::new())
            .build()
            .expect("Could not build FixedTermLoan");
        let EntityUpdate { entity: loan, .. } = self.repo.create_in_tx(&mut tx, new_loan).await?;
        tx.commit().await?;
        Ok(loan)
    }

    #[instrument(name = "lava.fixed_term_loans.approve_loan", skip(self), err)]
    pub async fn approve_loan(
        &self,
        loan_id: impl Into<FixedTermLoanId> + std::fmt::Debug,
        collateral: Satoshis,
        principal: UsdCents,
    ) -> Result<FixedTermLoan, FixedTermLoanError> {
        let mut loan = self.repo.find_by_id(loan_id.into()).await?;
        let user = self.users.find_by_id(loan.user_id).await?;
        let mut tx = self.pool.begin().await?;
        let tx_id = LedgerTxId::new();
        loan.approve(tx_id, collateral)?;
        self.repo.persist_in_tx(&mut tx, &mut loan).await?;
        self.ledger
            .create_accounts_for_loan(loan.id, loan.account_ids)
            .await?;
        self.ledger
            .approve_loan(
                tx_id,
                loan.account_ids,
                user.account_ids,
                collateral,
                principal,
                format!("{}-approval", loan.id),
            )
            .await?;
        tx.commit().await?;
        Ok(loan)
    }

    pub async fn find_by_id(
        &self,
        id: FixedTermLoanId,
    ) -> Result<Option<FixedTermLoan>, FixedTermLoanError> {
        match self.repo.find_by_id(id).await {
            Ok(loan) => Ok(Some(loan)),
            Err(FixedTermLoanError::EntityError(EntityError::NoEntityEventsPresent)) => Ok(None),
            Err(e) => Err(e),
        }
    }
}
