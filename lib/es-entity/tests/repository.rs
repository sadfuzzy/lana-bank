mod user_entity;

use es_entity::*;

use user_entity::*;

#[derive(EsEntityRepository)]
#[es_repo(entity = "User", indexes(id))]
pub struct Users {}

pub async fn init_pool() -> anyhow::Result<sqlx::PgPool> {
    let pg_host = std::env::var("PG_HOST").unwrap_or("localhost".to_string());
    let pg_con = format!("postgres://user:password@{pg_host}:5433/pg");
    let pool = sqlx::PgPool::connect(&pg_con).await?;
    Ok(pool)
}

#[tokio::test]
async fn test() -> anyhow::Result<()> {
    let pool = init_pool().await?;
    let id = UserId::from(uuid::Uuid::new_v4());
    let repo = Users {};
    let mut db = pool.begin().await?;
    let entity = repo.create_in_tx(&mut db, NewUser { id }).await?;
    assert!(entity.id == id);

    Ok(())
}

// NewEntity
// EntityEvent
// EntityId
// Entity
// Repo
//
// Load
