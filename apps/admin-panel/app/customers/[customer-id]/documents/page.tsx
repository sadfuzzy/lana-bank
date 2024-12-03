"use client"

import { gql } from "@apollo/client"

import { Documents } from "./list"

import { useGetCustomerDocumentsQuery } from "@/lib/graphql/generated"

gql`
  query GetCustomerDocuments($id: UUID!) {
    customer(id: $id) {
      id
      customerId
      documents {
        id
        filename
      }
    }
  }
`

export default function CustomerDocumentsPage({
  params,
}: {
  params: { "customer-id": string }
}) {
  const { data, refetch } = useGetCustomerDocumentsQuery({
    variables: { id: params["customer-id"] },
  })

  if (!data?.customer) return null

  return <Documents customer={data.customer} refetch={refetch} />
}
