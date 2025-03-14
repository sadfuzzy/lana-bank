mod config;
pub mod error;
mod job;
mod repo;
mod sumsub_auth;

use core_customer;
use job::{SumsubExportConfig, SumsubExportInitializer};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use std::sync::Arc;
use tracing::instrument;

use crate::{
    customer::{CustomerId, Customers},
    job::Jobs,
    primitives::{DepositId, JobId, Subject, UsdCents, WithdrawalId},
};

pub use config::*;
use error::ApplicantError;
use sumsub_auth::*;

use repo::ApplicantRepo;
pub use sumsub_auth::{AccessTokenResponse, PermalinkResponse};

use async_graphql::*;

/// Direction of the transaction from Sumsub's perspective
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum SumsubTransactionDirection {
    /// Money coming into the customer's account (deposit)
    #[serde(rename = "in")]
    In,
    /// Money going out of the customer's account (withdrawal)
    #[serde(rename = "out")]
    Out,
}

impl std::fmt::Display for SumsubTransactionDirection {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SumsubTransactionDirection::In => write!(f, "in"),
            SumsubTransactionDirection::Out => write!(f, "out"),
        }
    }
}

/// Helper function to format UsdCents as float dollars
/// FIXME temporary function, remove when we have a proper conversion
pub fn usd_cents_to_dollars(cents: UsdCents) -> f64 {
    // Use the into_inner method to get the value in cents
    (cents.into_inner() as f64) / 100.0
}

/// Applicants service
#[derive(Clone)]
pub struct Applicants {
    sumsub_client: SumsubClient,
    customers: Arc<Customers>,
    jobs: Arc<Jobs>,
    repo: ApplicantRepo,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, strum::Display)]
#[serde(rename_all = "UPPERCASE")]
#[strum(serialize_all = "UPPERCASE")]
pub enum ReviewAnswer {
    Green,
    Red,
}

impl std::str::FromStr for ReviewAnswer {
    type Err = ApplicantError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_uppercase().as_str() {
            "GREEN" => Ok(ReviewAnswer::Green),
            "RED" => Ok(ReviewAnswer::Red),
            _ => Err(ApplicantError::ReviewAnswerParseError(s.to_string())),
        }
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Enum, PartialEq, Eq, strum::Display)]
#[serde(rename_all = "kebab-case")]
#[strum(serialize_all = "kebab-case")]
pub enum SumsubVerificationLevel {
    #[serde(rename = "basic-kyc-level")]
    #[strum(serialize = "basic-kyc-level")]
    BasicKycLevel,
    #[serde(rename = "basic-kyb-level")]
    #[strum(serialize = "basic-kyb-level")]
    BasicKybLevel,
    Unimplemented,
}

impl std::str::FromStr for SumsubVerificationLevel {
    type Err = ApplicantError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "basic-kyc-level" => Ok(SumsubVerificationLevel::BasicKycLevel),
            "basic-kyb-level" => Ok(SumsubVerificationLevel::BasicKybLevel),
            _ => {
                tracing::warn!("Unrecognized SumsubVerificationLevel: {}", s);
                Err(ApplicantError::SumsubVerificationLevelParseError(
                    s.to_string(),
                ))
            }
        }
    }
}

impl From<&core_customer::CustomerType> for SumsubVerificationLevel {
    fn from(customer_type: &core_customer::CustomerType) -> Self {
        match customer_type {
            core_customer::CustomerType::Individual => SumsubVerificationLevel::BasicKycLevel,
            // All company types use the same SumSub verification level
            core_customer::CustomerType::GovernmentEntity => SumsubVerificationLevel::BasicKybLevel,
            core_customer::CustomerType::PrivateCompany => SumsubVerificationLevel::BasicKybLevel,
            core_customer::CustomerType::Bank => SumsubVerificationLevel::BasicKybLevel,
            core_customer::CustomerType::FinancialInstitution => {
                SumsubVerificationLevel::BasicKybLevel
            }
            core_customer::CustomerType::ForeignAgencyOrSubsidiary => {
                SumsubVerificationLevel::BasicKybLevel
            }
            core_customer::CustomerType::NonDomiciledCompany => {
                SumsubVerificationLevel::BasicKybLevel
            }
        }
    }
}

