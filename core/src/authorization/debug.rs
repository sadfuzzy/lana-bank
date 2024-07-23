use super::{Authorization, AuthorizationError, LoanAction, TermAction};

use crate::{
    authorization::{Action, Object},
    primitives::{Role, Subject},
};

pub async fn seed_permissions(pool: &sqlx::PgPool) -> Result<(), AuthorizationError> {
    let mut auth = Authorization::init(pool).await?;

    let role = Role::SuperUser;

    let _ = auth
        .add_permission_to_role(&role, Object::Loan, Action::Loan(LoanAction::Read))
        .await;

    let _ = auth
        .add_permission_to_role(&role, Object::Loan, Action::Loan(LoanAction::List))
        .await;

    let _ = auth
        .add_permission_to_role(&role, Object::Loan, Action::Loan(LoanAction::Create))
        .await;

    let _ = auth
        .add_permission_to_role(&role, Object::Loan, Action::Loan(LoanAction::Approve))
        .await;

    let _ = auth
        .add_permission_to_role(&role, Object::Loan, Action::Loan(LoanAction::RecordPayment))
        .await;

    let _ = auth
        .add_permission_to_role(&role, Object::Term, Action::Term(TermAction::Update))
        .await;

    let _ = auth
        .add_permission_to_role(&role, Object::Term, Action::Term(TermAction::Read))
        .await;

    let admin = Subject::from("admin");

    let _ = auth.assign_role_to_subject(&admin, &role).await;

    Ok(())
}
