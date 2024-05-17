pub mod error;
mod queries;

use graphql_client::{GraphQLQuery, Response};
use reqwest::{Client as ReqwestClient, Method};
use tracing::instrument;

use error::*;
use queries::*;

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

    #[instrument(name = "lava.ledger.cala.find_by_id", skip(self), err)]
    pub async fn find_account_by_external_id(&self, external_id: String) -> Result<(), CalaError> {
        let variables = account_by_external_id::Variables { external_id };
        let response =
            Self::traced_gql_request::<AccountByExternalId, _>(&self.client, &self.url, variables)
                .await?;
        Ok(())
        // if let Some(errors) = response.errors {
        //     let zeroth_error = errors[0].clone();

        //     return Err(GaloyClientError::GraphQLTopLevel {
        //         message: zeroth_error.message,
        //         path: zeroth_error.path.into(),
        //         locations: zeroth_error.locations,
        //         extensions: zeroth_error.extensions,
        //     });
        // }

        // let result = response
        //     .data
        //     .ok_or_else(|| GaloyClientError::GraphQLNested {
        //         message: "Empty `me` in response data".to_string(),
        //         path: None,
        //     })?;
        // GaloyTransactions::try_from(result)
    }

    async fn traced_gql_request<Q: GraphQLQuery, U: reqwest::IntoUrl>(
        client: &ReqwestClient,
        url: U,
        variables: Q::Variables,
    ) -> Result<Response<Q::ResponseData>, CalaError> {
        let trace_headers = lava_tracing::http::inject_trace();
        let body = Q::build_query(variables);
        let response = client
            .request(Method::POST, url)
            .headers(trace_headers)
            .json(&body)
            .send()
            .await?;

        let response = response.json::<Response<Q::ResponseData>>().await?;

        Ok(response)
    }
}
