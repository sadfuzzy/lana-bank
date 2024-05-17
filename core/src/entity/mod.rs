mod error;
mod event;
mod id;

pub use error::*;
pub use event::*;

#[allow(dead_code)]
pub(crate) struct EntityUpdate<T> {
    pub entity: T,
    pub n_new_events: usize,
}
