"use client"

import { gql } from "@apollo/client"

import { WithdrawalStatusBadge } from "./status-badge"

import { Withdrawal, useWithdrawalsQuery } from "@/lib/graphql/generated"

import PaginatedTable, {
  Column,
  DEFAULT_PAGESIZE,
  PaginatedData,
} from "@/components/new/paginated-table"

import Balance from "@/components/balance/balance"

gql`
  query Withdrawals($first: Int!, $after: String) {
    withdrawals(first: $first, after: $after) {
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          customerId
          withdrawalId
          amount
          status
          reference
          subjectCanConfirm
          subjectCanCancel
          customer {
            customerId
            email
          }
        }
      }
    }
  }
`

const Withdrawals = () => {
  const { data, loading, error, fetchMore } = useWithdrawalsQuery({
    variables: {
      first: DEFAULT_PAGESIZE,
    },
  })

  return (
    <div>
      {error && <p className="text-destructive text-sm">{error?.message}</p>}
      <PaginatedTable<Withdrawal>
        columns={columns}
        data={data?.withdrawals as PaginatedData<Withdrawal>}
        loading={loading}
        fetchMore={async (cursor) => fetchMore({ variables: { after: cursor } })}
        pageSize={DEFAULT_PAGESIZE}
      />
    </div>
  )
}

export default Withdrawals

const columns: Column<Withdrawal>[] = [
  { key: "customer", label: "Customer", render: (customer) => customer.email },
  {
    key: "reference",
    label: "Reference",
  },
  {
    key: "amount",
    label: "Amount",
    render: (amount) => <Balance amount={amount} currency="usd" />,
  },
  {
    key: "status",
    label: "Status",
    render: (status) => <WithdrawalStatusBadge status={status} />,
  },
]
