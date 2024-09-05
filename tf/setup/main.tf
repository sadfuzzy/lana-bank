variable "name_prefix" {}
variable "gcp_project" {}
variable "gcp_region" {}

variable "git_token" {
  sensitive = true
}

variable "additional_owners" {
  type    = list(string)
  default = []
}

locals {
  name_prefix = var.name_prefix
  gcp_project = var.gcp_project
  gcp_region  = var.gcp_region

  additional_owners = var.additional_owners

  dataset_id            = "${replace(local.name_prefix, "-", "_")}_dataset"
  sa_account_id         = replace("${var.name_prefix}-lava-bq-access", "_", "-")
  git_token             = var.git_token
  git_token_secret_id   = "${var.name_prefix}-git-token"
  dataform_keyring_name = "${var.name_prefix}-dataform-keyring"
  dataform_key_name     = "${var.name_prefix}-dataform-key"
}

output "service_account_key_base64" {
  value = google_service_account_key.bq_access_sa_key.private_key
}

output "service_account_email" {
  value = google_service_account.bq_access_sa.email
}

output "dataset_id" {
  value = google_bigquery_dataset.dataset.dataset_id
}
