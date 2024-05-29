use uuid::{uuid, Uuid};

// Journal
pub(super) const CORE_JOURNAL_ID: Uuid = uuid!("00000000-0000-0000-0000-000000000001");

// Accounts
pub(super) const CORE_ASSETS_ID: Uuid = uuid!("00000000-0000-0000-0000-000000000002");
pub(super) const CORE_ASSETS_NAME: &str = "Core Assets";
pub(super) const CORE_ASSETS_CODE: &str = "CORE.ASSETS";

pub(super) const BANK_ACH_CASH_ID: Uuid = uuid!("00000000-0000-0000-0000-000000000003");
pub(super) const BANK_ACH_CASH_NAME: &str = "Bank ACH Cash";
pub(super) const BANK_ACH_CASH_CODE: &str = "BANK.ACH_CASH";

pub(super) const BANK_TETHER_CASH_ID: Uuid = uuid!("00000000-0000-0000-0000-000000000004");
pub(super) const BANK_TETHER_CASH_NAME: &str = "Bank USDT Cash";
pub(super) const BANK_TETHER_CASH_CODE: &str = "BANK.TETHER_CASH";

// Templates
pub(super) const TOPUP_UNALLOCATED_COLLATERAL_CODE: &str = "TOPUP_UNALLOCATED_COLLATERAL";
pub(super) const APPROVE_LOAN_CODE: &str = "APPROVE_LOAN";
pub(super) const INCUR_INTEREST_CODE: &str = "INCUR_INTEREST";
pub(super) const RECORD_PAYMENT_CODE: &str = "RECORD_PAYMENT";
pub(super) const WITHDRAW_FROM_CHECKING_CODE: &str = "WITHDRAW_FROM_CHECKING";
