#!/usr/bin/env bats

load "helpers"

setup_file() {
  start_server
}

teardown_file() {
  stop_server
}

@test "audit: check audit logs" {
  exec_admin_graphql 'audit-logs'
  action=$(graphql_output '.data.audit[-1].action')
  [[ "$action" == "audit-list" ]] || exit 1
}
