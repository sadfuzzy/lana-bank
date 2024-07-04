use derive_builder::Builder;
use serde::{Deserialize, Serialize};

use crate::{
    entity::*,
    ledger::user::{UserLedgerAccountAddresses, UserLedgerAccountIds},
    primitives::*,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum UserEvent {
    Initialized {
        id: UserId,
        email: String,
        account_ids: UserLedgerAccountIds,
        account_addresses: UserLedgerAccountAddresses,
    },
    KycStarted {
        applicant_id: String,
    },
    KycApproved {
        applicant_id: String,
        level: KycLevel,
    },
    KycDeclined {
        applicant_id: String,
    },
}

impl EntityEvent for UserEvent {
    type EntityId = UserId;
    fn event_table_name() -> &'static str {
        "user_events"
    }
}

#[derive(Builder)]
#[builder(pattern = "owned", build_fn(error = "EntityError"))]
pub struct User {
    pub id: UserId,
    pub email: String,
    pub account_ids: UserLedgerAccountIds,
    pub account_addresses: UserLedgerAccountAddresses,
    pub status: AccountStatus,
    pub level: KycLevel,
    #[builder(setter(strip_option, into), default)]
    pub applicant_id: Option<String>,
    pub(super) events: EntityEvents<UserEvent>,
}

impl core::fmt::Display for User {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "User: {}, email: {}", self.id, self.email)
    }
}

impl Entity for User {
    type Event = UserEvent;
}

impl User {
    pub fn start_kyc(&mut self, applicant_id: String) {
        self.events.push(UserEvent::KycStarted {
            applicant_id: applicant_id.clone(),
        });
        self.applicant_id = Some(applicant_id);
    }

    pub fn approve_kyc(&mut self, level: KycLevel, applicant_id: String) {
        self.events.push(UserEvent::KycApproved {
            level,
            applicant_id: applicant_id.clone(),
        });

        self.applicant_id = Some(applicant_id);
        self.level = KycLevel::Basic;
        self.status = AccountStatus::Active;
    }

    pub fn deactivate(&mut self, applicant_id: String) {
        self.events.push(UserEvent::KycDeclined { applicant_id });
        self.level = KycLevel::NotKyced;
        self.status = AccountStatus::Inactive;
    }
}

impl TryFrom<EntityEvents<UserEvent>> for User {
    type Error = EntityError;

    fn try_from(events: EntityEvents<UserEvent>) -> Result<Self, Self::Error> {
        let mut builder = UserBuilder::default();
        for event in events.iter() {
            match event {
                UserEvent::Initialized {
                    id,
                    email,
                    account_ids,
                    account_addresses,
                } => {
                    builder = builder
                        .id(*id)
                        .account_ids(*account_ids)
                        .account_addresses(account_addresses.clone())
                        .email(email.clone())
                        .account_ids(*account_ids)
                        .level(KycLevel::NotKyced)
                        .status(AccountStatus::Inactive);
                }
                UserEvent::KycStarted { applicant_id } => {
                    builder = builder.applicant_id(applicant_id.clone());
                }
                UserEvent::KycApproved {
                    level,
                    applicant_id,
                } => {
                    builder = builder
                        .applicant_id(applicant_id.clone())
                        .level(*level)
                        .status(AccountStatus::Active)
                }
                UserEvent::KycDeclined { applicant_id } => {
                    builder = builder
                        .applicant_id(applicant_id.clone())
                        .status(AccountStatus::Inactive)
                }
            }
        }
        builder.events(events).build()
    }
}

#[derive(Debug, Builder)]
pub struct NewUser {
    #[builder(setter(into))]
    pub(super) id: UserId,
    #[builder(setter(into))]
    pub(super) email: String,
    pub(super) account_ids: UserLedgerAccountIds,
    pub(super) account_addresses: UserLedgerAccountAddresses,
}

impl NewUser {
    pub fn builder() -> NewUserBuilder {
        NewUserBuilder::default()
    }

    pub(super) fn initial_events(self) -> EntityEvents<UserEvent> {
        EntityEvents::init(
            self.id,
            [UserEvent::Initialized {
                id: self.id,
                email: self.email,
                account_ids: self.account_ids,
                account_addresses: self.account_addresses,
            }],
        )
    }
}
