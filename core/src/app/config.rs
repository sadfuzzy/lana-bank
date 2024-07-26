use serde::{Deserialize, Serialize};

use crate::{
    applicant::SumsubConfig, job::JobExecutorConfig, ledger::LedgerConfig, user::UserConfig,
};

#[derive(Clone, Default, Debug, Deserialize, Serialize)]
pub struct AppConfig {
    #[serde(default)]
    pub job_execution: JobExecutorConfig,
    #[serde(default)]
    pub ledger: LedgerConfig,
    #[serde(default)]
    pub sumsub: SumsubConfig,
    #[serde(default)]
    pub user: UserConfig,
}
