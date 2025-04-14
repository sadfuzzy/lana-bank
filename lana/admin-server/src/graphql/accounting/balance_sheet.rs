use async_graphql::*;

use lana_app::balance_sheet::BalanceSheet as DomainBalanceSheet;

use crate::primitives::*;

use super::{LedgerAccount, LedgerAccountBalanceRange};

#[derive(SimpleObject)]
#[graphql(complex)]
pub struct BalanceSheet {
    name: String,
    categories: Vec<LedgerAccount>,

    #[graphql(skip)]
    entity: Arc<DomainBalanceSheet>,
}

impl From<DomainBalanceSheet> for BalanceSheet {
    fn from(balance_sheet: DomainBalanceSheet) -> Self {
        let categories = balance_sheet.categories.clone();

        BalanceSheet {
            name: balance_sheet.name.to_string(),
            categories: categories.into_iter().map(LedgerAccount::from).collect(),
            entity: Arc::new(balance_sheet),
        }
    }
}

#[ComplexObject]
impl BalanceSheet {
    async fn balance(&self) -> async_graphql::Result<LedgerAccountBalanceRange> {
        if let Some(balance) = self.entity.btc_balance_range.as_ref() {
            Ok(Some(balance).into())
        } else {
            Ok(self.entity.usd_balance_range.as_ref().into())
        }
    }
}
