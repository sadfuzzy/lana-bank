use async_trait::async_trait;
use serde::{Deserialize, Serialize};

use super::repo::*;
use crate::{job::*, ledger::*};

#[derive(Clone, Default, Serialize, Deserialize)]
pub struct FixedTermLoanJobConfig {}

pub struct FixedTermLoanJobInitializer {
    ledger: Ledger,
    repo: FixedTermLoanRepo,
}

impl FixedTermLoanJobInitializer {
    pub fn new(ledger: &Ledger, repo: FixedTermLoanRepo) -> Self {
        Self {
            ledger: ledger.clone(),
            repo,
        }
    }
}

const FIXED_TERM_LOAN_JOB: JobType = JobType::new("FixedTermLoanJob");
impl JobInitializer for FixedTermLoanJobInitializer {
    fn job_type() -> JobType
    where
        Self: Sized,
    {
        FIXED_TERM_LOAN_JOB
    }

    fn init(&self, job: &Job) -> Result<Box<dyn JobRunner>, Box<dyn std::error::Error>> {
        Ok(Box::new(FixedTermLoanJobRunner {
            _config: job.config()?,
            _repo: self.repo.clone(),
            _ledger: self.ledger.clone(),
        }))
    }
}

pub struct FixedTermLoanJobRunner {
    _config: FixedTermLoanJobConfig,
    _repo: FixedTermLoanRepo,
    _ledger: Ledger,
}

#[async_trait]
impl JobRunner for FixedTermLoanJobRunner {
    async fn run(&self, _current_job: CurrentJob) -> Result<(), Box<dyn std::error::Error>> {
        Ok(())
    }
}
