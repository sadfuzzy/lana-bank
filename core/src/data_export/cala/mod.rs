pub mod error;
mod graphql;

use graphql_client::{GraphQLQuery, Response};
use reqwest::{Client as ReqwestClient, Method};

use super::ExportData;

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

    pub async fn insert_bq_row(
        &self,
        table_name: &str,
        data: &ExportData,
    ) -> Result<(), CalaError> {
        let insert_id = format!("{}:{}", data.id, data.sequence);
        tracing::Span::current().record("insert_id", &insert_id);
        let variables = row_insert::Variables {
            insert_id: format!("{}:{}", data.id, data.sequence),
            table_name: table_name.to_string(),
            row_data: serde_json::to_value(data).expect("Could not serialize event"),
        };
        Self::traced_gql_request::<RowInsert, _>(&self.client, &self.url, variables).await?;
        Ok(())
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
