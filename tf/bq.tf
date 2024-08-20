resource "google_bigquery_dataset" "bq_dataset" {
  count                      = local.setup_bq ? 1 : 0
  project                    = local.project_id
  dataset_id                 = local.dataset_id
  friendly_name              = "Dataset for lava ${var.name_prefix}"
  description                = "Dataset for lava ${var.name_prefix}"
  location                   = "US"
  delete_contents_on_destroy = true
}

resource "google_bigquery_dataset_iam_member" "bq_dataset_owner_sa" {
  count      = local.setup_bq ? 1 : 0
  project    = local.project_id
  dataset_id = google_bigquery_dataset.bq_dataset[0].dataset_id
  role       = "roles/bigquery.dataOwner"
  member     = local.sa_member
}
