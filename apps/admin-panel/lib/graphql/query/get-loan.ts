import { gql } from "@apollo/client"

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
