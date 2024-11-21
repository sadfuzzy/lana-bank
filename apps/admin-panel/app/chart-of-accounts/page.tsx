"use client"

import React, { useMemo, useState } from "react"
import { ApolloError, gql } from "@apollo/client"

import { Account } from "./accounts"

import { Skeleton } from "@/ui/skeleton"
import { Table, TableBody, TableCell, TableRow } from "@/ui/table"
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/ui/tab"
import {
  AccountAmountsByCurrency,
  GetOffBalanceSheetChartOfAccountsQuery,
  GetOnBalanceSheetChartOfAccountsQuery,
  useGetOffBalanceSheetChartOfAccountsQuery,
  useGetOnBalanceSheetChartOfAccountsQuery,
} from "@/lib/graphql/generated"
import { DateRange, getInitialDateRange } from "@/components/date-range-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card"

gql`
  query GetOnBalanceSheetChartOfAccounts {
    chartOfAccounts {
      name
      categories {
        name
        accounts {
          __typename
          ... on Account {
            id
            name
          }
          ... on AccountSet {
            id
            name
            hasSubAccounts
          }
        }
      }
    }
  }

  query GetOffBalanceSheetChartOfAccounts {
    offBalanceSheetChartOfAccounts {
      name
      categories {
        name
        accounts {
          __typename
          ... on Account {
            id
            name
          }
          ... on AccountSet {
            id
            name
            hasSubAccounts
          }
        }
      }
    }
  }
`

const LoadingSkeleton = () => {
  return (
    <Table>
      <TableBody>
        {[1, 2, 3].map((categoryIndex) => (
          <React.Fragment key={`category-${categoryIndex}`}>
            <TableRow>
              <TableCell className="text-primary">
                <Skeleton className="h-6 w-48" />
              </TableCell>
            </TableRow>
            {[1, 2, 3].map((accountIndex) => (
              <TableRow key={`account-${categoryIndex}-${accountIndex}`}>
                <TableCell className="pl-8">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-64" />
                    <div className="flex gap-4">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  )
}

type ChartOfAccountsValuesProps = {
  data:
    | GetOnBalanceSheetChartOfAccountsQuery["chartOfAccounts"]
    | GetOffBalanceSheetChartOfAccountsQuery["offBalanceSheetChartOfAccounts"]
    | undefined
  loading: boolean
  error: ApolloError | undefined
  dateRange: DateRange
}

const ChartOfAccountsValues: React.FC<ChartOfAccountsValuesProps> = ({
  data,
  loading,
  error,
  dateRange,
}) => {
  if (loading) return <LoadingSkeleton />
  if (error) return <p className="text-destructive">{error.message}</p>

  return (
    <Table>
      <TableBody>
        {data?.categories
          .toSorted(({ name: str1 }, { name: str2 }) =>
            str1 < str2 ? -1 : +(str1 > str2),
          )
          .map((category) => (
            <React.Fragment key={category.name}>
              <TableRow>
                <TableCell className="text-primary font-bold uppercase tracking-widest leading-8">
                  {category.name}
                </TableCell>
              </TableRow>
              {category.accounts.map((account) => (
                <Account
                  key={account.id}
                  dateRange={dateRange}
                  account={{
                    ...account,
                    amounts: undefined as unknown as AccountAmountsByCurrency,
                  }}
                />
              ))}
            </React.Fragment>
          ))}
      </TableBody>
    </Table>
  )
}

function ChartOfAccountsPage() {
  const date = useMemo(() => getInitialDateRange(), [])

  const {
    data: onBalanceSheetData,
    loading: onBalanceSheetLoading,
    error: onBalanceSheetError,
  } = useGetOnBalanceSheetChartOfAccountsQuery({
    fetchPolicy: "cache-and-network",
  })
  const {
    data: offBalanceSheetData,
    loading: offBalanceSheetLoading,
    error: offBalanceSheetError,
  } = useGetOffBalanceSheetChartOfAccountsQuery({
    fetchPolicy: "cache-and-network",
  })

  const [dateRange] = useState<DateRange>(date)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chart Of Accounts</CardTitle>
        <CardDescription>
          A structured list of all accounts used to categorize and track financial
          records.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="onBalanceSheet">
          <TabsList>
            <TabsTrigger value="onBalanceSheet">Regular</TabsTrigger>
            <TabsTrigger value="offBalanceSheet">Off Balance Sheet</TabsTrigger>
          </TabsList>
          <TabsContent value="onBalanceSheet">
            <ChartOfAccountsValues
              data={onBalanceSheetData?.chartOfAccounts}
              loading={onBalanceSheetLoading}
              error={onBalanceSheetError}
              dateRange={dateRange}
            />
          </TabsContent>
          <TabsContent value="offBalanceSheet">
            <ChartOfAccountsValues
              data={offBalanceSheetData?.offBalanceSheetChartOfAccounts}
              loading={offBalanceSheetLoading}
              error={offBalanceSheetError}
              dateRange={dateRange}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default ChartOfAccountsPage
