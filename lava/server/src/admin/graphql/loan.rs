use async_graphql::*;

use crate::shared_graphql::{
    loan::*,
    primitives::{Satoshis, UsdCents, UUID},
    terms::*,
};

#[derive(InputObject)]
pub struct LoanCreateInput {
    pub customer_id: UUID,
    pub desired_principal: UsdCents,
    pub loan_terms: TermsInput,
}

#[derive(SimpleObject)]
pub struct LoanCreatePayload {
    loan: Loan,
}

impl From<lava_app::loan::Loan> for LoanCreatePayload {
    fn from(loan: lava_app::loan::Loan) -> Self {
        Self { loan: loan.into() }
    }
}

#[derive(InputObject)]
pub struct LoanApproveInput {
    pub loan_id: UUID,
}

#[derive(SimpleObject)]
pub struct LoanApprovePayload {
    loan: Loan,
}

impl From<lava_app::loan::Loan> for LoanApprovePayload {
    fn from(loan: lava_app::loan::Loan) -> Self {
        Self { loan: loan.into() }
    }
}

#[derive(InputObject)]
pub struct LoanPartialPaymentInput {
    pub loan_id: UUID,
    pub amount: UsdCents,
}

#[derive(SimpleObject)]
pub struct LoanPartialPaymentPayload {
    loan: Loan,
}

impl From<lava_app::loan::Loan> for LoanPartialPaymentPayload {
    fn from(loan: lava_app::loan::Loan) -> Self {
        Self { loan: loan.into() }
    }
}

pub use lava_app::loan::LoanByCollateralizationRatioCursor;

#[derive(InputObject)]
pub struct LoanCollateralUpdateInput {
    pub loan_id: UUID,
    pub collateral: Satoshis,
}

#[derive(SimpleObject)]
pub struct LoanCollateralUpdatePayload {
    loan: Loan,
}

impl From<lava_app::loan::Loan> for LoanCollateralUpdatePayload {
    fn from(loan: lava_app::loan::Loan) -> Self {
        Self { loan: loan.into() }
    }
}

#[derive(InputObject)]
pub struct CollateralizationStateUpdateInput {
    pub loan_id: UUID,
}

#[derive(SimpleObject)]
pub struct CollateralizationStateUpdatePayload {
    loan: Loan,
}

impl From<lava_app::loan::Loan> for CollateralizationStateUpdatePayload {
    fn from(loan: lava_app::loan::Loan) -> Self {
        Self { loan: loan.into() }
    }
}
