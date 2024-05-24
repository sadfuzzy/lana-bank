use async_graphql::*;

use crate::{
    ledger,
    primitives::{Satoshis, UsdCents},
};

#[derive(SimpleObject)]
struct UnallocatedCollateral {
    btc_balance: Satoshis,
}

#[derive(SimpleObject)]
struct Checking {
    usd_balance: UsdCents,
}

#[derive(SimpleObject)]
pub(super) struct UserBalance {
    unallocated_collateral: UnallocatedCollateral,
    checking: Checking,
}

impl From<ledger::user::UserBalance> for UserBalance {
    fn from(balance: ledger::user::UserBalance) -> Self {
        Self {
            unallocated_collateral: UnallocatedCollateral {
                btc_balance: balance.unallocated_collateral,
            },
            checking: Checking {
                usd_balance: balance.checking,
            },
        }
    }
}
