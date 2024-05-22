pub mod error;
pub(super) mod graphql;

use cala_types::primitives::TxTemplateId;
use graphql_client::{GraphQLQuery, Response};
use reqwest::{Client as ReqwestClient, Method};
use tracing::instrument;
use uuid::Uuid;

use super::account::LedgerAccount;
use super::transactions::{deposit::DepositTxTemplate, withdrawal::WithdrawalTxTemplate};
use super::tx_template::TxTemplate;
use crate::primitives::{LedgerAccountId, LedgerJournalId};

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

    #[instrument(name = "lava.ledger.cala.find_journal_by_id", skip(self), err)]
    pub async fn find_journal_by_id(&self, id: Uuid) -> Result<LedgerJournalId, CalaError> {
        let variables = journal_by_id::Variables { id };
        let response =
            Self::traced_gql_request::<JournalById, _>(&self.client, &self.url, variables).await?;
        response
            .data
            .and_then(|d| d.journal)
            .map(|d| LedgerJournalId::from(d.journal_id))
            .ok_or(CalaError::MissingDataField)
    }

    #[instrument(name = "lava.ledger.cala.create_lava_journal", skip(self), err)]
    pub async fn create_lava_journal(&self, id: Uuid) -> Result<LedgerJournalId, CalaError> {
        let variables = lava_journal_create::Variables { id };
        let response =
            Self::traced_gql_request::<LavaJournalCreate, _>(&self.client, &self.url, variables)
                .await?;
        response
            .data
            .map(|d| LedgerJournalId::from(d.journal_create.journal.journal_id))
            .ok_or(CalaError::MissingDataField)
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
        let response =
            Self::traced_gql_request::<AccountCreate, _>(&self.client, &self.url, variables)
                .await?;
        response
            .data
            .map(|d| LedgerAccountId::from(d.account_create.account.account_id))
            .ok_or(CalaError::MissingDataField)
    }

    #[instrument(name = "lava.ledger.cala.find_account_by_id", skip(self, id), err)]
    pub async fn find_account_by_id(
        &self,
        id: impl Into<Uuid>,
    ) -> Result<Option<LedgerAccount>, CalaError> {
        let variables = account_by_id::Variables {
            id: id.into(),
            journal_id: super::constants::LAVA_JOURNAL_ID,
        };
        let response =
            Self::traced_gql_request::<AccountById, _>(&self.client, &self.url, variables).await?;

        Ok(response
            .data
            .and_then(|d| d.account)
            .map(LedgerAccount::from))
    }

    #[instrument(name = "lava.ledger.cala.find_by_id", skip(self), err)]
    pub async fn find_account_by_external_id(
        &self,
        external_id: String,
    ) -> Result<Option<LedgerAccount>, CalaError> {
        let variables = account_by_external_id::Variables {
            external_id,
            journal_id: super::constants::LAVA_JOURNAL_ID,
        };
        let response =
            Self::traced_gql_request::<AccountByExternalId, _>(&self.client, &self.url, variables)
                .await?;

        Ok(response
            .data
            .and_then(|d| d.account_by_external_id)
            .map(LedgerAccount::from))
    }

    #[instrument(name = "lava.ledger.cala.find_tx_template_by_code", skip(self), err)]
    pub async fn find_tx_template_by_code(
        &self,
        code: String,
    ) -> Result<Option<TxTemplate>, CalaError> {
        let variables = tx_template_by_code::Variables { code };
        let response =
            Self::traced_gql_request::<TxTemplateByCode, _>(&self.client, &self.url, variables)
                .await?;

        Ok(response
            .data
            .and_then(|d| d.tx_template_by_code)
            .map(TxTemplate::from))
    }

    #[instrument(name = "lava.ledger.cala.create_deposit_tx_template", skip(self), err)]
    pub async fn create_deposit_tx_template(
        &self,
        template_id: TxTemplateId,
        template_code: String,
    ) -> Result<Option<DepositTxTemplate>, CalaError> {
        let variables = lava_deposit_tx_template_create::Variables {
            template_id: Uuid::from(template_id),
            template_code,
            journal_id: format!(
                "uuid(\"{}\")",
                super::constants::LAVA_JOURNAL_ID.to_string()
            ),
            asset_account_id: format!("uuid(\"{}\")", super::constants::LAVA_ASSETS_ID.to_string()),
        };
        let response = Self::traced_gql_request::<LavaDepositTxTemplateCreate, _>(
            &self.client,
            &self.url,
            variables,
        )
        .await?;

        Ok(response
            .data
            .and_then(|d| Some(d.tx_template_create))
            .map(DepositTxTemplate::from))
    }

    #[instrument(
        name = "lava.ledger.cala.create_withdrawal_tx_template",
        skip(self),
        err
    )]
    pub async fn create_withdrawal_tx_template(
        &self,
        template_id: TxTemplateId,
        template_code: String,
    ) -> Result<Option<WithdrawalTxTemplate>, CalaError> {
        let variables = lava_withdrawal_tx_template_create::Variables {
            template_id: Uuid::from(template_id),
            template_code,
            journal_id: format!(
                "uuid(\"{}\")",
                super::constants::LAVA_JOURNAL_ID.to_string()
            ),
            asset_account_id: format!("uuid(\"{}\")", super::constants::LAVA_ASSETS_ID.to_string()),
        };
        let response = Self::traced_gql_request::<LavaWithdrawalTxTemplateCreate, _>(
            &self.client,
            &self.url,
            variables,
        )
        .await?;

        Ok(response
            .data
            .and_then(|d| Some(d.tx_template_create))
            .map(WithdrawalTxTemplate::from))
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
