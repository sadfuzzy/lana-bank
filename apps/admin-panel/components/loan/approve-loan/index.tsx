import { gql } from "@apollo/client"

import { useState } from "react"

import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/primitive/dialog"
import { Input } from "@/components/primitive/input"
import { Label } from "@/components/primitive/label"
import { useLoanApproveMutation } from "@/lib/graphql/generated"
import { Button } from "@/components/primitive/button"
import { currencyConverter } from "@/lib/utils"
import { DetailItem, DetailsGroup } from "@/components/details"
import Balance from "@/components/balance/balance"

gql`
  mutation LoanApprove($input: LoanApproveInput!) {
    loanApprove(input: $input) {
      loan {
        id
        loanId
        startDate
        balance {
          collateral {
            btcBalance
          }
          outstanding {
            usdBalance
          }
          interestIncurred {
            usdBalance
          }
        }
      }
    }
  }
`

export const LoanApproveDialog = ({
  loanId,
  children,
  refetch,
}: {
  loanId: string
  children: React.ReactNode
  refetch?: () => void
}) => {
  const [collateral, setCollateral] = useState<string>("")
  const [LoanApprove, { data, loading, error, reset }] = useLoanApproveMutation()

  const handleLoanApprove = async () => {
    if (!collateral) return

    try {
      await LoanApprove({
        variables: {
          input: {
            loanId: loanId,
            collateral: currencyConverter.btcToSatoshi(Number(collateral)),
          },
        },
      })
      toast.success("Loan Approved successfully")
      if (refetch) refetch()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setCollateral("")
          reset()
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      {data ? (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loan Approved</DialogTitle>
            <DialogDescription>Loan Details.</DialogDescription>
          </DialogHeader>
          <DetailsGroup>
            <DetailItem label="Loan ID" value={data.loanApprove.loan.loanId} />
            <DetailItem label="Start Date" value={data.loanApprove.loan.startDate} />
            <DetailItem
              label="Collateral"
              valueComponent={
                <Balance
                  amount={data.loanApprove.loan.balance.collateral.btcBalance}
                  currency="btc"
                />
              }
            />
            <DetailItem
              label="Interest Incurred"
              valueComponent={
                <Balance
                  amount={data.loanApprove.loan.balance.interestIncurred.usdBalance}
                  currency="usd"
                />
              }
            />
            <DetailItem
              label="Outstanding"
              valueComponent={
                <Balance
                  amount={data.loanApprove.loan.balance.outstanding.usdBalance}
                  currency="usd"
                />
              }
            />
          </DetailsGroup>
        </DialogContent>
      ) : (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Loan</DialogTitle>
            <DialogDescription>Fill in the details to Approve loan.</DialogDescription>
          </DialogHeader>
          <div>
            <Label>Collateral</Label>
            <div className="flex items-center gap-1">
              <Input
                required
                type="number"
                value={collateral}
                onChange={(e) => setCollateral(e.target.value)}
                placeholder="Enter the desired Collateral amount"
                min={0.00000001}
              />
              <div className="p-1.5 bg-input-text rounded-md px-4">BTC</div>
            </div>
          </div>
          {error && <span className="text-destructive">{error.message}</span>}
          <DialogFooter className="mt-4">
            <Button className="w-32" disabled={loading} onClick={handleLoanApprove}>
              Approve Loan
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  )
}
