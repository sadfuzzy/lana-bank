use sqlx::PgPool;

use super::{cursor::*, entity::*, error::*};
use crate::{entity::*, primitives::*};

#[derive(Clone)]
pub struct UserRepo {
    pool: PgPool,
}

impl UserRepo {
    pub(super) fn new(pool: &PgPool) -> Self {
        Self { pool: pool.clone() }
    }

    pub(super) async fn create(&self, new_user: NewUser) -> Result<EntityUpdate<User>, UserError> {
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

    pub async fn find_by_id(&self, user_id: UserId) -> Result<User, UserError> {
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

    pub async fn persist_in_tx(
        &self,
        db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
        settings: &mut User,
    ) -> Result<(), UserError> {
        settings.events.persist(db).await?;
        Ok(())
    }

    pub async fn list(
        &self,
        query: crate::query::PaginatedQueryArgs<UserByNameCursor>,
    ) -> Result<crate::query::PaginatedQueryRet<User, UserByNameCursor>, UserError> {
        let rows = sqlx::query_as!(
            GenericEvent,
            r#"
            WITH users AS (
              SELECT id, bitfinex_username, created_at
              FROM users
              WHERE ((bitfinex_username, id) > ($2, $1)) OR ($1 IS NULL AND $2 IS NULL)
              ORDER BY bitfinex_username, id
              LIMIT $3
            )
            SELECT a.id, e.sequence, e.event,
                a.created_at AS entity_created_at, e.recorded_at AS event_recorded_at
            FROM users a
            JOIN user_events e ON a.id = e.id
            ORDER BY a.bitfinex_username, a.id, e.sequence"#,
            query.after.as_ref().map(|c| c.id) as Option<UserId>,
            query.after.map(|c| c.name),
            query.first as i64 + 1
        )
        .fetch_all(&self.pool)
        .await?;
        let (entities, has_next_page) = EntityEvents::load_n::<User>(rows, query.first)?;
        let mut end_cursor = None;
        if let Some(last) = entities.last() {
            end_cursor = Some(UserByNameCursor {
                id: last.id,
                name: last.bitfinex_username.clone(),
            });
        }
        Ok(crate::query::PaginatedQueryRet {
            entities,
            has_next_page,
            end_cursor,
        })
    }
}
