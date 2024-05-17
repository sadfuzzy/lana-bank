use serde::{Deserialize, Serialize};

use crate::{job::JobExecutorConfig, ledger::LedgerConfig};

#[derive(Clone, Default, Debug, Deserialize, Serialize)]
pub struct AppConfig {
    #[serde(default)]
    pub job_execution: JobExecutorConfig,
    pub ledger: LedgerConfig,
}
