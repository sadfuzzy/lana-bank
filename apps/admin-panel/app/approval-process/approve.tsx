import React from "react"
import { gql } from "@apollo/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/primitive/dialog"
import { Button } from "@/components/primitive/button"
import { useApprovalProcessApproveMutation } from "@/lib/graphql/generated"

gql`
  mutation ApprovalProcessApprove($input: ApprovalProcessApproveInput!) {
    approvalProcessApprove(input: $input) {
      approvalProcess {
        id
        approvalProcessId
        processType
        createdAt
      }
    }
  }
`

type ApprovalDialogProps = {
  setOpenApprovalDialog: (isOpen: boolean) => void
  openApprovalDialog: boolean
  processId: string
  refetch?: () => void
}

export const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  setOpenApprovalDialog,
  openApprovalDialog,
  processId,
  refetch,
}) => {
  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)
  const [approveProcess, { loading }] = useApprovalProcessApproveMutation()

  const handleApprove = async () => {
    setError(null)
    try {
      await approveProcess({
        variables: {
          input: {
            processId,
          },
        },
        onCompleted: (data) => {
          toast.success("Process approved successfully")
          if (refetch) refetch()
          router.push(
            `/approval-processes/${data.approvalProcessApprove.approvalProcess.approvalProcessId}`,
          )
        },
      })
      setOpenApprovalDialog(false)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An unknown error occurred")
      }
    }
  }

  return (
    <Dialog open={openApprovalDialog} onOpenChange={setOpenApprovalDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Approve Process</DialogTitle>
        </DialogHeader>
        <p>{processId}</p>
        {error && <p className="text-destructive text-sm">{error}</p>}

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button onClick={() => setOpenApprovalDialog(false)} className="mt-2 sm:mt-0">
            Cancel
          </Button>
          <Button onClick={handleApprove} disabled={loading}>
            {loading ? "Approving..." : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ApprovalDialog
