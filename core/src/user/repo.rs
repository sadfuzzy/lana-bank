use std::collections::HashMap;

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

    pub async fn find_by_id(&self, id: UserId) -> Result<User, UserError> {
        let rows = sqlx::query_as!(
            GenericEvent,
            r#"SELECT a.id, e.sequence, e.event,
                a.created_at AS entity_created_at, e.recorded_at AS event_recorded_at
            FROM users a
            JOIN user_events e
            ON a.id = e.id
            WHERE a.id = $1"#,
            id as UserId
        )
        .fetch_all(&self.pool)
        .await?;
        match EntityEvents::load_first(rows) {
            Ok(user) => Ok(user),
            Err(EntityError::NoEntityEventsPresent) => Err(UserError::CouldNotFindById(id)),
            Err(e) => Err(e.into()),
        }
    }

    pub async fn list(&self) -> Result<Vec<User>, UserError> {
        let rows = sqlx::query_as!(
            GenericEvent,
            r#"SELECT a.id, e.sequence, e.event,
                a.created_at AS entity_created_at, e.recorded_at AS event_recorded_at
            FROM users a
            JOIN user_events e
            ON a.id = e.id
            ORDER BY a.email, a.id, e.sequence"#,
        )
        .fetch_all(&self.pool)
        .await?;
        let n = rows.len();
        let res = EntityEvents::load_n::<User>(rows, n)?;
        Ok(res.0)
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
            Ok(user) => Ok(user),
            Err(EntityError::NoEntityEventsPresent) => Err(UserError::CouldNotFindByEmail(email)),
            Err(e) => Err(e.into()),
        }
    }

    pub async fn persist(&self, user: &mut User) -> Result<(), UserError> {
        let mut db = self.pool.begin().await?;
        user.events.persist(&mut db).await?;
        db.commit().await?;
        Ok(())
    }

    pub async fn find_all<T: From<User>>(
        &self,
        ids: &[UserId],
    ) -> Result<HashMap<UserId, T>, UserError> {
        let rows = sqlx::query_as!(
            GenericEvent,
            r#"SELECT a.id, e.sequence, e.event,
                a.created_at AS entity_created_at, e.recorded_at AS event_recorded_at
            FROM users a
            JOIN user_events e
            ON a.id = e.id
            WHERE a.id = ANY($1)"#,
            ids as &[UserId]
        )
        .fetch_all(&self.pool)
        .await?;
        let n = rows.len();
        let res = EntityEvents::load_n::<User>(rows, n)?;

        Ok(res.0.into_iter().map(|u| (u.id, T::from(u))).collect())
    }
}
