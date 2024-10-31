mod balance;
mod history;
mod repayment_plan;

use async_graphql::*;

use super::{customer::*, loader::LavaDataLoader, terms::*, user::*};
use crate::primitives::*;
pub use lava_app::{
    loan::{Loan as DomainLoan, LoanByCollateralizationRatioCursor, LoanCollaterizationState},
    primitives::LoanStatus,
};

pub use balance::*;
pub use history::*;
pub use repayment_plan::*;

#[derive(SimpleObject, Clone)]
#[graphql(complex)]
pub struct Loan {
    id: ID,
    loan_id: UUID,
    created_at: Timestamp,
    approved_at: Option<Timestamp>,
    expires_at: Option<Timestamp>,
    status: LoanStatus,
    collateral: Satoshis,
    principal: UsdCents,
    collateralization_state: LoanCollaterizationState,

    #[graphql(skip)]
    pub(super) entity: Arc<DomainLoan>,
}

impl From<lava_app::loan::Loan> for Loan {
    fn from(loan: lava_app::loan::Loan) -> Self {
        let created_at = loan.created_at().into();
        let approved_at: Option<Timestamp> = loan.approved_at.map(|a| a.into());
        let expires_at: Option<Timestamp> = loan.expires_at.map(|e| e.into());

        let collateral = loan.collateral();
        let principal = loan.initial_principal();
        let collateralization_state = loan.collateralization();

        Loan {
            id: loan.id.to_global_id(),
            loan_id: UUID::from(loan.id),
            status: loan.status(),
            created_at,
            approved_at,
            expires_at,
            collateral,
            principal,
            collateralization_state,

            entity: Arc::new(loan),
        }
    }
}

#[ComplexObject]
impl Loan {
    async fn loan_terms(&self) -> TermValues {
        self.entity.terms.into()
    }

    async fn customer(&self, ctx: &Context<'_>) -> async_graphql::Result<Customer> {
        let loader = ctx.data_unchecked::<LavaDataLoader>();
        let customer = loader
            .load_one(self.entity.customer_id)
            .await?
            .expect("customer not found");
        Ok(customer)
    }

    async fn balance(&self, ctx: &Context<'_>) -> async_graphql::Result<LoanBalance> {
        let app = ctx.data_unchecked::<LavaApp>();
        let balance = app
            .ledger()
            .get_loan_balance(self.entity.account_ids)
            .await?;
        Ok(LoanBalance::from(balance))
    }

    async fn transactions(&self) -> Vec<LoanHistoryEntry> {
        self.entity
            .history()
            .into_iter()
            .map(LoanHistoryEntry::from)
            .collect()
    }

    async fn repayment_plan(&self) -> Vec<LoanRepaymentInPlan> {
        self.entity
            .repayment_plan()
            .into_iter()
            .map(LoanRepaymentInPlan::from)
            .collect()
    }

    async fn approvals(&self) -> Vec<LoanApproval> {
        self.entity
            .approvals()
            .into_iter()
            .map(|a| LoanApproval {
                user_id: a.user_id,
                approved_at: a.approved_at.into(),
            })
            .collect()
    }

    async fn current_cvl(&self, ctx: &Context<'_>) -> async_graphql::Result<CVLPct> {
        let app = ctx.data_unchecked::<LavaApp>();
        let price = app.price().usd_cents_per_btc().await?;
        Ok(self.entity.cvl_data().cvl(price))
    }

    async fn subject_can_approve(&self, ctx: &Context<'_>) -> async_graphql::Result<bool> {
        let (app, sub) = crate::app_and_sub_from_ctx!(ctx);
        Ok(app
            .loans()
            .subject_can_approve(sub, self.entity.id, false)
            .await
            .is_ok())
    }

    async fn subject_can_update_collateral(
        &self,
        ctx: &Context<'_>,
    ) -> async_graphql::Result<bool> {
        let (app, sub) = crate::app_and_sub_from_ctx!(ctx);
        Ok(app
            .loans()
            .subject_can_update_collateral(sub, self.entity.id, false)
            .await
            .is_ok())
    }

    async fn subject_can_update_collateralization_state(
        &self,
        ctx: &Context<'_>,
    ) -> async_graphql::Result<bool> {
        let (app, sub) = crate::app_and_sub_from_ctx!(ctx);
        Ok(app
            .loans()
            .subject_can_update_collateralization_state(sub, self.entity.id, false)
            .await
            .is_ok())
    }

    async fn subject_can_record_payment_or_complete_loan(
        &self,
        ctx: &Context<'_>,
    ) -> async_graphql::Result<bool> {
        let (app, sub) = crate::app_and_sub_from_ctx!(ctx);
        Ok(app
            .loans()
            .subject_can_record_payment_or_complete_loan(sub, self.entity.id, false)
            .await
            .is_ok())
    }
}

#[derive(SimpleObject)]
#[graphql(complex)]
pub struct LoanApproval {
    #[graphql(skip)]
    user_id: UserId,
    approved_at: Timestamp,
}

#[ComplexObject]
impl LoanApproval {
    async fn user(&self, ctx: &Context<'_>) -> async_graphql::Result<User> {
        let loader = ctx.data_unchecked::<LavaDataLoader>();
        let user = loader
            .load_one(self.user_id)
            .await?
            .expect("user not found");
        Ok(user)
    }
}

#[derive(InputObject)]
pub struct LoanCreateInput {
    pub customer_id: UUID,
    pub desired_principal: UsdCents,
    pub loan_terms: TermsInput,
}
crate::mutation_payload!(LoanCreatePayload, loan: Loan);

#[derive(InputObject)]
pub struct LoanApproveInput {
    pub loan_id: UUID,
}
crate::mutation_payload!(LoanApprovePayload, loan: Loan);

#[derive(InputObject)]
pub struct LoanPartialPaymentInput {
    pub loan_id: UUID,
    pub amount: UsdCents,
}
crate::mutation_payload!(LoanPartialPaymentPayload, loan: Loan);

#[derive(InputObject)]
pub struct LoanCollateralUpdateInput {
    pub loan_id: UUID,
    pub collateral: Satoshis,
}
crate::mutation_payload!(LoanCollateralUpdatePayload, loan: Loan);

#[derive(InputObject)]
pub struct LoanCollateralizationStateTriggerRefreshInput {
    pub loan_id: UUID,
}
crate::mutation_payload!(LoanCollateralizationStateTriggerRefreshPayload, loan: Loan);
