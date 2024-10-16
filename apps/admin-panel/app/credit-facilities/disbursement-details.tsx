import React from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/primitive/dialog"
import Balance from "@/components/balance/balance"
import { formatDate } from "@/lib/utils"
import { DetailItem, DetailsGroup } from "@/components/details"

type DisbursementDetailsDialogProps = {
  setOpenDialog: (isOpen: boolean) => void
  openDialog: boolean
  disbursement: {
    id: string
    index: number
    amount: number
    status: string
    approvals?: {
      approvedAt: string
      user: {
        userId: string
        email: string
        roles: string[]
      }
    }[]
    createdAt: string
  }
}

export const DisbursementDetailsDialog: React.FC<DisbursementDetailsDialogProps> = ({
  setOpenDialog,
  openDialog,
  disbursement,
}) => {
  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const hasApprovals = disbursement.approvals && disbursement.approvals.length > 0

  return (
    <Dialog open={openDialog} onOpenChange={handleCloseDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Disbursement Details</DialogTitle>
          <DialogDescription>View the details of this disbursement.</DialogDescription>
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
            value={<Balance amount={disbursement.amount} currency="usd" />}
          />
          <DetailItem
            className="px-0"
            label="Created"
            value={formatDate(disbursement.createdAt)}
          />
        </DetailsGroup>
        <div className="text-sm mt-4 text-primary">
          {hasApprovals ? (
            <div className="flex flex-col gap-2">
              {disbursement.approvals!.map((approval, index) => (
                <p key={index}>
                  Approved by {approval.user.email} on {formatDate(approval.approvedAt)}
                </p>
              ))}
            </div>
          ) : (
            <p>No approvals yet.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
