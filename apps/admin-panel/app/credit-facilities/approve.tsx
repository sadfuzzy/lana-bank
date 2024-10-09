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
import {
  GetCreditFacilityDetailsDocument,
  useCreditFacilityApproveMutation,
} from "@/lib/graphql/generated"

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
  creditFacilityId: string
  onSuccess?: () => void
}

export const CreditFacilityApproveDialog: React.FC<CreditFacilityApproveDialogProps> = ({
  setOpenDialog,
  openDialog,
  creditFacilityId,
  onSuccess,
}) => {
  const [approveCreditFacility, { loading, reset }] = useCreditFacilityApproveMutation({
    refetchQueries: [GetCreditFacilityDetailsDocument],
  })
  const [error, setError] = useState<string | null>(null)

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
        <form onSubmit={handleSubmit}>
          {error && <p className="text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleCloseDialog}>
              Back
            </Button>
            <Button type="submit" loading={loading}>
              Approve
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
