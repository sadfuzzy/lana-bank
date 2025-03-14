use async_graphql::*;

use crate::{graphql::account::AccountAmountsByCurrency, primitives::*};

#[derive(SimpleObject)]
pub struct TrialBalance {
    name: String,
    total: AccountAmountsByCurrency,
    accounts: Vec<TrialBalanceAccount>,
}

#[derive(SimpleObject)]
pub struct TrialBalanceAccount {
    id: UUID,
    name: String,
    amounts: AccountAmountsByCurrency,
}

impl From<lana_app::trial_balance::TrialBalanceAccountSet> for TrialBalanceAccount {
    fn from(line_item: lana_app::trial_balance::TrialBalanceAccountSet) -> Self {
        TrialBalanceAccount {
            id: line_item.id.into(),
            name: line_item.name.to_string(),
            amounts: line_item.into(),
        }
    }
}

impl From<lana_app::trial_balance::TrialBalance> for TrialBalance {
    fn from(trial_balance: lana_app::trial_balance::TrialBalance) -> Self {
        TrialBalance {
            name: trial_balance.name.to_string(),
            total: trial_balance.clone().into(),
            accounts: trial_balance
                .accounts
                .into_iter()
                .map(TrialBalanceAccount::from)
                .collect(),
        }
    }
}
