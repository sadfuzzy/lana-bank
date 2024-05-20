use uuid::{uuid, Uuid};

// Journal
pub(super) const LAVA_JOURNAL_ID: Uuid = uuid!("00000000-0000-0000-0000-000000000001");

// Accounts
pub(super) const LOAN_OMINBUS_EXTERNAL_ID: &str = "lava:loan-omnibus";
pub(super) const LAVA_ASSETS_ID: Uuid = uuid!("00000000-0000-0000-0000-000000000002");

// Templates
pub(super) const LAVA_DEPOSIT_TX_TEMPLATE_CODE: &str = "DEPOSIT";
pub(super) const LAVA_WITHDRAWAL_TX_TEMPLATE_CODE: &str = "WITHDRAWAL";
