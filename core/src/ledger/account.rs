use crate::primitives::{LedgerAccountId, Money};

use super::cala::graphql::*;

pub struct LedgerAccount {
    pub id: LedgerAccountId,
    pub settled_usd_balance: Money,
    pub settled_btc_balance: Money,
}

impl From<account_by_external_id::AccountByExternalIdAccountByExternalId> for LedgerAccount {
    fn from(account: account_by_external_id::AccountByExternalIdAccountByExternalId) -> Self {
        LedgerAccount {
            id: LedgerAccountId::from(account.account_id),
            settled_usd_balance: account
                .usd_balance
                .map(|b| Money {
                    amount: b.settled.normal_balance.units,
                    currency: b.settled.normal_balance.currency,
                })
                .unwrap_or_else(|| Money {
                    amount: rust_decimal::Decimal::ZERO,
                    currency: "USD".parse().unwrap(),
                }),
            settled_btc_balance: account
                .btc_balance
                .map(|b| Money {
                    amount: b.settled.normal_balance.units,
                    currency: b.settled.normal_balance.currency,
                })
                .unwrap_or_else(|| Money {
                    amount: rust_decimal::Decimal::ZERO,
                    currency: "BTC".parse().unwrap(),
                }),
        }
    }
}

impl From<account_by_id::AccountByIdAccount> for LedgerAccount {
    fn from(account: account_by_id::AccountByIdAccount) -> Self {
        LedgerAccount {
            id: LedgerAccountId::from(account.account_id),
            settled_usd_balance: account
                .usd_balance
                .map(|b| Money {
                    amount: b.settled.normal_balance.units,
                    currency: b.settled.normal_balance.currency,
                })
                .unwrap_or_else(|| Money {
                    amount: rust_decimal::Decimal::ZERO,
                    currency: "USD".parse().unwrap(),
                }),
            settled_btc_balance: account
                .btc_balance
                .map(|b| Money {
                    amount: b.settled.normal_balance.units,
                    currency: b.settled.normal_balance.currency,
                })
                .unwrap_or_else(|| Money {
                    amount: rust_decimal::Decimal::ZERO,
                    currency: "BTC".parse().unwrap(),
                }),
        }
    }
}
