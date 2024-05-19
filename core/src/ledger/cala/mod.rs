pub mod error;
mod graphql;

use graphql_client::{GraphQLQuery, Response};
use reqwest::{Client as ReqwestClient, Method};
use tracing::instrument;
use uuid::Uuid;

use crate::primitives::LedgerAccountId;

use error::*;
use graphql::*;

#[derive(Clone)]
pub struct CalaClient {
    url: String,
    client: ReqwestClient,
}

impl CalaClient {
    pub fn new(url: String) -> Self {
        let client = ReqwestClient::new();
        CalaClient { client, url }
    }

    #[instrument(name = "lava.ledger.cala.create_account", skip(self), err)]
    pub async fn create_account(
        &self,
        name: String,
        code: String,
        external_id: String,
    ) -> Result<LedgerAccountId, CalaError> {
        let account_id = LedgerAccountId::new();
        let variables = account_create::Variables {
            input: account_create::AccountCreateInput {
                account_id: Uuid::from(account_id),
                external_id: Some(external_id),
                normal_balance_type: account_create::DebitOrCredit::CREDIT,
                status: account_create::Status::ACTIVE,
                name,
                code,
                description: None,
                metadata: None,
            },
        };
        let _response =
            Self::traced_gql_request::<AccountCreate, _>(&self.client, &self.url, variables)
                .await?;
        Ok(account_id)
    }

    #[instrument(name = "lava.ledger.cala.find_by_id", skip(self), err)]
    pub async fn find_account_by_external_id(
        &self,
        external_id: String,
    ) -> Result<LedgerAccountId, CalaError> {
        let variables = account_by_external_id::Variables { external_id };
        let response =
            Self::traced_gql_request::<AccountByExternalId, _>(&self.client, &self.url, variables)
                .await?;

        Ok(LedgerAccountId::from(
            response
                .data
                .ok_or_else(|| {
                    CalaError::MissingResponseData("Empty `data` in response data".to_string())
                })?
                .account_by_external_id
                .account_id,
        ))
    }

    async fn traced_gql_request<Q: GraphQLQuery, U: reqwest::IntoUrl>(
        client: &ReqwestClient,
        url: U,
        variables: Q::Variables,
    ) -> Result<Response<Q::ResponseData>, CalaError>
    where
        <Q as GraphQLQuery>::ResponseData: std::fmt::Debug,
    {
        let trace_headers = lava_tracing::http::inject_trace();
        let body = Q::build_query(variables);
        let response = client
            .request(Method::POST, url)
            .headers(trace_headers)
            .json(&body)
            .send()
            .await?;
        let response = response.json::<Response<Q::ResponseData>>().await?;

        if let Some(errors) = response.errors {
            return Err(CalaError::from(errors));
        }

        Ok(response)
    }
}
