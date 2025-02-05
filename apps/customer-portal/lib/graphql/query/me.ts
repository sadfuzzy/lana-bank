import { gql } from "@apollo/client"

import { MeDocument, MeQuery, MeQueryVariables } from "../generated"

import { executeQuery } from "."

gql`
  query me {
    me {
      customer {
        id
        customerId
        status
        level
        createdAt
        email
        telegramId
        depositAccount {
          id
          depositAccountId
          customerId
          createdAt
          balance {
            settled
            pending
          }
          deposits {
            id
            depositId
            accountId
            amount
            createdAt
            reference
          }
          withdrawals {
            id
            withdrawalId
            accountId
            amount
            createdAt
            reference
            status
          }
        }
      }
    }
  }
`

export const meQuery = async () => {
  return executeQuery<MeQuery, MeQueryVariables>({
    document: MeDocument,
    variables: {},
  })
}
