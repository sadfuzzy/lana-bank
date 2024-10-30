use async_graphql::*;

pub use lava_app::terms::{AnnualRatePct, CVLPct, InterestInterval};

#[derive(SimpleObject, Clone)]
pub struct TermValues {
    annual_rate: AnnualRatePct,
    accrual_interval: InterestInterval,
    incurrence_interval: InterestInterval,
    duration: Duration,
    liquidation_cvl: CVLPct,
    margin_call_cvl: CVLPct,
    initial_cvl: CVLPct,
}

#[derive(InputObject)]
pub struct TermsInput {
    pub annual_rate: AnnualRatePct,
    pub accrual_interval: InterestInterval,
    pub incurrence_interval: InterestInterval,
    pub liquidation_cvl: CVLPct,
    pub duration: DurationInput,
    pub margin_call_cvl: CVLPct,
    pub initial_cvl: CVLPct,
}

#[derive(SimpleObject, Clone)]
pub(super) struct Duration {
    period: Period,
    units: u32,
}

#[derive(Enum, Copy, Clone, Eq, PartialEq)]
pub enum Period {
    Months,
}

#[derive(InputObject)]
pub struct DurationInput {
    pub period: Period,
    pub units: u32,
}

impl From<lava_app::terms::TermValues> for TermValues {
    fn from(values: lava_app::terms::TermValues) -> Self {
        Self {
            annual_rate: values.annual_rate,
            accrual_interval: values.accrual_interval,
            incurrence_interval: values.incurrence_interval,
            duration: values.duration.into(),
            liquidation_cvl: values.liquidation_cvl,
            margin_call_cvl: values.margin_call_cvl,
            initial_cvl: values.initial_cvl,
        }
    }
}

impl From<lava_app::terms::Duration> for Duration {
    fn from(duration: lava_app::terms::Duration) -> Self {
        match duration {
            lava_app::terms::Duration::Months(months) => Self {
                period: Period::Months,
                units: months,
            },
        }
    }
}

impl From<DurationInput> for lava_app::terms::Duration {
    fn from(duration: DurationInput) -> Self {
        match duration.period {
            Period::Months => Self::Months(duration.units),
        }
    }
}
