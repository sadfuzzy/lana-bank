import { gql } from "@apollo/client"

import { MeDocument, MeQuery, MeQueryVariables } from "../generated"

import { executeQuery } from "."

gql`
  query Me {
    me {
      userId
      email
      btcDepositAddress
      ustDepositAddress
      applicantId
      status
      level
      balance {
        unallocatedCollateral {
          settled {
            btcBalance
          }
        }
        checking {
          settled {
            usdBalance
          }
          pending {
            usdBalance
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
