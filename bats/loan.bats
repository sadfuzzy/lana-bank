#!/usr/bin/env bats

load "helpers"

setup_file() {
  start_server
}

teardown_file() {
  stop_server
}

@test "loan: can create loan terms" {

  exec_admin_graphql 'current-terms-update' 
  terms_id=$(graphql_output '.data.currentTermsUpdate.terms.termsId')
  [[ "$terms_id" != "null" ]] || exit 1

}
