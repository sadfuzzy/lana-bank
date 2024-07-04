import { gql } from "@apollo/client"

import { MeDocument, MeQuery, MeQueryVariables } from "../generated"

import { executeQuery } from "."

gql`
  query Me {
    me {
      userId
      btcDepositAddress
      ustDepositAddress
      email
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
