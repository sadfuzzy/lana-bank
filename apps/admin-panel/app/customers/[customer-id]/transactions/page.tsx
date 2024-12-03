"use client"

import { gql } from "@apollo/client"

import { CustomerTransactionsTable } from "./list"

import { useGetCustomerTransactionsQuery } from "@/lib/graphql/generated"

gql`
  query GetCustomerTransactions($id: UUID!) {
    customer(id: $id) {
      id
      deposits {
        createdAt
        customerId
        depositId
        reference
        amount
      }
      withdrawals {
        status
        reference
        customerId
        withdrawalId
        createdAt
        amount
        customer {
          customerId
          email
        }
      }
      transactions @client {
        ... on Deposit {
          createdAt
          customerId
          depositId
          reference
          amount
        }
        ... on Withdrawal {
          status
          reference
          customerId
          withdrawalId
          createdAt
          amount
          customer {
            customerId
            email
          }
        }
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
  if (!data?.customer) return null
  return <CustomerTransactionsTable transactions={data.customer.transactions} />
}
