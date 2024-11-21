"use client"

import { gql } from "@apollo/client"

import { useRouter } from "next/navigation"

import { DisbursalStatusBadge } from "./status-badge"

import { CreditFacilityDisbursal, useDisbursalsQuery } from "@/lib/graphql/generated"

import PaginatedTable, {
  Column,
  DEFAULT_PAGESIZE,
  PaginatedData,
} from "@/components/paginated-table"
import Balance from "@/components/balance/balance"
import { formatDate } from "@/lib/utils"

gql`
  query Disbursals($first: Int!, $after: String) {
    disbursals(first: $first, after: $after) {
      edges {
        node {
          id
          disbursalId
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
  const router = useRouter()
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
        onClick={(disbursal) => {
          router.push(`/disbursals/${disbursal.disbursalId}`)
        }}
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
    render: (date) => formatDate(date),
  },
  {
    key: "status",
    label: "Status",
    render: (status) => <DisbursalStatusBadge status={status} />,
  },
]
