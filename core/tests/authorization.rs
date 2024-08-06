mod helpers;

use lava_core::{
    audit::*,
    authorization::{error::AuthorizationError, *},
    primitives::*,
};

#[tokio::test]
async fn superuser_permissions() -> anyhow::Result<()> {
    let pool = helpers::init_pool().await?;
    let audit = Audit::new(&pool);
    let authz = Authorization::init(&pool, audit).await?;

    let superuser_id = uuid::Uuid::new_v4();
    let superuser_subject = Subject::from(superuser_id);
    authz
        .assign_role_to_subject(&superuser_subject, &Role::Superuser)
        .await?;

    // Superuser can create users
    assert!(authz
        .check_permission(
            &superuser_subject,
            Object::User,
            Action::User(UserAction::Create),
        )
        .await
        .is_ok());

    // Superuser can assign Admin role
    assert!(authz
        .check_permission(
            &superuser_subject,
            Object::User,
            Action::User(UserAction::AssignRole(Role::Admin))
        )
        .await
        .is_ok());

    // Superuser can assign Bank Manager role
    assert!(authz
        .check_permission(
            &superuser_subject,
            Object::User,
            Action::User(UserAction::AssignRole(Role::BankManager))
        )
        .await
        .is_ok());

    // Superuser cannot assign Superuser role
    assert!(matches!(
        authz
            .check_permission(
                &superuser_subject,
                Object::User,
                Action::User(UserAction::AssignRole(Role::Superuser))
            )
            .await,
        Err(AuthorizationError::NotAuthorized)
    ));

    Ok(())
}

#[tokio::test]
async fn admin_permissions() -> anyhow::Result<()> {
    let pool = helpers::init_pool().await?;
    let audit = Audit::new(&pool);
    let authz = Authorization::init(&pool, audit).await?;

    let admin_id = uuid::Uuid::new_v4();
    let admin_subject = Subject::from(admin_id);
    authz
        .assign_role_to_subject(&admin_subject, &Role::Admin)
        .await?;

    // Admin can create users
    assert!(authz
        .check_permission(
            &admin_subject,
            Object::User,
            Action::User(UserAction::Create)
        )
        .await
        .is_ok());

    // Admin can assign Bank Manager role
    assert!(authz
        .check_permission(
            &admin_subject,
            Object::User,
            Action::User(UserAction::AssignRole(Role::BankManager))
        )
        .await
        .is_ok());

    // Admin cannot assign Admin role
    assert!(matches!(
        authz
            .check_permission(
                &admin_subject,
                Object::User,
                Action::User(UserAction::AssignRole(Role::Admin))
            )
            .await,
        Err(AuthorizationError::NotAuthorized)
    ));

    // Admin cannot assign Superuser role
    assert!(matches!(
        authz
            .check_permission(
                &admin_subject,
                Object::User,
                Action::User(UserAction::AssignRole(Role::Superuser))
            )
            .await,
        Err(AuthorizationError::NotAuthorized)
    ));

    Ok(())
}

#[tokio::test]
async fn bank_manager_permissions() -> anyhow::Result<()> {
    let pool = helpers::init_pool().await?;
    let audit = Audit::new(&pool);
    let authz = Authorization::init(&pool, audit).await?;

    let bank_manager_id = uuid::Uuid::new_v4();
    let bank_manager_subject = Subject::from(bank_manager_id);
    authz
        .assign_role_to_subject(&bank_manager_subject, &Role::BankManager)
        .await?;

    // Bank Manager cannot create users
    assert!(matches!(
        authz
            .check_permission(
                &bank_manager_subject,
                Object::User,
                Action::User(UserAction::Create)
            )
            .await,
        Err(AuthorizationError::NotAuthorized)
    ));

    // Bank Manager cannot assign roles
    assert!(matches!(
        authz
            .check_permission(
                &bank_manager_subject,
                Object::User,
                Action::User(UserAction::AssignRole(Role::BankManager))
            )
            .await,
        Err(AuthorizationError::NotAuthorized)
    ));

    assert!(matches!(
        authz
            .check_permission(
                &bank_manager_subject,
                Object::User,
                Action::User(UserAction::AssignRole(Role::Admin))
            )
            .await,
        Err(AuthorizationError::NotAuthorized)
    ));

    assert!(matches!(
        authz
            .check_permission(
                &bank_manager_subject,
                Object::User,
                Action::User(UserAction::AssignRole(Role::Superuser))
            )
            .await,
        Err(AuthorizationError::NotAuthorized)
    ));

    Ok(())
}
