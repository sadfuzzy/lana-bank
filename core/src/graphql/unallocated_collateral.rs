use async_graphql::*;

use crate::{ledger, primitives::Satoshis};

#[derive(SimpleObject)]
pub(super) struct UnallocatedCollateral {
    btc_balance: Satoshis,
}

impl From<ledger::UnallocatedCollateral> for UnallocatedCollateral {
    fn from(account: ledger::UnallocatedCollateral) -> Self {
        Self {
            btc_balance: account.settled_btc_balance,
        }
    }
}
