use sqlx::PgPool;

use super::{entity::*, error::*};
use crate::{
    entity::*,
    primitives::{UserId, WithdrawId},
};

#[derive(Clone)]
pub struct WithdrawRepo {
    pool: PgPool,
}

impl WithdrawRepo {
    pub(super) fn new(pool: &PgPool) -> Self {
        Self { pool: pool.clone() }
    }

    pub(super) async fn create(
        &self,
        new_withdraw: NewWithdraw,
    ) -> Result<EntityUpdate<Withdraw>, WithdrawError> {
        let mut tx = self.pool.begin().await?;
        sqlx::query!(
            r#"INSERT INTO withdraws (id, user_id)
            VALUES ($1, $2)"#,
            new_withdraw.id as WithdrawId,
            new_withdraw.user_id as UserId,
        )
        .execute(&mut *tx)
        .await?;
        let mut events = new_withdraw.initial_events();
        let n_new_events = events.persist(&mut tx).await?;
        tx.commit().await?;
        let withdraw = Withdraw::try_from(events)?;
        Ok(EntityUpdate {
            entity: withdraw,
            n_new_events,
        })
    }
}
