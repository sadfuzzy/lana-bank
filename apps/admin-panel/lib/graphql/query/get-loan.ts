import { gql } from "@apollo/client"

import {
  GetLoanDetailsDocument,
  GetLoanDetailsQuery,
  GetLoanDetailsQueryVariables,
} from "../generated"

import { performQuery } from "."

gql`
  query GetLoanDetails($id: UUID!) {
    loan(id: $id) {
      loanId
      user {
        userId
      }
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

export function getLoanDetails(
  variables: GetLoanDetailsQueryVariables,
): Promise<Error | GetLoanDetailsQuery> {
  return performQuery<GetLoanDetailsQuery, GetLoanDetailsQueryVariables>(
    GetLoanDetailsDocument,
    variables,
  )
}
