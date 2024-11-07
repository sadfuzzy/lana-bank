"use client"

import { gql } from "@apollo/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { LoanAndCreditFacilityStatusBadge } from "../loans/status-badge"

import {
  CreditFacilitiesSort,
  CreditFacility,
  SortDirection,
  useCreditFacilitiesQuery,
} from "@/lib/graphql/generated"

import PaginatedTable, {
  Column,
  DEFAULT_PAGESIZE,
  PaginatedData,
} from "@/components/new/paginated-table"
import Balance from "@/components/balance/balance"
import {
  camelToScreamingSnake,
  formatCollateralizationState,
  formatDate,
} from "@/lib/utils"

gql`
  query CreditFacilities($first: Int!, $after: String, $sort: CreditFacilitiesSort) {
    creditFacilities(first: $first, after: $after, sort: $sort) {
      edges {
        cursor
        node {
          id
          creditFacilityId
          collateralizationState
          createdAt
          status
          facilityAmount
          collateral
          currentCvl {
            disbursed
            total
          }
          customer {
            customerId
            email
          }
          balance {
            outstanding {
              usdBalance
            }
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`

const CreditFacilities = () => {
  const router = useRouter()
  const [sortBy, setSortBy] = useState<CreditFacilitiesSort>()

  const { data, loading, error, fetchMore } = useCreditFacilitiesQuery({
    variables: {
      first: DEFAULT_PAGESIZE,
      sort: sortBy,
    },
  })

  return (
    <div>
      {error && <p className="text-destructive text-sm">{error?.message}</p>}
      <PaginatedTable<CreditFacility>
        columns={columns}
        data={data?.creditFacilities as PaginatedData<CreditFacility>}
        loading={loading}
        fetchMore={async (cursor) => fetchMore({ variables: { after: cursor } })}
        pageSize={DEFAULT_PAGESIZE}
        onClick={(facility) => {
          router.push(`/credit-facilities/${facility.creditFacilityId}`)
        }}
        onSort={(column, direction) => {
          setSortBy({
            by: (column === "currentCvl"
              ? "CVL"
              : camelToScreamingSnake(column)) as CreditFacilitiesSort["by"],
            direction: direction as SortDirection,
          })
        }}
      />
    </div>
  )
}

export default CreditFacilities

const columns: Column<CreditFacility>[] = [
  { key: "customer", label: "Customer", render: (customer) => customer.email },
  {
    key: "status",
    label: "Status",
    render: (status) => <LoanAndCreditFacilityStatusBadge status={status} />,
  },
  {
    key: "balance",
    label: "Outstanding",
    render: (balance) => (
      <Balance amount={balance.outstanding.usdBalance} currency="usd" />
    ),
  },
  {
    key: "collateralizationState",
    label: "Collateralization State",
    render: (state) => formatCollateralizationState(state),
  },
  {
    key: "currentCvl",
    label: "CVL",
    render: (cvl) => `${cvl.disbursed}%`,
    sortable: true,
  },
  {
    key: "createdAt",
    label: "Created At",
    render: (date) => formatDate(date),
    sortable: true,
  },
]
