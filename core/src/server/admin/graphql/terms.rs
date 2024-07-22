use async_graphql::*;

use crate::{
    loan::{AnnualRate, CVLPct},
    server::shared_graphql::terms::*,
};

#[derive(InputObject)]
pub(super) struct DefaultTermsUpdateInput {
    pub annual_rate: AnnualRate,
    pub interval: InterestInterval,
    pub liquidation_cvl: CVLPct,
    pub duration: DurationInput,
    pub margin_call_cvl: CVLPct,
    pub initial_cvl: CVLPct,
}

#[derive(SimpleObject)]
pub struct DefaultTermsUpdatePayload {
    pub terms: Terms,
}

impl From<crate::loan::Terms> for DefaultTermsUpdatePayload {
    fn from(terms: crate::loan::Terms) -> Self {
        Self {
            terms: terms.into(),
        }
    }
}
