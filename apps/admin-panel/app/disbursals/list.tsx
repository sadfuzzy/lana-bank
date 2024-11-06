"use client"

import { gql } from "@apollo/client"

import { CreditFacilityDisbursal, useDisbursalsQuery } from "@/lib/graphql/generated"

import PaginatedTable, {
  Column,
  DEFAULT_PAGESIZE,
  PaginatedData,
} from "@/components/new/paginated-table"
import Balance from "@/components/balance/balance"

gql`
  query Disbursals($first: Int!, $after: String) {
    disbursals(first: $first, after: $after) {
      edges {
        node {
          id
          amount
          createdAt
          status
        }
        cursor
      }
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

const Disbursals = () => {
  const { data, loading, error, fetchMore } = useDisbursalsQuery({
    variables: {
      first: DEFAULT_PAGESIZE,
    },
  })

  return (
    <div>
      {error && <p className="text-destructive text-sm">{error?.message}</p>}
      <PaginatedTable<CreditFacilityDisbursal>
        columns={columns}
        data={data?.disbursals as PaginatedData<CreditFacilityDisbursal>}
        loading={loading}
        fetchMore={async (cursor) => fetchMore({ variables: { after: cursor } })}
        pageSize={DEFAULT_PAGESIZE}
      />
    </div>
  )
}

export default Disbursals

const columns: Column<CreditFacilityDisbursal>[] = [
  {
    key: "amount",
    label: "Amount",
    render: (amount) => <Balance amount={amount} currency="usd" />,
  },
  {
    key: "createdAt",
    label: "Date",
    render: (date) => new Date(date).toLocaleDateString(),
  },
  {
    key: "status",
    label: "Status",
  },
]
