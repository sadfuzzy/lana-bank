import { gql } from "@apollo/client"

import {
  GetRealtimePriceUpdatesDocument,
  GetRealtimePriceUpdatesQuery,
  GetRealtimePriceUpdatesQueryVariables,
} from "../generated"

import { executeQuery } from "."

gql`
  query GetRealtimePriceUpdates {
    realtimePrice {
      usdCentsPerBtc
    }
  }
`
export const priceQuery = async () => {
  return executeQuery<
    GetRealtimePriceUpdatesQuery,
    GetRealtimePriceUpdatesQueryVariables
  >({
    document: GetRealtimePriceUpdatesDocument,
    variables: {},
  })
}
