use derive_builder::Builder;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(transparent)]
pub struct LoanAnnualRate(Decimal);

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(transparent)]
pub struct LoanLTVPct(Decimal);

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum LoanDuration {
    Months(u32),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum InterestInterval {
    EndOfMonth,
}

#[derive(Builder, Debug, Serialize, Deserialize, Clone)]
pub struct TermValues {
    annual_rate: LoanAnnualRate,
    duration: LoanDuration,
    interval: InterestInterval,
    // overdue_penalty_rate: LoanAnnualRate,
    liquidation_ltv: LoanLTVPct,
    margin_call_ltv: LoanLTVPct,
    initial_ltv: LoanLTVPct,
}

impl TermValues {
    pub fn builder() -> TermValuesBuilder {
        TermValuesBuilder::default()
    }
}
