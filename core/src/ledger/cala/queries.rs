#![allow(clippy::enum_variant_names)]
#![allow(clippy::derive_partial_eq_without_eq)]

use chrono::{DateTime, Utc};
use graphql_client::GraphQLQuery;
use serde::Deserialize;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "src/ledger/cala/graphql/schema.graphql",
    query_path = "src/ledger/cala/graphql/queries/account-by-external-id.gql",
    response_derives = "Debug, PartialEq, Eq, Clone"
)]
pub struct AccountByExternalId;
