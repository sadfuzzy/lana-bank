use sqlx::{PgPool, Postgres, Transaction};

use crate::{entity::*, primitives::UserId};

use super::{error::UserError, NewUser, User};

#[derive(Clone)]
pub struct UserRepo {
    pool: PgPool,
}

impl UserRepo {
    pub(super) fn new(pool: &PgPool) -> Self {
        Self { pool: pool.clone() }
    }

    pub async fn create_in_tx(
        &self,
        db: &mut Transaction<'_, Postgres>,
        new_user: NewUser,
    ) -> Result<User, UserError> {
        sqlx::query!(
            r#"INSERT INTO users (id, email)
            VALUES ($1, $2)
            "#,
            new_user.id as UserId,
            new_user.email
        )
        .execute(&mut **db)
        .await?;
        let mut events = new_user.initial_events();
        events.persist(db).await?;
        Ok(User::try_from(events)?)
    }

    pub async fn find_by_email(&self, email: impl Into<String>) -> Result<User, UserError> {
        let email = email.into();
        let rows = sqlx::query_as!(
            GenericEvent,
            r#"SELECT a.id, e.sequence, e.event,
                a.created_at AS entity_created_at, e.recorded_at AS event_recorded_at
            FROM users a
            JOIN user_events e
            ON a.id = e.id
            WHERE a.email = $1"#,
            email
        )
        .fetch_all(&self.pool)
        .await?;
        match EntityEvents::load_first(rows) {
            Ok(customer) => Ok(customer),
            Err(EntityError::NoEntityEventsPresent) => Err(UserError::CouldNotFindByEmail(email)),
            Err(e) => Err(e.into()),
        }
    }
}
