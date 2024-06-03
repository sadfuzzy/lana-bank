use crate::primitives::UsdCents;

pub struct LayeredUsdBalance {
    pub settled: UsdCents,
    pub pending: UsdCents,
}
