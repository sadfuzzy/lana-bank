"use client"

import { gql } from "@apollo/client"

import { CustomerTransactionsTable } from "./list"

import { useGetCustomerTransactionsQuery } from "@/lib/graphql/generated"

gql`
  query GetCustomerTransactions($id: UUID!) {
    customer(id: $id) {
      id
      deposits {
        ...DepositFields
      }
      withdrawals {
        ...WithdrawalFields
      }
    }
  }
`

export default function CustomerTransactionsPage({
  params,
}: {
  params: { "customer-id": string }
}) {
  const { data } = useGetCustomerTransactionsQuery({
    variables: { id: params["customer-id"] },
  })
  const transactions = [
    ...(data?.customer?.deposits || []),
    ...(data?.customer?.withdrawals || []),
  ].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
  if (!transactions) return null
  return <CustomerTransactionsTable transactions={transactions} />
}
