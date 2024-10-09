"use client"

import React from "react"
import { gql } from "@apollo/client"

import CreditFacilityDetailsCard from "./details"

import { PageHeading } from "@/components/page-heading"
import { useGetCreditFacilityDetailsQuery } from "@/lib/graphql/generated"

gql`
  query GetCreditFacilityDetails($id: UUID!) {
    creditFacility(id: $id) {
      id
      creditFacilityId
      collateralizationState
      balance {
        outstanding {
          usdBalance
        }
      }
      customer {
        customerId
        email
        telegramId
        status
        level
        applicantId
      }
      userCanApprove
      userCanUpdateCollateral
      userCanInitiateDisbursement
      userCanApproveDisbursement
      userCanRecordPayment
    }
  }
`

function CreditFacilityPage({
  params,
}: {
  params: {
    "credit-facility-id": string
  }
}) {
  const { "credit-facility-id": creditFacilityId } = params
  const { data, loading, error } = useGetCreditFacilityDetailsQuery({
    variables: { id: creditFacilityId },
  })

  if (loading) return <p>Loading...</p>
  if (error) return <div className="text-destructive">{error.message}</div>

  return (
    <main className="max-w-7xl m-auto">
      <PageHeading>Credit Facility Details</PageHeading>
      {data && data?.creditFacility && (
        <CreditFacilityDetailsCard
          creditFacilityId={creditFacilityId}
          creditFacilityDetails={data.creditFacility}
        />
      )}
    </main>
  )
}

export default CreditFacilityPage
