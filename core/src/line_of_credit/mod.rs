mod entity;
pub mod error;
mod repo;

use sqlx::PgPool;
use tracing::instrument;

use crate::{
    entity::{EntityError, EntityUpdate},
    job::{JobRegistry, Jobs},
    ledger::Ledger,
    primitives::*,
};

pub use entity::*;
use error::*;
use repo::*;

#[derive(Clone)]
pub struct LineOfCreditContracts {
    repo: LineOfCreditContractRepo,
    _ledger: Ledger,
    jobs: Option<Jobs>,
    pool: PgPool,
}

impl LineOfCreditContracts {
    pub fn new(pool: &PgPool, _registry: &mut JobRegistry, ledger: &Ledger) -> Self {
        let repo = LineOfCreditContractRepo::new(pool);
        Self {
            repo,
            _ledger: ledger.clone(),
            jobs: None,
            pool: pool.clone(),
        }
    }

    pub fn set_jobs(&mut self, jobs: &Jobs) {
        self.jobs = Some(jobs.clone());
    }

    #[instrument(name = "lava.line_of_credit.create_contract", skip(self), err)]
    pub async fn create_contract(
        &self,
        user_id: UserId,
    ) -> Result<LineOfCreditContract, LineOfCreditContractError> {
        let contract_id = LineOfCreditContractId::new();
        let new_contract = NewLineOfCreditContract::builder()
            .id(contract_id)
            .user_id(user_id)
            .build()
            .expect("Could not build LineOfCreditContract");
        let mut tx = self.pool.begin().await?;
        let EntityUpdate {
            entity: contract, ..
        } = self.repo.create_in_tx(&mut tx, new_contract).await?;
        tx.commit().await?;
        Ok(contract)
    }

    pub async fn find_by_id(
        &self,
        id: LineOfCreditContractId,
    ) -> Result<Option<LineOfCreditContract>, LineOfCreditContractError> {
        match self.repo.find_by_id(id).await {
            Ok(contract) => Ok(Some(contract)),
            Err(LineOfCreditContractError::EntityError(EntityError::NoEntityEventsPresent)) => {
                Ok(None)
            }
            Err(e) => Err(e),
        }
    }
}
