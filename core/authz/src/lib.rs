pub mod error;

use sqlx_adapter::{
    casbin::{
        prelude::{DefaultModel, Enforcer},
        CoreApi, MgmtApi,
    },
    SqlxAdapter,
};
use std::{fmt, marker::PhantomData, str::FromStr, sync::Arc};
use tokio::sync::RwLock;
use tracing::instrument;

use lava_audit::{Audit, AuditInfo};

use error::AuthorizationError;

const MODEL: &str = include_str!("./rbac.conf");

#[derive(Clone)]
pub struct Authorization<S, R, O, A>
where
    S: FromStr + fmt::Display + Clone,
    R: FromStr + fmt::Display + Copy,
    O: FromStr + fmt::Display + Copy + fmt::Debug,
    A: FromStr + fmt::Display + Copy,
    <S as FromStr>::Err: fmt::Debug,
    <R as FromStr>::Err: fmt::Debug,
    <O as FromStr>::Err: fmt::Debug,
    <A as FromStr>::Err: fmt::Debug,
{
    enforcer: Arc<RwLock<Enforcer>>,
    audit: Audit<S, O, A>,
    _phantom: PhantomData<R>,
}

impl<S, R, O, A> Authorization<S, R, O, A>
where
    S: FromStr + fmt::Display + fmt::Debug + Clone,
    R: FromStr + fmt::Display + fmt::Debug + Copy,
    O: FromStr + fmt::Display + fmt::Debug + Copy,
    A: FromStr + fmt::Display + fmt::Debug + Copy,
    <S as FromStr>::Err: fmt::Debug,
    <R as FromStr>::Err: fmt::Debug,
    <O as FromStr>::Err: fmt::Debug,
    <A as FromStr>::Err: fmt::Debug,
{
    pub async fn init(
        pool: &sqlx::PgPool,
        audit: &Audit<S, O, A>,
    ) -> Result<Self, AuthorizationError> {
        let model = DefaultModel::from_str(MODEL).await?;
        let adapter = SqlxAdapter::new_with_pool(pool.clone()).await?;

        let enforcer = Enforcer::new(model, adapter).await?;

        let auth = Self {
            enforcer: Arc::new(RwLock::new(enforcer)),
            audit: audit.clone(),
            _phantom: PhantomData,
        };
        Ok(auth)
    }

    pub async fn add_role_hierarchy(
        &self,
        parent_role: R,
        child_role: R,
    ) -> Result<(), AuthorizationError> {
        let mut enforcer = self.enforcer.write().await;

        match enforcer
            .add_grouping_policy(vec![child_role.to_string(), parent_role.to_string()])
            .await
        {
            Ok(_) => Ok(()),
            Err(e) => match AuthorizationError::from(e) {
                AuthorizationError::PermissionAlreadyExistsForRole(_) => Ok(()),
                e => Err(e),
            },
        }
    }

    #[instrument(name = "lava.authz.enforce_permission", skip(self))]
    pub async fn enforce_permission(
        &self,
        sub: &S,
        object: O,
        action: impl Into<A> + std::fmt::Debug + std::marker::Copy,
    ) -> Result<AuditInfo<S>, AuthorizationError> {
        let result = self.inspect_permission(sub, object, action).await;
        match result {
            Ok(()) => Ok(self.audit.record_entry(sub, object, action, true).await?),
            Err(AuthorizationError::NotAuthorized) => {
                self.audit.record_entry(sub, object, action, false).await?;
                Err(AuthorizationError::NotAuthorized)
            }
            Err(e) => Err(e),
        }
    }

    #[instrument(name = "lava.authz.inspect_permission", skip(self))]
    pub async fn inspect_permission(
        &self,
        sub: &S,
        object: O,
        action: impl Into<A> + std::fmt::Debug,
    ) -> Result<(), AuthorizationError> {
        let action = action.into();
        let mut enforcer = self.enforcer.write().await;
        enforcer.load_policy().await?;

        match enforcer.enforce((sub.to_string(), object.to_string(), action.to_string())) {
            Ok(true) => Ok(()),
            Ok(false) => Err(AuthorizationError::NotAuthorized),
            Err(e) => Err(AuthorizationError::Casbin(e)),
        }
    }

    pub async fn evaluate_permission(
        &self,
        sub: &S,
        object: O,
        action: impl Into<A> + std::fmt::Debug + std::marker::Copy,
        enforce: bool,
    ) -> Result<Option<AuditInfo<S>>, AuthorizationError> {
        let action = action.into();
        if enforce {
            Ok(Some(self.enforce_permission(sub, object, action).await?))
        } else {
            self.inspect_permission(sub, object, action)
                .await
                .map(|_| None)
        }
    }

    pub async fn add_permission_to_role(
        &self,
        role: &R,
        object: O,
        action: impl Into<A>,
    ) -> Result<(), AuthorizationError> {
        let mut enforcer = self.enforcer.write().await;

        let action = action.into();
        match enforcer
            .add_policy(vec![
                role.to_string(),
                object.to_string(),
                action.to_string(),
            ])
            .await
        {
            Ok(_) => Ok(()),
            Err(e) => match AuthorizationError::from(e) {
                AuthorizationError::PermissionAlreadyExistsForRole(_) => Ok(()),
                e => Err(e),
            },
        }
    }

    pub async fn assign_role_to_subject(
        &self,
        sub: impl Into<S>,
        role: &R,
    ) -> Result<(), AuthorizationError> {
        let sub: S = sub.into();
        let mut enforcer = self.enforcer.write().await;

        match enforcer
            .add_grouping_policy(vec![sub.to_string(), role.to_string()])
            .await
        {
            Ok(_) => Ok(()),
            Err(e) => match AuthorizationError::from(e) {
                AuthorizationError::PermissionAlreadyExistsForRole(_) => Ok(()),
                e => Err(e),
            },
        }
    }

    pub async fn revoke_role_from_subject(
        &self,
        sub: impl Into<S>,
        role: &R,
    ) -> Result<(), AuthorizationError> {
        let sub: S = sub.into();
        let mut enforcer = self.enforcer.write().await;

        match enforcer
            .remove_grouping_policy(vec![sub.to_string(), role.to_string()])
            .await
        {
            Ok(_) => Ok(()),
            Err(e) => Err(AuthorizationError::from(e)),
        }
    }

    pub async fn roles_for_subject(&self, sub: impl Into<S>) -> Result<Vec<R>, AuthorizationError> {
        let sub: S = sub.into();
        let sub_uuid = sub.to_string();
        let enforcer = self.enforcer.read().await;

        let roles = enforcer
            .get_grouping_policy()
            .into_iter()
            .filter(|r| r[0] == sub_uuid)
            .map(|r| r[1].parse().expect("Could not parse role"))
            .collect();

        Ok(roles)
    }

    pub async fn check_all_permissions(
        &self,
        sub: &S,
        object: O,
        actions: &[A],
    ) -> Result<bool, AuthorizationError> {
        for action in actions {
            match self.enforce_permission(sub, object, *action).await {
                Ok(_) => continue,
                Err(AuthorizationError::NotAuthorized) => return Ok(false),
                Err(e) => return Err(e),
            }
        }
        Ok(true)
    }
}
