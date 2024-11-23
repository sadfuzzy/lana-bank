use async_graphql::*;

use crate::primitives::UsdCents;

#[derive(InputObject)]
pub struct ShareholderEquityAddInput {
    pub amount: UsdCents,
    pub reference: String,
}
