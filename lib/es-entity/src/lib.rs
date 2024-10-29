#![cfg_attr(feature = "fail-on-warnings", deny(warnings))]
#![cfg_attr(feature = "fail-on-warnings", deny(clippy::all))]

mod error;
mod events;
mod query;
mod traits;

pub mod prelude {
    pub use chrono;
    pub use serde_json;
    pub use sqlx;
}

pub use error::*;
pub use es_entity_macros::expand_es_query;
pub use es_entity_macros::EsEntity;
pub use es_entity_macros::EsEvent;
pub use es_entity_macros::EsRepo;
pub use events::*;
pub use query::*;
pub use traits::*;

#[macro_export]
macro_rules! es_query (
    ($db:expr, $query:expr) => ({
        $crate::expand_es_query!(executor = $db, sql = $query)
    });
    ($db:expr, $query:expr, $($args:tt)*) => ({
        $crate::expand_es_query!(executor = $db, sql = $query, args = [$($args)*])
    })
);

#[cfg(feature = "graphql")]
pub mod graphql {
    pub use async_graphql;
    pub use base64;

    #[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
    #[serde(transparent)]
    pub struct UUID(uuid::Uuid);
    async_graphql::scalar!(UUID);
    impl<T: Into<uuid::Uuid>> From<T> for UUID {
        fn from(id: T) -> Self {
            let uuid = id.into();
            Self(uuid)
        }
    }
    impl From<&UUID> for uuid::Uuid {
        fn from(id: &UUID) -> Self {
            id.0
        }
    }
}

#[macro_export]
macro_rules! entity_id {
    ($name:ident) => {
        #[derive(
            sqlx::Type,
            Debug,
            Clone,
            Copy,
            PartialEq,
            Eq,
            PartialOrd,
            Ord,
            Hash,
            serde::Deserialize,
            serde::Serialize,
        )]
        #[serde(transparent)]
        #[sqlx(transparent)]
        pub struct $name(uuid::Uuid);

        impl $name {
            #[allow(clippy::new_without_default)]
            pub fn new() -> Self {
                uuid::Uuid::new_v4().into()
            }
        }

        impl From<uuid::Uuid> for $name {
            fn from(uuid: uuid::Uuid) -> Self {
                Self(uuid)
            }
        }

        impl From<$name> for uuid::Uuid {
            fn from(id: $name) -> Self {
                id.0
            }
        }

        impl From<&$name> for uuid::Uuid {
            fn from(id: &$name) -> Self {
                id.0
            }
        }

        #[cfg(feature = "graphql")]
        impl From<$crate::graphql::UUID> for $name {
            fn from(id: $crate::graphql::UUID) -> Self {
                $name(uuid::Uuid::from(&id))
            }
        }

        #[cfg(feature = "graphql")]
        impl From<&$crate::graphql::UUID> for $name {
            fn from(id: &$crate::graphql::UUID) -> Self {
                $name(uuid::Uuid::from(id))
            }
        }

        impl std::fmt::Display for $name {
            fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                write!(f, "{}", self.0)
            }
        }

        impl std::str::FromStr for $name {
            type Err = uuid::Error;

            fn from_str(s: &str) -> Result<Self, Self::Err> {
                Ok(Self(uuid::Uuid::parse_str(s)?))
            }
        }
    };
}
