resource "google_project_iam_custom_role" "list_objects" {
  project     = local.project
  role_id     = local.objects_list_role_name
  title       = "List bucket Objects"
  description = "Role to _only_ list objects (not get them)"
  permissions = [
    "storage.objects.list",
  ]
}

resource "google_storage_bucket" "tf_state" {
  name                        = local.tf_state_bucket_name
  project                     = local.project
  location                    = "us-east1"
  uniform_bucket_level_access = true
  versioning {
    enabled = true
  }
}

data "google_iam_policy" "tf_state_access" {
  binding {
    role    = "roles/storage.admin"
    members = ["user:${local.justin}"]
  }
}

resource "google_storage_bucket_iam_policy" "policy" {
  bucket      = google_storage_bucket.tf_state.name
  policy_data = data.google_iam_policy.tf_state_access.policy_data
}
