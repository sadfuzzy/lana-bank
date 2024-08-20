import {
  for_each = local.setup_bq ? toset([var.bq_creds]) : []
  to       = google_bigquery_dataset.bq_dataset[0]
  id       = local.dataset_id
}

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
