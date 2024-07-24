import { gql } from "@apollo/client"

import {
  GetMyLoansDocument,
  GetMyLoansQuery,
  GetMyLoansQueryVariables,
} from "../generated"

import { executeQuery } from "."

gql`
  query GetMyLoans {
    me {
      customerId
      loans {
        id
        loanId
        startDate
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
  }
`

export const getMyLoans = async () => {
  return executeQuery<GetMyLoansQuery, GetMyLoansQueryVariables>({
    document: GetMyLoansDocument,
    variables: {},
  })
}
