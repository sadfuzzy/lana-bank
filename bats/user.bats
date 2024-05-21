#!/usr/bin/env bats

load "helpers"

setup_file() {
  start_server
}

teardown_file() {
  stop_server
}

@test "user: can create a user" {
  username=$(random_uuid)
  variables=$(
    jq -n \
      --arg username "$username" \
    '{
      input: {
        bitfinexUserName: "$username",
      }
    }'
  )
  exec_graphql 'user-create' "$variables"
  username=$(graphql_output '.data.userCreate.user.bitfinexUsername')
  [[ "$id" != null ]] || exit 1;
}
