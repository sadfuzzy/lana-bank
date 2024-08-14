"use client"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { IoEllipsisHorizontal } from "react-icons/io5"
import { gql } from "@apollo/client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/primitive/table"
import { Card, CardContent } from "@/components/primitive/card"
import { Button } from "@/components/primitive/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/primitive/dropdown-menu"
import { Input } from "@/components/primitive/input"
import { PageHeading } from "@/components/page-heading"
import { useWithdrawalQuery, useWithdrawalsQuery } from "@/lib/graphql/generated"
import { Badge } from "@/components/primitive/badge"
import { WithdrawalConfirmDialog } from "@/components/customer/withdrawal-confirm-dialog"
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
      nodes {
        customerId
        withdrawalId
        amount
        confirmed
        customer {
          customerId
          email
        }
      }
    }
  }

  query Withdrawal($id: UUID!) {
    withdrawal(id: $id) {
      customerId
      withdrawalId
      amount
      confirmed
      customer {
        customerId
        email
        applicantId
      }
    }
  }
`

function WithdrawalsTable() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("id") || ""
  const [searchInput, setSearchInput] = useState<string>(searchQuery)
  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState<string | null>(null)

  const pageSize = 100

  const {
    data: withdrawalsData,
    error: withdrawalsError,
    loading: withdrawalsLoading,
    fetchMore,
    refetch: refetchWithdrawals,
  } = useWithdrawalsQuery({
    variables: { first: pageSize },
    skip: !!searchQuery,
  })

  const {
    data: withdrawalData,
    error: withdrawalError,
    loading: withdrawalLoading,
    refetch: refetchWithdrawal,
  } = useWithdrawalQuery({
    variables: { id: searchQuery },
    skip: !searchQuery,
  })

  const handleSearch = () => {
    if (searchInput) {
      router.push(`/withdrawals?id=${searchInput}`)
    } else {
      router.push("/withdrawals")
    }
  }

  const handleClearSearch = () => {
    setSearchInput("")
    router.push("/withdrawals")
  }

  const handleLoadMore = () => {
    if (withdrawalsData?.withdrawals.pageInfo?.hasNextPage) {
      fetchMore({
        variables: {
          after: withdrawalsData.withdrawals.pageInfo.endCursor,
          first: pageSize,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev
          return {
            withdrawals: {
              ...fetchMoreResult.withdrawals,
              nodes: [...prev.withdrawals.nodes, ...fetchMoreResult.withdrawals.nodes],
              pageInfo: fetchMoreResult.withdrawals.pageInfo,
            },
          }
        },
      })
    }
  }

  const withdrawalsToDisplay = searchQuery
    ? withdrawalData?.withdrawal
      ? [withdrawalData.withdrawal]
      : []
    : withdrawalsData?.withdrawals.nodes || []

  return (
    <main>
      <div className="flex justify-between items-center mb-8">
        <PageHeading className="mb-0">Withdrawals</PageHeading>
        <div className="flex gap-2">
          <Input
            placeholder="Find a Withdrawal by Withdrawal ID"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-80"
          />
          <Button onClick={handleSearch}>Search</Button>
          {searchQuery && (
            <Button variant="secondary" onClick={handleClearSearch}>
              X Clear
            </Button>
          )}
        </div>
      </div>
      {withdrawalsLoading || withdrawalLoading ? (
        <Card>
          <CardContent className="p-6">
            <div>Loading...</div>
          </CardContent>
        </Card>
      ) : withdrawalsError || withdrawalError ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-destructive">
              {withdrawalsError?.message || withdrawalError?.message}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            {withdrawalsToDisplay.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Withdrawal ID</TableHead>
                    <TableHead>Withdrawal Amount</TableHead>
                    <TableHead>Confirmed</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawalsToDisplay.map((withdrawal) =>
                    withdrawal && withdrawal.customer ? (
                      <TableRow key={withdrawal.withdrawalId}>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div>{withdrawal.customer.email}</div>
                            <div className="text-xs text-textColor-secondary">
                              {withdrawal.customerId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{withdrawal.withdrawalId}</TableCell>
                        <TableCell>
                          <Balance amount={withdrawal.amount} currency="usd" />
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={withdrawal.confirmed ? "success" : "destructive"}
                          >
                            {withdrawal.confirmed ? "True" : "False"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Button variant="ghost">
                                <IoEllipsisHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="text-sm">
                              <DropdownMenuItem
                                onClick={() => {
                                  if (!withdrawal.confirmed)
                                    setSelectedWithdrawalId(withdrawal.withdrawalId)
                                }}
                              >
                                Confirm Withdraw
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ) : null,
                  )}
                </TableBody>
              </Table>
            ) : (
              <div>No data available</div>
            )}
          </CardContent>
        </Card>
      )}
      {!searchQuery && withdrawalsData?.withdrawals.pageInfo?.hasNextPage && (
        <div className="flex justify-center mt-4">
          <Button variant="ghost" onClick={handleLoadMore}>
            Load More
          </Button>
        </div>
      )}
      {selectedWithdrawalId && (
        <WithdrawalConfirmDialog
          key={selectedWithdrawalId}
          refetch={refetchWithdrawals || refetchWithdrawal}
          withdrawalId={selectedWithdrawalId}
          openWithdrawalConfirmDialog={Boolean(selectedWithdrawalId)}
          setOpenWithdrawalConfirmDialog={() => setSelectedWithdrawalId(null)}
        />
      )}
    </main>
  )
}

export default WithdrawalsTable
