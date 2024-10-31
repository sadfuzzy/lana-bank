use async_graphql::*;

use super::chart_of_accounts::*;
use crate::graphql::account::*;

#[derive(SimpleObject)]
pub struct ProfitAndLossStatement {
    name: String,
    net: AccountAmountsByCurrency,
    categories: Vec<StatementCategory>,
}

impl From<lava_app::ledger::account_set::LedgerProfitAndLossStatement> for ProfitAndLossStatement {
    fn from(profit_and_loss: lava_app::ledger::account_set::LedgerProfitAndLossStatement) -> Self {
        ProfitAndLossStatement {
            name: profit_and_loss.name,
            net: profit_and_loss.balance.into(),
            categories: profit_and_loss
                .categories
                .into_iter()
                .map(StatementCategory::from)
                .collect(),
        }
    }
}
