pub mod error;
mod templates;
mod velocity;

use cala_ledger::{
    account::{error::AccountError, *},
    tx_template::Params,
    velocity::{NewVelocityControl, VelocityControlId},
    CalaLedger, Currency, DebitOrCredit, JournalId, TransactionId,
};

use crate::{primitives::UsdCents, DepositAccountBalance};

use error::*;

pub const DEPOSITS_VELOCITY_CONTROL_ID: uuid::Uuid =
    uuid::uuid!("00000000-0000-0000-0000-000000000001");

#[derive(Clone)]
pub struct DepositLedger {
    cala: CalaLedger,
    journal_id: JournalId,
    deposit_omnibus_account_id: AccountId,
    usd: Currency,
    deposit_control_id: VelocityControlId,
}

impl DepositLedger {
    pub async fn init(
        cala: &CalaLedger,
        journal_id: JournalId,
        omnibus_account_code: String,
    ) -> Result<Self, DepositLedgerError> {
        let deposit_omnibus_account_id =
            Self::create_deposit_omnibus_account(cala, omnibus_account_code.clone()).await?;

        templates::RecordDeposit::init(cala).await?;
        templates::InitiateWithdraw::init(cala).await?;
        templates::CancelWithdraw::init(cala).await?;
        templates::ConfirmWithdraw::init(cala).await?;

        let overdraft_prevention_id = velocity::OverdraftPrevention::init(cala).await?;

        let deposit_control_id = Self::create_deposit_control(cala).await?;

        match cala
            .velocities()
            .add_limit_to_control(deposit_control_id, overdraft_prevention_id)
            .await
        {
            Ok(_)
            | Err(cala_ledger::velocity::error::VelocityError::LimitAlreadyAddedToControl) => {}
            Err(e) => return Err(e.into()),
        }

        Ok(Self {
            cala: cala.clone(),
            journal_id,
            deposit_omnibus_account_id,
            deposit_control_id,
            usd: "USD".parse().expect("Could not parse 'USD'"),
        })
    }

    pub async fn record_deposit(
        &self,
        op: es_entity::DbOp<'_>,
        tx_id: impl Into<TransactionId>,
        amount: UsdCents,
        credit_account_id: impl Into<AccountId>,
    ) -> Result<(), DepositLedgerError> {
        let tx_id = tx_id.into();
        let mut op = self.cala.ledger_operation_from_db_op(op);

        let params = templates::RecordDepositParams {
            journal_id: self.journal_id,
            currency: self.usd,
            amount: amount.to_usd(),
            deposit_omnibus_account_id: self.deposit_omnibus_account_id,
            credit_account_id: credit_account_id.into(),
        };
        self.cala
            .post_transaction_in_op(&mut op, tx_id, templates::RECORD_DEPOSIT_CODE, params)
            .await?;

        op.commit().await?;
        Ok(())
    }

    pub async fn initiate_withdrawal(
        &self,
        op: es_entity::DbOp<'_>,
        tx_id: impl Into<TransactionId>,
        amount: UsdCents,
        credit_account_id: impl Into<AccountId>,
    ) -> Result<(), DepositLedgerError> {
        let tx_id = tx_id.into();
        let mut op = self.cala.ledger_operation_from_db_op(op);

        let params = templates::InitiateWithdrawParams {
            journal_id: self.journal_id,
            deposit_omnibus_account_id: self.deposit_omnibus_account_id,
            credit_account_id: credit_account_id.into(),
            amount: amount.to_usd(),
            currency: self.usd,
        };

        self.cala
            .post_transaction_in_op(&mut op, tx_id, templates::INITIATE_WITHDRAW_CODE, params)
            .await?;

        op.commit().await?;
        Ok(())
    }

