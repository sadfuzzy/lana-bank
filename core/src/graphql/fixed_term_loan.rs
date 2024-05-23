use async_graphql::*;

use super::primitives::*;

#[derive(SimpleObject)]
pub struct FixedTermLoan {
    loan_id: UUID,
    user_id: UUID,
}

#[derive(InputObject)]
pub struct FixedTermLoanCreateInput {
    pub user_id: UUID,
}

#[derive(SimpleObject)]
pub struct FixedTermLoanCreatePayload {
    loan: FixedTermLoan,
}

#[derive(InputObject)]
pub struct FixedTermLoanApproveInput {
    pub loan_id: UUID,
    pub collateral: Satoshis,
    pub principal: UsdCents,
}

#[derive(SimpleObject)]
pub struct FixedTermLoanApprovePayload {
    loan: FixedTermLoan,
}

impl From<crate::fixed_term_loan::FixedTermLoan> for FixedTermLoan {
    fn from(loan: crate::fixed_term_loan::FixedTermLoan) -> Self {
        FixedTermLoan {
            loan_id: UUID::from(loan.id),
            user_id: UUID::from(loan.user_id),
        }
    }
}

impl From<crate::fixed_term_loan::FixedTermLoan> for FixedTermLoanCreatePayload {
    fn from(loan: crate::fixed_term_loan::FixedTermLoan) -> Self {
        Self {
            loan: FixedTermLoan::from(loan),
        }
    }
}

impl From<crate::fixed_term_loan::FixedTermLoan> for FixedTermLoanApprovePayload {
    fn from(loan: crate::fixed_term_loan::FixedTermLoan) -> Self {
        Self {
            loan: FixedTermLoan::from(loan),
        }
    }
}
