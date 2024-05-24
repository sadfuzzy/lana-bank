use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(transparent)]
pub struct FixedTermLoanRate(Decimal);

impl FixedTermLoanRate {
    pub fn from_bips(bips: u32) -> Self {
        FixedTermLoanRate(Decimal::from(bips) / Decimal::from(10_000))
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum InterestInterval {
    Secondly,
    Daily,
    Weekly,
    Monthly,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FixedTermLoanTerms {
    pub interval: InterestInterval,
    pub rate: FixedTermLoanRate,
}
