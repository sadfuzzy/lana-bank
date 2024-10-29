use async_graphql::*;

use lava_app::terms::{AnnualRatePct, CVLPct};

use crate::shared_graphql::{
    convert::ToGlobalId,
    primitives::{Timestamp, UUID},
    terms::{DurationInput, InterestInterval, TermValues},
};

impl ToGlobalId for lava_app::primitives::TermsTemplateId {
    fn to_global_id(&self) -> async_graphql::types::ID {
        async_graphql::types::ID::from(format!("loan_terms:{}", self))
    }
}

#[derive(InputObject)]
pub(super) struct TermsTemplateCreateInput {
    pub name: String,
    pub annual_rate: AnnualRatePct,
    pub accrual_interval: InterestInterval,
    pub incurrence_interval: InterestInterval,
    pub duration: DurationInput,
    pub liquidation_cvl: CVLPct,
    pub margin_call_cvl: CVLPct,
    pub initial_cvl: CVLPct,
}

#[derive(SimpleObject)]
pub struct TermsTemplateCreatePayload {
    pub terms_template: TermsTemplate,
}

impl From<lava_app::terms_template::TermsTemplate> for TermsTemplateCreatePayload {
    fn from(terms_template: lava_app::terms_template::TermsTemplate) -> Self {
        Self {
            terms_template: terms_template.into(),
        }
    }
}

#[derive(SimpleObject)]
pub struct TermsTemplate {
    id: ID,
    terms_id: UUID,
    name: String,
    values: TermValues,
    created_at: Timestamp,
}

impl From<lava_app::terms_template::TermsTemplate> for TermsTemplate {
    fn from(terms: lava_app::terms_template::TermsTemplate) -> Self {
        let created_at = terms.created_at().into();

        Self {
            id: terms.id.to_global_id(),
            name: terms.name,
            terms_id: terms.id.into(),
            values: terms.values.into(),
            created_at,
        }
    }
}

#[derive(InputObject)]
pub(super) struct TermsTemplateUpdateInput {
    pub id: UUID,
    pub annual_rate: AnnualRatePct,
    pub accrual_interval: InterestInterval,
    pub incurrence_interval: InterestInterval,
    pub liquidation_cvl: CVLPct,
    pub duration: DurationInput,
    pub margin_call_cvl: CVLPct,
    pub initial_cvl: CVLPct,
}

#[derive(SimpleObject)]
pub struct TermsTemplateUpdatePayload {
    pub terms_template: TermsTemplate,
}

impl From<lava_app::terms_template::TermsTemplate> for TermsTemplateUpdatePayload {
    fn from(terms_template: lava_app::terms_template::TermsTemplate) -> Self {
        Self {
            terms_template: terms_template.into(),
        }
    }
}
