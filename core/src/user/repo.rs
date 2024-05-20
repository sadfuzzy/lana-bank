use sqlx::PgPool;

use super::{entity::*, error::*};
use crate::{entity::*, primitives::*};

#[derive(Clone)]
pub(super) struct UserRepo {
    pool: PgPool,
}

impl UserRepo {
    pub fn new(pool: &PgPool) -> Self {
        Self { pool: pool.clone() }
    }

    pub async fn create(&self, new_user: NewUser) -> Result<EntityUpdate<User>, UserError> {
        let mut tx = self.pool.begin().await?;
        sqlx::query!(
            r#"INSERT INTO users (id, bitfinex_username)
            VALUES ($1, $2)"#,
            new_user.id as UserId,
            new_user.bitfinex_username,
        )
        .execute(&mut *tx)
        .await?;
        let mut events = new_user.initial_events();
        let n_new_events = events.persist(&mut tx).await?;
        tx.commit().await?;
        let user = User::try_from(events)?;
        Ok(EntityUpdate {
            entity: user,
            n_new_events,
        })
    }
}
