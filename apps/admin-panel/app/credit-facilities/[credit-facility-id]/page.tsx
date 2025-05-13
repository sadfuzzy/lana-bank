"use client"

import { gql } from "@apollo/client"
import { use } from "react"

import { CreditFacilityHistory } from "./history"

import {
  useGetCreditFacilityHistoryQuery,
  useGetCreditFacilityLayoutDetailsQuery,
  useGetCustomerBasicDetailsQuery,
} from "@/lib/graphql/generated"
import { removeUnderscore } from "@/lib/utils"

gql`
  fragment CreditFacilityHistoryFragment on CreditFacility {
    id
    creditFacilityId
    history {
      ... on CreditFacilityIncrementalPayment {
        cents
        recordedAt
        txId
      }
      ... on CreditFacilityCollateralUpdated {
        satoshis
        recordedAt
        action
        txId
      }
      ... on CreditFacilityOrigination {
        cents
        recordedAt
        txId
      }
      ... on CreditFacilityCollateralizationUpdated {
        state
        collateral
        outstandingInterest
        outstandingDisbursal
        recordedAt
        price
      }
      ... on CreditFacilityDisbursalExecuted {
        cents
        recordedAt
        txId
      }
      ... on CreditFacilityInterestAccrued {
        cents
        recordedAt
        txId
        days
      }
    }
  }

  query GetCreditFacilityHistory($id: UUID!) {
    creditFacility(id: $id) {
      ...CreditFacilityHistoryFragment
    }
  }
`

interface CreditFacilityHistoryPageProps {
  params: Promise<{
    "credit-facility-id": string
  }>
}

export default function CreditFacilityHistoryPage({
  params,
}: CreditFacilityHistoryPageProps) {
  const { "credit-facility-id": creditFacilityId } = use(params)
  const { data: cfData } = useGetCreditFacilityHistoryQuery({
    variables: { id: creditFacilityId },
    fetchPolicy: "cache-and-network",
  })

  const { data: layoutData } = useGetCreditFacilityLayoutDetailsQuery({
    variables: { id: creditFacilityId },
  })

  const customerId = layoutData?.creditFacility?.customer?.customerId
  const { data: customerData } = useGetCustomerBasicDetailsQuery({
    variables: { id: customerId! },
    skip: !customerId,
  })

  if (!cfData?.creditFacility) return null

  const customerType = customerData?.customer?.customerType
  const customerTypeDisplay = customerType ? removeUnderscore(customerType) : "Unknown"

  return (
    <div>
      <div className="mb-4">
        <span className="font-medium">Customer Type: </span>
        <span>{customerTypeDisplay}</span>
      </div>
      <CreditFacilityHistory creditFacility={cfData.creditFacility} />
    </div>
  )
}
