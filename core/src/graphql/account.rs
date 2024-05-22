use async_graphql::*;

use super::primitives::Money;
use crate::ledger::LedgerAccount;

#[derive(SimpleObject)]
pub(super) struct UnallocatedCollateral {
    balance: Money,
}

impl From<LedgerAccount> for UnallocatedCollateral {
    fn from(account: LedgerAccount) -> Self {
        Self {
            balance: Money::from(account.settled_btc_balance),
        }
    }
}
