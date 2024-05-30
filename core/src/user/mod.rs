mod entity;
pub mod error;
mod repo;

use crate::{
    entity::*,
    ledger::*,
    primitives::{
        LedgerTxId, Satoshis, TransactionConfirmation, TronTransactionConfirmation,
        TronWithdrawalDestination, UsdCents, UserId, WithdrawalDestination,
    },
};

pub use entity::*;
use error::UserError;
pub use repo::UserRepo;

#[derive(Clone)]
pub struct Users {
    _pool: sqlx::PgPool,
    repo: UserRepo,
    ledger: Ledger,
}

impl Users {
    pub fn new(pool: &sqlx::PgPool, ledger: &Ledger) -> Self {
        let repo = UserRepo::new(pool);
        Self {
            _pool: pool.clone(),
            repo,
            ledger: ledger.clone(),
        }
    }

    pub fn repo(&self) -> &UserRepo {
        &self.repo
    }

    pub async fn create_user(&self, bitfinex_username: String) -> Result<User, UserError> {
        let id = UserId::new();
        let ledger_account_ids = self
            .ledger
            .create_accounts_for_user(&bitfinex_username)
            .await?;
        let new_user = NewUser::builder()
            .id(id)
            .bitfinex_username(bitfinex_username)
            .account_ids(ledger_account_ids)
            .build()
            .expect("Could not build User");

        let EntityUpdate { entity: user, .. } = self.repo.create(new_user).await?;
        Ok(user)
    }

    pub async fn topup_unallocated_collateral_for_user(
        &self,
        user_id: UserId,
        amount: Satoshis,
        reference: String,
    ) -> Result<User, UserError> {
        let user = self.repo.find_by_id(user_id).await?;
        self.ledger
            .topup_collateral_for_user(
                user.account_ids.unallocated_collateral_id,
                amount,
                reference,
            )
            .await?;
        Ok(user)
    }

    pub async fn initiate_withdrawal_via_usdt_on_tron_for_user(
        &self,
        user_id: UserId,
        amount: UsdCents,
        tron_address: String,
        reference: String,
    ) -> Result<User, UserError> {
        let mut user = self.repo.find_by_id(user_id).await?;
        let tx_id = LedgerTxId::new();
        let destination = WithdrawalDestination::Tron(TronWithdrawalDestination {
            address: tron_address,
        });

        let mut db_tx = self._pool.begin().await?;
        user.initiate_withdrawal(tx_id, amount, destination, reference.clone())?;
        self.repo.persist_in_tx(&mut db_tx, &mut user).await?;

        self.ledger
            .initiate_withdrawal_via_usdt_for_user(user.account_ids, amount, reference)
            .await?;

        db_tx.commit().await?;
        Ok(user)
    }

    pub async fn settle_withdrawal_via_usdt_on_tron_for_user(
        &self,
        user_id: UserId,
        tron_tx_id: String,
        reference: String,
    ) -> Result<User, UserError> {
        let mut user = self.repo.find_by_id(user_id).await?;
        let tx_id = LedgerTxId::new();
        let confirmation =
            TransactionConfirmation::Tron(TronTransactionConfirmation { tx_id: tron_tx_id });

        let mut db_tx = self._pool.begin().await?;
        let amount = user.settle_withdrawal(tx_id, confirmation, reference.clone())?;
        self.repo.persist_in_tx(&mut db_tx, &mut user).await?;

        self.ledger
            .settle_withdrawal_via_usdt_for_user(user.account_ids, amount, reference)
            .await?;

        db_tx.commit().await?;
        Ok(user)
    }

    pub async fn find_by_id(&self, id: UserId) -> Result<Option<User>, UserError> {
        match self.repo.find_by_id(id).await {
            Ok(user) => Ok(Some(user)),
            Err(UserError::EntityError(EntityError::NoEntityEventsPresent)) => Ok(None),
            Err(e) => Err(e),
        }
    }
}
