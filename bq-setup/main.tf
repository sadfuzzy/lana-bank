locals {
  project                = "cala-enterprise"
  location               = "US-EAST1"
  tf_state_bucket_name   = "lava-bank-tf-state"
  objects_list_role_name = "lava_objects_list"

  justin = "user:justin@galoy.io"

  lava_dev = {
    jireva  = "jir@galoy.io",
    jcarter = "justin@galoy.io"
    sv      = "sv@galoy.io"
  }
}

module "source_dataset" {
  source = "./source-dataset"

  for_each = local.lava_dev

  name_prefix = "${each.key}-dev"

  additional_owners = [each.value]
  gcp_project = local.project
  gcp_region  = local.location
}

output "bq_dev_sa_keys_base64" {
  value = { for key, value in module.source_dataset : key => value.service_account_key_base64 }
  sensitive = true
}

terraform {
  backend "gcs" {
    bucket = "lava-bank-tf-state"
    prefix = "lava-bank/setup"
  }
}

