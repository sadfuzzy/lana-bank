use uuid::{uuid, Uuid};

// Journal
pub(super) const CORE_JOURNAL_ID: Uuid = uuid!("00000000-0000-0000-0000-000000000001");

// Accounts
pub(super) const CORE_ASSETS_ID: Uuid = uuid!("00000000-0000-0000-0000-000000000002");
pub(super) const CORE_ASSETS_NAME: &str = "Core Assets";
pub(super) const CORE_ASSETS_CODE: &str = "CORE.ASSETS";

// Templates
pub(super) const TOPUP_UNALLOCATED_COLLATERAL_CODE: &str = "TOPUP_UNALLOCATED_COLLATERAL";
pub(super) const APPROVE_LOAN_CODE: &str = "APPROVE_LOAN";
pub(super) const INCUR_INTEREST_CODE: &str = "INCUR_INTEREST";
pub(super) const RECORD_PAYMENT_CODE: &str = "RECORD_PAYMENT";
