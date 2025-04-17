#[macro_use]
pub mod macros;
mod authenticated_subject;
mod credit_facility;
mod customer;
mod deposit;
mod deposit_account;
mod deposit_account_history;
mod price;
mod schema;
mod terms;
mod withdrawal;

use async_graphql::*;

pub use schema::*;

use lana_app::app::LanaApp;

pub fn schema(app: Option<LanaApp>) -> Schema<Query, Mutation, EmptySubscription> {
    let mut schema_builder = Schema::build(Query, Mutation, EmptySubscription);

    if let Some(app) = app {
        schema_builder = schema_builder.data(app);
    }

    schema_builder.finish()
}
