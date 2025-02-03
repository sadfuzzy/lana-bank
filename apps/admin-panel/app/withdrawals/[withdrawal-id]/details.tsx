"use client"

import React, { useState } from "react"

import { Button } from "@lana/web/ui/button"

import { WithdrawalStatusBadge } from "../status-badge"

import { WithdrawalConfirmDialog } from "./confirm"
import { WithdrawalCancelDialog } from "./cancel"

import { DetailsCard, DetailItemProps } from "@/components/details"
import Balance from "@/components/balance/balance"
import {
  ApprovalProcessStatus,
  GetWithdrawalDetailsQuery,
  WithdrawalStatus,
} from "@/lib/graphql/generated"
import ApprovalDialog from "@/app/actions/approve"
import DenialDialog from "@/app/actions/deny"
import { VotersCard } from "@/app/disbursals/[disbursal-id]/voters"

type WithdrawalDetailsProps = {
  withdrawal: NonNullable<GetWithdrawalDetailsQuery["withdrawal"]>
}

const WithdrawalDetailsCard: React.FC<WithdrawalDetailsProps> = ({ withdrawal }) => {
  const [openWithdrawalCancelDialog, setOpenWithdrawalCancelDialog] = useState<
    GetWithdrawalDetailsQuery["withdrawal"] | null
  >(null)
  const [openWithdrawalConfirmDialog, setOpenWithdrawalConfirmDialog] = useState<
    GetWithdrawalDetailsQuery["withdrawal"] | null
  >(null)
  const [openApprovalDialog, setOpenApprovalDialog] = useState(false)
  const [openDenialDialog, setOpenDenialDialog] = useState(false)

  const details: DetailItemProps[] = [
    {
      label: "Customer Email",
      value: withdrawal.account.customer.email,
      href: `/customers/${withdrawal.account.customer.customerId}`,
    },
    {
      label: "Withdrawal Amount",
      value: <Balance amount={withdrawal.amount} currency="usd" />,
    },
    {
      label: "Withdrawal Reference",
      value:
        withdrawal.reference === withdrawal.withdrawalId ? "N/A" : withdrawal.reference,
    },
    {
      label: "Status",
      value: <WithdrawalStatusBadge status={withdrawal.status} />,
      valueTestId: "withdrawal-status-badge",
    },
  ]

  const footerContent = (
    <>
      {withdrawal.status === WithdrawalStatus.PendingConfirmation && (
        <>
          <Button
            onClick={() => setOpenWithdrawalConfirmDialog(withdrawal)}
            data-testid="withdraw-confirm-button"
            variant="outline"
          >
            Confirm
          </Button>
          <Button
            data-testid="withdraw-cancel-button"
            variant="outline"
            onClick={() => setOpenWithdrawalCancelDialog(withdrawal)}
          >
            Cancel
          </Button>
        </>
      )}
      {withdrawal?.approvalProcess.status === ApprovalProcessStatus.InProgress &&
        withdrawal.approvalProcess.subjectCanSubmitDecision && (
          <>
            <Button
              variant="outline"
              onClick={() => setOpenApprovalDialog(true)}
              data-testid="approval-process-approve-button"
            >
              Approve
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpenDenialDialog(true)}
              data-testid="approval-process-deny-button"
            >
              Deny
            </Button>
          </>
        )}
    </>
  )

  return (
    <>
      <DetailsCard
        title="Withdrawal"
        details={details}
        footerContent={footerContent}
        errorMessage={withdrawal.approvalProcess.deniedReason}
        className="max-w-7xl m-auto"
      />
      <VotersCard approvalProcess={withdrawal.approvalProcess} />
      {openWithdrawalConfirmDialog && (
        <WithdrawalConfirmDialog
          withdrawalData={openWithdrawalConfirmDialog}
          openWithdrawalConfirmDialog={Boolean(openWithdrawalConfirmDialog)}
          setOpenWithdrawalConfirmDialog={() => setOpenWithdrawalConfirmDialog(null)}
        />
      )}
      {openWithdrawalCancelDialog && (
        <WithdrawalCancelDialog
          withdrawalData={openWithdrawalCancelDialog}
          openWithdrawalCancelDialog={Boolean(openWithdrawalCancelDialog)}
          setOpenWithdrawalCancelDialog={() => setOpenWithdrawalCancelDialog(null)}
        />
      )}
      <ApprovalDialog
        approvalProcess={withdrawal?.approvalProcess}
        openApprovalDialog={openApprovalDialog}
        setOpenApprovalDialog={() => setOpenApprovalDialog(false)}
      />
      <DenialDialog
        approvalProcess={withdrawal?.approvalProcess}
        openDenialDialog={openDenialDialog}
        setOpenDenialDialog={() => setOpenDenialDialog(false)}
      />
    </>
  )
}

export default WithdrawalDetailsCard
