use crate::primitives::{LedgerAccountId, Satoshis};

use super::cala::graphql::*;

pub struct UnallocatedCollateral {
    pub id: LedgerAccountId,
    pub settled_btc_balance: Satoshis,
}

impl From<account_by_external_id::AccountByExternalIdAccountByExternalId>
    for UnallocatedCollateral
{
    fn from(account: account_by_external_id::AccountByExternalIdAccountByExternalId) -> Self {
        UnallocatedCollateral {
            id: LedgerAccountId::from(account.account_id),
            settled_btc_balance: account
                .usd_balance
                .map(|b| Satoshis::from(b.settled.normal_balance.units))
                .unwrap_or_else(|| Satoshis::ZERO),
        }
    }
}

impl From<account_by_id::AccountByIdAccount> for UnallocatedCollateral {
    fn from(account: account_by_id::AccountByIdAccount) -> Self {
        UnallocatedCollateral {
            id: LedgerAccountId::from(account.account_id),
            settled_btc_balance: account
                .usd_balance
                .map(|b| Satoshis::from(b.settled.normal_balance.units))
                .unwrap_or_else(|| Satoshis::ZERO),
        }
    }
}
