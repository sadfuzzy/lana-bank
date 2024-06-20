use crate::primitives::{LedgerAccountId, Satoshis, UsdCents};
use serde::{Deserialize, Serialize};

use super::{cala::graphql::*, primitives::LayeredUsdBalance};

#[derive(Debug, Copy, Clone, Serialize, Deserialize)]
pub struct UserLedgerAccountIds {
    pub off_balance_sheet_deposit_account_id: LedgerAccountId,
    pub on_balance_sheet_deposit_account_id: LedgerAccountId,
}

impl UserLedgerAccountIds {
    #[allow(clippy::new_without_default)]
    pub fn new() -> Self {
        Self {
            off_balance_sheet_deposit_account_id: LedgerAccountId::new(),
            on_balance_sheet_deposit_account_id: LedgerAccountId::new(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserLedgerAccountAddresses {
    pub tron_usdt_address: String,
    pub btc_address: String,
}

pub struct UserBalance {
    pub btc_balance: Satoshis,
    pub usdt_balance: LayeredUsdBalance,
}

impl From<user_balance::ResponseData> for UserBalance {
    fn from(data: user_balance::ResponseData) -> Self {
        UserBalance {
            btc_balance: data
                .btc_balance
                .map(|b| Satoshis::from_btc(b.settled.normal_balance.units))
                .unwrap_or_else(|| Satoshis::ZERO),
            usdt_balance: LayeredUsdBalance {
                settled: data
                    .usdt_balance
                    .clone()
                    .map(|b| UsdCents::from_usd(b.settled.normal_balance.units))
                    .unwrap_or_else(|| UsdCents::ZERO),
                pending: data
                    .usdt_balance
                    .map(|b| UsdCents::from_usd(b.pending.normal_balance.units))
                    .unwrap_or_else(|| UsdCents::ZERO),
            },
        }
    }
}
