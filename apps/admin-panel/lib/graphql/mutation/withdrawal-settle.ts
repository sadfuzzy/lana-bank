import { gql } from "@apollo/client"

import {
  WithdrawalSettleDocument,
  WithdrawalSettleInput,
  WithdrawalSettleMutation,
} from "../generated"

import { performMutation } from "."

gql`
  mutation WithdrawalSettle($input: WithdrawalSettleInput!) {
    withdrawalSettle(input: $input) {
      withdrawal {
        amount
        userId
        withdrawalId
      }
    }
  }
`

export function withdrawalSettle(
  variables: WithdrawalSettleInput,
): Promise<Error | WithdrawalSettleMutation> {
  return performMutation<WithdrawalSettleMutation, WithdrawalSettleInput>(
    WithdrawalSettleDocument,
    variables,
  )
}
