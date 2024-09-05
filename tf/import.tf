locals {
  bq_tables = local.setup_bq ? [
    "user_events",
    "customer_events",
    "loan_events",
    "withdraw_events",
    "deposit_events"
  ] : []
}

import {
  for_each = local.setup_bq ? toset(local.bq_tables) : []
  to       = module.setup.google_bigquery_table.entities[each.value]
  id       = "projects/${local.project_id}/datasets/${local.dataset_id}/tables/${each.value}"
}

import {
  for_each = local.setup_bq ? toset([""]) : []
  to       = module.setup.google_dataform_repository.repository[0]
  id       = "projects/${local.project_id}/locations/${local.gcp_region}/repositories/${local.name_prefix}-repo"
}

import {
  for_each = local.setup_bq ? toset([""]) : []
  to       = module.setup.google_dataform_repository_release_config.release[0]
  id       = "projects/${local.project_id}/locations/${local.gcp_region}/repositories/${local.name_prefix}-repo/releaseConfigs/${local.name_prefix}-release"
}

import {
  for_each = local.setup_bq ? toset([""]) : []
  to       = module.setup.google_dataform_repository_workflow_config.workflow[0]
  id       = "projects/${local.project_id}/locations/${local.gcp_region}/repositories/${local.name_prefix}-repo/workflowConfigs/${local.name_prefix}-workflow"
}
