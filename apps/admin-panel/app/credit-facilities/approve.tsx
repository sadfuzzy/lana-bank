import React, { useState } from "react"
import { gql } from "@apollo/client"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/primitive/dialog"
import { Button } from "@/components/primitive/button"
import {
  CreditFacility,
  GetCreditFacilityDetailsDocument,
  useCreditFacilityApproveMutation,
  useGetRealtimePriceUpdatesQuery,
} from "@/lib/graphql/generated"
import { DetailItem, DetailsGroup } from "@/components/details"
import Balance from "@/components/balance/balance"
import { formatDate } from "@/lib/utils"

gql`
  mutation CreditFacilityApprove($input: CreditFacilityApproveInput!) {
    creditFacilityApprove(input: $input) {
      creditFacility {
        id
        creditFacilityId
      }
    }
  }
`

type CreditFacilityApproveDialogProps = {
  setOpenDialog: (isOpen: boolean) => void
  openDialog: boolean
  creditFacilityDetails: CreditFacility
  onSuccess?: () => void
}

export const CreditFacilityApproveDialog: React.FC<CreditFacilityApproveDialogProps> = ({
  setOpenDialog,
  openDialog,
  creditFacilityDetails,
  onSuccess,
}) => {
  const { data: session } = useSession()
  const creditFacilityId = creditFacilityDetails.creditFacilityId
  const [approveCreditFacility, { loading, reset }] = useCreditFacilityApproveMutation({
    refetchQueries: [GetCreditFacilityDetailsDocument],
  })
  const [error, setError] = useState<string | null>(null)
  const { data: priceInfo } = useGetRealtimePriceUpdatesQuery({
    fetchPolicy: "cache-only",
  })

  const hasApprovals = creditFacilityDetails.approvals.length > 0
  const userHasAlreadyApproved = creditFacilityDetails.approvals
    .map((a) => a.user.email)
    .includes(session?.user?.email || "")
  const canApproveCreditFacility = !userHasAlreadyApproved

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await approveCreditFacility({
        variables: {
          input: {
            creditFacilityId,
          },
        },
        onCompleted: (data) => {
          if (data.creditFacilityApprove) {
            toast.success("Credit facility approved successfully")
            if (onSuccess) onSuccess()
            handleCloseDialog()
          }
        },
      })
    } catch (error) {
      console.error("Error approving credit facility:", error)
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
    reset()
  }

  return (
    <Dialog open={openDialog} onOpenChange={handleCloseDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Credit Facility</DialogTitle>
          <DialogDescription>
            Are you sure you want to approve this credit facility?
          </DialogDescription>
        </DialogHeader>
        <DetailsGroup>
          <DetailItem
            label="Collateral Balance"
            className="px-0"
            value={
              <Balance
                amount={creditFacilityDetails.balance.collateral.btcBalance}
                currency="btc"
              />
            }
          />
          <DetailItem
            label="Expected Collateral to meet target CVL"
            className="px-0"
            value={
              <Balance
                amount={creditFacilityDetails.collateralToMatchInitialCvl}
                currency="btc"
              />
            }
          />
          <DetailItem
            className="px-0"
            label={
              <p className="text-textColor-secondary flex items-center">
                <div className="mr-2">Current CVL (BTC/USD:</div>
                <Balance
                  amount={priceInfo?.realtimePrice.usdCentsPerBtc}
                  currency="usd"
                />
                <div>)</div>
              </p>
            }
            value={`${creditFacilityDetails.currentCvl.total}%`}
          />
          <DetailItem
            className="px-0"
            label="Target (Initial) CVL"
            value={`${creditFacilityDetails.creditFacilityTerms.initialCvl}%`}
          />
          <DetailItem
            className="px-0"
            label="Margin Call CVL"
            value={`${creditFacilityDetails.creditFacilityTerms.marginCallCvl}%`}
          />
        </DetailsGroup>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-destructive">{error}</p>}
          {hasApprovals && (
            <div className="flex flex-col gap-2 mb-2 text-sm">
              {creditFacilityDetails.approvals.map((approval, index) => (
                <p className="text-primary" key={index}>
                  Approved by {approval.user.email} on {formatDate(approval.approvedAt)}
                </p>
              ))}
            </div>
          )}
          {userHasAlreadyApproved && (
            <p className="text-success text-sm">
              You have already approved this credit facility
            </p>
          )}
          {!userHasAlreadyApproved && (
            <DialogFooter className="mt-4">
              <Button type="button" variant="ghost" onClick={handleCloseDialog}>
                Cancel
              </Button>
              {canApproveCreditFacility && (
                <Button type="submit" loading={loading}>
                  Approve
                </Button>
              )}
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
