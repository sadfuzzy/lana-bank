use crate::accounting_init::*;

use constants::TRIAL_BALANCE_STATEMENT_NAME;

pub(crate) async fn init(
    trial_balances: &TrialBalances,
) -> Result<StatementsInit, AccountingInitError> {
    create_trial_balances(trial_balances).await?;

    Ok(StatementsInit)
}

async fn create_trial_balances(trial_balances: &TrialBalances) -> Result<(), AccountingInitError> {
    trial_balances
        .create_trial_balance_statement(TRIAL_BALANCE_STATEMENT_NAME.to_string())
        .await?;

    Ok(())
}
