use async_graphql::*;

use crate::shared_graphql::{customer::Customer, primitives::UUID};

pub use lava_app::customer::CustomerByEmailCursor;

#[derive(InputObject)]
pub struct CustomerCreateInput {
    pub email: String,
    pub telegram_id: String,
}

#[derive(InputObject)]

pub struct CustomerUpdateInput {
    pub customer_id: UUID,
    pub telegram_id: String,
}

#[derive(SimpleObject)]
pub struct CustomerUpdatePayload {
    pub customer: Customer,
}

impl From<lava_app::customer::Customer> for CustomerUpdatePayload {
    fn from(customer: lava_app::customer::Customer) -> Self {
        Self {
            customer: Customer::from(customer),
        }
    }
}

#[derive(SimpleObject)]
pub struct CustomerCreatePayload {
    pub customer: Customer,
}

impl From<lava_app::customer::Customer> for CustomerCreatePayload {
    fn from(customer: lava_app::customer::Customer) -> Self {
        Self {
            customer: Customer::from(customer),
        }
    }
}

#[derive(InputObject)]
pub struct SumsubPermalinkCreateInput {
    pub customer_id: UUID,
}
