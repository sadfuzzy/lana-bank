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
import { Button } from "@/components/primitive/button"
import { Input } from "@/components/primitive/input"
import { useCollateralUpdateMutation } from "@/lib/graphql/generated"
import { DetailItem, DetailsGroup } from "@/components/details"
import { currencyConverter } from "@/lib/utils"
import Balance from "@/components/balance/balance"
import { Label } from "@/components/primitive/label"

gql`
  mutation CollateralUpdate($input: CollateralUpdateInput!) {
    collateralUpdate(input: $input) {
      loan {
        loanId
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

export function CollateralUpdateDialog({
  setOpenCollateralUpdateDialog,
  openCollateralUpdateDialog,
  loanData,
  refetch,
}: {
  setOpenCollateralUpdateDialog: (isOpen: boolean) => void
  openCollateralUpdateDialog: boolean
  loanData: {
    loanId: string
    existingCollateral: number
  }
  refetch?: () => void
}) {
  const [updateCollateral, { loading, data, reset }] = useCollateralUpdateMutation()
  const [error, setError] = useState<string | null>(null)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [newCollateral, setNewCollateral] = useState(
    currencyConverter.satoshiToBtc(loanData.existingCollateral),
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newCollateral === null) {
      setError("Please enter a valid collateral amount.")
      return
    }
    setError(null)
    try {
      const result = await updateCollateral({
        variables: {
          input: {
            loanId: loanData.loanId,
            collateral: currencyConverter.btcToSatoshi(newCollateral),
          },
        },
      })
      if (result.data) {
        toast.success("Collateral updated successfully")
        setIsSubmitted(true)
        if (refetch) refetch()
      } else {
        throw new Error("No data returned from mutation")
      }
    } catch (error) {
      console.error("Error updating collateral:", error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An unknown error occurred")
      }
    }
  }

  const handleConfirm = () => {
    setIsConfirmed(true)
  }

  const handleCloseDialog = () => {
    setOpenCollateralUpdateDialog(false)
    setError(null)
    setIsConfirmed(false)
    setIsSubmitted(false)
    setNewCollateral(currencyConverter.satoshiToBtc(loanData.existingCollateral))
    reset()
  }

  return (
    <Dialog
      open={openCollateralUpdateDialog}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleCloseDialog()
        }
      }}
    >
      <DialogContent>
        {isSubmitted && data ? (
          <>
            <DialogHeader>
              <DialogTitle>Collateral Updated</DialogTitle>
              <DialogDescription>
                The collateral for the loan has been successfully updated.
              </DialogDescription>
            </DialogHeader>
            <DetailsGroup>
              <DetailItem
                className="text-sm"
                label="Loan ID"
                value={data.collateralUpdate.loan.loanId}
              />
              <DetailItem
                className="text-sm"
                label="New Collateral"
                valueComponent={
                  <Balance
                    amount={data.collateralUpdate.loan.balance.collateral.btcBalance}
                    currency="btc"
                  />
                }
              />
            </DetailsGroup>
            <DialogFooter>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogFooter>
          </>
        ) : isConfirmed ? (
          <>
            {console.log(newCollateral)}
            <DialogHeader>
              <DialogTitle>Confirm Update</DialogTitle>
              <DialogDescription>
                Are you sure you want to update the collateral for this loan?
              </DialogDescription>
            </DialogHeader>
            <form className="flex flex-col gap-4 text-sm" onSubmit={handleSubmit}>
              <DetailsGroup>
                <DetailItem className="text-sm" label="Loan ID" value={loanData.loanId} />
                <DetailItem
                  className="text-sm"
                  label="Current Collateral"
                  valueComponent={
                    <Balance amount={loanData.existingCollateral} currency="btc" />
                  }
                />
                <DetailItem
                  className="text-sm"
                  label="New Collateral"
                  valueComponent={
                    <Balance
                      amount={currencyConverter.btcToSatoshi(newCollateral)}
                      currency="btc"
                    />
                  }
                />
              </DetailsGroup>
              {error && <p className="text-destructive">{error}</p>}
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Confirm"}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Update Collateral</DialogTitle>
              <DialogDescription>
                Enter the new collateral amount for this loan.
              </DialogDescription>
            </DialogHeader>
            <form className="flex flex-col gap-4" onSubmit={handleConfirm}>
              <div className="bg-secondary-foreground p-2 rounded-md text-sm">
                <DetailsGroup>
                  <DetailItem label="Loan ID" value={loanData.loanId} />
                  <DetailItem
                    label="Current Collateral"
                    valueComponent={
                      <Balance amount={loanData.existingCollateral} currency="btc" />
                    }
                  />
                </DetailsGroup>
              </div>
              <div>
                <Label>New Collateral</Label>
                <Input
                  type="number"
                  value={newCollateral !== null ? newCollateral : ""}
                  onChange={(e) => setNewCollateral(parseFloat(e.target.value))}
                  placeholder="Enter new collateral amount"
                />
              </div>
              {error && <p className="text-destructive">{error}</p>}
              <DialogFooter>
                <Button type="submit" onClick={handleConfirm}>
                  Proceed to Confirm
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
