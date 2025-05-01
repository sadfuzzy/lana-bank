mod entity;
pub mod error;
mod repo;

use authz::PermissionCheck;
use outbox::OutboxEventMarker;

use crate::{
    event::CoreCreditEvent,
    primitives::{CollateralId, CollateralUpdate},
    CreditFacilityPublisher,
};

pub use entity::Collateral;
pub(super) use entity::*;
use error::CollateralError;
use repo::CollateralRepo;

pub struct Collaterals<Perms, E>
where
    Perms: PermissionCheck,
    E: OutboxEventMarker<CoreCreditEvent>,
{
    authz: Perms,
    repo: CollateralRepo<E>,
}

impl<Perms, E> Collaterals<Perms, E>
where
    Perms: PermissionCheck,
    E: OutboxEventMarker<CoreCreditEvent>,
{
    pub fn new(pool: &sqlx::PgPool, authz: &Perms, publisher: &CreditFacilityPublisher<E>) -> Self {
        Self {
            authz: authz.clone(),
            repo: CollateralRepo::new(pool, publisher),
        }
    }

    pub async fn find_by_id(&self, id: CollateralId) -> Result<Collateral, CollateralError> {
        self.repo.find_by_id(id).await
    }

    pub async fn create_in_op(
        &self,
        db: &mut es_entity::DbOp<'_>,
        collateral: NewCollateral,
    ) -> Result<Collateral, CollateralError> {
        self.repo.create_in_op(db, collateral).await
    }

    pub async fn update_in_op(
        &self,
        db: &mut es_entity::DbOp<'_>,
        collateral: &mut Collateral,
    ) -> Result<(), CollateralError> {
        self.repo.update_in_op(db, collateral).await?;
        Ok(())
    }
}

impl<Perms, E> Clone for Collaterals<Perms, E>
where
    Perms: PermissionCheck,
    E: OutboxEventMarker<CoreCreditEvent>,
{
    fn clone(&self) -> Self {
        Self {
            authz: self.authz.clone(),
            repo: self.repo.clone(),
        }
    }
}