impl From<core_customer::CustomerType> for SumsubVerificationLevel {
    fn from(customer_type: core_customer::CustomerType) -> Self {
        (&customer_type).into()
    }
}

#[derive(Deserialize, Debug, Serialize)]
#[serde(tag = "type")]
pub enum SumsubCallbackPayload {
    #[serde(rename = "applicantCreated")]
    #[serde(rename_all = "camelCase")]
    ApplicantCreated {
        applicant_id: String,
        inspection_id: String,
        correlation_id: String,
        level_name: String,
        external_user_id: CustomerId,
        review_status: String,
        created_at_ms: String,
        client_id: Option<String>,
        sandbox_mode: Option<bool>,
    },
    #[serde(rename = "applicantReviewed")]
    #[serde(rename_all = "camelCase")]
    ApplicantReviewed {
        applicant_id: String,
        inspection_id: String,
        correlation_id: String,
        external_user_id: CustomerId,
        level_name: String,
        review_result: ReviewResult,
        review_status: String,
        created_at_ms: String,
        sandbox_mode: Option<bool>,
    },
    #[serde(other)]
    Unknown,
}

#[derive(Deserialize, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReviewResult {
    pub review_answer: ReviewAnswer,
    pub moderation_comment: Option<String>,
    pub client_comment: Option<String>,
    pub reject_labels: Option<Vec<String>>,
    pub review_reject_type: Option<String>,
}

impl Applicants {
    pub fn new(pool: &PgPool, config: &SumsubConfig, customers: &Customers, jobs: &Jobs) -> Self {
        let sumsub_client = SumsubClient::new(config);
        jobs.add_initializer(SumsubExportInitializer::new(sumsub_client.clone(), pool));

        Self {
            repo: ApplicantRepo::new(pool),
            sumsub_client,
            customers: Arc::new(customers.clone()),
            jobs: Arc::new(jobs.clone()),
        }
    }

    pub async fn handle_callback(&self, payload: serde_json::Value) -> Result<(), ApplicantError> {
        let customer_id: CustomerId = payload["externalUserId"]
            .as_str()
            .ok_or_else(|| ApplicantError::MissingExternalUserId(payload.to_string()))?
            .parse()?;

        let callback_id = &self
            .repo
            .persist_webhook_data(customer_id, payload.clone())
            .await?;

        let mut db = self.repo.begin_op().await?;

        self.jobs
            .create_and_spawn_in_op(
                &mut db,
                JobId::new(),
                SumsubExportConfig::Webhook {
                    callback_id: *callback_id,
                },
            )
            .await?;

        match self.process_payload(&mut db, payload).await {
            Ok(_) => (),
            Err(ApplicantError::UnhandledCallbackType(_)) => (),
            Err(e) => return Err(e),
        }

        db.commit().await?;

        Ok(())
    }

