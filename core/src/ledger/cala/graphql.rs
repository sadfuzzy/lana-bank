#![allow(clippy::enum_variant_names)]
#![allow(clippy::derive_partial_eq_without_eq)]
#![allow(clippy::upper_case_acronyms)]

use graphql_client::GraphQLQuery;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "src/ledger/cala/graphql/schema.graphql",
    query_path = "src/ledger/cala/graphql/accounts.gql",
    response_derives = "Debug, PartialEq, Eq, Clone"
)]
pub struct AccountByExternalId;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "src/ledger/cala/graphql/schema.graphql",
    query_path = "src/ledger/cala/graphql/accounts.gql",
    response_derives = "Debug, PartialEq, Eq, Clone"
)]
pub struct AccountById;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "src/ledger/cala/graphql/schema.graphql",
    query_path = "src/ledger/cala/graphql/accounts.gql",
    response_derives = "Debug, PartialEq, Eq, Clone"
)]
pub struct AccountCreate;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "src/ledger/cala/graphql/schema.graphql",
    query_path = "src/ledger/cala/graphql/mutations/lava-accounts-create.gql",
    response_derives = "Debug, PartialEq, Eq, Clone"
)]
pub struct LavaAccountsCreate;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "src/ledger/cala/graphql/schema.graphql",
    query_path = "src/ledger/cala/graphql/journals.gql",
    response_derives = "Debug, PartialEq, Eq, Clone"
)]
pub struct JournalById;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "src/ledger/cala/graphql/schema.graphql",
    query_path = "src/ledger/cala/graphql/mutations/lava-journal-create.gql",
    response_derives = "Debug, PartialEq, Eq, Clone"
)]
pub struct LavaJournalCreate;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "src/ledger/cala/graphql/schema.graphql",
    query_path = "src/ledger/cala/graphql/transactions/topup-unallocated-collateral.gql",
    response_derives = "Debug, PartialEq, Eq, Clone"
)]
pub struct TopupUnallocatedCollateralTemplateCreate;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "src/ledger/cala/graphql/schema.graphql",
    query_path = "src/ledger/cala/graphql/transactions/topup-unallocated-collateral.gql",
    response_derives = "Debug, PartialEq, Eq, Clone"
)]
pub struct PostTopupUnallocatedCollateralTransaction;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "src/ledger/cala/graphql/schema.graphql",
    query_path = "src/ledger/cala/graphql/transactions/withdrawal.gql",
    response_derives = "Debug, PartialEq, Eq, Clone"
)]
pub struct LavaWithdrawalTxTemplateCreate;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "src/ledger/cala/graphql/schema.graphql",
    query_path = "src/ledger/cala/graphql/transactions/find-tx-template.gql",
    response_derives = "Debug, PartialEq, Eq, Clone"
)]
pub struct TxTemplateByCode;

type UUID = uuid::Uuid;
type JSON = serde_json::Value;
type Decimal = rust_decimal::Decimal;
type CurrencyCode = cala_types::primitives::Currency;
type Expression = String;
