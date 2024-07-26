mod config;
mod entity;
pub mod error;
mod repo;

use crate::{authorization::Authorization, primitives::Role};

pub use config::*;
pub use entity::*;
use error::UserError;
pub use repo::UserRepo;

#[derive(Clone)]
pub struct Users {
    pool: sqlx::PgPool,
    authz: Authorization,
    repo: UserRepo,
}

impl Users {
    pub async fn init(
        pool: &sqlx::PgPool,
        authz: &Authorization,
        config: UserConfig,
    ) -> Result<Self, UserError> {
        let repo = UserRepo::new(pool);
        let mut users = Self {
            pool: pool.clone(),
            authz: authz.clone(),
            repo,
        };

        if let Some(email) = config.super_user_email {
            users.create_super_user(email).await?;
        }

        Ok(users)
    }

    async fn create_super_user(&mut self, email: String) -> Result<(), UserError> {
        if self.find_by_email(&email).await?.is_none() {
            self.create_user(&email).await?;
            self.authz
                .assign_role_to_subject(email, &Role::SuperUser)
                .await?;
        }
        Ok(())
    }

    pub fn repo(&self) -> &UserRepo {
        &self.repo
    }

    pub async fn create_user(&self, email: impl Into<String>) -> Result<User, UserError> {
        let new_user = NewUser::builder()
            .email(email)
            .build()
            .expect("Could not build user");
        let mut db = self.pool.begin().await?;
        let user = self.repo.create_in_tx(&mut db, new_user).await?;
        db.commit().await?;
        Ok(user)
    }

    pub async fn find_by_email(&self, email: impl Into<String>) -> Result<Option<User>, UserError> {
        match self.repo.find_by_email(email).await {
            Ok(user) => Ok(Some(user)),
            Err(UserError::CouldNotFindByEmail(_)) => Ok(None),
            Err(e) => Err(e),
        }
    }
}
