import React, { useState } from "react"
import { gql } from "@apollo/client"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@lana/web/ui/dialog"
import { Button } from "@lana/web/ui/button"
import { Input } from "@lana/web/ui/input"
import { Label } from "@lana/web/ui/label"

import { useCreditFacilityPartialPaymentMutation } from "@/lib/graphql/generated"
import { UsdCents } from "@/types"

gql`
  mutation CreditFacilityPartialPayment($input: CreditFacilityPartialPaymentInput!) {
    creditFacilityPartialPayment(input: $input) {
      creditFacility {
        id
        creditFacilityId
        ...CreditFacilityTransactionsFragment

        ...CreditFacilityLayoutFragment
      }
    }
  }
`

type CreditFacilityPartialPaymentDialogProps = {
  setOpenDialog: (isOpen: boolean) => void
  openDialog: boolean
  creditFacilityId: string
}

export const CreditFacilityPartialPaymentDialog: React.FC<
  CreditFacilityPartialPaymentDialogProps
> = ({ setOpenDialog, openDialog, creditFacilityId }) => {
  const [partialPaymentCreditFacility, { loading, reset }] =
    useCreditFacilityPartialPaymentMutation()
  const [error, setError] = useState<string | null>(null)
  const [amount, setAmount] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const amountInCents = Math.round(parseFloat(amount) * 100)

    if (isNaN(amountInCents) || amountInCents <= 0) {
      setError("Please enter a valid amount")
      return
    }

    try {
      await partialPaymentCreditFacility({
        variables: {
          input: {
            creditFacilityId,
            amount: amountInCents as UsdCents,
          },
        },
        onCompleted: (data) => {
          if (data.creditFacilityPartialPayment) {
            toast.success("Partial payment processed successfully")
            handleCloseDialog()
          }
        },
      })
    } catch (error) {
      console.error("Error processing partial payment:", error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An unknown error occurred")
      }
    }
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setError(null)
    setAmount("")
    reset()
  }

  return (
    <Dialog open={openDialog} onOpenChange={handleCloseDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Process Partial Payment</DialogTitle>
          <DialogDescription>
            Enter the amount you wish to pay towards this credit facility.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label>Amount</Label>
            <div className="flex items-center gap-1">
              <Input
                data-testid="facility-partial-payment-amount-input"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter the desired principal amount"
                min={0}
              />
              <div className="p-1.5 bg-input-text rounded-md px-4">USD</div>
            </div>
          </div>
          {error && <p className="text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              data-testid="facility-partial-payment-submit-button"
            >
              Process Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
