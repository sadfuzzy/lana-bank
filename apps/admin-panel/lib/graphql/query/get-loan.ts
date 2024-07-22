import { gql } from "@apollo/client"

gql`
  query GetLoanDetails($id: UUID!) {
    loan(id: $id) {
      id
      loanId
      startDate
      status
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
