#![allow(clippy::upper_case_acronyms)]
use async_graphql::*;
use serde::{Deserialize, Serialize};

pub use es_entity::graphql::UUID;

pub use lava_app::primitives::{Satoshis, SignedSatoshis, SignedUsdCents, UsdCents};

#[derive(Clone, Serialize, Deserialize)]
#[serde(transparent)]
pub struct Timestamp(chrono::DateTime<chrono::Utc>);
scalar!(Timestamp);
impl From<chrono::DateTime<chrono::Utc>> for Timestamp {
    fn from(value: chrono::DateTime<chrono::Utc>) -> Self {
        Self(value)
    }
}
impl Timestamp {
    pub fn into_inner(self) -> chrono::DateTime<chrono::Utc> {
        self.0
    }
}

#[derive(Serialize, Deserialize)]
#[serde(transparent)]
pub struct Decimal(rust_decimal::Decimal);
scalar!(Decimal);
impl From<rust_decimal::Decimal> for Decimal {
    fn from(value: rust_decimal::Decimal) -> Self {
        Self(value)
    }
}

#[derive(Serialize, Deserialize)]
#[serde(transparent)]
pub struct CurrencyCode(lava_app::primitives::Currency);
scalar!(CurrencyCode);
impl From<CurrencyCode> for lava_app::primitives::Currency {
    fn from(code: CurrencyCode) -> Self {
        code.0
    }
}
impl From<lava_app::primitives::Currency> for CurrencyCode {
    fn from(currency: lava_app::primitives::Currency) -> Self {
        Self(currency)
    }
}
