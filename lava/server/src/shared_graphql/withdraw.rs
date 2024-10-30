use async_graphql::{dataloader::DataLoader, *};

use crate::{
    admin::{
        graphql::{approval_process::ApprovalProcess, loader::LavaDataLoader},
        AdminAuthContext,
    },
    shared_graphql::{customer::Customer, primitives::*},
};
use lava_app::{app::LavaApp, primitives::UsdCents, withdraw::WithdrawalStatus};

#[derive(SimpleObject, Clone)]
#[graphql(complex)]
pub struct Withdrawal {
    customer_id: UUID,
    withdrawal_id: UUID,
    approval_process_id: UUID,
    amount: UsdCents,
    status: WithdrawalStatus,
    reference: String,
    created_at: Timestamp,

    #[graphql(skip)]
    domain_approval_process_id: governance::ApprovalProcessId,
}

#[ComplexObject]
impl Withdrawal {
    async fn customer(&self, ctx: &Context<'_>) -> async_graphql::Result<Option<Customer>> {
        let app = ctx.data_unchecked::<LavaApp>();
        let AdminAuthContext { sub } = ctx.data()?;
        let customer = app
            .customers()
            .find_by_id(Some(sub), &self.customer_id)
            .await?;
        Ok(customer.map(Customer::from))
    }

    async fn approval_process(&self, ctx: &Context<'_>) -> async_graphql::Result<ApprovalProcess> {
        let loader = ctx.data_unchecked::<DataLoader<LavaDataLoader>>();
        let process = loader
            .load_one(self.domain_approval_process_id)
            .await?
            .expect("process not found");
        Ok(process)
    }

    async fn user_can_confirm(&self, ctx: &Context<'_>) -> async_graphql::Result<bool> {
        let app = ctx.data_unchecked::<LavaApp>();
        let AdminAuthContext { sub } = ctx.data()?;
        Ok(app.withdraws().user_can_confirm(sub, false).await.is_ok())
    }

    async fn user_can_cancel(&self, ctx: &Context<'_>) -> async_graphql::Result<bool> {
        let app = ctx.data_unchecked::<LavaApp>();
        let AdminAuthContext { sub } = ctx.data()?;
        Ok(app.withdraws().user_can_cancel(sub, false).await.is_ok())
    }
}

impl From<lava_app::withdraw::Withdraw> for Withdrawal {
    fn from(withdraw: lava_app::withdraw::Withdraw) -> Self {
        Withdrawal {
            created_at: withdraw.created_at().into(),
            withdrawal_id: UUID::from(withdraw.id),
            customer_id: UUID::from(withdraw.customer_id),
            approval_process_id: UUID::from(withdraw.approval_process_id),
            amount: withdraw.amount,
            status: withdraw.status(),
            reference: withdraw.reference,
            domain_approval_process_id: withdraw.approval_process_id,
        }
    }
}
