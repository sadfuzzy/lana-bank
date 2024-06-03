use crate::primitives::UsdCents;

pub struct LayeredUsdBalance {
    pub settled: UsdCents,
    pub encumbrance: UsdCents,
}
