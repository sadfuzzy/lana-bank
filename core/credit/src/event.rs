use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use core_money::{Satoshis, UsdCents};

use super::primitives::*;

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum CoreCreditEvent {
    FacilityCreated {
        id: CreditFacilityId,
        created_at: DateTime<Utc>,
    },
    FacilityApproved {
        id: CreditFacilityId,
    },
    FacilityActivated {
        id: CreditFacilityId,
        activated_at: DateTime<Utc>,
    },
    FacilityCompleted {
        id: CreditFacilityId,
        completed_at: DateTime<Utc>,
    },
    FacilityRepaymentRecorded {
        credit_facility_id: CreditFacilityId,
        disbursal_amount: UsdCents,
        interest_amount: UsdCents,
        recorded_at: DateTime<Utc>,
    },
    FacilityCollateralUpdated {
        credit_facility_id: CreditFacilityId,
        new_amount: Satoshis,
        abs_diff: Satoshis,
        action: FacilityCollateralUpdateAction,
        recorded_at: DateTime<Utc>,
    },
    DisbursalSettled {
        credit_facility_id: CreditFacilityId,
        amount: UsdCents,
        recorded_at: DateTime<Utc>,
    },
    AccrualPosted {
        credit_facility_id: CreditFacilityId,
        amount: UsdCents,
        posted_at: DateTime<Utc>,
    },
    ObligationCreated {
        id: ObligationId,
        credit_facility_id: CreditFacilityId,
        amount: UsdCents,
    },
    ObligationDue {
        id: ObligationId,
        credit_facility_id: CreditFacilityId,
        amount: UsdCents,
    },
}

#[derive(Debug, Serialize, Deserialize)]
pub enum FacilityCollateralUpdateAction {
    Add,
    Remove,
}
