use audit::AuditSvc;
use authz::PermissionCheck;

use crate::{
    account::*, deposit::*, deposit_account_balance::*,
    deposit_account_cursor::DepositAccountsByCreatedAtCursor, error::*, ledger::*, primitives::*,
    withdrawal::*,
};

pub struct DepositsForSubject<'a, Perms>
where
    Perms: PermissionCheck,
{
    account_holder_id: DepositAccountHolderId,
    sub: &'a <<Perms as PermissionCheck>::Audit as AuditSvc>::Subject,
    accounts: &'a DepositAccountRepo,
    deposits: &'a DepositRepo,
    withdrawals: &'a WithdrawalRepo,
    ledger: &'a DepositLedger,
    authz: &'a Perms,
}

impl<'a, Perms> DepositsForSubject<'a, Perms>
where
    Perms: PermissionCheck,
    <<Perms as PermissionCheck>::Audit as AuditSvc>::Action:
        From<CoreDepositAction> + From<GovernanceAction>,
    <<Perms as PermissionCheck>::Audit as AuditSvc>::Object:
        From<CoreDepositObject> + From<GovernanceObject>,
{
    pub(super) fn new(
        subject: &'a <<Perms as PermissionCheck>::Audit as AuditSvc>::Subject,
        account_holder_id: DepositAccountHolderId,
        accounts: &'a DepositAccountRepo,
        deposits: &'a DepositRepo,
        withdrawals: &'a WithdrawalRepo,
        ledger: &'a DepositLedger,
        authz: &'a Perms,
    ) -> Self {
        Self {
            sub: subject,
            account_holder_id,
            accounts,
            deposits,
            withdrawals,
            ledger,
            authz,
        }
    }

    pub async fn list_accounts_by_created_at(
        &self,
        query: es_entity::PaginatedQueryArgs<DepositAccountsByCreatedAtCursor>,
        direction: impl Into<es_entity::ListDirection> + std::fmt::Debug,
    ) -> Result<
        es_entity::PaginatedQueryRet<DepositAccount, DepositAccountsByCreatedAtCursor>,
        CoreDepositError,
    > {
        self.authz
            .audit()
            .record_entry(
                self.sub,
                CoreDepositObject::all_deposit_accounts(),
                CoreDepositAction::DEPOSIT_ACCOUNT_LIST,
                true,
            )
            .await?;

        Ok(self
            .accounts
            .list_for_account_holder_id_by_created_at(
                self.account_holder_id,
                query,
                direction.into(),
            )
            .await?)
    }

    pub async fn account_balance(
        &self,
        account_id: impl Into<DepositAccountId> + std::fmt::Debug,
    ) -> Result<DepositAccountBalance, CoreDepositError> {
        let account_id = account_id.into();

        self.ensure_account_access(
            account_id,
            CoreDepositObject::deposit_account(account_id),
            CoreDepositAction::DEPOSIT_ACCOUNT_READ_BALANCE,
        )
        .await?;

        let balance = self.ledger.balance(account_id).await?;
        Ok(balance)
    }

    pub async fn list_deposits_for_account(
        &self,
        account_id: impl Into<DepositAccountId> + std::fmt::Debug,
    ) -> Result<Vec<Deposit>, CoreDepositError> {
        let account_id = account_id.into();

        self.ensure_account_access(
            account_id,
            CoreDepositObject::all_deposits(),
            CoreDepositAction::DEPOSIT_LIST,
        )
        .await?;

        Ok(self
            .deposits
            .list_for_deposit_account_id_by_created_at(
                account_id,
                Default::default(),
                es_entity::ListDirection::Descending,
            )
            .await?
            .entities)
    }

    pub async fn list_withdrawals_for_account(
        &self,
        account_id: impl Into<DepositAccountId> + std::fmt::Debug,
    ) -> Result<Vec<Withdrawal>, CoreDepositError> {
        let account_id = account_id.into();

        self.ensure_account_access(
            account_id,
            CoreDepositObject::all_withdrawals(),
            CoreDepositAction::WITHDRAWAL_LIST,
        )
        .await?;

        Ok(self
            .withdrawals
            .list_for_deposit_account_id_by_created_at(
                account_id,
                Default::default(),
                es_entity::ListDirection::Descending,
            )
            .await?
            .entities)
    }

    async fn ensure_account_access(
        &self,
        account_id: DepositAccountId,
        object: CoreDepositObject,
        action: CoreDepositAction,
    ) -> Result<(), CoreDepositError> {
        let account = self.accounts.find_by_id(account_id).await?;

        if account.account_holder_id != self.account_holder_id {
            self.authz
                .audit()
                .record_entry(self.sub, object, action, false)
                .await?;
            return Err(CoreDepositError::DepositAccountNotFound);
        }
        self.authz
            .audit()
            .record_entry(self.sub, object, action, true)
            .await?;

        Ok(())
    }
}
