use async_graphql::*;

use super::fixed_term_loan::*;
use crate::app::LavaApp;

pub struct Query;

#[Object]
impl Query {
    async fn hello(&self) -> String {
        "world".to_string()
    }
}

pub struct Mutation;

#[Object]
impl Mutation {
    pub async fn fixed_term_loan_create(
        &self,
        ctx: &Context<'_>,
        _input: FixedTermLoanCreateInput,
    ) -> async_graphql::Result<FixedTermLoanCreatePayload> {
        let app = ctx.data_unchecked::<LavaApp>();
        let loan = app.fixed_term_loans().create_loan().await?;
        Ok(FixedTermLoanCreatePayload::from(loan))
    }
}
