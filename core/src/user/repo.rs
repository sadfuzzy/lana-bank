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

    pub async fn find(&self, user_id: UserId) -> Result<User, UserError> {
        let rows = sqlx::query_as!(
            GenericEvent,
            r#"SELECT a.id, e.sequence, e.event,
                a.created_at AS entity_created_at, e.recorded_at AS event_recorded_at
            FROM users a
            JOIN user_events e
            ON a.id = e.id
            WHERE a.id = $1"#,
            user_id as UserId
        )
        .fetch_all(&self.pool)
        .await?;
        match EntityEvents::load_first(rows) {
            Ok(user) => Ok(user),
            Err(EntityError::NoEntityEventsPresent) => Err(UserError::CouldNotFindById(user_id)),
            Err(e) => Err(e.into()),
        }
    }
}
