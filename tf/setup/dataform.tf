resource "google_project_iam_member" "service_account_impersonation" {
  project = local.gcp_project
  role    = "roles/iam.serviceAccountTokenCreator"
  member  = "serviceAccount:service-${data.google_project.project.number}@gcp-sa-dataform.iam.gserviceaccount.com"
}

resource "google_service_account_iam_member" "service_account_impersonation_target" {
  service_account_id = google_service_account.bq_access_sa.name
  role               = "roles/iam.serviceAccountTokenCreator"
  member             = "serviceAccount:service-${data.google_project.project.number}@gcp-sa-dataform.iam.gserviceaccount.com"
}

resource "google_project_iam_member" "dev_jobuser" {
  project = local.gcp_project
  role    = "roles/bigquery.jobUser"
  member  = "serviceAccount:${google_service_account.bq_access_sa.email}"
}
