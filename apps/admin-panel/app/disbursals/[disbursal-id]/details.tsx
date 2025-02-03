"use client"

import React, { useState } from "react"
import Link from "next/link"

import { Button } from "@lana/web/ui/button"

import { DisbursalStatusBadge } from "../status-badge"

import { DetailsCard, DetailItemProps } from "@/components/details"
import Balance from "@/components/balance/balance"
import { ApprovalProcessStatus, GetDisbursalDetailsQuery } from "@/lib/graphql/generated"
import ApprovalDialog from "@/app/actions/approve"
import DenialDialog from "@/app/actions/deny"

type DisbursalDetailsProps = {
  disbursal: NonNullable<GetDisbursalDetailsQuery["disbursal"]>
}

export const DisbursalDetailsCard: React.FC<DisbursalDetailsProps> = ({ disbursal }) => {
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
        approvalProcess={disbursal.approvalProcess}
        openApprovalDialog={openApprovalDialog}
        setOpenApprovalDialog={() => setOpenApprovalDialog(false)}
      />
      <DenialDialog
        approvalProcess={disbursal.approvalProcess}
        openDenialDialog={openDenialDialog}
        setOpenDenialDialog={() => setOpenDenialDialog(false)}
      />
    </>
  )
}
