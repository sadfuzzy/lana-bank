use async_trait::async_trait;
use core_user::CoreUserEvent;
use futures::StreamExt;

use job::*;
use lana_events::LanaEvent;

use super::{kratos_admin::KratosAdmin, Outbox};

#[derive(serde::Serialize)]
pub struct UserOnboardingJobConfig;
impl JobConfig for UserOnboardingJobConfig {
    type Initializer = UserOnboardingJobInitializer;
}

pub struct UserOnboardingJobInitializer {
    outbox: Outbox,
    kratos_admin: KratosAdmin,
}

impl UserOnboardingJobInitializer {
    pub fn new(outbox: &Outbox, kratos_admin: KratosAdmin) -> Self {
        Self {
            outbox: outbox.clone(),
            kratos_admin,
        }
    }
}

const USER_ONBOARDING_JOB: JobType = JobType::new("user-onboarding");
impl JobInitializer for UserOnboardingJobInitializer {
    fn job_type() -> JobType
    where
        Self: Sized,
    {
        USER_ONBOARDING_JOB
    }

    fn init(&self, _: &Job) -> Result<Box<dyn JobRunner>, Box<dyn std::error::Error>> {
        Ok(Box::new(UserOnboardingJobRunner {
            outbox: self.outbox.clone(),
            kratos_admin: self.kratos_admin.clone(),
        }))
    }

    fn retry_on_error_settings() -> RetrySettings
    where
        Self: Sized,
    {
        RetrySettings::repeat_indefinitely()
    }
}

#[derive(Default, Clone, serde::Deserialize, serde::Serialize)]
struct UserOnboardingJobData {
    sequence: outbox::EventSequence,
}

pub struct UserOnboardingJobRunner {
    outbox: Outbox,
    kratos_admin: KratosAdmin,
}
#[async_trait]
impl JobRunner for UserOnboardingJobRunner {
    async fn run(
        &self,
        current_job: CurrentJob,
    ) -> Result<JobCompletion, Box<dyn std::error::Error>> {
        let state = current_job
            .execution_state::<UserOnboardingJobData>()?
            .unwrap_or_default();
        let mut stream = self.outbox.listen_persisted(Some(state.sequence)).await?;

        while let Some(message) = stream.next().await {
            if let Some(LanaEvent::User(CoreUserEvent::UserCreated { id, email })) =
                &message.payload
            {
                self.kratos_admin.create_user(*id, email.clone()).await?;
            }
        }

        let now = crate::time::now();
        Ok(JobCompletion::RescheduleAt(now))
    }
}
