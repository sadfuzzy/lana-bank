#![cfg_attr(feature = "fail-on-warnings", deny(warnings))]
#![cfg_attr(feature = "fail-on-warnings", deny(clippy::all))]

mod error;
mod events;
mod query;
mod traits;

pub use error::*;
pub use es_entity_macros::EsEntity;
pub use es_entity_macros::EsEvent;
pub use es_entity_macros::EsRepo;
pub use events::*;
pub use query::*;
pub use traits::*;
