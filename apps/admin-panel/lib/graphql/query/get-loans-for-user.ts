import { gql } from "@apollo/client"

import {
  GetLoansForUserDocument,
  GetLoansForUserQuery,
  GetLoansForUserQueryVariables,
} from "../generated"

import { performQuery } from "."

gql`
  query GetLoansForUser($userId: UUID!) {
    loansForUser(userId: $userId) {
      loanId
      userId
      balance {
        collateral {
          btcBalance
        }
        outstanding {
          usdBalance
        }
        interestIncurred {
          usdBalance
        }
      }
    }
  }
`

export function getLoansForUser(
  variables: GetLoansForUserQueryVariables,
): Promise<Error | GetLoansForUserQuery> {
  return performQuery<GetLoansForUserQuery, GetLoansForUserQueryVariables>(
    GetLoansForUserDocument,
    variables,
  )
}
