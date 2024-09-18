import { gql } from "@apollo/client"
import React, { useState } from "react"
import { toast } from "sonner"

import { useLoanPartialPaymentMutation } from "@/lib/graphql/generated"
import { currencyConverter } from "@/lib/utils"

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
import { Button } from "@/components/primitive/button"

gql`
  mutation loanPartialPayment($input: LoanPartialPaymentInput!) {
    loanPartialPayment(input: $input) {
      loan {
        id
        loanId
        createdAt
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

type LoanPartialPaymentDialogProps = {
  loanId: string
  refetch?: () => void
}

export const LoanPartialPaymentDialog: React.FC<
  React.PropsWithChildren<LoanPartialPaymentDialogProps>
> = ({ loanId, refetch, children }) => {
  const [loanIdValue, setLoanIdValue] = useState<string>(loanId)
  const [amount, setAmount] = useState<string>("")
  const [open, setOpen] = useState<boolean>(false)
  const [loanPartialPayment, { loading, error, reset }] = useLoanPartialPaymentMutation()

  const handlePartialPaymentSubmit = async () => {
    const numericAmount = parseFloat(amount)

    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Please enter a valid positive number")
      return
    }

    try {
      await loanPartialPayment({
        variables: {
          input: {
            amount: currencyConverter.usdToCents(numericAmount),
            loanId,
          },
        },
      })

      toast.success("Payment successful")
      if (refetch) refetch()
      setOpen(false)
      handleClose()
    } catch (error) {
      console.error(error)
      toast.error("Payment failed. Please try again.")
    }
  }

  const handleClose = () => {
    setLoanIdValue(loanIdValue)
    setAmount("")
    reset()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose()
        }
        setOpen(isOpen)
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Loan Payment</DialogTitle>
          <DialogDescription>Fill in the details below.</DialogDescription>
        </DialogHeader>
        <div>
          <Label>Amount</Label>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter the desired principal amount"
              min={0}
            />
            <div className="p-1.5 bg-input-text rounded-md px-4">USD</div>
          </div>
        </div>
        {error && <span className="text-destructive">{error.message}</span>}
        <DialogFooter className="mt-4">
          <Button
            className="w-32"
            disabled={loading}
            onClick={handlePartialPaymentSubmit}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
