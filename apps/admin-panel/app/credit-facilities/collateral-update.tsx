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
} from "@/components/primitive/dialog"
import { Input } from "@/components/primitive/input"
import { Button } from "@/components/primitive/button"
import { Label } from "@/components/primitive/label"
import {
  GetCreditFacilityDetailsDocument,
  useCreditFacilityCollateralUpdateMutation,
} from "@/lib/graphql/generated"
import { currencyConverter } from "@/lib/utils"

gql`
  mutation CreditFacilityCollateralUpdate($input: CreditFacilityCollateralUpdateInput!) {
    creditFacilityCollateralUpdate(input: $input) {
      creditFacility {
        id
        creditFacilityId
      }
    }
  }
`

type CreditFacilityCollateralUpdateDialogProps = {
  setOpenDialog: (isOpen: boolean) => void
  openDialog: boolean
  creditFacilityId: string
  onSuccess?: () => void
}

export const CreditFacilityCollateralUpdateDialog: React.FC<
  CreditFacilityCollateralUpdateDialogProps
> = ({ setOpenDialog, openDialog, creditFacilityId, onSuccess }) => {
  const [updateCollateral, { loading, reset }] =
    useCreditFacilityCollateralUpdateMutation({
      refetchQueries: [GetCreditFacilityDetailsDocument],
    })
  const [collateral, setCollateral] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await updateCollateral({
        variables: {
          input: {
            creditFacilityId,
            collateral: currencyConverter.btcToSatoshi(Number(collateral)),
          },
        },
        onCompleted: (data) => {
          if (data.creditFacilityCollateralUpdate) {
            toast.success("Credit facility collateral updated successfully")
            if (onSuccess) onSuccess()
            handleCloseDialog()
          }
        },
      })
    } catch (error) {
      console.error("Error updating credit facility collateral:", error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An unknown error occurred")
      }
    }
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setCollateral("")
    setError(null)
    reset()
  }

  return (
    <Dialog open={openDialog} onOpenChange={handleCloseDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Credit Facility Collateral</DialogTitle>
          <DialogDescription>
            Enter the new collateral amount for this credit facility.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="collateral">Collateral</Label>
            <div className="flex items-center gap-1">
              <Input
                id="collateral"
                type="number"
                step="0.00000001"
                required
                placeholder="Enter collateral amount"
                value={collateral}
                onChange={(e) => setCollateral(e.target.value)}
              />
              <div className="p-1.5 bg-input-text rounded-md px-4">BTC</div>
            </div>
          </div>
          {error && <p className="text-destructive mb-4">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Update Collateral
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
