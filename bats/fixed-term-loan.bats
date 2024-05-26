#!/usr/bin/env bats

load "helpers"

setup_file() {
  start_server
}

teardown_file() {
  stop_server
}

wait_for_interest() {
  variables=$(
    jq -n \
    --arg loanId "$1" \
    '{ id: $loanId }'
  )
  exec_graphql 'find-loan' "$variables"
  interest_balance=$(graphql_output '.data.loan.balance.totalInterestIncurred.usdBalance')
  cache_value 'total_interest_incurred' "$interest_balance"
  [[ "$interest_balance" -gt "0" ]] || return 1
}

@test "fixed-term-loan: loan lifecycle" {
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
  user_id=$(graphql_output '.data.userCreate.user.userId')

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
  [[ "$id" != null ]] || exit 1;
  collateral_balance=$(graphql_output '.data.fixedTermLoanCreate.loan.balance.collateral.btcBalance')
  [[ "$collateral_balance" == "0" ]] || exit 1;
  principal_balance=$(graphql_output '.data.fixedTermLoanCreate.loan.balance.principal.usdBalance')
  [[ "$principal_balance" == "0" ]] || exit 1;

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
  [[ "$id" == "$loan_id" ]] || exit 1;
  collateral_balance=$(graphql_output '.data.fixedTermLoanApprove.loan.balance.collateral.btcBalance')
  [[ "$collateral_balance" == "100000" ]] || exit 1;
  principal_balance=$(graphql_output '.data.fixedTermLoanApprove.loan.balance.principal.usdBalance')
  [[ "$principal_balance" == "200000" ]] || exit 1;

  retry 10 1 wait_for_interest "$id"
  interest_balance=$(read_value 'total_interest_incurred')
  [[ "$interest_balance" -gt "0" ]] || exit 1
}
