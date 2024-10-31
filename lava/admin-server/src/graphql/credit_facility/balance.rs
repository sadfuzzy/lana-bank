use async_graphql::*;

use crate::primitives::*;

#[derive(SimpleObject)]
pub(super) struct CreditFacilityBalance {
    facility_remaining: FacilityRemaining,
    disbursed: Disbursed,
    interest: Interest,
    outstanding: Outstanding,
    collateral: Collateral,
}

impl From<lava_app::ledger::credit_facility::CreditFacilityBalance> for CreditFacilityBalance {
    fn from(balance: lava_app::ledger::credit_facility::CreditFacilityBalance) -> Self {
        Self {
            facility_remaining: FacilityRemaining {
                usd_balance: balance.facility,
            },
            disbursed: Disbursed {
                total: Total {
                    usd_balance: balance.disbursed,
                },
                outstanding: Outstanding {
                    usd_balance: balance.disbursed_receivable,
                },
            },
            interest: Interest {
                total: Total {
                    usd_balance: balance.interest,
                },
                outstanding: Outstanding {
                    usd_balance: balance.accrued_interest_receivable,
                },
            },
            outstanding: Outstanding {
                usd_balance: balance.disbursed_receivable + balance.accrued_interest_receivable,
            },
            collateral: Collateral {
                btc_balance: balance.collateral,
            },
        }
    }
}

#[derive(SimpleObject)]
pub struct Collateral {
    pub btc_balance: Satoshis,
}

#[derive(SimpleObject)]
pub struct Outstanding {
    pub usd_balance: UsdCents,
}

#[derive(SimpleObject)]
pub struct Total {
    pub usd_balance: UsdCents,
}

#[derive(SimpleObject)]
pub struct FacilityRemaining {
    pub usd_balance: UsdCents,
}

#[derive(SimpleObject)]
pub struct Disbursed {
    pub total: Total,
    pub outstanding: Outstanding,
}

#[derive(SimpleObject)]
pub struct Interest {
    pub total: Total,
    pub outstanding: Outstanding,
}
