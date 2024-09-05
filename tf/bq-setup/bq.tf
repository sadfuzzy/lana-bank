resource "google_bigquery_dataset" "dataset" {
  project                    = local.gcp_project
  dataset_id                 = local.dataset_id
  friendly_name              = "Dataset for lava-bank ${local.name_prefix}"
  description                = "Dataset for lava-bank ${local.name_prefix}"
  location                   = "EU"
  delete_contents_on_destroy = true
}

resource "google_service_account" "bq_access_sa" {
  project      = local.gcp_project
  account_id   = local.sa_account_id
  display_name = "Serviae Account for lava-bank BigQuery access"
}

resource "google_service_account_key" "bq_access_sa_key" {
  service_account_id = google_service_account.bq_access_sa.name
}

resource "google_bigquery_dataset_iam_member" "dataset_owner_sa" {
  project    = local.gcp_project
  dataset_id = google_bigquery_dataset.dataset.dataset_id
  role       = "roles/bigquery.dataOwner"
  member     = "serviceAccount:${google_service_account.bq_access_sa.email}"
}

resource "google_bigquery_dataset_iam_member" "dataform_additional_owners" {
  for_each   = toset(local.additional_owners)
  project    = local.gcp_project
  dataset_id = google_bigquery_dataset.dataset.dataset_id
  role       = "roles/bigquery.dataOwner"
  member     = "user:${each.value}"
}
