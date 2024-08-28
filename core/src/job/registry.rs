use std::collections::HashMap;

use super::{entity::*, error::JobError, traits::*};

pub struct JobRegistry {
    initializers: HashMap<JobType, Box<dyn JobInitializer>>,
}

impl JobRegistry {
    pub(super) fn new() -> Self {
        Self {
            initializers: HashMap::new(),
        }
    }

    pub fn add_initializer<I: JobInitializer>(&mut self, initializer: I) {
        self.initializers
            .insert(<I as JobInitializer>::job_type(), Box::new(initializer));
    }

    pub(super) fn initializer_exists(&self, job_type: &JobType) -> bool {
        self.initializers.contains_key(job_type)
    }

    pub(super) fn init_job(&self, job: &Job) -> Result<Box<dyn JobRunner>, JobError> {
        self.initializers
            .get(&job.job_type)
            .ok_or(JobError::NoInitializerPresent)?
            .init(job)
            .map_err(|e| JobError::JobInitError(e.to_string()))
    }
}