    pub async fn confirm_withdrawal(
        &self,
        op: es_entity::DbOp<'_>,
        tx_id: impl Into<TransactionId>,
        correlation_id: String,
        amount: UsdCents,
        credit_account_id: impl Into<AccountId>,
        external_id: String,
    ) -> Result<(), DepositLedgerError> {
        let tx_id = tx_id.into();
        let mut op = self.cala.ledger_operation_from_db_op(op);

        let params = templates::ConfirmWithdrawParams {
            journal_id: self.journal_id,
            currency: self.usd,
            amount: amount.to_usd(),
            deposit_omnibus_account_id: self.deposit_omnibus_account_id,
            credit_account_id: credit_account_id.into(),
            correlation_id,
            external_id,
        };

        self.cala
            .post_transaction_in_op(&mut op, tx_id, templates::CONFIRM_WITHDRAW_CODE, params)
            .await?;
        op.commit().await?;
        Ok(())
    }

    pub async fn cancel_withdrawal(
        &self,
        op: es_entity::DbOp<'_>,
        tx_id: impl Into<TransactionId>,
        amount: UsdCents,
        credit_account_id: impl Into<AccountId>,
    ) -> Result<(), DepositLedgerError> {
        let tx_id = tx_id.into();
        let mut op = self.cala.ledger_operation_from_db_op(op);

        let params = templates::CancelWithdrawParams {
            journal_id: self.journal_id,
            currency: self.usd,
            amount: amount.to_usd(),
            credit_account_id: credit_account_id.into(),
            deposit_omnibus_account_id: self.deposit_omnibus_account_id,
        };

        self.cala
            .post_transaction_in_op(&mut op, tx_id, templates::CANCEL_WITHDRAW_CODE, params)
            .await?;
        op.commit().await?;
        Ok(())
    }

    async fn create_deposit_omnibus_account(
        cala: &CalaLedger,
        code: String,
    ) -> Result<AccountId, DepositLedgerError> {
        let new_account = NewAccount::builder()
            .code(&code)
            .id(AccountId::new())
            .name("Deposit Omnibus Account")
            .description("Omnibus Account for Deposit module")
            .normal_balance_type(DebitOrCredit::Debit)
            .build()
            .expect("Couldn't create onchain incoming account");
        match cala.accounts().create(new_account).await {
            Err(AccountError::CodeAlreadyExists) => {
                let account = cala.accounts().find_by_code(code).await?;
                Ok(account.id)
            }
            Err(e) => Err(e.into()),
            Ok(account) => Ok(account.id),
        }
    }

    pub async fn balance(
        &self,
        account_id: impl Into<AccountId>,
    ) -> Result<DepositAccountBalance, DepositLedgerError> {
        match self
            .cala
            .balances()
            .find(self.journal_id, account_id.into(), self.usd)
            .await
        {
            Ok(balances) => Ok(DepositAccountBalance {
                settled: UsdCents::try_from_usd(balances.settled())?,
                pending: UsdCents::try_from_usd(balances.pending())?,
            }),
            Err(cala_ledger::balance::error::BalanceError::NotFound(..)) => {
                Ok(DepositAccountBalance::ZERO)
            }
            Err(e) => Err(e.into()),
        }
    }

    pub async fn create_deposit_control(
        cala: &CalaLedger,
    ) -> Result<VelocityControlId, DepositLedgerError> {
        let control = NewVelocityControl::builder()
            .id(DEPOSITS_VELOCITY_CONTROL_ID)
            .name("Deposit Control")
            .description("Velocity Control for Deposits")
            .build()
            .expect("build control");

        match cala.velocities().create_control(control).await {
            Err(cala_ledger::velocity::error::VelocityError::ControlIdAlreadyExists) => {
                Ok(DEPOSITS_VELOCITY_CONTROL_ID.into())
            }
            Err(e) => Err(e.into()),
            Ok(control) => Ok(control.id()),
        }
    }

    pub async fn add_deposit_control_to_account(
        &self,
        op: &mut cala_ledger::LedgerOperation<'_>,
        account_id: impl Into<AccountId>,
    ) -> Result<(), DepositLedgerError> {
        self.cala
            .velocities()
            .attach_control_to_account_in_op(
                op,
                self.deposit_control_id,
                account_id.into(),
                Params::default(),
            )
            .await?;

        Ok(())
    }
}
