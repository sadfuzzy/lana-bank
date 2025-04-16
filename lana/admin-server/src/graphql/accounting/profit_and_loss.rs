use async_graphql::*;

use lana_app::profit_and_loss::ProfitAndLossStatement as DomainProfitAndLossStatement;

use crate::{graphql::loader::*, primitives::*};

use super::{LedgerAccount, LedgerAccountBalanceRange};

#[derive(SimpleObject)]
#[graphql(complex)]
pub struct ProfitAndLossStatement {
    pub name: String,
    #[graphql(skip)]
    pub entity: Arc<DomainProfitAndLossStatement>,
}

impl From<DomainProfitAndLossStatement> for ProfitAndLossStatement {
    fn from(profit_and_loss: DomainProfitAndLossStatement) -> Self {
        ProfitAndLossStatement {
            name: profit_and_loss.name.to_string(),
            entity: Arc::new(profit_and_loss),
        }
    }
}

#[ComplexObject]
impl ProfitAndLossStatement {
    async fn net(&self) -> async_graphql::Result<LedgerAccountBalanceRange> {
        if let Some(balance) = self.entity.btc_balance_range.as_ref() {
            Ok(Some(balance).into())
        } else {
            Ok(self.entity.usd_balance_range.as_ref().into())
        }
    }

    async fn categories(&self, ctx: &Context<'_>) -> async_graphql::Result<Vec<LedgerAccount>> {
        let loader = ctx.data_unchecked::<LanaDataLoader>();
        let mut categories = loader
            .load_many(self.entity.category_ids.iter().copied())
            .await?;
        let mut result = Vec::with_capacity(self.entity.category_ids.len());
        for id in self.entity.category_ids.iter() {
            if let Some(account) = categories.remove(id) {
                result.push(account);
            }
        }
        Ok(result)
    }
}
