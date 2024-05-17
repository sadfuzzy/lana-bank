use async_graphql::*;

use super::primitives::*;

#[derive(SimpleObject)]
pub struct FixedTermLoan {
    pub loan_id: UUID,
}

#[derive(InputObject)]
pub struct FixedTermLoanCreateInput {
    bitfinex_user_name: String,
}

#[derive(SimpleObject)]
pub struct FixedTermLoanCreatePayload {
    pub loan: FixedTermLoan,
}

#[derive(InputObject)]
pub struct FixedTermLoanDeclareCollateralizedInput {
    pub loan_id: UUID,
}

#[derive(SimpleObject)]
pub struct FixedTermLoanDeclareCollateralizedPayload {
    pub loan: FixedTermLoan,
}

impl From<crate::fixed_term_loan::FixedTermLoan> for FixedTermLoan {
    fn from(loan: crate::fixed_term_loan::FixedTermLoan) -> Self {
        FixedTermLoan {
            loan_id: UUID::from(loan.id),
        }
    }
}

impl From<crate::fixed_term_loan::FixedTermLoan> for FixedTermLoanCreatePayload {
    fn from(loan: crate::fixed_term_loan::FixedTermLoan) -> Self {
        FixedTermLoanCreatePayload {
            loan: FixedTermLoan::from(loan),
        }
    }
}

impl From<crate::fixed_term_loan::FixedTermLoan> for FixedTermLoanDeclareCollateralizedPayload {
    fn from(loan: crate::fixed_term_loan::FixedTermLoan) -> Self {
        FixedTermLoanDeclareCollateralizedPayload {
            loan: FixedTermLoan::from(loan),
        }
    }
}
