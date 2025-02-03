use serde::{Deserialize, Serialize};

use crate::primitives::CustomerId;

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum CoreCustomerEvent {
    CustomerCreated { id: CustomerId, email: String },
}
