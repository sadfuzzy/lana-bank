use async_graphql::*;

use crate::{
    server::shared_graphql::{
        convert::ToGlobalId,
        primitives::UUID,
        terms::{DurationInput, InterestInterval, TermValues},
    },
    terms::{AnnualRatePct, CVLPct},
};

impl ToGlobalId for crate::primitives::TermsTemplateId {
    fn to_global_id(&self) -> async_graphql::types::ID {
        async_graphql::types::ID::from(format!("loan_terms:{}", self))
    }
}

#[derive(InputObject)]
pub(super) struct TermsTemplateCreateInput {
    pub name: String,
    pub annual_rate: AnnualRatePct,
    pub interval: InterestInterval,
    pub duration: DurationInput,
    pub liquidation_cvl: CVLPct,
    pub margin_call_cvl: CVLPct,
    pub initial_cvl: CVLPct,
}

#[derive(SimpleObject)]
pub struct TermsTemplateCreatePayload {
    pub terms_template: TermsTemplate,
}

impl From<crate::terms_template::TermsTemplate> for TermsTemplateCreatePayload {
    fn from(terms_template: crate::terms_template::TermsTemplate) -> Self {
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
}

impl From<crate::terms_template::TermsTemplate> for TermsTemplate {
    fn from(terms: crate::terms_template::TermsTemplate) -> Self {
        Self {
            id: terms.id.to_global_id(),
            name: terms.name,
            terms_id: terms.id.into(),
            values: terms.values.into(),
        }
    }
}
