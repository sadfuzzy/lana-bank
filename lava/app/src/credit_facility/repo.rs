use rust_decimal::Decimal;
use sqlx::PgPool;

use es_entity::*;

use crate::primitives::*;

use super::{entity::*, error::CreditFacilityError, publisher::*};

#[derive(EsRepo, Clone)]
#[es_repo(
    entity = "CreditFacility",
    err = "CreditFacilityError",
    columns(
        customer_id(ty = "CustomerId", list_for),
        approval_process_id(ty = "ApprovalProcessId", update(persist = "false")),
        collateralization_ratio(
            ty = "Option<Decimal>",
            create(persist = false),
            update(accessor = "collateralization_ratio()")
        ),
    ),
    post_persist_hook = "publish"
)]
pub struct CreditFacilityRepo {
    pool: PgPool,
    publisher: CreditFacilityPublisher,
}

impl CreditFacilityRepo {
    pub(super) fn new(pool: &PgPool, publisher: &CreditFacilityPublisher) -> Self {
        Self {
            pool: pool.clone(),
            publisher: publisher.clone(),
        }
    }

    async fn publish(
        &self,
        db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
        entity: &CreditFacility,
        new_events: es_entity::LastPersisted<'_, CreditFacilityEvent>,
    ) -> Result<(), CreditFacilityError> {
        self.publisher.publish(db, entity, new_events).await
    }
}
