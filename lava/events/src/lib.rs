#![cfg_attr(feature = "fail-on-warnings", deny(warnings))]
#![cfg_attr(feature = "fail-on-warnings", deny(clippy::all))]

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum LavaEvent {
    Governance(governance::GovernanceEvent),
}

impl From<governance::GovernanceEvent> for LavaEvent {
    fn from(event: governance::GovernanceEvent) -> Self {
        Self::Governance(event)
    }
}
