use lava_core::{ledger::*, primitives::LedgerAccountId};

pub const BANK_USDT_CASH_ID: &str = "00000000-0000-0000-0000-000000000004";

#[tokio::test]
async fn init() -> anyhow::Result<()> {
    let ledger = lava_core::ledger::Ledger::init(LedgerConfig::default()).await?;
    let account_id = ledger
        .cala
        .find_account_by_external_id::<LedgerAccountId>(BANK_USDT_CASH_ID.to_string())
        .await?;
    assert!(account_id.is_some());
    Ok(())
}
