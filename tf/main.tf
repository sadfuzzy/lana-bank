variable "bq_creds" {
  type    = string
  default = "dummy"
}

variable "name_prefix" {
  type    = string
  default = "lava_ci"
}

locals {
  setup_bq = var.bq_creds != "dummy"

  service_account_creds = local.setup_bq ? jsondecode(base64decode(var.bq_creds)) : null
  project_id            = local.setup_bq ? local.service_account_creds.project_id : null
  sa_email              = local.setup_bq ? local.service_account_creds.client_email : null
  sa_member             = local.setup_bq ? "serviceAccount:${local.sa_email}" : null
  dataset_id            = local.setup_bq ? "${var.name_prefix}_dataset" : null
}


provider "google" {
  project = local.project_id
}

provider "cala" {
  endpoint = "http://localhost:2252/graphql"
}

module "setup" {
  source = "./lava-setup"

  bq_creds   = var.bq_creds
  dataset_id = local.dataset_id
}

terraform {
  required_providers {
    cala = {
      source  = "registry.terraform.io/galoymoney/cala"
      version = "0.0.20"
    }
  }
}
