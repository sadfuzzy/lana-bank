mod entity;
pub mod error;
mod processes;
mod repo;

use tracing::instrument;

use std::collections::HashMap;

use authz::PermissionCheck;

use crate::{
    audit::AuditInfo,
    authorization::{Authorization, Object, WithdrawalAction},
    customer::Customers,
    data_export::Export,
    governance::Governance,
    job::Jobs,
    ledger::Ledger,
    outbox::Outbox,
    primitives::{CustomerId, Subject, UsdCents, WithdrawalId},
};

pub use entity::*;
use error::WithdrawalError;
pub use processes::approval::*;
pub use repo::{cursor::*, WithdrawalRepo};

#[derive(Clone)]
pub struct Withdrawals {
    repo: WithdrawalRepo,
    customers: Customers,
    ledger: Ledger,
    authz: Authorization,
    governance: Governance,
    approval_withdraw: ApproveWithdrawal,
    _jobs: Jobs,
}

impl Withdrawals {
    #[allow(clippy::too_many_arguments)]
    pub async fn init(
        pool: &sqlx::PgPool,
        customers: &Customers,
        ledger: &Ledger,
        authz: &Authorization,
        export: &Export,
        governance: &Governance,
        jobs: &Jobs,
        outbox: &Outbox,
    ) -> Result<Self, WithdrawalError> {
        let repo = WithdrawalRepo::new(pool, export);
        let approval_withdraw = ApproveWithdrawal::new(&repo, authz.audit(), governance);
        jobs.add_initializer_and_spawn_unique(
            WithdrawApprovalJobInitializer::new(outbox, &approval_withdraw),
            WithdrawApprovalJobConfig,
        )
        .await?;

        match governance.init_policy(APPROVE_WITHDRAWAL_PROCESS).await {
            Err(governance::error::GovernanceError::PolicyError(
                governance::policy_error::PolicyError::DuplicateApprovalProcessType,
            )) => (),
            Err(e) => return Err(e.into()),
            _ => (),
        }

        Ok(Self {
            repo,
            customers: customers.clone(),
            ledger: ledger.clone(),
            authz: authz.clone(),
            governance: governance.clone(),
            approval_withdraw,
            _jobs: jobs.clone(),
        })
    }

    pub fn repo(&self) -> &WithdrawalRepo {
        &self.repo
    }

    pub async fn subject_can_initiate(
        &self,
        sub: &Subject,
        enforce: bool,
    ) -> Result<Option<AuditInfo>, WithdrawalError> {
        Ok(self
            .authz
            .evaluate_permission(sub, Object::Withdrawal, WithdrawalAction::Initiate, enforce)
            .await?)
    }

    pub async fn initiate(
        &self,
        sub: &Subject,
        customer_id: impl Into<CustomerId> + std::fmt::Debug,
        amount: UsdCents,
        reference: Option<String>,
    ) -> Result<Withdrawal, WithdrawalError> {
        let audit_info = self
            .subject_can_initiate(sub, true)
            .await?
            .expect("audit info missing");
        let customer_id = customer_id.into();
        let customer = self.customers.repo().find_by_id(customer_id).await?;
        let id = WithdrawalId::new();
        let new_withdrawal = NewWithdrawal::builder()
            .id(id)
            .approval_process_id(id)
            .customer_id(customer_id)
            .amount(amount)
            .reference(reference)
            .debit_account_id(customer.account_ids.on_balance_sheet_deposit_account_id)
            .audit_info(audit_info)
            .build()
            .expect("Could not build Withdraw");

        let mut db_tx = self.repo.begin().await?;
        self.governance
            .start_process(&mut db_tx, id, id.to_string(), APPROVE_WITHDRAWAL_PROCESS)
            .await?;
        let withdrawal = self.repo.create_in_tx(&mut db_tx, new_withdrawal).await?;

        let customer_balances = self
            .ledger
            .get_customer_balance(customer.account_ids)
            .await?;
        if customer_balances.usd_balance.settled < amount {
            return Err(WithdrawalError::InsufficientBalance(
                amount,
                customer_balances.usd_balance.settled,
            ));
        }

        self.ledger
            .initiate_withdrawal_for_customer(
                withdrawal.id,
                customer.account_ids,
                withdrawal.amount,
                format!("lava:withdraw:{}:initiate", withdrawal.id),
            )
            .await?;

        db_tx.commit().await?;

        Ok(withdrawal)
    }

