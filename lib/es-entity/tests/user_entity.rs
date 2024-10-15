#[derive(Debug, Clone, Copy, PartialEq, sqlx::Type)]
#[sqlx(transparent)]
pub struct UserId(uuid::Uuid);

impl From<uuid::Uuid> for UserId {
    fn from(uuid: uuid::Uuid) -> Self {
        Self(uuid)
    }
}

#[derive(Debug)]
pub struct NewUser {
    pub id: UserId,
}

pub struct User {
    pub id: UserId,
}
