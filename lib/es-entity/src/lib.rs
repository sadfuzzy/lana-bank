#![cfg_attr(feature = "fail-on-warnings", deny(warnings))]
#![cfg_attr(feature = "fail-on-warnings", deny(clippy::all))]

mod error;
mod events;
mod query;
mod traits;

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
    // in Rust 1.45 we can now invoke proc macros in expression position
    ($db:expr, $query:expr) => ({
        $crate::expand_es_query!(executor = $db, sql = $query)
    });
    // RFC: this semantically should be `$($args:expr),*` (with `$(,)?` to allow trailing comma)
    // but that doesn't work in 1.45 because `expr` fragments get wrapped in a way that changes
    // their hygiene, which is fixed in 1.46 so this is technically just a temp. workaround.
    // My question is: do we care?
    // I was hoping using the `expr` fragment might aid code completion but it doesn't in my
    // experience, at least not with IntelliJ-Rust at the time of writing (version 0.3.126.3220-201)
    // so really the only benefit is making the macros _slightly_ self-documenting, but it's
    // not like it makes them magically understandable at-a-glance.
    ($db:expr, $query:expr, $($args:tt)*) => ({
        $crate::expand_es_query!(executor = $db, sql = $query, args = [$($args)*])
    })
);
