use crate::primitives::{LedgerAccountId, Satoshis, UsdCents};
use serde::{Deserialize, Serialize};

use super::cala::graphql::*;

#[derive(Debug, Copy, Clone, Serialize, Deserialize)]
pub struct FixedTermLoanAccountIds {
    pub collateral_account_id: LedgerAccountId,
    pub outstanding_account_id: LedgerAccountId,
    pub interest_account_id: LedgerAccountId,
}

impl FixedTermLoanAccountIds {
    #[allow(clippy::new_without_default)]
    pub fn new() -> Self {
        Self {
            collateral_account_id: LedgerAccountId::new(),
            outstanding_account_id: LedgerAccountId::new(),
            interest_account_id: LedgerAccountId::new(),
        }
    }
}

pub struct FixedTermLoanBalance {
    pub collateral: Satoshis,
    pub outstanding: UsdCents,
    pub interest_incurred: UsdCents,
}

impl From<fixed_term_loan_balance::ResponseData> for FixedTermLoanBalance {
    fn from(data: fixed_term_loan_balance::ResponseData) -> Self {
        FixedTermLoanBalance {
            collateral: data
                .collateral
                .map(|b| Satoshis::from_btc(b.settled.normal_balance.units))
                .unwrap_or_else(|| Satoshis::ZERO),
            outstanding: data
                .loan_outstanding
                .map(|b| UsdCents::from_usd(b.settled.normal_balance.units))
                .unwrap_or_else(|| UsdCents::ZERO),
            interest_incurred: data
                .interest_income
                .map(|b| UsdCents::from_usd(b.settled.normal_balance.units))
                .unwrap_or_else(|| UsdCents::ZERO),
        }
    }
}
