use async_graphql::{types::connection::*, *};
use serde::{Deserialize, Serialize};

use crate::{
    primitives::{CustomerId, Satoshis},
    server::shared_graphql::{customer::Customer, primitives::UUID},
};

#[derive(InputObject)]
pub struct CustomerPledgeCollateralInput {
    pub user_id: UUID,
    pub amount: Satoshis,
    pub reference: String,
}

#[derive(SimpleObject)]
pub struct CustomerPledgeCollateralPayload {
    pub user: Customer,
}

impl From<crate::customer::Customer> for CustomerPledgeCollateralPayload {
    fn from(user: crate::customer::Customer) -> Self {
        Self {
            user: Customer::from(user),
        }
    }
}

#[derive(Serialize, Deserialize)]
pub(super) struct CustomerByNameCursor {
    pub name: String,
    pub id: CustomerId,
}

impl CursorType for CustomerByNameCursor {
    type Error = String;

    fn encode_cursor(&self) -> String {
        use base64::{engine::general_purpose, Engine as _};
        let json = serde_json::to_string(&self).expect("could not serialize token");
        general_purpose::STANDARD_NO_PAD.encode(json.as_bytes())
    }

    fn decode_cursor(s: &str) -> Result<Self, Self::Error> {
        use base64::{engine::general_purpose, Engine as _};
        let bytes = general_purpose::STANDARD_NO_PAD
            .decode(s.as_bytes())
            .map_err(|e| e.to_string())?;
        let json = String::from_utf8(bytes).map_err(|e| e.to_string())?;
        serde_json::from_str(&json).map_err(|e| e.to_string())
    }
}

impl From<(CustomerId, &str)> for CustomerByNameCursor {
    fn from((id, name): (CustomerId, &str)) -> Self {
        Self {
            id,
            name: name.to_string(),
        }
    }
}

impl From<CustomerByNameCursor> for crate::customer::CustomerByNameCursor {
    fn from(cursor: CustomerByNameCursor) -> Self {
        Self {
            id: cursor.id,
            name: cursor.name,
        }
    }
}

#[derive(InputObject)]
pub struct SumsubPermalinkCreateInput {
    pub customer_id: String,
}
