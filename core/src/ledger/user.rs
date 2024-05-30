use crate::primitives::{LayeredUsdBalance, LedgerAccountId, Satoshis, UsdCents};
use serde::{Deserialize, Serialize};

use super::cala::graphql::*;

#[derive(Debug, Copy, Clone, Serialize, Deserialize)]
pub struct UserLedgerAccountIds {
    pub unallocated_collateral_id: LedgerAccountId,
    pub checking_id: LedgerAccountId,
}

impl UserLedgerAccountIds {
    #[allow(clippy::new_without_default)]
    pub fn new() -> Self {
        Self {
            unallocated_collateral_id: LedgerAccountId::new(),
            checking_id: LedgerAccountId::new(),
        }
    }
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
                encumbrance: data
                    .checking
                    .map(|b| UsdCents::from_usd(b.encumbrance.normal_balance.units))
                    .unwrap_or_else(|| UsdCents::ZERO),
            },
        }
    }
}
