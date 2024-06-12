use crate::primitives::{LedgerAccountId, Satoshis, UsdCents};
use serde::{Deserialize, Serialize};

use super::{cala::graphql::*, primitives::LayeredUsdBalance};

#[derive(Debug, Copy, Clone, Serialize, Deserialize)]
pub struct UserLedgerAccountIds {
    pub unallocated_collateral_id: LedgerAccountId,
    pub checking_id: LedgerAccountId,
    pub bank_checking_id: LedgerAccountId,
    pub bank_unallocated_collateral_id: LedgerAccountId,
}

impl UserLedgerAccountIds {
    #[allow(clippy::new_without_default)]
    pub fn new() -> Self {
        Self {
            unallocated_collateral_id: LedgerAccountId::new(),
            checking_id: LedgerAccountId::new(),
            bank_checking_id: LedgerAccountId::new(),
            bank_unallocated_collateral_id: LedgerAccountId::new(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserLedgerAccountAddresses {
    pub checking_address: String,
    pub unallocated_collateral_address: String,
}

pub struct UserBalance {
    pub unallocated_collateral: Satoshis,
    pub checking: LayeredUsdBalance,
}

impl From<user_balance::ResponseData> for UserBalance {
    fn from(data: user_balance::ResponseData) -> Self {
        UserBalance {
            unallocated_collateral: data
                .unallocated_collateral
                .map(|b| Satoshis::from_btc(b.settled.normal_balance.units))
                .unwrap_or_else(|| Satoshis::ZERO),
            checking: LayeredUsdBalance {
                settled: data
                    .checking
                    .clone()
                    .map(|b| UsdCents::from_usd(b.settled.normal_balance.units))
                    .unwrap_or_else(|| UsdCents::ZERO),
                pending: data
                    .checking
                    .map(|b| UsdCents::from_usd(b.pending.normal_balance.units))
                    .unwrap_or_else(|| UsdCents::ZERO),
            },
        }
    }
}
