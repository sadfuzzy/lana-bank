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
  GetCreditFacilityDetailsDocument,
  useCreditFacilityDisbursementApproveMutation,
} from "@/lib/graphql/generated"
import Balance from "@/components/balance/balance"
import { formatDate } from "@/lib/utils"
import { DetailItem, DetailsGroup } from "@/components/details"

gql`
  mutation CreditFacilityDisbursementApprove(
    $input: CreditFacilityDisbursementApproveInput!
  ) {
    creditFacilityDisbursementApprove(input: $input) {
      disbursement {
        id
        index
      }
    }
  }
`

type CreditFacilityDisbursementApproveDialogProps = {
  setOpenDialog: (isOpen: boolean) => void
  openDialog: boolean
  creditFacilityId: string
  disbursementIdx: number
  disbursement: {
    id: string
    index: number
    amount: number
    status: string
    approvals: {
      approvedAt: string
      user: {
        userId: string
        email: string
        roles: string[]
      }
    }[]
    createdAt: string
  }
  onSuccess?: () => void
}

export const CreditFacilityDisbursementApproveDialog: React.FC<
  CreditFacilityDisbursementApproveDialogProps
> = ({
  setOpenDialog,
  openDialog,
  creditFacilityId,
  disbursementIdx,
  disbursement,
  onSuccess,
}) => {
  const { data: session } = useSession()
  const [approveDisbursement, { loading, reset }] =
    useCreditFacilityDisbursementApproveMutation({
      refetchQueries: [GetCreditFacilityDetailsDocument],
    })
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await approveDisbursement({
        variables: {
          input: {
            creditFacilityId,
            disbursementIdx,
          },
        },
        onCompleted: (data) => {
          if (data.creditFacilityDisbursementApprove) {
            toast.success("Disbursement approved successfully")
            if (onSuccess) onSuccess()
            handleCloseDialog()
          }
        },
      })
    } catch (error) {
      console.error("Error approving disbursement:", error)
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

  const hasApprovals = disbursement.approvals.length > 0
  const userHasAlreadyApproved = disbursement.approvals
    .map((a) => a.user.email)
    .includes(session?.user?.email || "")

  return (
    <Dialog open={openDialog} onOpenChange={handleCloseDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Credit Facility Disbursement</DialogTitle>
          <DialogDescription>
            Review the disbursement details before approving.
          </DialogDescription>
        </DialogHeader>
        <DetailsGroup>
          <DetailItem
            className="px-0"
            label="ID"
            value={disbursement.id.split("disbursement:")[1]}
          />
          <DetailItem
            className="px-0"
            label="Amount"
            valueComponent={<Balance amount={disbursement.amount} currency="usd" />}
          />
          <DetailItem
            className="px-0"
            label="Created"
            value={formatDate(disbursement.createdAt)}
          />
        </DetailsGroup>
        <div className="text-sm">
          {userHasAlreadyApproved && (
            <span className="text-primary mb-2">You have already approved this loan</span>
          )}
          {hasApprovals && !userHasAlreadyApproved && (
            <div className="flex flex-col gap-2 mb-2">
              {disbursement.approvals.map((approval, index) => (
                <p className="text-primary" key={index}>
                  Approved by {approval.user.email} on {formatDate(approval.approvedAt)}
                </p>
              ))}
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-destructive mb-4">{error}</p>}
          {!userHasAlreadyApproved && (
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Approving..." : "Approve Disbursement"}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
