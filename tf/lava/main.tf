variable "name_prefix" {
  type    = string
  default = "dev_"
}

variable "dataform_git_commitish" {
  type    = string
  default = ""
}

variable "gcp_region" {
  type    = string
  default = "europe-west6"
}

variable "bq_creds" {
  type    = string
  default = "dummy"
}

locals {
  name_prefix                   = var.name_prefix
  gcp_region                    = var.gcp_region
  setup_bq                      = var.bq_creds != "dummy"
  git_token_secret_name         = "${local.name_prefix}-git-token"
  dataform_keyring_name         = "${var.name_prefix}-dataform-keyring"
  dataform_key_name             = "${var.name_prefix}-dataform-key"
  dataform_release_config_name  = "${var.name_prefix}-release"
  dataform_workflow_config_name = "${var.name_prefix}-workflow"
  dataset_id                    = "${replace(local.name_prefix, "-", "_")}_dataset"
  dataform_git_branch           = "${var.name_prefix}-dataform"
  dataform_git_commitish        = var.dataform_git_commitish != "" ? var.dataform_git_commitish : "${var.name_prefix}-dataform"


  dataform_repo_name = "${local.name_prefix}-repo"
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
