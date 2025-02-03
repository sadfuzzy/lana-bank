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

import {
  useCreditFacilityCollateralUpdateMutation,
  useGetCreditFacilityOverviewQuery,
} from "@/lib/graphql/generated"
import { DetailItem, DetailsGroup } from "@/components/details"
import { currencyConverter } from "@/lib/utils"
import Balance from "@/components/balance/balance"
import { Satoshis } from "@/types"

gql`
  mutation CreditFacilityCollateralUpdate($input: CreditFacilityCollateralUpdateInput!) {
    creditFacilityCollateralUpdate(input: $input) {
      creditFacility {
        id
        creditFacilityId
        balance {
          collateral {
            btcBalance
          }
        }
        ...CreditFacilityTransactionsFragment
        ...CreditFacilityOverviewFragment
        ...CreditFacilityBasicDetailsFragment
      }
    }
  }
`

type CreditFacilityCollateralUpdateDialogProps = {
  setOpenDialog: (isOpen: boolean) => void
  openDialog: boolean
  creditFacilityId: string
}

export const CreditFacilityCollateralUpdateDialog: React.FC<
  CreditFacilityCollateralUpdateDialogProps
> = ({ setOpenDialog, openDialog, creditFacilityId }) => {
  const [updateCollateral, { loading, reset }] =
    useCreditFacilityCollateralUpdateMutation()
  const [error, setError] = useState<string | null>(null)
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false)
  const [newCollateral, setNewCollateral] = useState<string>("")

  const { data: creditFacilityDetails } = useGetCreditFacilityOverviewQuery({
    variables: { id: creditFacilityId },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newCollateral === "") {
      setError("Please enter a valid collateral amount.")
      return
    }
    setError(null)
    try {
      const result = await updateCollateral({
        variables: {
          input: {
            creditFacilityId,
            collateral: currencyConverter.btcToSatoshi(Number(newCollateral)),
          },
        },
      })
      if (result.data) {
        toast.success("Credit facility collateral updated successfully")
        handleCloseDialog()
      } else {
        throw new Error("No data returned from mutation")
      }
    } catch (error) {
      console.error("Error updating credit facility collateral:", error)
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
    setError(null)
    setIsConfirmed(false)
    reset()
    setOpenDialog(false)
    setNewCollateral("")
  }

  const currentCollateral =
    creditFacilityDetails?.creditFacility?.balance?.collateral?.btcBalance || 0

  return (
    <Dialog open={openDialog} onOpenChange={handleCloseDialog}>
      <DialogContent>
        {isConfirmed ? (
          <>
            <DialogHeader>
              <DialogTitle>Confirm Update</DialogTitle>
              <DialogDescription>
                Are you sure you want to update the collateral for this credit facility?
              </DialogDescription>
            </DialogHeader>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <input
                type="text"
                className="sr-only"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Backspace") {
                    e.preventDefault()
                    setIsConfirmed(false)
                  }
                }}
              />
              <DetailsGroup layout="horizontal">
                <DetailItem
                  label="Current Collateral"
                  value={
                    <Balance amount={currentCollateral as Satoshis} currency="btc" />
                  }
                />
                <DetailItem
                  label="New Collateral"
                  value={
                    <Balance
                      amount={currencyConverter.btcToSatoshi(Number(newCollateral))}
                      currency="btc"
                    />
                  }
                />
              </DetailsGroup>
              {error && <p className="text-destructive">{error}</p>}
              <DialogFooter>
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    setIsConfirmed(false)
                  }}
                  variant="ghost"
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  data-testid="confirm-update-button"
                >
                  {loading ? "Updating..." : "Confirm"}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Update Credit Facility Collateral</DialogTitle>
              <DialogDescription>
                Enter the new collateral amount for this credit facility.
              </DialogDescription>
            </DialogHeader>
            <form className="flex flex-col gap-4" onSubmit={handleConfirm}>
              <div className="rounded-md">
                <DetailsGroup layout="horizontal">
                  <DetailItem
                    label="Current Collateral"
                    value={
                      <Balance amount={currentCollateral as Satoshis} currency="btc" />
                    }
                    data-testid="current-collateral-balance"
                  />
                  {creditFacilityDetails?.creditFacility?.collateralToMatchInitialCvl && (
                    <DetailItem
                      label="Expected Collateral"
                      value={
                        <Balance
                          amount={
                            creditFacilityDetails?.creditFacility
                              ?.collateralToMatchInitialCvl
                          }
                          currency="btc"
                        />
                      }
                      data-testid="expected-collateral-balance"
                    />
                  )}
                </DetailsGroup>
              </div>
              <div>
                <Label>New Collateral</Label>
                <div className="flex items-center gap-1">
                  <Input
                    autoFocus
                    type="number"
                    value={newCollateral}
                    onChange={(e) => setNewCollateral(e.target.value)}
                    placeholder="Enter new collateral amount"
                    step="0.00000001"
                    data-testid="new-collateral-input"
                  />
                  <div className="p-1.5 bg-input-text rounded-md px-4">BTC</div>
                </div>
              </div>
              {error && <p className="text-destructive">{error}</p>}
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleConfirm}
                  data-testid="proceed-to-confirm-button"
                >
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
