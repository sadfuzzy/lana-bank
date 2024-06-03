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
        bitfinexUsername: $username,
      }
    }'
  )
  exec_graphql 'user-create' "$variables"
  user=$(graphql_output '.data.userCreate.user.bitfinexUsername')
  [[ "$user" == "$username" ]] || exit 1;

  sats=$(graphql_output '.data.userCreate.user.balance.unallocatedCollateral.settled.btcBalance')
  [[ "$sats" == "0" ]] || exit 1;

  user_id=$(graphql_output '.data.userCreate.user.userId')
  cache_value 'user.id' "$user_id"
}

@test "user: can topup unallocated collateral" {
  user_id=$(read_value 'user.id')
  variables=$(
    jq -n \
      --arg userId "$user_id" \
    '{
      input: {
        userId: $userId,
        amount: 100000,
        reference: ("topup-" + $userId)
      }
    }'
  )
  exec_graphql 'topup-unallocated-collateral' "$variables"
  sats=$(graphql_output '.data.userTopupCollateral.user.balance.unallocatedCollateral.settled.btcBalance')
  echo $(graphql_output)
  [[ "$sats" == "100000" ]] || exit 1;
}

@test "user: can withdraw" {
  user_id=$(read_value 'user.id')
  variables=$(
    jq -n \
    --arg userId "$user_id" \
    '{
      input: {
        userId: $userId,
      }
    }'
  )
  exec_graphql 'fixed-term-loan-create' "$variables"
  id=$(graphql_output '.data.fixedTermLoanCreate.loan.loanId')
  [[ "$id" != null ]] || exit 1
  variables=$(
    jq -n \
      --arg loanId "$id" \
    '{
      input: {
        loanId: $loanId,
        collateral: 100000,
        principal: 200000,
      }
    }'
  )
  exec_graphql 'approve-loan' "$variables"
  loan_id=$(graphql_output '.data.fixedTermLoanApprove.loan.loanId')
  [[ "$id" == "$loan_id" ]] || exit 1

  variables=$(
    jq -n \
    --arg userId "$user_id" \
    '{ id: $userId }'
  )
  exec_graphql 'find-user' "$variables"
  checking_balance=$(graphql_output '.data.user.balance.checking.settled.usdBalance')
  [[ "$checking_balance" == "200000" ]] || exit 1

  variables=$(
    jq -n \
      --arg userId "$user_id" \
    '{
      input: {
        userId: $userId,
        amount: 10000,
        destination: "tron-address",
        reference: ("initiate_withdraw-" + $userId)
      }
    }'
  )
  exec_graphql 'initiate-withdrawal' "$variables"
  withdraw_id=$(graphql_output '.data.withdrawInitiate.withdraw.id')

  variables=$(
    jq -n \
    --arg userId "$user_id" \
    '{ id: $userId }'
  )
  exec_graphql 'find-user' "$variables"
  checking_balance=$(graphql_output '.data.user.balance.checking.settled.usdBalance')
  [[ "$checking_balance" == "190000" ]] || exit 1
  encumbered_checking_balance=$(graphql_output '.data.user.balance.checking.encumbrance.usdBalance')
  [[ "$encumbered_checking_balance" == "10000" ]] || exit 1

  variables=$(
    jq -n \
      --arg withdrawalId "$withdraw_id" \
    '{
      input: {
        withdrawalId: $withdrawalId,
        reference: ("settle_withdraw-" + $withdrawalId)
      }
    }'
  )
  exec_graphql 'settle-withdrawal' "$variables"

  variables=$(
    jq -n \
    --arg userId "$user_id" \
    '{ id: $userId }'
  )
  exec_graphql 'find-user' "$variables"
  checking_balance=$(graphql_output '.data.user.balance.checking.settled.usdBalance')
  [[ "$checking_balance" == "190000" ]] || exit 1
  encumbered_checking_balance=$(graphql_output '.data.user.balance.checking.encumbrance.usdBalance')
  [[ "$encumbered_checking_balance" == "0" ]] || exit 1
}
