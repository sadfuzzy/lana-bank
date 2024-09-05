"use client"

import { useState } from "react"
import { gql } from "@apollo/client"

import { DetailItem, DetailsGroup } from "@/components/details"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/primitive/card"

import { useGetCustomerDetailsByCustomerIdQuery } from "@/lib/graphql/generated"
import { CreateLoanDialog } from "@/app/loans/create"
import { Button } from "@/components/primitive/button"
import { RecordDepositDialog } from "@/app/deposits/record"
import { WithdrawalInitiateDialog } from "@/app/withdrawals/initiate"

gql`
  query getCustomerDetailsByCustomerId($id: UUID!) {
    customer(id: $id) {
      customerId
      email
      loans {
        loanId
      }
      deposits {
        depositId
      }
      withdrawals {
        withdrawalId
      }
      transactions @client {
        ... on Deposit {
          depositId
        }
        ... on Withdrawal {
          withdrawalId
        }
      }
    }
  }
`

export const CustomerDetailsCard = ({ customerId }: { customerId: string }) => {
  const [openWithdrawalInitiateDialog, setOpenWithdrawalInitiateDialog] = useState(false)
  const [openRecordDepositDialog, setOpenRecordDepositDialog] = useState(false)

  const {
    loading,
    error,
    refetch,
    data: customerDetails,
  } = useGetCustomerDetailsByCustomerIdQuery({
    variables: {
      id: customerId,
    },
  })

  return (
    <>
      <Card>
        {loading ? (
          <CardContent className="p-6">Loading...</CardContent>
        ) : error ? (
          <CardContent className="p-6 text-destructive">{error.message}</CardContent>
        ) : !customerDetails || !customerDetails.customer ? (
          <CardContent className="p-6">No customer found with this ID</CardContent>
        ) : (
          <>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle>Customer Overview</CardTitle>
              </div>
            </CardHeader>
            <div className="flex w-full items-center justify-between">
              <CardContent className="flex-1">
                <DetailsGroup>
                  <DetailItem
                    label="Customer ID"
                    value={customerDetails.customer.customerId}
                  />
                  <DetailItem label="Email" value={customerDetails.customer.email} />
                </DetailsGroup>
              </CardContent>
              <CardFooter className="flex space-x-4 justify-end">
                <CreateLoanDialog refetch={refetch} customerId={customerId}>
                  <Button>New Loan</Button>
                </CreateLoanDialog>
                <Button onClick={() => setOpenRecordDepositDialog(true)}>
                  Record Deposit
                </Button>
                <Button onClick={() => setOpenWithdrawalInitiateDialog(true)}>
                  Record Withdrawal
                </Button>
              </CardFooter>
            </div>
          </>
        )}
      </Card>
      {openWithdrawalInitiateDialog && (
        <WithdrawalInitiateDialog
          customerId={customerId}
          openWithdrawalInitiateDialog={openWithdrawalInitiateDialog}
          setOpenWithdrawalInitiateDialog={() => setOpenWithdrawalInitiateDialog(false)}
        />
      )}
      {openRecordDepositDialog && (
        <RecordDepositDialog
          customerId={customerId}
          openRecordDepositDialog={openRecordDepositDialog}
          setOpenRecordDepositDialog={() => setOpenRecordDepositDialog(false)}
        />
      )}
    </>
  )
}
