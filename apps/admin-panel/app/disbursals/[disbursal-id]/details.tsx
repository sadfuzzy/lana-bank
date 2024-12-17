"use client"

import React, { useState } from "react"
import Link from "next/link"

import { DisbursalStatusBadge } from "../status-badge"

import { DetailsCard, DetailItemProps } from "@/components/details"
import { Button } from "@/ui/button"
import Balance from "@/components/balance/balance"
import {
  ApprovalProcess,
  ApprovalProcessStatus,
  GetDisbursalDetailsQuery,
} from "@/lib/graphql/generated"
import ApprovalDialog from "@/app/actions/approve"
import DenialDialog from "@/app/actions/deny"

type DisbursalDetailsProps = {
  disbursal: NonNullable<GetDisbursalDetailsQuery["disbursal"]>
  refetch: () => void
}

export const DisbursalDetailsCard: React.FC<DisbursalDetailsProps> = ({
  disbursal,
  refetch,
}) => {
  const [openApprovalDialog, setOpenApprovalDialog] = useState(false)
  const [openDenialDialog, setOpenDenialDialog] = useState(false)

  const details: DetailItemProps[] = [
    {
      label: "Customer Email",
      value: disbursal.creditFacility.customer.email,
      href: `/customers/${disbursal.creditFacility.customer.customerId}`,
    },
    {
      label: "Disbursal Amount",
      value: <Balance amount={disbursal.amount} currency="usd" />,
    },
    {
      label: "Facility Amount",
      value: <Balance amount={disbursal.creditFacility.facilityAmount} currency="usd" />,
    },
    {
      label: "Status",
      value: (
        <DisbursalStatusBadge
          status={disbursal.status}
          data-testid="disbursal-status-badge"
        />
      ),
    },
  ]

  const footerContent = (
    <>
      {disbursal.approvalProcess?.status === ApprovalProcessStatus.InProgress &&
        disbursal.approvalProcess.subjectCanSubmitDecision && (
          <>
            <Button
              data-testid="disbursal-approve-button"
              onClick={() => setOpenApprovalDialog(true)}
              variant="outline"
            >
              Approve
            </Button>
            <Button
              data-testid="disbursal-deny-button"
              onClick={() => setOpenDenialDialog(true)}
              variant="outline"
            >
              Deny
            </Button>
          </>
        )}
      <Link href={`/credit-facilities/${disbursal.creditFacility.creditFacilityId}`}>
        <Button variant="outline">View Credit Facility</Button>
      </Link>
    </>
  )

  return (
    <>
      <DetailsCard
        title="Disbursal"
        details={details}
        footerContent={footerContent}
        errorMessage={disbursal.approvalProcess.deniedReason}
      />
      <ApprovalDialog
        approvalProcess={disbursal.approvalProcess as ApprovalProcess}
        openApprovalDialog={openApprovalDialog}
        setOpenApprovalDialog={() => setOpenApprovalDialog(false)}
        refetch={refetch}
      />
      <DenialDialog
        approvalProcess={disbursal.approvalProcess as ApprovalProcess}
        openDenialDialog={openDenialDialog}
        setOpenDenialDialog={() => setOpenDenialDialog(false)}
        refetch={refetch}
      />
    </>
  )
}
