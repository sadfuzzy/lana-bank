"use client"
import QRCode from "react-qr-code"

import { gql } from "@apollo/client"

import { IoQrCode } from "react-icons/io5"

import { CopyButton } from "@/components/copy-button"
import { DetailItem, DetailsGroup } from "@/components/details"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/primitive/card"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/primitive/dialog"
import { Separator } from "@/components/primitive/separator"
import { currencyConverter, formatCurrency } from "@/lib/utils"
import {
  useGetCustomerByCustomerIdQuery,
  useSumsubPermalinkCreateMutation,
} from "@/lib/graphql/generated"

gql`
  mutation sumsubPermalinkCreate($input: SumsubPermalinkCreateInput!) {
    sumsubPermalinkCreate(input: $input) {
      url
    }
  }
`

export const CustomerDetailsCard = ({ customerId }: { customerId: string }) => {
  const {
    loading,
    error,
    data: customerDetails,
  } = useGetCustomerByCustomerIdQuery({
    variables: {
      id: customerId,
    },
  })

  const sumsubLink = `https://cockpit.sumsub.com/checkus#/applicant/${customerDetails?.customer?.applicantId}/client/basicInfo`

  const [createLink, { data: linkData, loading: linkLoading, error: linkError }] =
    useSumsubPermalinkCreateMutation()

  const handleCreateLink = async () => {
    if (customerDetails?.customer?.customerId) {
      await createLink({
        variables: {
          input: {
            customerId: customerDetails.customer.customerId,
          },
        },
      })
    }
  }

  return (
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
              <CardTitle>
                <div className="flex flex-col gap-1">
                  <p className="text-lg">{customerDetails.customer.email}</p>
                  <p className="text-sm text-textColor-secondary">{customerId}</p>
                </div>
              </CardTitle>
            </div>
          </CardHeader>
          <Separator />
          <Card className="mt-4" variant="transparent">
            <CardContent>
              <DetailsGroup>
                <DetailItem
                  label="customer ID"
                  value={customerDetails.customer.customerId}
                />
                <DetailItem label="Email" value={customerDetails.customer.email} />
                <DetailItem label="Status" value={customerDetails.customer.status} />
                <DetailItem
                  label="Applicant Id"
                  value={customerDetails.customer.applicantId ?? "not yet connected"}
                  valueComponent={
                    customerDetails.customer.applicantId ? (
                      <a
                        href={sumsubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        {customerDetails.customer.applicantId}
                      </a>
                    ) : (
                      <div>
                        <p>not set yet</p>
                        {!linkData && (
                          <button
                            onClick={handleCreateLink}
                            className="text-blue-500 underline"
                            disabled={linkLoading}
                          >
                            {linkLoading ? "Creating link..." : "Create Link"}
                          </button>
                        )}
                        {linkData && linkData.sumsubPermalinkCreate && (
                          <a
                            href={linkData.sumsubPermalinkCreate.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline"
                          >
                            {linkData.sumsubPermalinkCreate.url}
                          </a>
                        )}
                        {linkError && <p className="text-red-500">{linkError.message}</p>}
                      </div>
                    )
                  }
                />
                <DetailItem label="Level" value={customerDetails.customer.level} />
                <DetailItem
                  label="Unallocated Collateral Settled (BTC)"
                  value={`${customerDetails.customer.balance.unallocatedCollateral.settled.btcBalance} sats`}
                />
                <DetailItem
                  label="Checking Settled Balance (USD)"
                  value={formatCurrency({
                    amount: currencyConverter.centsToUsd(
                      customerDetails.customer.balance.checking.settled.usdBalance,
                    ),
                    currency: "USD",
                  })}
                />
                <DetailItem
                  label="Pending withdrawals (USD)"
                  value={formatCurrency({
                    amount: currencyConverter.centsToUsd(
                      customerDetails.customer.balance.checking.pending.usdBalance,
                    ),
                    currency: "USD",
                  })}
                />
                <DetailItem
                  label="BTC Deposit Address"
                  value={customerDetails.customer.btcDepositAddress}
                  valueComponent={
                    <AddressWithQr
                      address={customerDetails.customer.btcDepositAddress}
                      title="BTC Deposit Address"
                    />
                  }
                />
                <DetailItem
                  label="UST Deposit Address"
                  value={customerDetails.customer.ustDepositAddress}
                  valueComponent={
                    <AddressWithQr
                      address={customerDetails.customer.ustDepositAddress}
                      title="UST Deposit Address"
                    />
                  }
                />
              </DetailsGroup>
            </CardContent>
          </Card>
        </>
      )}
    </Card>
  )
}

const AddressWithQr = ({ address, title }: { address: string; title?: string }) => {
  return (
    <Dialog>
      <DialogTrigger className="flex gap-2 items-center">
        <IoQrCode className="w-4 h-4 bg-white text-black" />
        <p>{address}</p>
      </DialogTrigger>
      <DialogContent className="flex flex-col justify-center items-center max-w-[25rem] gap-6">
        <DialogTitle className="flex justify-center items-center w-full text-md">
          {title || "QR Code"}
        </DialogTitle>
        <div className="flex justify-center items-center bg-white p-4 rounded-lg">
          <QRCode value={address} size={250} />
        </div>
        <div className="flex justify-center items-center gap-2 bg-secondary-foreground rounded-md p-2">
          <p className="text-center text-sm text-textColor-secondary">{address}</p>
          <CopyButton value={address} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
