use serde::{Deserialize, Serialize};

use super::{CreditFacility, CreditFacilityId};

#[derive(Debug, Serialize, Deserialize)]
pub struct CreditFacilityByCreatedAtCursor {
    pub id: CreditFacilityId,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

impl From<&CreditFacility> for CreditFacilityByCreatedAtCursor {
    fn from(values: &CreditFacility) -> Self {
        Self {
            id: values.id,
            created_at: values.created_at(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreditFacilityByCollateralizationRatioCursor {
    pub id: CreditFacilityId,
    pub ratio: Option<rust_decimal::Decimal>,
}

impl From<&CreditFacility> for CreditFacilityByCollateralizationRatioCursor {
    fn from(values: &CreditFacility) -> Self {
        Self {
            id: values.id,
            ratio: values.collateralization_ratio(),
        }
    }
}
