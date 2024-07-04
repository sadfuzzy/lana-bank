mod cursor;
mod entity;
pub mod error;
mod repo;

use crate::{
    ledger::*,
    primitives::{KycLevel, UserId},
};

pub use cursor::*;
pub use entity::*;
use error::UserError;
pub use repo::UserRepo;

#[derive(Clone)]
pub struct Users {
    pool: sqlx::PgPool,
    repo: UserRepo,
    ledger: Ledger,
}

impl Users {
    pub fn new(pool: &sqlx::PgPool, ledger: &Ledger) -> Self {
        let repo = UserRepo::new(pool);
        Self {
            pool: pool.clone(),
            repo,
            ledger: ledger.clone(),
        }
    }

    pub fn repo(&self) -> &UserRepo {
        &self.repo
    }

    pub async fn create_user(&self, id: UserId, email: String) -> Result<User, UserError> {
        let (ledger_account_ids, ledger_account_addresses) =
            self.ledger.create_accounts_for_user(id).await?;
        let new_user = NewUser::builder()
            .id(id)
            .email(email)
            .account_ids(ledger_account_ids)
            .account_addresses(ledger_account_addresses)
            .build()
            .expect("Could not build User");

        self.repo.create(new_user).await
    }

    pub async fn find_by_id(&self, id: UserId) -> Result<Option<User>, UserError> {
        match self.repo.find_by_id(id).await {
            Ok(user) => Ok(Some(user)),
            Err(UserError::CouldNotFindById(_)) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub async fn list(
        &self,
        query: crate::query::PaginatedQueryArgs<UserByNameCursor>,
    ) -> Result<crate::query::PaginatedQueryRet<User, UserByNameCursor>, UserError> {
        self.repo.list(query).await
    }

    pub async fn start_kyc(
        &self,
        user_id: UserId,
        applicant_id: String,
    ) -> Result<User, UserError> {
        let mut user = self.repo.find_by_id(user_id).await?;
        user.start_kyc(applicant_id);

        let mut db_tx = self.pool.begin().await?;
        self.repo.persist_in_tx(&mut db_tx, &mut user).await?;
        db_tx.commit().await?;

        Ok(user)
    }

    pub async fn approve_basic(
        &self,
        user_id: UserId,
        applicant_id: String,
    ) -> Result<User, UserError> {
        let mut user = self.repo.find_by_id(user_id).await?;
        user.approve_kyc(KycLevel::Basic, applicant_id);

        let mut db_tx = self.pool.begin().await?;
        self.repo.persist_in_tx(&mut db_tx, &mut user).await?;
        db_tx.commit().await?;

        Ok(user)
    }

    pub async fn deactivate(
        &self,
        user_id: UserId,
        applicant_id: String,
    ) -> Result<User, UserError> {
        let mut user = self.repo.find_by_id(user_id).await?;
        user.deactivate(applicant_id);

        let mut db_tx = self.pool.begin().await?;
        self.repo.persist_in_tx(&mut db_tx, &mut user).await?;
        db_tx.commit().await?;

        Ok(user)
    }
}
