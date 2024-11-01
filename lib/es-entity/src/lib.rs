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
    pub use uuid;
}

pub use error::*;
pub use es_entity_macros::expand_es_query;
pub use es_entity_macros::retry_on_concurrent_modification;
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

    #[derive(Debug, serde::Serialize, serde::Deserialize, Clone, Copy)]
    #[serde(transparent)]
    pub struct UUID(crate::prelude::uuid::Uuid);
    async_graphql::scalar!(UUID);
    impl<T: Into<crate::prelude::uuid::Uuid>> From<T> for UUID {
        fn from(id: T) -> Self {
            let uuid = id.into();
            Self(uuid)
        }
    }
    impl From<&UUID> for crate::prelude::uuid::Uuid {
        fn from(id: &UUID) -> Self {
            id.0
        }
    }
}

// macro_rules! assert_idempotent {
//     ($pattern:pat $(if $guard:expr)? $(,)?
// }

#[macro_export]
macro_rules! from_es_entity_error {
    ($name:ident) => {
        impl $name {
            pub fn was_not_found(&self) -> bool {
                matches!(self, $name::EsEntityError($crate::EsEntityError::NotFound))
            }
            pub fn was_concurrent_modification(&self) -> bool {
                matches!(
                    self,
                    $name::EsEntityError($crate::EsEntityError::ConcurrentModification)
                )
            }
        }
        impl From<$crate::EsEntityError> for $name {
            fn from(e: $crate::EsEntityError) -> Self {
                $name::EsEntityError(e)
            }
        }
    };
}

#[macro_export]
macro_rules! entity_id {
    // Match identifiers without conversions
    ($($name:ident),+ $(,)?) => {
        $crate::entity_id! { $($name),+ ; }
    };
    ($($name:ident),+ $(,)? ; $($from:ty => $to:ty),* $(,)?) => {
        $(
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
            pub struct $name($crate::prelude::uuid::Uuid);

            impl $name {
                #[allow(clippy::new_without_default)]
                pub fn new() -> Self {
                    $crate::prelude::uuid::Uuid::new_v4().into()
                }
            }

            impl From<$crate::prelude::uuid::Uuid> for $name {
                fn from(uuid: $crate::prelude::uuid::Uuid) -> Self {
                    Self(uuid)
                }
            }

            impl From<$name> for $crate::prelude::uuid::Uuid {
                fn from(id: $name) -> Self {
                    id.0
                }
            }

            impl From<&$name> for $crate::prelude::uuid::Uuid {
                fn from(id: &$name) -> Self {
                    id.0
                }
            }

            #[cfg(feature = "graphql")]
            impl From<$crate::graphql::UUID> for $name {
                fn from(id: $crate::graphql::UUID) -> Self {
                    $name($crate::prelude::uuid::Uuid::from(&id))
                }
            }

            #[cfg(feature = "graphql")]
            impl From<&$crate::graphql::UUID> for $name {
                fn from(id: &$crate::graphql::UUID) -> Self {
                    $name($crate::prelude::uuid::Uuid::from(id))
                }
            }

            impl std::fmt::Display for $name {
                fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                    write!(f, "{}", self.0)
                }
            }

            impl std::str::FromStr for $name {
                type Err = $crate::prelude::uuid::Error;

                fn from_str(s: &str) -> Result<Self, Self::Err> {
                    Ok(Self($crate::prelude::uuid::Uuid::parse_str(s)?))
                }
            }
        )+
        // Implement additional conversions
        $(
            impl From<$from> for $to {
                fn from(id: $from) -> Self {
                    <$to>::from($crate::prelude::uuid::Uuid::from(id))
                }
            }
            impl From<$to> for $from {
                fn from(id: $to) -> Self {
                    <$from>::from($crate::prelude::uuid::Uuid::from(id))
                }
            }
        )*
    };
}
