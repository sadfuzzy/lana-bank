mod entity;
mod error;
mod repo;

use crate::{
    entity::*,
    primitives::{LedgerAccountId, UserId, WithdrawId},
};

pub use entity::*;
use error::WithdrawError;
pub use repo::WithdrawRepo;

#[derive(Clone)]
pub struct Withdraws {
    _pool: sqlx::PgPool,
    repo: WithdrawRepo,
}

impl Withdraws {
    pub fn new(pool: &sqlx::PgPool) -> Self {
        let repo = WithdrawRepo::new(pool);
        Self {
            _pool: pool.clone(),
            repo,
        }
    }

    pub fn repo(&self) -> &WithdrawRepo {
        &self.repo
    }

    pub async fn create_withdraw(
        &self,
        user_id: impl Into<UserId> + std::fmt::Debug,
        account_id: impl Into<LedgerAccountId> + std::fmt::Debug,
    ) -> Result<Withdraw, WithdrawError> {
        let id = WithdrawId::new();
        let new_withdraw = NewWithdraw::builder()
            .id(id)
            .user_id(user_id)
            .account_id(account_id)
            .build()
            .expect("Could not build Withdraw");

        let EntityUpdate { entity: user, .. } = self.repo.create(new_withdraw).await?;
        Ok(user)
    }
}
