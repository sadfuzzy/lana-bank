"use client"

import { gql } from "@apollo/client"
import { useTranslations } from "next-intl"

import { Deposit, useDepositsQuery } from "@/lib/graphql/generated"

import PaginatedTable, {
  Column,
  DEFAULT_PAGESIZE,
  PaginatedData,
} from "@/components/paginated-table"

import Balance from "@/components/balance/balance"

gql`
  fragment DepositFields on Deposit {
    id
    createdAt
    depositId
    reference
    amount
  }

  query Deposits($first: Int!, $after: String) {
    deposits(first: $first, after: $after) {
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          ...DepositFields
          account {
            customer {
              email
            }
          }
        }
      }
    }
  }
`

const Deposits = () => {
  const t = useTranslations("Deposits.table")
  const { data, loading, error, fetchMore } = useDepositsQuery({
    variables: {
      first: DEFAULT_PAGESIZE,
    },
  })

  return (
    <div>
      {error && <p className="text-destructive text-sm">{error?.message}</p>}
      <PaginatedTable<Deposit>
        columns={columns(t)}
        data={data?.deposits as PaginatedData<Deposit>}
        loading={loading}
        fetchMore={async (cursor) => fetchMore({ variables: { after: cursor } })}
        pageSize={DEFAULT_PAGESIZE}
      />
    </div>
  )
}

export default Deposits

const columns = (t: ReturnType<typeof useTranslations>): Column<Deposit>[] => [
  {
    key: "account",
    label: t("headers.customer"),
    render: (account) => account.customer.email,
  },
  {
    key: "reference",
    label: t("headers.reference"),
  },
  {
    key: "amount",
    label: t("headers.amount"),
    render: (amount) => <Balance amount={amount} currency="usd" />,
  },
]
