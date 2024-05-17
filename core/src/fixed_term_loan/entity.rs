use derive_builder::Builder;
use serde::{Deserialize, Serialize};

use crate::{entity::*, primitives::*};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FixedTermLoanEvent {
    Initialized {
        id: FixedTermLoanId,
        loan_account_id: LedgerAccountId,
    },
}

impl EntityEvent for FixedTermLoanEvent {
    type EntityId = FixedTermLoanId;
    fn event_table_name() -> &'static str {
        "fixed_term_loan_events"
    }
}

#[derive(Builder)]
#[builder(pattern = "owned", build_fn(error = "EntityError"))]
pub struct FixedTermLoan {
    pub(super) _events: EntityEvents<FixedTermLoanEvent>,
}

impl Entity for FixedTermLoan {
    type Event = FixedTermLoanEvent;
}

impl TryFrom<EntityEvents<FixedTermLoanEvent>> for FixedTermLoan {
    type Error = EntityError;

    fn try_from(events: EntityEvents<FixedTermLoanEvent>) -> Result<Self, Self::Error> {
        let builder = FixedTermLoanBuilder::default();
        builder._events(events).build()
    }
}