    async fn process_payload(
        &self,
        db: &mut es_entity::DbOp<'_>,
        payload: serde_json::Value,
    ) -> Result<(), ApplicantError> {
        match serde_json::from_value(payload.clone())? {
            SumsubCallbackPayload::ApplicantCreated {
                external_user_id,
                applicant_id,
                sandbox_mode,
                ..
            } => {
                let res = self
                    .customers
                    .start_kyc(db, external_user_id, applicant_id)
                    .await;

                match res {
                    Ok(_) => (),
                    Err(e) if e.was_not_found() && sandbox_mode.unwrap_or(false) => {
                        return Ok(());
                    }
                    Err(e) => return Err(e.into()),
                }
            }
            SumsubCallbackPayload::ApplicantReviewed {
                external_user_id,
                review_result:
                    ReviewResult {
                        review_answer: ReviewAnswer::Red,
                        ..
                    },
                applicant_id,
                sandbox_mode,
                ..
            } => {
                let res = self
                    .customers
                    .decline_kyc(db, external_user_id, applicant_id)
                    .await;

                match res {
                    Ok(_) => (),
                    Err(e) if e.was_not_found() && sandbox_mode.unwrap_or(false) => {
                        return Ok(());
                    }
                    Err(e) => return Err(e.into()),
                }
            }
            SumsubCallbackPayload::ApplicantReviewed {
                external_user_id,
                review_result:
                    ReviewResult {
                        review_answer: ReviewAnswer::Green,
                        ..
                    },
                applicant_id,
                level_name,
                sandbox_mode,
                ..
            } => {
                // Try to parse the level name, will return error for unrecognized values
                match level_name.parse::<SumsubVerificationLevel>() {
                    Ok(_) => {} // Level is valid, continue
                    Err(_) => {
                        return Err(ApplicantError::UnhandledCallbackType(format!(
                            "Sumsub level {level_name} not implemented",
                            level_name = level_name
                        )));
                    }
                };

                let res = self
                    .customers
                    .approve_kyc(db, external_user_id, applicant_id)
                    .await;

                match res {
                    Ok(_) => (),
                    Err(e) if e.was_not_found() && sandbox_mode.unwrap_or(false) => {
                        return Ok(());
                    }
                    Err(e) => return Err(e.into()),
                }

                self.jobs
                    .create_and_spawn_in_op(
                        db,
                        JobId::new(),
                        SumsubExportConfig::SensitiveInfo {
                            customer_id: external_user_id,
                        },
                    )
                    .await?;
            }
            SumsubCallbackPayload::Unknown => {
                return Err(ApplicantError::UnhandledCallbackType(format!(
                    "callback event not processed for payload {payload}",
                )));
            }
        }
        Ok(())
    }

    #[instrument(name = "applicant.create_permalink", skip(self))]
    pub async fn create_permalink(
        &self,
        sub: &Subject,
        customer_id: impl Into<CustomerId> + std::fmt::Debug,
    ) -> Result<PermalinkResponse, ApplicantError> {
        let customer_id: CustomerId = customer_id.into();

        let customer = self.customers.find_by_id(sub, customer_id).await?;
        let customer = customer.ok_or_else(|| {
            ApplicantError::CustomerIdNotFound(format!(
                "Customer with ID {} not found",
                customer_id
            ))
        })?;

        let level: SumsubVerificationLevel = customer.customer_type.into();

        self.sumsub_client
            .create_permalink(customer_id, &level.to_string())
            .await
    }

    #[instrument(name = "applicants.submit_withdrawal_transaction", skip(self), err)]
    pub async fn submit_withdrawal_transaction(
        &self,
        withdrawal_id: WithdrawalId,
        customer_id: CustomerId,
        amount: UsdCents,
    ) -> Result<(), ApplicantError> {
        self.sumsub_client
            .submit_finance_transaction(
                customer_id,
                withdrawal_id.to_string(),
                "Withdrawal",
                &SumsubTransactionDirection::Out.to_string(),
                usd_cents_to_dollars(amount),
                "USD",
            )
            .await
    }

    #[instrument(name = "applicants.submit_deposit_transaction", skip(self), err)]
    pub async fn submit_deposit_transaction(
        &self,
        deposit_id: DepositId,
        customer_id: CustomerId,
        amount: UsdCents,
    ) -> Result<(), ApplicantError> {
        self.sumsub_client
            .submit_finance_transaction(
                customer_id,
                deposit_id.to_string(),
                "Deposit",
                &SumsubTransactionDirection::In.to_string(),
                usd_cents_to_dollars(amount),
                "USD",
            )
            .await
    }
}
