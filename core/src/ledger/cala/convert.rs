use super::graphql::*;
use crate::primitives::LedgerAccountId;

impl From<account_by_external_id::AccountByExternalIdAccountByExternalId> for LedgerAccountId {
    fn from(account: account_by_external_id::AccountByExternalIdAccountByExternalId) -> Self {
        LedgerAccountId::from(account.account_id)
    }
}
