mod entity;
pub mod error;
mod repo;

use crate::{entity::*, ledger::*, primitives::UserId};

pub use entity::*;
use error::UserError;
use repo::UserRepo;

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

    pub async fn create_user(&self, bitfinex_username: String) -> Result<User, UserError> {
        let id = UserId::new();
        let ledger_account_id = self
            .ledger
            .create_account_for_user(&bitfinex_username)
            .await?;
        let new_user = NewUser::builder()
            .id(id)
            .bitfinex_username(bitfinex_username)
            .ledger_account_id(ledger_account_id)
            .build()
            .expect("Could not build User");

        let EntityUpdate { entity: user, .. } = self.repo.create(new_user).await?;
        Ok(user)
    }
}
