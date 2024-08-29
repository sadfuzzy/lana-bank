variable "name_prefix" {}
variable "gcp_project" {}
variable "gcp_region" {}

variable "additional_owners" {
  type    = list(string)
  default = []
}

locals {
  name_prefix = var.name_prefix
  gcp_project = var.gcp_project
  gcp_region  = var.gcp_region

  additional_owners = var.additional_owners

  dataset_id    = "${replace(local.name_prefix, "-", "_")}_dataset"
  sa_account_id = replace("${var.name_prefix}-lava-bq-access", "_", "-")
}

output "service_account_key_base64" {
  value   = google_service_account_key.bq_access_sa_key.private_key
}

output "dataset_id" {
  value = google_bigquery_dataset.dataset.dataset_id
}
