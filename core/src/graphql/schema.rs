use async_graphql::{types::connection::*, *};

use crate::{app::LavaApp};

pub struct Query;

#[Object]
impl Query {
    async fn hello(&self) -> String {
        "world".to_string()
    }
}

pub struct Mutation;

#[Object]
impl Mutation {
    pub async fn create_lala(&self) -> String {
        "world".to_string()
    }
}

