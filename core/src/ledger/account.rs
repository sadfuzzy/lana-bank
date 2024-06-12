use crate::primitives::{LedgerAccountId, LedgerAccountSetId, Satoshis, UsdCents};

use super::cala::graphql::*;

pub struct LedgerAccount {
    pub id: LedgerAccountId,
    pub settled_btc_balance: Satoshis,
    pub settled_usd_balance: UsdCents,
    pub account_set_ids: Vec<LedgerAccountSetId>,
}

impl From<account_by_external_id::AccountByExternalIdAccountByExternalId> for LedgerAccount {
    fn from(account: account_by_external_id::AccountByExternalIdAccountByExternalId) -> Self {
        LedgerAccount {
            id: LedgerAccountId::from(account.account_id),
            settled_usd_balance: account
                .usd_balance
                .map(|b| UsdCents::from_usd(b.settled.normal_balance.units))
                .unwrap_or_else(|| UsdCents::ZERO),
            settled_btc_balance: account
                .btc_balance
                .map(|b| Satoshis::from_btc(b.settled.normal_balance.units))
                .unwrap_or_else(|| Satoshis::ZERO),
            account_set_ids: account
                .sets
                .edges
                .iter()
                .map(|e| e.node.account_set_id)
                .map(LedgerAccountSetId::from)
                .collect(),
        }
    }
}

impl From<account_by_id::AccountByIdAccount> for LedgerAccount {
    fn from(account: account_by_id::AccountByIdAccount) -> Self {
        LedgerAccount {
            id: LedgerAccountId::from(account.account_id),
            settled_usd_balance: account
                .usd_balance
                .map(|b| UsdCents::from_usd(b.settled.normal_balance.units))
                .unwrap_or_else(|| UsdCents::ZERO),
            settled_btc_balance: account
                .btc_balance
                .map(|b| Satoshis::from_btc(b.settled.normal_balance.units))
                .unwrap_or_else(|| Satoshis::ZERO),
            account_set_ids: account
                .sets
                .edges
                .iter()
                .map(|e| e.node.account_set_id)
                .map(LedgerAccountSetId::from)
                .collect(),
        }
    }
}
