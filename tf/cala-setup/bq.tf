resource "cala_big_query_integration" "bq" {
  count                        = local.setup_bq ? 1 : 0
  id                           = "00000000-0000-0000-0000-000000000001"
  name                         = "bq-integration"
  project_id                   = local.project_id
  dataset_id                   = local.dataset_id
  service_account_creds_base64 = var.bq_creds
}


resource "google_bigquery_table" "entities" {
  for_each   = toset(local.bq_tables)
  project    = local.project_id
  dataset_id = local.dataset_id
  table_id   = each.value

  schema = <<EOF
[
  {
    "name": "id",
    "type": "STRING",
    "description": "The ID of the entity"
  },
  {
    "name": "event_type",
    "type": "STRING",
    "description": "The type of the event"
  },
  {
    "name": "event",
    "type": "JSON",
    "description": "The JSON of the event"
  },
  {
    "name": "sequence",
    "type": "INTEGER",
    "description": "The sequence number of the event"
  },
  {
    "name": "recorded_at",
    "type": "TIMESTAMP",
    "description": "When the event was recorded"
  }
]
EOF

}

resource "google_bigquery_table_iam_member" "entities_owner_sa" {
  for_each   = toset(local.bq_tables)
  project    = local.project_id
  dataset_id = local.dataset_id
  table_id   = google_bigquery_table.entities[each.value].table_id
  role       = "roles/bigquery.dataOwner"
  member     = local.sa_member
}
