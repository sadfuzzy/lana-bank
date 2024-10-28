use serde::{Deserialize, Serialize};

use crate::primitives::*;

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum GovernanceEvent {
    ApprovalProcessConcluded {
        id: ApprovalProcessId,
        process_type: ApprovalProcessType,
        approved: bool,
    },
}
