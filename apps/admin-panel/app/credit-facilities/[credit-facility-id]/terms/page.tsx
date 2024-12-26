"use client"

import { gql } from "@apollo/client"

import { CreditFacilityTerms } from "./list"

import { useGetCreditFacilityTermsQuery } from "@/lib/graphql/generated"

gql`
  query GetCreditFacilityTerms($id: UUID!) {
    creditFacility(id: $id) {
      id
      creditFacilityId
      createdAt
      facilityAmount
      creditFacilityTerms {
        annualRate
        accrualInterval
        incurrenceInterval
        liquidationCvl
        marginCallCvl
        initialCvl
        oneTimeFeeRate
        duration {
          period
          units
        }
      }
    }
  }
`

export default function CreditFacilityTermsPage({
  params,
}: {
  params: { "credit-facility-id": string }
}) {
  const { data } = useGetCreditFacilityTermsQuery({
    variables: { id: params["credit-facility-id"] },
  })

  if (!data?.creditFacility) return null

  return <CreditFacilityTerms creditFacility={data.creditFacility} />
}
