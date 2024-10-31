use async_graphql::*;

use super::chart_of_accounts::*;
use crate::graphql::account::*;

#[derive(SimpleObject)]
pub struct BalanceSheet {
    name: String,
    balance: AccountAmountsByCurrency,
    categories: Vec<StatementCategory>,
}

impl From<lava_app::ledger::account_set::LedgerBalanceSheet> for BalanceSheet {
    fn from(balance_sheet: lava_app::ledger::account_set::LedgerBalanceSheet) -> Self {
        BalanceSheet {
            name: balance_sheet.name,
            balance: balance_sheet.balance.into(),
            categories: balance_sheet
                .categories
                .into_iter()
                .map(StatementCategory::from)
                .collect(),
        }
    }
}
