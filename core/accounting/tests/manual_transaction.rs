mod helpers;

use authz::dummy::DummySubject;
use cala_ledger::{CalaLedger, CalaLedgerConfig, Currency, DebitOrCredit};
use core_accounting::{CoreAccounting, ManualEntryInput, manual_transaction::AccountIdOrCode};
use helpers::{action, object};
use rust_decimal_macros::dec;

#[tokio::test]
#[rustfmt::skip]
async fn manual_transaction() -> anyhow::Result<()> {
    use rand::Rng;
    let pool = helpers::init_pool().await?;
    let cala_config = CalaLedgerConfig::builder().pool(pool.clone()).exec_migrations(false).build()?;
    let cala = CalaLedger::init(cala_config).await?;
    let authz = authz::dummy::DummyPerms::<action::DummyAction, object::DummyObject>::new();
    let journal_id = helpers::init_journal(&cala).await?;

    let accounting = CoreAccounting::new(&pool, &authz, &cala, journal_id);
    let chart_ref = format!("ref-{:08}", rand::thread_rng().gen_range(0..10000));
    let chart = accounting.chart_of_accounts().create_chart(&DummySubject, "Test chart".to_string(), chart_ref.clone()).await?;
    let import = r#"
        1,,Assets
        2,,Liabilities
        "#;
    let chart_id = chart.id;
    let _ = accounting.chart_of_accounts().import_from_csv(&DummySubject, chart_id, import).await?;

    let to: AccountIdOrCode = "1".parse().unwrap();
    let from: AccountIdOrCode = "2".parse().unwrap();

    let entries = vec![
        ManualEntryInput::builder().account_id_or_code(to.clone()).amount(dec!(100)).currency(Currency::USD).direction(DebitOrCredit::Debit).description("test 1 debit").build().unwrap(),
        ManualEntryInput::builder().account_id_or_code(from.clone()).amount(dec!(100)).currency(Currency::USD).direction(DebitOrCredit::Credit).description("test 1 credit").build().unwrap(),
    ];
    accounting.execute_manual_transaction(&DummySubject, &chart_ref, None, "Test transaction 1".to_string(), entries).await?;

    let account = accounting.find_ledger_account_by_code(&DummySubject, &chart_ref, "2".to_string()).await?.unwrap();
    assert_eq!(account.usd_balance_range.expect("should have balance").end.expect("balance missing").settled(), dec!(100));

    Ok(())
}
