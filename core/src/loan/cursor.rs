use serde::{Deserialize, Serialize};

use super::{Loan, LoanId};

#[derive(Debug, Serialize, Deserialize)]
pub struct LoanByCreatedAtCursor {
    pub id: LoanId,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

impl From<&Loan> for LoanByCreatedAtCursor {
    fn from(values: &Loan) -> Self {
        Self {
            id: values.id,
            created_at: values.created_at(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoanByCollateralizationRatioCursor {
    pub id: LoanId,
    pub ratio: Option<rust_decimal::Decimal>,
}

impl From<&Loan> for LoanByCollateralizationRatioCursor {
    fn from(values: &Loan) -> Self {
        Self {
            id: values.id,
            ratio: values.collateralization_ratio(),
        }
    }
}
