"use client"
import QRCode from "react-qr-code"

import { CopyButton } from "@/components/copy-button"
import { DetailItem, DetailsGroup } from "@/components/details"
import { QrCode } from "@/components/icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/primitive/card"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/primitive/dialog"
import { Separator } from "@/components/primitive/separator"
import { currencyConverter, formatCurrency } from "@/lib/utils"
import { useGetUserByUserIdQuery } from "@/lib/graphql/generated"

export const UserDetailsCard = ({ userId }: { userId: string }) => {
  const {
    loading,
    error,
    data: userDetails,
  } = useGetUserByUserIdQuery({
    variables: {
      id: userId,
    },
  })

  return (
    <Card>
      {loading ? (
        <CardContent className="p-6">Loading...</CardContent>
      ) : error ? (
        <CardContent className="p-6">{error.message}</CardContent>
      ) : !userDetails || !userDetails.user ? (
        <CardContent className="p-6">No user found with this ID</CardContent>
      ) : (
        <>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                <div className="flex flex-col gap-1">
                  <p className="text-lg">{userDetails.user.email}</p>
                  <p className="text-sm text-textColor-secondary">{userId}</p>
                </div>
              </CardTitle>
            </div>
            <Separator />
          </CardHeader>
          <Card>
            <CardHeader>
              <CardTitle>User details</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailsGroup>
                <DetailItem label="User ID" value={userDetails.user.userId} />
                <DetailItem label="Email" value={userDetails.user.email} />
                <DetailItem
                  label="Unallocated Collateral Settled (BTC)"
                  value={`${userDetails.user.balance.unallocatedCollateral.settled.btcBalance} sats`}
                />
                <DetailItem
                  label="Checking Settled Balance (USD)"
                  value={formatCurrency({
                    amount: currencyConverter.centsToUsd(
                      userDetails.user.balance.checking.settled.usdBalance,
                    ),
                    currency: "USD",
                  })}
                />
                <DetailItem
                  label="Pending withdrawals (USD)"
                  value={formatCurrency({
                    amount: currencyConverter.centsToUsd(
                      userDetails.user.balance.checking.pending.usdBalance,
                    ),
                    currency: "USD",
                  })}
                />
                <DetailItem
                  label="BTC Deposit Address"
                  value={userDetails.user.btcDepositAddress}
                  valueComponent={
                    <AddressWithQr
                      address={userDetails.user.btcDepositAddress}
                      title="BTC Deposit Address"
                    />
                  }
                />
                <DetailItem
                  label="UST Deposit Address"
                  value={userDetails.user.ustDepositAddress}
                  valueComponent={
                    <AddressWithQr
                      address={userDetails.user.ustDepositAddress}
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
        <QrCode className="w-4 h-4 bg-white text-black" />
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
