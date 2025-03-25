"use client"

import { gql } from "@apollo/client"
import { useTranslations } from "next-intl"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lana/web/ui/card"

import { GeneralLedgerEntry, useGeneralLedgerEntriesQuery } from "@/lib/graphql/generated"

import { formatDate, formatDirection } from "@/lib/utils"

import PaginatedTable, {
  Column,
  DEFAULT_PAGESIZE,
  PaginatedData,
} from "@/components/paginated-table"
import Balance from "@/components/balance/balance"

gql`
  query GeneralLedgerEntries($first: Int!, $after: String) {
    generalLedgerEntries(first: $first, after: $after) {
      edges {
        cursor
        node {
          __typename
          ... on BtcGeneralLedgerEntry {
            id
            entryId
            entryType
            description
            direction
            createdAt
            btcAmount
          }
          ... on UsdGeneralLedgerEntry {
            id
            entryId
            entryType
            description
            direction
            createdAt
            usdAmount
          }
        }
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

const GeneralLedgerPage: React.FC = () => {
  const t = useTranslations("GeneralLedger")

  const { data, loading, error, fetchMore } = useGeneralLedgerEntriesQuery({
    variables: {
      first: DEFAULT_PAGESIZE,
    },
  })

  const columns: Column<GeneralLedgerEntry>[] = [
    {
      key: "createdAt",
      label: t("table.createdAt"),
      render: (date: string) => formatDate(date),
    },
    {
      key: "entryType",
      label: t("table.entryType"),
    },
    {
      key: "direction",
      label: t("table.direction"),
      render: (direction: string) => formatDirection(direction),
    },
    {
      key: "__typename",
      label: t("table.amount"),
      render: (_: string | undefined, entry: GeneralLedgerEntry) => {
        if (entry.__typename === "BtcGeneralLedgerEntry") {
          return <Balance amount={entry.btcAmount} currency="btc" />
        } else if (entry.__typename === "UsdGeneralLedgerEntry") {
          return <Balance amount={entry.usdAmount} currency="usd" />
        }
      },
    },
    {
      key: "description",
      label: t("table.description"),
      render: (description?: string | null) => {
        if (description) return description
        return "-"
      },
    },
  ]

  return (
    <Card className="mt-2">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-destructive text-sm">{error?.message}</p>
        ) : (
          <PaginatedTable<GeneralLedgerEntry>
            columns={columns}
            data={data?.generalLedgerEntries as PaginatedData<GeneralLedgerEntry>}
            pageSize={DEFAULT_PAGESIZE}
            fetchMore={async (cursor) => fetchMore({ variables: { after: cursor } })}
            loading={loading}
            noDataText={t("noTableData")}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default GeneralLedgerPage
