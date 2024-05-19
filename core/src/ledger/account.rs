use crate::primitives::LedgerAccountId;

pub struct LedgerAccount {
    id: LedgerAccountId,
    external_id: String,
    code: String,
}
