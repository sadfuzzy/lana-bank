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
import { currencyConverter, formatCurrency } from "@/lib/utils"
import { DetailItem, DetailsGroup } from "@/components/details"

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
  const [collateral, setCollateral] = useState<number>(0)
  const [LoanApprove, { data, loading, error, reset }] = useLoanApproveMutation()

  const handleLoanApprove = async () => {
    try {
      await LoanApprove({
        variables: {
          input: {
            loanId: loanId,
            collateral,
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
          setCollateral(0)
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
              value={`${data.loanApprove.loan.balance.collateral.btcBalance} sats`}
            />
            <DetailItem
              label="Interest Incurred"
              value={formatCurrency({
                amount: currencyConverter.centsToUsd(
                  data.loanApprove.loan.balance.interestIncurred.usdBalance,
                ),
                currency: "USD",
              })}
            />
            <DetailItem
              label="Outstanding"
              value={formatCurrency({
                amount: currencyConverter.centsToUsd(
                  data.loanApprove.loan.balance.outstanding.usdBalance,
                ),
                currency: "USD",
              })}
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
                type="number"
                value={collateral}
                onChange={(e) => setCollateral(Number(e.target.value))}
                placeholder="Enter the desired principal amount"
                min={0}
              />
              <div className="p-1.5 bg-input-text rounded-md px-4">SATS</div>
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
