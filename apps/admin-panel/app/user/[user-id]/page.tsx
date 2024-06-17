import QRCode from "react-qr-code"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/primitive/card"
import { Separator } from "@/components/primitive/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/primitive/table"
import { PageHeading } from "@/components/page-heading"
import { getUserByUserId } from "@/lib/graphql/query/get-user-by-userid"
import { getLoansForUser } from "@/lib/graphql/query/get-loans-for-user"
import { DetailItem, DetailsGroup } from "@/components/details"
import { currencyConverter, formatCurrency } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/primitive/dialog"
import { QrCode } from "@/components/icons"
import { CopyButton } from "@/components/copy-button"

async function UserDetails({
  params,
}: {
  params: {
    "user-id": string
  }
}) {
  const { "user-id": userId } = params
  return (
    <main>
      <PageHeading>User Details</PageHeading>
      <UserDetailsCard userId={userId} />
      <UserLoansTable userId={userId} />
    </main>
  )
}

const UserDetailsCard = async ({ userId }: { userId: string }) => {
  const userDetails = await getUserByUserId({ id: userId })

  return (
    <Card>
      {userDetails instanceof Error ? (
        <CardContent className="p-6">{userDetails.message}</CardContent>
      ) : !userDetails.user ? (
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

const UserLoansTable = async ({ userId }: { userId: string }) => {
  const userLoans = await getLoansForUser({ id: userId })

  return (
    <Card className="mt-4">
      {userLoans instanceof Error ? (
        <CardContent className="p-6">{userLoans.message}</CardContent>
      ) : !userLoans.user?.loans || userLoans.user?.loans.length === 0 ? (
        <CardContent className="p-6">No loans found for this user</CardContent>
      ) : (
        <>
          <CardHeader>
            <CardTitle>User loans</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Loan ID</TableCell>
                  <TableCell>Collateral (BTC)</TableCell>
                  <TableCell>Interest Incurred (USD)</TableCell>
                  <TableCell>Outstanding (USD)</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userLoans.user.loans.map((loan) => (
                  <TableRow key={loan.loanId}>
                    <TableCell>{loan.loanId}</TableCell>
                    <TableCell>{loan.balance.collateral.btcBalance} sats</TableCell>
                    <TableCell>
                      {formatCurrency({
                        amount: currencyConverter.centsToUsd(
                          loan.balance.interestIncurred.usdBalance,
                        ),
                        currency: "USD",
                      })}
                    </TableCell>
                    <TableCell>
                      {formatCurrency({
                        amount: currencyConverter.centsToUsd(
                          loan.balance.outstanding.usdBalance,
                        ),
                        currency: "USD",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </>
      )}
    </Card>
  )
}

export default UserDetails
