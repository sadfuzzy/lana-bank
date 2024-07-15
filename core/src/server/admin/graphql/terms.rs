use async_graphql::*;

use crate::{
    loan::{AnnualRate, CVLPct},
    server::shared_graphql::terms::*,
};

#[derive(InputObject)]
pub(super) struct CurrentTermsUpdateInput {
    pub annual_rate: AnnualRate,
    pub interval: InterestInterval,
    pub liquidation_cvl: CVLPct,
    pub duration: DurationInput,
    pub margin_call_cvl: CVLPct,
    pub initial_cvl: CVLPct,
}

#[derive(InputObject)]
pub(super) struct DurationInput {
    pub period: Period,
    pub units: u32,
}

#[derive(SimpleObject)]
pub struct CurrentTermsUpdatePayload {
    pub terms: Terms,
}

impl From<crate::loan::Terms> for CurrentTermsUpdatePayload {
    fn from(terms: crate::loan::Terms) -> Self {
        Self {
            terms: terms.into(),
        }
    }
}

impl From<DurationInput> for crate::loan::Duration {
    fn from(loan_duration: DurationInput) -> Self {
        match loan_duration.period {
            Period::Months => Self::Months(loan_duration.units),
        }
    }
}
