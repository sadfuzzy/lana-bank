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
        let new_user = NewUser::builder()
            .id(UserId::new())
            .bitfinex_username(bitfinex_username)
            .build()
            .expect("Could not build User");

        let EntityUpdate { entity: user, .. } = self.repo.create(new_user).await?;
        Ok(user)
    }
}