    pub async fn subject_can_confirm(
        &self,
        sub: &Subject,
        enforce: bool,
    ) -> Result<Option<AuditInfo>, WithdrawalError> {
        Ok(self
            .authz
            .evaluate_permission(sub, Object::Withdrawal, WithdrawalAction::Confirm, enforce)
            .await?)
    }

    pub async fn confirm(
        &self,
        sub: &Subject,
        withdrawal_id: impl Into<WithdrawalId> + std::fmt::Debug,
    ) -> Result<Withdrawal, WithdrawalError> {
        let audit_info = self
            .subject_can_confirm(sub, true)
            .await?
            .expect("audit info missing");
        let id = withdrawal_id.into();
        let mut withdrawal = self.repo.find_by_id(id).await?;
        let tx_id = withdrawal.confirm(audit_info)?;

        let mut db_tx = self.repo.begin().await?;
        self.repo.update_in_tx(&mut db_tx, &mut withdrawal).await?;

        self.ledger
            .confirm_withdrawal_for_customer(
                tx_id,
                withdrawal.id,
                withdrawal.debit_account_id,
                withdrawal.amount,
                format!("lava:withdraw:{}:confirm", withdrawal.id),
            )
            .await?;

        db_tx.commit().await?;

        Ok(withdrawal)
    }

    pub async fn subject_can_cancel(
        &self,
        sub: &Subject,
        enforce: bool,
    ) -> Result<Option<AuditInfo>, WithdrawalError> {
        Ok(self
            .authz
            .evaluate_permission(sub, Object::Withdrawal, WithdrawalAction::Cancel, enforce)
            .await?)
    }

    #[instrument(name = "withdraw.cancel", skip(self), err)]
    #[es_entity::retry_on_concurrent_modification]
    pub async fn cancel(
        &self,
        sub: &Subject,
        withdrawal_id: impl es_entity::RetryableInto<WithdrawalId>,
    ) -> Result<Withdrawal, WithdrawalError> {
        let audit_info = self
            .subject_can_cancel(sub, true)
            .await?
            .expect("audit info missing");

        let id = withdrawal_id.into();
        let mut withdrawal = self.repo.find_by_id(id).await?;
        let tx_id = withdrawal.cancel(audit_info)?;

        let mut db_tx = self.repo.begin().await?;
        self.repo.update_in_tx(&mut db_tx, &mut withdrawal).await?;

        self.ledger
            .cancel_withdrawal_for_customer(
                tx_id,
                withdrawal.id,
                withdrawal.debit_account_id,
                withdrawal.amount,
                format!("lava:withdraw:{}:cancel", withdrawal.id),
            )
            .await?;

        db_tx.commit().await?;

        Ok(withdrawal)
    }

    pub async fn find_by_id(
        &self,
        sub: &Subject,
        id: impl Into<WithdrawalId> + std::fmt::Debug,
    ) -> Result<Option<Withdrawal>, WithdrawalError> {
        self.authz
            .enforce_permission(sub, Object::Withdrawal, WithdrawalAction::Read)
            .await?;

        match self.repo.find_by_id(id.into()).await {
            Ok(withdrawal) => Ok(Some(withdrawal)),
            Err(e) if e.was_not_found() => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub async fn ensure_up_to_date_status(
        &self,
        withdraw: &Withdrawal,
    ) -> Result<Option<Withdrawal>, WithdrawalError> {
        self.approval_withdraw.execute_from_svc(withdraw).await
    }

    pub async fn list_for_customer(
        &self,
        sub: &Subject,
        customer_id: CustomerId,
    ) -> Result<Vec<Withdrawal>, WithdrawalError> {
        self.authz
            .enforce_permission(sub, Object::Withdrawal, WithdrawalAction::List)
            .await?;

        Ok(self
            .repo
            .list_for_customer_id_by_created_at(
                customer_id,
                Default::default(),
                es_entity::ListDirection::Descending,
            )
            .await?
            .entities)
    }

    pub async fn list(
        &self,
        sub: &Subject,
        query: es_entity::PaginatedQueryArgs<WithdrawalByCreatedAtCursor>,
    ) -> Result<
        es_entity::PaginatedQueryRet<Withdrawal, WithdrawalByCreatedAtCursor>,
        WithdrawalError,
    > {
        self.authz
            .enforce_permission(sub, Object::Withdrawal, WithdrawalAction::List)
            .await?;
        self.repo
            .list_by_created_at(query, es_entity::ListDirection::Descending)
            .await
    }

    pub async fn find_all<T: From<Withdrawal>>(
        &self,
        ids: &[WithdrawalId],
    ) -> Result<HashMap<WithdrawalId, T>, WithdrawalError> {
        self.repo.find_all(ids).await
    }
}
