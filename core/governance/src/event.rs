use serde::{Deserialize, Serialize};

use shared_primitives::ApprovalProcessId;

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum GovernanceEvent {
    ApprovalProcessConcluded {
        id: ApprovalProcessId,
        approved: bool,
    },
}
