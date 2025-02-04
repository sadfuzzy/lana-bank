use async_graphql::{Context, Object};

use super::authenticated_subject::*;

pub struct Query;

#[Object]
impl Query {
    async fn me(&self, ctx: &Context<'_>) -> async_graphql::Result<AuthenticatedSubject> {
        let (app, sub) = app_and_sub_from_ctx!(ctx);
        let customer = app.customers().find_for_subject(sub).await?;
        Ok(AuthenticatedSubject::from(customer))
    }
}
