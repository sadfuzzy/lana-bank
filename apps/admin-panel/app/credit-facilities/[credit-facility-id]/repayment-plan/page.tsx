"use client"

import { gql } from "@apollo/client"

import { CreditFacilityRepaymentPlan } from "./list"

import { useGetCreditFacilityRepaymentPlanQuery } from "@/lib/graphql/generated"

gql`
  fragment RepaymentOnFacilityPage on CreditFacilityRepaymentInPlan {
    repaymentType
    status
    initial
    outstanding
    accrualAt
    dueAt
  }

  query GetCreditFacilityRepaymentPlan($id: UUID!) {
    creditFacility(id: $id) {
      id
      creditFacilityId
      repaymentPlan {
        ...RepaymentOnFacilityPage
      }
    }
  }
`
export default function CreditFacilityRepaymentPlansPage({
  params,
}: {
  params: { "credit-facility-id": string }
}) {
  const { data } = useGetCreditFacilityRepaymentPlanQuery({
    variables: { id: params["credit-facility-id"] },
  })

  if (!data?.creditFacility) return null

  return <CreditFacilityRepaymentPlan creditFacility={data.creditFacility} />
}
