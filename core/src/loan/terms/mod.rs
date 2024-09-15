pub mod error;
mod repo;
mod value;

use crate::primitives::LoanTermsId;

pub use repo::*;
pub use value::*;

pub struct Terms {
    pub id: LoanTermsId,
    pub values: TermValues,
}
