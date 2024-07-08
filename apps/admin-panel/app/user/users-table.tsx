"use client"

import Link from "next/link"

import { IoEllipsisHorizontal } from "react-icons/io5"

import {
  GetUserByUserIdQuery,
  useGetUserByUserIdQuery,
  UsersQuery,
  useUsersQuery,
} from "@/lib/graphql/generated"
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

import { currencyConverter, formatCurrency } from "@/lib/utils"

function UsersTable({ userId }: { userId?: string }) {
  let userDetails: GetUserByUserIdQuery["user"][] | UsersQuery["users"]["nodes"] | null =
    null
  let error: string | null = null
  let loading: boolean = false

  const {
    data: getUsersData,
    error: usersError,
    loading: getUsersLoading,
  } = useUsersQuery({
    variables: { first: 100 },
  })

  const {
    data: getUsersByUserIdData,
    error: getUsersByUserIdError,
    loading: getUsersByUserIdLoading,
  } = useGetUserByUserIdQuery({
    variables: { id: userId || "" },
    skip: !userId,
  })

  if (getUsersByUserIdData) {
    loading = getUsersByUserIdLoading
    const result = getUsersByUserIdData
    if (usersError) {
      error = usersError.message
    } else {
      userDetails = result.user ? [result.user] : null
    }
  } else {
    loading = getUsersLoading
    const result = getUsersData
    if (getUsersByUserIdError) {
      error = getUsersByUserIdError.message
    } else {
      userDetails = result?.users.nodes ? result.users.nodes : null
    }
  }

  return (
    <>
      {loading ? (
        <Card>
          <CardContent className="p-4">
            <div>Loading...</div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-4">
            <div>{error}</div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            {userDetails && userDetails.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>BTC Balance (Settled)</TableHead>
                    <TableHead>USD Balance (Settled)</TableHead>
                    <TableHead>USD Balance (Withdrawals)</TableHead>
                    <TableHead>BTC Address</TableHead>
                    <TableHead>UST Address</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userDetails.map((user) =>
                    user ? (
                      <TableRow key={user.userId}>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div>{user.email}</div>
                            <div className="text-xs text-textColor-secondary">
                              {user.userId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.balance.unallocatedCollateral.settled?.btcBalance} sats
                        </TableCell>
                        <TableCell>
                          {formatCurrency({
                            amount: currencyConverter.centsToUsd(
                              user.balance.checking.settled?.usdBalance,
                            ),
                            currency: "USD",
                          })}
                        </TableCell>
                        <TableCell>
                          {formatCurrency({
                            amount: currencyConverter.centsToUsd(
                              user.balance.checking.pending?.usdBalance,
                            ),
                            currency: "USD",
                          })}
                        </TableCell>
                        <TableCell>{user.btcDepositAddress}</TableCell>
                        <TableCell>{user.ustDepositAddress}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Button variant="ghost">
                                <IoEllipsisHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="text-sm">
                              <Link href={`/user/${user.userId}`}>
                                <DropdownMenuItem>View details</DropdownMenuItem>
                              </Link>
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
    </>
  )
}

export default UsersTable
