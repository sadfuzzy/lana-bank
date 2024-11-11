mod user_entity;

use es_entity::*;

use user_entity::*;

#[derive(EsRepo)]
#[es_repo(
    entity = "User",
    columns(email = "String"),
    post_persist_hook = "export"
)]
pub struct Users {
    pool: sqlx::PgPool,
}

impl Users {
    async fn custom_query(&self) -> Result<(), EsRepoError> {
        let id = UserId::from(uuid::Uuid::new_v4());
        let _: User = es_query!(
            self.pool(),
            "SELECT * FROM users WHERE id = $1",
            id as UserId
        )
        .fetch_one()
        .await?;
        Ok(())
    }

    async fn export(
        &self,
        _op: &mut es_entity::DbOp<'_>,
        _entity: &User,
        _new_events: impl Iterator<Item = &es_entity::PersistedEvent<UserEvent>>,
    ) -> Result<(), EsRepoError> {
        Ok(())
    }
}

pub async fn init_pool() -> anyhow::Result<sqlx::PgPool> {
    let pg_host = std::env::var("PG_HOST").unwrap_or("localhost".to_string());
    let pg_con = format!("postgres://user:password@{pg_host}:5433/pg");
    let pool = sqlx::PgPool::connect(&pg_con).await?;
    Ok(pool)
}

#[tokio::test]
async fn create() -> anyhow::Result<()> {
    let pool = init_pool().await?;
    let repo = Users { pool: pool.clone() };

    let mut db = repo.begin_op().await?;
    let id = UserId::from(uuid::Uuid::new_v4());
    let entity = repo
        .create_in_op(
            &mut db,
            NewUser {
                id,
                email: "email@test.com".to_string(),
            },
        )
        .await?;
    assert!(entity.id == id);

    Ok(())
}

#[tokio::test]
async fn find_by() -> anyhow::Result<()> {
    let pool = init_pool().await?;

    let repo = Users { pool: pool.clone() };

    let res = repo.find_by_email("email@test.com".to_string()).await;

    assert!(matches!(
        res,
        Err(EsRepoError::EsEntityError(EsEntityError::NotFound))
    ));

    Ok(())
}

#[tokio::test]
async fn find_all() -> anyhow::Result<()> {
    let pool = init_pool().await?;

    let repo = Users { pool: pool.clone() };

    let res = repo
        .find_all::<User>(&[UserId::from(uuid::Uuid::new_v4())])
        .await?;

    assert!(res.is_empty());

    Ok(())
}

#[tokio::test]
async fn list_by_created_at() -> anyhow::Result<()> {
    let pool = init_pool().await?;

    let repo = Users { pool: pool.clone() };

    let res = repo
        .list_by_created_at(Default::default(), es_entity::ListDirection::Descending)
        .await;

    assert!(res.is_ok());

    Ok(())
}

#[tokio::test]
async fn custom() -> anyhow::Result<()> {
    let pool = init_pool().await?;

    let repo = Users { pool: pool.clone() };

    let res = repo.custom_query().await;
    assert!(matches!(
        res,
        Err(EsRepoError::EsEntityError(EsEntityError::NotFound))
    ));

    Ok(())
}
