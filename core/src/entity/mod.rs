mod error;
mod event;
mod id;

pub use error::*;
pub use event::*;
pub use id::*;

pub(crate) struct EntityUpdate<T> {
    pub entity: T,
    pub n_new_events: usize,
}
