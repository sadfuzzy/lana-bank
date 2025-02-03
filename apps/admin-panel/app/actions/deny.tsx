import React from "react"
import { gql, useApolloClient } from "@apollo/client"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@lana/web/ui/dialog"
import { Button } from "@lana/web/ui/button"

import { Textarea } from "@lana/web/ui/textarea"

import {
  ApprovalProcessType,
  GetCreditFacilityBasicDetailsDocument,
  GetCreditFacilityBasicDetailsQuery,
  GetDisbursalDetailsDocument,
  GetWithdrawalDetailsDocument,
  useApprovalProcessDenyMutation,
} from "@/lib/graphql/generated"
import { DetailItem, DetailsGroup } from "@/components/details"
import { formatDate, formatProcessType } from "@/lib/utils"

gql`
  mutation ApprovalProcessDeny($input: ApprovalProcessDenyInput!, $reason: String!) {
    approvalProcessDeny(input: $input, reason: $reason) {
      approvalProcess {
        ...ApprovalProcessFields
      }
    }
  }
`

type DenialDialogProps = {
  setOpenDenialDialog: (isOpen: boolean) => void
  openDenialDialog: boolean
  approvalProcess: NonNullable<
    GetCreditFacilityBasicDetailsQuery["creditFacility"]
  >["approvalProcess"]
}

export const DenialDialog: React.FC<DenialDialogProps> = ({
  setOpenDenialDialog,
  openDenialDialog,
  approvalProcess,
}) => {
  const client = useApolloClient()
  const [error, setError] = React.useState<string | null>(null)
  const [reason, setReason] = React.useState("")
  const [denyProcess, { loading }] = useApprovalProcessDenyMutation({
    update: (cache) => {
      cache.modify({
        fields: {
          creditFacilities: (_, { DELETE }) => DELETE,
          withdrawals: (_, { DELETE }) => DELETE,
          disbursals: (_, { DELETE }) => DELETE,
        },
      })
      cache.gc()
    },
  })

  const handleDeny = async () => {
    setError(null)
    if (!reason.trim()) {
      setError("Please provide a reason for denial")
      return
    }

    try {
      await denyProcess({
        variables: {
          input: {
            processId: approvalProcess.approvalProcessId,
          },
          reason: reason.trim(),
        },
        onCompleted: async ({ approvalProcessDeny }) => {
          const processType = approvalProcessDeny.approvalProcess.approvalProcessType
          if (processType === ApprovalProcessType.CreditFacilityApproval) {
            await client.query({
              query: GetCreditFacilityBasicDetailsDocument,
              variables: { id: approvalProcess.approvalProcessId },
              fetchPolicy: "network-only",
            })
          } else if (processType === ApprovalProcessType.WithdrawalApproval) {
            await client.query({
              query: GetWithdrawalDetailsDocument,
              variables: { id: approvalProcess.approvalProcessId },
              fetchPolicy: "network-only",
            })
          } else if (processType === ApprovalProcessType.DisbursalApproval) {
            await client.query({
              query: GetDisbursalDetailsDocument,
              variables: { id: approvalProcess.approvalProcessId },
              fetchPolicy: "network-only",
            })
          }
          toast.success("Process approved successfully")
        },
      })
      setOpenDenialDialog(false)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An unknown error occurred")
      }
    }
  }

  return (
    <Dialog open={openDenialDialog} onOpenChange={setOpenDenialDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deny Process</DialogTitle>
        </DialogHeader>
        <DetailsGroup layout="horizontal">
          <DetailItem
            label="Process Type"
            value={formatProcessType(approvalProcess?.approvalProcessType)}
          />
          <DetailItem label="Created At" value={formatDate(approvalProcess?.createdAt)} />
        </DetailsGroup>
        <div className="space-y-2">
          <label htmlFor="reason" className="text-sm font-medium">
            Reason for Denial
          </label>
          <Textarea
            id="reason"
            data-testid="approval-process-dialog-deny-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a reason for denying this process"
            className="min-h-[100px]"
          />
        </div>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => setOpenDenialDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDeny}
            loading={loading}
            data-testid="approval-process-dialog-deny-button"
          >
            Deny
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DenialDialog
