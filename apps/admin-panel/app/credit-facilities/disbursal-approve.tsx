"use client"

import React from "react"

import ApprovalDialog from "../actions/approve"

import DenialDialog from "../actions/deny"

import { VotersCard } from "../disbursals/[disbursal-id]/voters"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog"
import { Button } from "@/ui/button"
import {
  ApprovalProcess,
  ApprovalProcessStatus,
  GetCreditFacilityDetailsQuery,
} from "@/lib/graphql/generated"
import Balance from "@/components/balance/balance"
import { formatDate } from "@/lib/utils"
import { DetailItem, DetailsGroup } from "@/components/details"

type CreditFacilityDisbursalApproveDialogProps = {
  setOpenDialog: (isOpen: boolean) => void
  openDialog: boolean
  creditFacilityId: string
  disbursalIdx: number
  disbursal: NonNullable<
    GetCreditFacilityDetailsQuery["creditFacility"]
  >["disbursals"][number]
  refetch?: () => void
}

export const CreditFacilityDisbursalApproveDialog: React.FC<
  CreditFacilityDisbursalApproveDialogProps
> = ({ setOpenDialog, openDialog, disbursal, refetch }) => {
  const [openDenialDialog, setOpenDenialDialog] = React.useState(false)
  const [openApprovalDialog, setOpenApprovalDialog] = React.useState(false)

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  return (
    <Dialog open={openDialog} onOpenChange={handleCloseDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Credit Facility Disbursal Approval Process</DialogTitle>
          <DialogDescription>
            Review the disbursal details before approving
          </DialogDescription>
        </DialogHeader>
        <DetailsGroup>
          <DetailItem
            className="px-0"
            label="Amount"
            value={<Balance amount={disbursal.amount} currency="usd" />}
          />
          <DetailItem
            className="px-0"
            label="Created"
            value={formatDate(disbursal.createdAt)}
          />
        </DetailsGroup>
        <VotersCard approvalProcess={disbursal.approvalProcess} />
        <DialogFooter>
          {disbursal.approvalProcess.status === ApprovalProcessStatus.InProgress &&
            disbursal.approvalProcess.subjectCanSubmitDecision && (
              <>
                <Button onClick={() => setOpenApprovalDialog(true)} className="ml-2">
                  Approve
                </Button>
                <Button onClick={() => setOpenDenialDialog(true)} className="ml-2">
                  Deny
                </Button>
              </>
            )}
        </DialogFooter>
      </DialogContent>

      <ApprovalDialog
        approvalProcess={disbursal.approvalProcess as ApprovalProcess}
        openApprovalDialog={openApprovalDialog}
        setOpenApprovalDialog={() => {
          setOpenApprovalDialog(false)
          handleCloseDialog()
        }}
        refetch={refetch}
      />
      <DenialDialog
        approvalProcess={disbursal.approvalProcess as ApprovalProcess}
        openDenialDialog={openDenialDialog}
        setOpenDenialDialog={() => {
          setOpenDenialDialog(false)
          handleCloseDialog()
        }}
        refetch={refetch}
      />
    </Dialog>
  )
}
