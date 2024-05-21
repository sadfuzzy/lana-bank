use async_graphql::*;

use super::primitives::Money;
use crate::ledger::LedgerAccount;

#[derive(SimpleObject)]
pub(super) struct DepositAccount {
    balance: Money,
}

impl From<LedgerAccount> for DepositAccount {
    fn from(account: LedgerAccount) -> Self {
        Self {
            balance: Money::from(account.settled_btc_balance),
        }
    }
}
