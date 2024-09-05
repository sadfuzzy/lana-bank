resource "google_dataform_repository" "repository" {
  count    = local.setup_bq ? 1 : 0
  provider = google-beta

  project = local.project_id
  region  = local.gcp_region

  name         = local.dataform_repo_name
  display_name = "Dataform Repository for ${local.dataform_repo_name}"

  git_remote_settings {
    url                                 = "https://github.com/GaloyMoney/lava-bank.git"
    default_branch                      = local.dataform_git_branch
    authentication_token_secret_version = local.git_token_secret_name
  }
}

resource "google_dataform_repository_iam_member" "member" {
  provider = google-beta
  count    = local.setup_bq ? 1 : 0

  project = google_dataform_repository.repository[0].project
  region = google_dataform_repository.repository[0].region
  repository = google_dataform_repository.repository[0].name
  role = "roles/owner"
  member = local.sa_member
}

resource "google_dataform_repository_release_config" "release" {
  provider = google-beta
  count    = local.setup_bq ? 1 : 0

  project    = google_dataform_repository.repository[0].project
  region     = google_dataform_repository.repository[0].region
  repository = google_dataform_repository.repository[0].name

  name          = local.dataform_release_config_name
  git_commitish = local.dataform_git_commitish

  code_compilation_config {
    default_database = local.project_id
    default_schema   = "dataform"
    default_location = local.gcp_region
    assertion_schema = "dataform_assertions"
    schema_suffix    = local.name_prefix
    vars = {
      executionEnv = "volcano-dev"
    }
  }
}
resource "google_dataform_repository_workflow_config" "workflow" {
  provider = google-beta
  count    = local.setup_bq ? 1 : 0

  name = local.dataform_workflow_config_name

  project    = google_dataform_repository.repository[0].project
  region     = google_dataform_repository.repository[0].region
  repository = google_dataform_repository.repository[0].name

  release_config = google_dataform_repository_release_config.release[0].id

  invocation_config {
    transitive_dependencies_included         = true
    transitive_dependents_included           = true
    fully_refresh_incremental_tables_enabled = false
    service_account                          = local.sa_email
  }
}
