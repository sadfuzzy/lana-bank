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
import { useCreditFacilityDisbursementApproveMutation } from "@/lib/graphql/generated"

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
  onSuccess?: () => void
}

export const CreditFacilityDisbursementApproveDialog: React.FC<
  CreditFacilityDisbursementApproveDialogProps
> = ({ setOpenDialog, openDialog, creditFacilityId, disbursementIdx, onSuccess }) => {
  const [approveDisbursement, { loading, reset }] =
    useCreditFacilityDisbursementApproveMutation()
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

  return (
    <Dialog open={openDialog} onOpenChange={handleCloseDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Credit Facility Disbursement</DialogTitle>
          <DialogDescription>
            Are you sure you want to approve this disbursement?
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-destructive mb-4">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Approving..." : "Approve Disbursement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
