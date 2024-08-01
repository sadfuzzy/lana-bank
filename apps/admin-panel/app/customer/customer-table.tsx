"use client"

import Link from "next/link"

import { IoEllipsisHorizontal } from "react-icons/io5"

import {
  CustomersQuery,
  GetCustomerByCustomerIdQuery,
  useCustomersQuery,
  useGetCustomerByCustomerIdQuery,
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
import { CreateLoanDialog } from "@/components/loan/create-loan-dialog"

function CustomerTable({ customerId }: { customerId?: string }) {
  let customerDetails:
    | GetCustomerByCustomerIdQuery["customer"][]
    | CustomersQuery["customers"]["nodes"]
    | null = null
  let error: string | null = null
  let loading: boolean = false

  const {
    data: getCustomersData,
    error: customersError,
    loading: getcustomersLoading,
  } = useCustomersQuery({
    variables: { first: 100 },
  })

  const {
    data: getCustomerByCustomerIdData,
    error: getcustomersBycustomerIdError,
    loading: getcustomersBycustomerIdLoading,
  } = useGetCustomerByCustomerIdQuery({
    variables: { id: customerId || "" },
    skip: !customerId,
  })

  if (getCustomerByCustomerIdData) {
    loading = getcustomersBycustomerIdLoading
    const result = getCustomerByCustomerIdData
    if (customersError) {
      error = customersError.message
    } else {
      customerDetails = result.customer ? [result.customer] : null
    }
  } else {
    loading = getcustomersLoading
    const result = getCustomersData
    if (getcustomersBycustomerIdError) {
      error = getcustomersBycustomerIdError.message
    } else {
      customerDetails = result?.customers.nodes ? result.customers.nodes : null
    }
  }

  return (
    <>
      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div>Loading...</div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-destructive">{error}</div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            {customerDetails && customerDetails.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>customer</TableHead>
                    <TableHead>BTC Balance (Settled)</TableHead>
                    <TableHead>USD Balance (Settled)</TableHead>
                    <TableHead>USD Balance (Withdrawals)</TableHead>
                    <TableHead>BTC Address</TableHead>
                    <TableHead>UST Address</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerDetails.map((customer) =>
                    customer ? (
                      <TableRow key={customer.customerId}>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div>{customer.email}</div>
                            <div className="text-xs text-textColor-secondary">
                              {customer.customerId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {customer.balance.unallocatedCollateral.settled?.btcBalance}{" "}
                          sats
                        </TableCell>
                        <TableCell>
                          {formatCurrency({
                            amount: currencyConverter.centsToUsd(
                              customer.balance.checking.settled?.usdBalance,
                            ),
                            currency: "USD",
                          })}
                        </TableCell>
                        <TableCell>
                          {formatCurrency({
                            amount: currencyConverter.centsToUsd(
                              customer.balance.checking.pending?.usdBalance,
                            ),
                            currency: "USD",
                          })}
                        </TableCell>
                        <TableCell>{customer.btcDepositAddress}</TableCell>
                        <TableCell>{customer.ustDepositAddress}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Button variant="ghost">
                                <IoEllipsisHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="text-sm">
                              <Link href={`/customer/${customer.customerId}`}>
                                <DropdownMenuItem>View details</DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                                <CreateLoanDialog customerId={customer.customerId}>
                                  <span>Create Loan</span>
                                </CreateLoanDialog>
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
    </>
  )
}

export default CustomerTable
