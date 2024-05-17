use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Eq, Copy, Clone, Serialize, Deserialize)]
pub enum FixedTermLoanState {
    Initializing,
    PendingFunding,
    Funded,
    PayedOut,
    Completed,
}
