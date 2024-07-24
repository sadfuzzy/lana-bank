use async_graphql::*;

use super::withdraw::*;
use crate::{
    app::LavaApp,
    primitives::{CustomerId, LoanId},
    server::{
        public::PublicAuthContext,
        shared_graphql::{
            customer::Customer,
            loan::Loan,
            primitives::UUID,
            sumsub::{SumsubPermalinkCreatePayload, SumsubTokenCreatePayload},
        },
    },
};

pub struct Query;

#[Object]
impl Query {
    async fn loan(&self, ctx: &Context<'_>, id: UUID) -> async_graphql::Result<Option<Loan>> {
        let app = ctx.data_unchecked::<LavaApp>();

        let loan = app.loans().find_by_id(None, LoanId::from(id)).await?;
        Ok(loan.map(Loan::from))
    }

    async fn customer(
        &self,
        ctx: &Context<'_>,
        id: UUID,
    ) -> async_graphql::Result<Option<Customer>> {
        let app = ctx.data_unchecked::<LavaApp>();
        let user = app.customers().find_by_id(CustomerId::from(id)).await?;
        Ok(user.map(Customer::from))
    }

    async fn me(&self, ctx: &Context<'_>) -> async_graphql::Result<Option<Customer>> {
        let PublicAuthContext { user_id } = ctx.data()?;

        let app = ctx.data_unchecked::<LavaApp>();
        let user = app.customers().find_by_id(*user_id).await?;

        Ok(user.map(Customer::from))
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
        let PublicAuthContext { user_id } = ctx.data()?;

        let app = ctx.data_unchecked::<LavaApp>();

        let withdraw = app
            .withdraws()
            .initiate(*user_id, input.amount, input.destination, input.reference)
            .await?;

        Ok(WithdrawalInitiatePayload::from(withdraw))
    }

    pub async fn sumsub_token_create(
        &self,
        ctx: &Context<'_>,
    ) -> async_graphql::Result<SumsubTokenCreatePayload> {
        let PublicAuthContext { user_id } = ctx.data()?;

        let app = ctx.data_unchecked::<LavaApp>();
        let res = app.applicants().create_access_token(*user_id).await?;

        Ok(SumsubTokenCreatePayload { token: res.token })
    }

    pub async fn sumsub_permalink_create(
        &self,
        ctx: &Context<'_>,
    ) -> async_graphql::Result<SumsubPermalinkCreatePayload> {
        let PublicAuthContext { user_id } = ctx.data()?;

        let app = ctx.data_unchecked::<LavaApp>();
        let res = app.applicants().create_permalink(*user_id).await?;

        let url = res.url;
        Ok(SumsubPermalinkCreatePayload { url })
    }
}
