use chrono::{DateTime, Utc};

use crate::{primitives::*, terms::CollateralizationState};

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct CreditFacilityCreated {
    pub cents: UsdCents,
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct CreditFacilityOrigination {
    pub recorded_at: DateTime<Utc>,
    pub tx_id: LedgerTxId,
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct IncrementalPayment {
    pub cents: UsdCents,
    pub recorded_at: DateTime<Utc>,
    pub payment_id: PaymentAllocationId,
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct CollateralUpdated {
    pub satoshis: Satoshis,
    pub recorded_at: DateTime<Utc>,
    pub action: CollateralAction,
    pub tx_id: LedgerTxId,
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct CollateralizationUpdated {
    pub state: CollateralizationState,
    pub outstanding_interest: UsdCents,
    pub outstanding_disbursal: UsdCents,
    pub recorded_at: DateTime<Utc>,
    pub price: PriceOfOneBTC,
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct DisbursalExecuted {
    pub cents: UsdCents,
    pub recorded_at: DateTime<Utc>,
    pub tx_id: LedgerTxId,
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct InterestAccrualsPosted {
    pub cents: UsdCents,
    pub recorded_at: DateTime<Utc>,
    pub days: i64,
    pub tx_id: LedgerTxId,
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct CreditFacilityCompleted {
    pub completed_at: DateTime<Utc>,
}

/// Represents an entry in Credit Facility history as it is stored in a database.
/// The entries contain no running sums; if needed, they have to be calculated
/// during replaying.
#[derive(Debug, serde::Deserialize, serde::Serialize)]
#[serde(tag = "type")]
pub enum CreditFacilityHistoryEntry {
    Creation(CreditFacilityCreated),
    Origination(CreditFacilityOrigination),
    Collateral(CollateralUpdated),
    Collateralization(CollateralizationUpdated),
    Payment(IncrementalPayment),
    Disbursal(DisbursalExecuted),
    Interest(InterestAccrualsPosted),
    Completion(CreditFacilityCompleted),
}
