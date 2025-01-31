#![cfg_attr(feature = "fail-on-warnings", deny(warnings))]
#![cfg_attr(feature = "fail-on-warnings", deny(clippy::all))]

pub mod config;
pub mod error;
mod job;
mod time;

mod kratos_admin;
use kratos_admin::KratosAdmin;

use config::*;
use error::*;
use job::*;

use lana_events::LanaEvent;

pub type Outbox = outbox::Outbox<LanaEvent>;

#[derive(Clone)]
pub struct UserOnboarding {
    _outbox: Outbox,
}

impl UserOnboarding {
    pub async fn init(
        jobs: &::job::Jobs,
        outbox: &Outbox,
        config: UserOnboardingConfig,
    ) -> Result<Self, UserOnboardingError> {
        let kratos_admin = KratosAdmin::init(config.kratos_admin);

        jobs.add_initializer_and_spawn_unique(
            UserOnboardingJobInitializer::new(outbox, kratos_admin),
            UserOnboardingJobConfig,
        )
        .await?;
        Ok(Self {
            _outbox: outbox.clone(),
        })
    }
}
