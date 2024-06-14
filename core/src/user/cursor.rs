use serde::{Deserialize, Serialize};

use super::{User, UserId};

#[derive(Debug, Serialize, Deserialize)]
pub struct UserByNameCursor {
    pub name: String,
    pub id: UserId,
}

impl From<&User> for UserByNameCursor {
    fn from(values: &User) -> Self {
        Self {
            name: values.email.clone(),
            id: values.id,
        }
    }
}
