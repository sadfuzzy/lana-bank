"use client"

import { gql } from "@apollo/client"

import { CustomerCreditFacilitiesTable } from "./list"

import { useGetCustomerCreditFacilitiesQuery } from "@/lib/graphql/generated"

gql`
  query GetCustomerCreditFacilities($id: UUID!) {
    customer(id: $id) {
      id
      creditFacilities {
        id
        creditFacilityId
        collateralizationState
        status
        createdAt
        balance {
          collateral {
            btcBalance
          }
          outstanding {
            usdBalance
          }
        }
      }
    }
  }
`

export default function CustomerCreditFacilitiesPage({
  params,
}: {
  params: { "customer-id": string }
}) {
  const { data } = useGetCustomerCreditFacilitiesQuery({
    variables: { id: params["customer-id"] },
  })

  if (!data?.customer) return null

  return (
    <CustomerCreditFacilitiesTable creditFacilities={data.customer.creditFacilities} />
  )
}
