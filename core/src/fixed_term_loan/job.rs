use async_trait::async_trait;
use serde::{Deserialize, Serialize};

use super::{error::*, repo::*};
use crate::{
    job::*,
    ledger::*,
    primitives::{FixedTermLoanId, LedgerTxId, UsdCents},
};

#[derive(Clone, Serialize, Deserialize)]
pub struct FixedTermLoanJobConfig {
    pub loan_id: FixedTermLoanId,
}

pub struct FixedTermLoanInterestJobInitializer {
    ledger: Ledger,
    repo: FixedTermLoanRepo,
}

impl FixedTermLoanInterestJobInitializer {
    pub fn new(ledger: &Ledger, repo: FixedTermLoanRepo) -> Self {
        Self {
            ledger: ledger.clone(),
            repo,
        }
    }
}

const FIXED_TERM_LOAN_INTEREST_JOB: JobType = JobType::new("fixed-term-loan-interest");
impl JobInitializer for FixedTermLoanInterestJobInitializer {
    fn job_type() -> JobType
    where
        Self: Sized,
    {
        FIXED_TERM_LOAN_INTEREST_JOB
    }

    fn init(&self, job: &Job) -> Result<Box<dyn JobRunner>, Box<dyn std::error::Error>> {
        Ok(Box::new(FixedTermLoanInterestJobRunner {
            config: job.config()?,
            repo: self.repo.clone(),
            ledger: self.ledger.clone(),
        }))
    }
}

pub struct FixedTermLoanInterestJobRunner {
    config: FixedTermLoanJobConfig,
    repo: FixedTermLoanRepo,
    ledger: Ledger,
}

#[async_trait]
impl JobRunner for FixedTermLoanInterestJobRunner {
    async fn run(
        &self,
        current_job: CurrentJob,
    ) -> Result<JobCompletion, Box<dyn std::error::Error>> {
        let mut loan = self.repo.find_by_id(self.config.loan_id).await?;
        let tx_id = LedgerTxId::new();
        let tx_ref = match loan.record_incur_interest_transaction(tx_id) {
            Err(FixedTermLoanError::AlreadyCompleted) => {
                return Ok(JobCompletion::Complete);
            }
            Ok(tx_ref) => tx_ref,
            Err(_) => unreachable!(),
        };
        println!(
            "Loan interest job running for loan: {:?} - ref {}",
            loan.id, tx_ref
        );
        let mut db_tx = current_job.pool().begin().await?;
        self.repo.persist_in_tx(&mut db_tx, &mut loan).await?;

        self.ledger
            .record_fixed_term_loan_interest(tx_id, loan.account_ids, tx_ref, UsdCents::ONE)
            .await?;

        match loan.next_interest_at() {
            Some(next_interest_at) => {
                Ok(JobCompletion::RescheduleAtWithTx(db_tx, next_interest_at))
            }
            None => {
                println!("Loan interest job completed for loan: {:?}", loan.id);
                Ok(JobCompletion::CompleteWithTx(db_tx))
            }
        }
    }
}
