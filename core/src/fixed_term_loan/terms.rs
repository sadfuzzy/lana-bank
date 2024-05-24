use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(transparent)]
pub struct FixedTermLoanRate(Decimal);

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum InterestInterval {
    Monthly,
    Quarterly,
    SemiAnnually,
    Annually,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FixedTermLoanTerms {
    pub interval: InterestInterval,
    pub rate: FixedTermLoanRate,
}
