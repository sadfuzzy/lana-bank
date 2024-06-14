use async_graphql::*;

use super::{fixed_term_loan::*, user::*};
use crate::{
    app::LavaApp,
    primitives::{FixedTermLoanId, UserId},
    server::{
        public::UserContext,
        shared_graphql::{fixed_term_loan::FixedTermLoan, primitives::UUID, user::User},
    },
};

pub struct Query;

#[Object]
impl Query {
    async fn loan(
        &self,
        ctx: &Context<'_>,
        id: UUID,
    ) -> async_graphql::Result<Option<FixedTermLoan>> {
        let app = ctx.data_unchecked::<LavaApp>();
        let loan = app
            .fixed_term_loans()
            .find_by_id(FixedTermLoanId::from(id))
            .await?;
        Ok(loan.map(FixedTermLoan::from))
    }

    async fn user(&self, ctx: &Context<'_>, id: UUID) -> async_graphql::Result<Option<User>> {
        let app = ctx.data_unchecked::<LavaApp>();
        let user = app.users().find_by_id(UserId::from(id)).await?;
        Ok(user.map(User::from))
    }

    async fn me(&self, ctx: &Context<'_>) -> async_graphql::Result<Option<User>> {
        let user_id = match ctx.data_unchecked::<UserContext>().user_id {
            None => return Err("Unauthorized".into()),
            Some(id) => id,
        };

        let app = ctx.data_unchecked::<LavaApp>();
        let user = app.users().find_by_id(user_id).await?;

        Ok(user.map(User::from))
    }
}

pub struct Mutation;

#[Object]
impl Mutation {
    pub async fn withdrawal_initiate(
        &self,
        ctx: &Context<'_>,
        input: WithdrawalInitiateInput,
    ) -> async_graphql::Result<WithdrawalInitiatePayload> {
        let user_id = match ctx.data_unchecked::<UserContext>().user_id {
            None => return Err("Unauthorized".into()),
            Some(id) => id,
        };

        let app = ctx.data_unchecked::<LavaApp>();

        let withdraw = app
            .withdraws()
            .initiate(user_id, input.amount, input.destination, input.reference)
            .await?;

        Ok(WithdrawalInitiatePayload::from(withdraw))
    }

    pub async fn fixed_term_loan_create(
        &self,
        ctx: &Context<'_>,
    ) -> async_graphql::Result<FixedTermLoanCreatePayload> {
        let user_id = match ctx.data_unchecked::<UserContext>().user_id {
            None => return Err("Unauthorized".into()),
            Some(id) => id,
        };

        let app = ctx.data_unchecked::<LavaApp>();
        let loan = app.fixed_term_loans().create_loan_for_user(user_id).await?;
        Ok(FixedTermLoanCreatePayload::from(loan))
    }

    pub async fn fixed_term_loan_approve(
        &self,
        ctx: &Context<'_>,
        input: FixedTermLoanApproveInput,
    ) -> async_graphql::Result<FixedTermLoanApprovePayload> {
        // TODO: validate userId

        let app = ctx.data_unchecked::<LavaApp>();
        let loan = app
            .fixed_term_loans()
            .approve_loan(input.loan_id, input.collateral, input.principal)
            .await?;
        Ok(FixedTermLoanApprovePayload::from(loan))
    }

    pub async fn fixed_term_loan_record_payment(
        &self,
        ctx: &Context<'_>,
        input: FixedTermLoanRecordPaymentInput,
    ) -> async_graphql::Result<FixedTermLoanRecordPaymentPayload> {
        let app = ctx.data_unchecked::<LavaApp>();
        let loan = app
            .fixed_term_loans()
            .record_payment(input.loan_id, input.amount)
            .await?;
        Ok(FixedTermLoanRecordPaymentPayload::from(loan))
    }
}
