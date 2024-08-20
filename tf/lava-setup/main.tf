variable "bq_creds" {
  type    = string
  default = "dummy"
}

variable "dataset_id" {
  type = string
}

locals {
  setup_bq = var.bq_creds != "dummy"

  bq_tables = local.setup_bq ? [
    "user_events",
    "customer_events",
    "loan_events",
    "withdraw_events",
    "deposit_events"
  ] : []

  service_account_creds = local.setup_bq ? jsondecode(base64decode(var.bq_creds)) : null
  project_id            = local.setup_bq ? local.service_account_creds.project_id : null
  sa_email              = local.setup_bq ? local.service_account_creds.client_email : null
  sa_member             = local.setup_bq ? "serviceAccount:${local.sa_email}" : null
}

terraform {
  required_providers {
    cala = {
      source  = "registry.terraform.io/galoymoney/cala"
      version = "0.0.20"
    }
  }
}
