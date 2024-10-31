use async_graphql::*;

use crate::primitives::*;

pub use lava_app::loan::RepaymentStatus as LoanRepaymentStatus;

#[derive(SimpleObject)]
pub struct LoanRepaymentInPlan {
    pub repayment_type: LoanRepaymentType,
    pub status: LoanRepaymentStatus,
    pub initial: UsdCents,
    pub outstanding: UsdCents,
    pub accrual_at: Timestamp,
    pub due_at: Timestamp,
}

impl From<lava_app::loan::LoanRepaymentInPlan> for LoanRepaymentInPlan {
    fn from(repayment: lava_app::loan::LoanRepaymentInPlan) -> Self {
        match repayment {
            lava_app::loan::LoanRepaymentInPlan::Interest(interest) => LoanRepaymentInPlan {
                repayment_type: LoanRepaymentType::Interest,
                status: interest.status,
                initial: interest.initial,
                outstanding: interest.outstanding,
                accrual_at: interest.accrual_at.into(),
                due_at: interest.due_at.into(),
            },
            lava_app::loan::LoanRepaymentInPlan::Principal(interest) => LoanRepaymentInPlan {
                repayment_type: LoanRepaymentType::Principal,
                status: interest.status,
                initial: interest.initial,
                outstanding: interest.outstanding,
                accrual_at: interest.accrual_at.into(),
                due_at: interest.due_at.into(),
            },
        }
    }
}

#[derive(async_graphql::Enum, Clone, Copy, PartialEq, Eq)]
pub enum LoanRepaymentType {
    Principal,
    Interest,
}
