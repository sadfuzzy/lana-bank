import { gql } from "@apollo/client"

import { GetLoanDocument, GetLoanQuery, GetLoanQueryVariables } from "../generated"

import { executeQuery } from "."

gql`
  query getLoan($id: UUID!) {
    loan(id: $id) {
      id
      loanId
      createdAt
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
      loanTerms {
        annualRate
        interval
        liquidationCvl
        marginCallCvl
        initialCvl
        duration {
          period
          units
        }
      }
    }
  }
`
export const getLoan = async ({ variables }: { variables: GetLoanQueryVariables }) => {
  return executeQuery<GetLoanQuery, GetLoanQueryVariables>({
    document: GetLoanDocument,
    variables,
  })
}
