mod entity;
mod error;
mod repo;

use crate::{
    entity::*,
    ledger::Ledger,
    primitives::{
        LedgerTxId, TransactionConfirmation, TronTransactionConfirmation,
        TronWithdrawalDestination, UsdCents, UserId, WithdrawId, WithdrawalDestination,
    },
    user::UserRepo,
};

pub use entity::*;
use error::WithdrawError;
pub use repo::WithdrawRepo;

#[derive(Clone)]
pub struct Withdraws {
    _pool: sqlx::PgPool,
    repo: WithdrawRepo,
    users: UserRepo,
    ledger: Ledger,
}

impl Withdraws {
    pub fn new(pool: &sqlx::PgPool, users: &UserRepo, ledger: &Ledger) -> Self {
        let repo = WithdrawRepo::new(pool);
        Self {
            _pool: pool.clone(),
            repo,
            users: users.clone(),
            ledger: ledger.clone(),
        }
    }

    pub fn repo(&self) -> &WithdrawRepo {
        &self.repo
    }

    pub async fn create_withdraw(
        &self,
        user_id: impl Into<UserId> + std::fmt::Debug,
    ) -> Result<Withdraw, WithdrawError> {
        let id = WithdrawId::new();
        let new_withdraw = NewWithdraw::builder()
            .id(id)
            .user_id(user_id)
            .build()
            .expect("Could not build Withdraw");

        let EntityUpdate {
            entity: withdraw, ..
        } = self.repo.create(new_withdraw).await?;
        Ok(withdraw)
    }

    pub async fn initiate_withdrawal_via_usdt_on_tron_for_user(
        &self,
        id: WithdrawId,
        amount: UsdCents,
        tron_address: String,
        reference: String,
    ) -> Result<Withdraw, WithdrawError> {
        let mut withdraw = self.repo.find_by_id(id).await?;
        let user = self.users.find_by_id(withdraw.user_id).await?;
        let tx_id = LedgerTxId::new();
        let destination = WithdrawalDestination::Tron(TronWithdrawalDestination {
            address: tron_address,
        });

        let mut db_tx = self._pool.begin().await?;
        withdraw.initiate_usd_withdrawal(tx_id, amount, destination, reference.clone())?;
        self.repo.persist_in_tx(&mut db_tx, &mut withdraw).await?;

        self.ledger
            .initiate_withdrawal_via_usdt_for_user(user.account_ids, amount, reference)
            .await?;

        db_tx.commit().await?;
        Ok(withdraw)
    }

    pub async fn settle_withdrawal_via_usdt_on_tron_for_user(
        &self,
        id: WithdrawId,
        tron_tx_id: String,
        reference: String,
    ) -> Result<Withdraw, WithdrawError> {
        let mut withdraw = self.repo.find_by_id(id).await?;
        let user = self.users.find_by_id(withdraw.user_id).await?;
        let tx_id = LedgerTxId::new();
        let confirmation =
            TransactionConfirmation::Tron(TronTransactionConfirmation { tx_id: tron_tx_id });

        let mut db_tx = self._pool.begin().await?;
        let amount = withdraw.settle(tx_id, confirmation, reference.clone())?;
        self.repo.persist_in_tx(&mut db_tx, &mut withdraw).await?;

        self.ledger
            .settle_withdrawal_via_usdt_for_user(user.account_ids, amount, reference)
            .await?;

        db_tx.commit().await?;
        Ok(withdraw)
    }
}
