use serde::{Deserialize, Serialize};

use super::{Customer, CustomerId};

#[derive(Debug, Serialize, Deserialize)]
pub struct CustomerByNameCursor {
    pub name: String,
    pub id: CustomerId,
}

impl From<&Customer> for CustomerByNameCursor {
    fn from(values: &Customer) -> Self {
        Self {
            name: values.email.clone(),
            id: values.id,
        }
    }
}
