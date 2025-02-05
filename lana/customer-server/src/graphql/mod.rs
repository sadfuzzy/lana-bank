#[macro_use]
pub mod macros;
mod authenticated_subject;
mod customer;
mod deposit;
mod deposit_account;
mod schema;
mod withdrawal;

use async_graphql::*;

pub use schema::*;

use lana_app::app::LanaApp;

pub fn schema(app: Option<LanaApp>) -> Schema<Query, EmptyMutation, EmptySubscription> {
    let mut schema_builder = Schema::build(Query, EmptyMutation, EmptySubscription);

    if let Some(app) = app {
        schema_builder = schema_builder.data(app);
    }

    schema_builder.finish()
}
