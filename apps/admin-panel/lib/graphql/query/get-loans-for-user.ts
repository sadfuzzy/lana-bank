import { gql } from "@apollo/client"

gql`
  query GetLoansForUser($id: UUID!) {
    user(id: $id) {
      userId
      loans {
        id
        loanId
        startDate
        status
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
