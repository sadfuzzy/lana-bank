"use client"
import React, { useState } from "react"
import { gql } from "@apollo/client"

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@lana/web/ui/table"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lana/web/ui/card"

import { Skeleton } from "@lana/web/ui/skeleton"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

import {
  TrialBalanceCurrencySelection,
  TrialBalanceLayerSelection,
  TrialBalanceLayers,
} from "./trial-balance-currency-selector"

import { GetTrialBalanceQuery, useGetTrialBalanceQuery } from "@/lib/graphql/generated"
import Balance, { Currency } from "@/components/balance/balance"
import {
  DateRange,
  DateRangeSelector,
  getInitialDateRange,
} from "@/components/date-range-picker"
import PaginatedTable, { Column, PaginatedData } from "@/components/paginated-table"

const DEFAULT_PAGESIZE = 15

gql`
  query GetTrialBalance(
    $from: Timestamp!
    $until: Timestamp!
    $first: Int!
    $after: String
  ) {
    trialBalance(from: $from, until: $until) {
      name
      total {
        __typename
        ...UsdLedgerBalanceRangeFragment
        ...BtcLedgerBalanceRangeFragment
      }
      accounts(first: $first, after: $after) {
        edges {
          cursor
          node {
            id
            code
            name
            balanceRange {
              __typename
              ...UsdLedgerBalanceRangeFragment
              ...BtcLedgerBalanceRangeFragment
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
  }

  fragment UsdBalanceFragment on UsdLedgerAccountBalance {
    settled
    pending
    encumbrance
  }

  fragment BtcBalanceFragment on BtcLedgerAccountBalance {
    settled
    pending
    encumbrance
  }

  fragment UsdLedgerBalanceRangeFragment on UsdLedgerAccountBalanceRange {
    usdStart: start {
      ...UsdBalanceFragment
    }
    usdDiff: diff {
      ...UsdBalanceFragment
    }
    usdEnd: end {
      ...UsdBalanceFragment
    }
  }

  fragment BtcLedgerBalanceRangeFragment on BtcLedgerAccountBalanceRange {
    btcStart: start {
      ...BtcBalanceFragment
    }
    btcDiff: diff {
      ...BtcBalanceFragment
    }
    btcEnd: end {
      ...BtcBalanceFragment
    }
  }
`

