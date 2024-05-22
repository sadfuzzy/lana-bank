use async_graphql::*;

use super::{fixed_term_loan::*, primitives::UUID, user::*};
use crate::{app::LavaApp, primitives::FixedTermLoanId};

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
}

pub struct Mutation;

#[Object]
impl Mutation {
    pub async fn user_create(
        &self,
        ctx: &Context<'_>,
        input: UserCreateInput,
    ) -> async_graphql::Result<UserCreatePayload> {
        let app = ctx.data_unchecked::<LavaApp>();
        let user = app.users().create_user(input.bitfinex_username).await?;
        Ok(UserCreatePayload::from(user))
    }

    pub async fn fixed_term_loan_create(
        &self,
        ctx: &Context<'_>,
        _input: FixedTermLoanCreateInput,
    ) -> async_graphql::Result<FixedTermLoanCreatePayload> {
        let app = ctx.data_unchecked::<LavaApp>();
        let loan = app.fixed_term_loans().create_loan().await?;
        Ok(FixedTermLoanCreatePayload::from(loan))
    }

    pub async fn fixed_term_loan_declare_collateralized(
        &self,
        ctx: &Context<'_>,
        input: FixedTermLoanDeclareCollateralizedInput,
    ) -> async_graphql::Result<FixedTermLoanDeclareCollateralizedPayload> {
        let app = ctx.data_unchecked::<LavaApp>();
        let loan = app
            .fixed_term_loans()
            .declare_collateralized(FixedTermLoanId::from(input.loan_id))
            .await?;
        Ok(FixedTermLoanDeclareCollateralizedPayload::from(loan))
    }

    pub async fn user_topup_collateral(
        &self,
        _ctx: &Context<'_>,
        _input: UserTopupCollateralInput,
    ) -> async_graphql::Result<UserTopupCollateralPayload> {
        unimplemented!()
    }
}
