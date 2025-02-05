use async_graphql::*;

use crate::primitives::*;

pub use lana_app::deposit::DepositAccount as DomainDepositAccount;

use super::{deposit::*, withdrawal::*};

#[derive(SimpleObject, Clone)]
#[graphql(complex)]
pub struct DepositAccount {
    id: ID,
    deposit_account_id: UUID,
    customer_id: UUID,
    created_at: Timestamp,

    #[graphql(skip)]
    pub(super) entity: Arc<DomainDepositAccount>,
}

impl From<DomainDepositAccount> for DepositAccount {
    fn from(account: DomainDepositAccount) -> Self {
        DepositAccount {
            id: account.id.to_global_id(),
            deposit_account_id: account.id.into(),
            customer_id: account.account_holder_id.into(),
            created_at: account.created_at().into(),

            entity: Arc::new(account),
        }
    }
}

#[derive(SimpleObject)]
pub struct DepositAccountBalance {
    settled: UsdCents,
    pending: UsdCents,
}

impl From<lana_app::deposit::DepositAccountBalance> for DepositAccountBalance {
    fn from(balance: lana_app::deposit::DepositAccountBalance) -> Self {
        Self {
            settled: balance.settled,
            pending: balance.pending,
        }
    }
}

#[ComplexObject]
impl DepositAccount {
    async fn balance(&self, ctx: &Context<'_>) -> async_graphql::Result<DepositAccountBalance> {
        let (app, sub) = crate::app_and_sub_from_ctx!(ctx);
        let balance = app
            .deposits()
            .for_subject(sub)?
            .account_balance(self.entity.id)
            .await?;
        Ok(DepositAccountBalance::from(balance))
    }

    async fn deposits(&self, ctx: &Context<'_>) -> async_graphql::Result<Vec<Deposit>> {
        let (app, sub) = crate::app_and_sub_from_ctx!(ctx);
        let deposits = app
            .deposits()
            .for_subject(sub)?
            .list_deposits_for_account(self.entity.id)
            .await?;
        Ok(deposits.into_iter().map(Deposit::from).collect())
    }

    async fn withdrawals(&self, ctx: &Context<'_>) -> async_graphql::Result<Vec<Withdrawal>> {
        let (app, sub) = crate::app_and_sub_from_ctx!(ctx);
        let withdrawals = app
            .deposits()
            .for_subject(sub)?
            .list_withdrawals_for_account(self.entity.id)
            .await?;
        Ok(withdrawals.into_iter().map(Withdrawal::from).collect())
    }
}