const LoadingSkeleton = () => {
  return (
    <div className="space-y-4" data-testid="loading-skeleton">
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-10 w-96" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Skeleton className="h-5 w-32" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-5 w-24 ml-auto" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-5 w-24 ml-auto" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-5 w-24 ml-auto" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-5 w-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24 ml-auto" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24 ml-auto" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24 ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

type TrialBalanceAccountNode = NonNullable<
  NonNullable<GetTrialBalanceQuery["trialBalance"]>["accounts"]
>["edges"][0]["node"]

type BalanceRange = NonNullable<TrialBalanceAccountNode["balanceRange"]>

function isUsdLedgerBalanceRange(balanceRange: BalanceRange | null | undefined) {
  return !!balanceRange && balanceRange.__typename === "UsdLedgerAccountBalanceRange"
}

function isBtcLedgerBalanceRange(balanceRange: BalanceRange | null | undefined) {
  return !!balanceRange && balanceRange.__typename === "BtcLedgerAccountBalanceRange"
}

function TrialBalancePage() {
  const t = useTranslations("TrialBalance")
  const [dateRange, setDateRange] = useState<DateRange>(getInitialDateRange())

  const { data, loading, error, fetchMore } = useGetTrialBalanceQuery({
    variables: {
      from: dateRange.from,
      until: dateRange.until,
      first: DEFAULT_PAGESIZE,
    },
  })

  const [currency, setCurrency] = React.useState<Currency>("usd")
  const [layer, setLayer] = React.useState<TrialBalanceLayers>("settled")

  const router = useRouter()

  const total = data?.trialBalance.total
  const accounts = data?.trialBalance.accounts

  if (error) return <div className="text-destructive">{error.message}</div>
  if (loading && !data) {
    return <LoadingSkeleton />
  }
  if (!total) return <div>{t("noAccountsPresent")}</div>

  const columns: Column<TrialBalanceAccountNode>[] = [
    {
      key: "code",
      label: t("table.headers.accountCode"),
      render: (code: string) => (
        <div className="font-mono text-xs text-gray-500">{code}</div>
      ),
    },
    {
      key: "name",
      label: t("table.headers.accountName"),
    },
    {
      key: "balanceRange",
      label: t("table.headers.openingBalance"),
      labelClassName: "!justify-end",
      render: (_, node) => {
        if (currency === "usd" && isUsdLedgerBalanceRange(node.balanceRange)) {
          return (
            <Balance
              align="end"
              currency={currency}
              amount={node.balanceRange.usdStart[layer]}
            />
          )
        } else if (currency === "btc" && isBtcLedgerBalanceRange(node.balanceRange)) {
          return (
            <Balance
              align="end"
              currency={currency}
              amount={node.balanceRange.btcStart[layer]}
            />
          )
        }
        return null
      },
    },
    {
      key: "balanceRange",
      label: t("table.headers.periodActivity"),
      labelClassName: "!justify-end",
      render: (_, node) => {
        if (currency === "usd" && isUsdLedgerBalanceRange(node.balanceRange)) {
          return (
            <Balance
              align="end"
              currency={currency}
              amount={node.balanceRange.usdDiff[layer]}
            />
          )
        } else if (currency === "btc" && isBtcLedgerBalanceRange(node.balanceRange)) {
          return (
            <Balance
              align="end"
              currency={currency}
              amount={node.balanceRange.btcDiff[layer]}
            />
          )
        }
        return null
      },
    },
    {
      key: "balanceRange",
      label: t("table.headers.closingBalance"),
      labelClassName: "!justify-end",
      render: (_, node) => {
        if (currency === "usd" && isUsdLedgerBalanceRange(node.balanceRange)) {
          return (
            <Balance
              align="end"
              currency={currency}
              amount={node.balanceRange.usdEnd[layer]}
            />
          )
        } else if (currency === "btc" && isBtcLedgerBalanceRange(node.balanceRange)) {
          return (
            <Balance
              align="end"
              currency={currency}
              amount={node.balanceRange.btcEnd[layer]}
            />
          )
        }
        return null
      },
    },
  ]

  const Footer = (
    <TableFooter className="border-t-4">
      <TableRow>
        <TableCell className="font-bold">{t("totals")}</TableCell>
        <TableCell />
        <TableCell className="w-48">
          {currency === "usd" && isUsdLedgerBalanceRange(total) ? (
            <Balance align="end" currency={currency} amount={total.usdStart[layer]} />
          ) : currency === "btc" && isBtcLedgerBalanceRange(total) ? (
            <Balance align="end" currency={currency} amount={total.btcStart[layer]} />
          ) : null}
        </TableCell>
        <TableCell className="w-48">
          {currency === "usd" && isUsdLedgerBalanceRange(total) ? (
            <Balance align="end" currency={currency} amount={total.usdDiff[layer]} />
          ) : currency === "btc" && isBtcLedgerBalanceRange(total) ? (
            <Balance align="end" currency={currency} amount={total.btcDiff[layer]} />
          ) : null}
        </TableCell>
        <TableCell className="w-48">
          {currency === "usd" && isUsdLedgerBalanceRange(total) ? (
            <Balance align="end" currency={currency} amount={total.usdEnd[layer]} />
          ) : currency === "btc" && isBtcLedgerBalanceRange(total) ? (
            <Balance align="end" currency={currency} amount={total.btcEnd[layer]} />
          ) : null}
        </TableCell>
      </TableRow>
    </TableFooter>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6 items-center">
          <div>{t("dateRange")}:</div>
          <DateRangeSelector initialDateRange={dateRange} onDateChange={setDateRange} />
        </div>
        <div>
          <TrialBalanceCurrencySelection currency={currency} setCurrency={setCurrency} />
          <TrialBalanceLayerSelection layer={layer} setLayer={setLayer} />
        </div>
        <PaginatedTable<TrialBalanceAccountNode>
          columns={columns}
          data={accounts as PaginatedData<TrialBalanceAccountNode>}
          loading={loading}
          pageSize={DEFAULT_PAGESIZE}
          fetchMore={async (cursor) =>
            fetchMore({
              variables: {
                after: cursor,
                from: dateRange.from,
                until: dateRange.until,
                first: DEFAULT_PAGESIZE,
              },
            })
          }
          customFooter={Footer}
          style="compact"
          onClick={(account) => router.push(`/ledger-account/${account.code}`)}
          noDataText={t("noAccountsPresent")}
        />
        <div className="mt-4" />
      </CardContent>
    </Card>
  )
}

export default TrialBalancePage
