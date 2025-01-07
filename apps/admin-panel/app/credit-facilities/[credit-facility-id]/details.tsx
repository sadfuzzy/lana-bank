"use client"

import React from "react"

import { CreditFacilityCollateralUpdateDialog } from "../collateral-update"

import {
  ApprovalProcess,
  ApprovalProcessStatus,
  GetCreditFacilityBasicDetailsQuery,
} from "@/lib/graphql/generated"
import { Button } from "@/ui/button"
import Balance from "@/components/balance/balance"
import { formatCollateralizationState } from "@/lib/utils"
import { LoanAndCreditFacilityStatusBadge } from "@/app/loans/status-badge"

import ApprovalDialog from "@/app/actions/approve"
import DenialDialog from "@/app/actions/deny"
import { DetailsCard, DetailItemProps } from "@/components/details"

type CreditFacilityDetailsProps = {
  creditFacilityId: string
  creditFacilityDetails: NonNullable<GetCreditFacilityBasicDetailsQuery["creditFacility"]>
  refetch: () => void
}

const CreditFacilityDetailsCard: React.FC<CreditFacilityDetailsProps> = ({
  creditFacilityId,
  creditFacilityDetails,
  refetch,
}) => {
  const [openCollateralUpdateDialog, setOpenCollateralUpdateDialog] =
    React.useState(false)

  const [openApprovalDialog, setOpenApprovalDialog] = React.useState(false)
  const [openDenialDialog, setOpenDenialDialog] = React.useState(false)

  const details: DetailItemProps[] = [
    {
      label: "Customer Email",
      value: creditFacilityDetails.customer.email,
      href: `/customers/${creditFacilityDetails.customer.customerId}`,
    },
    {
      label: "Collateralization State",
      value: formatCollateralizationState(creditFacilityDetails.collateralizationState),
    },
    {
      label: "Facility Amount",
      value: <Balance amount={creditFacilityDetails.facilityAmount} currency="usd" />,
    },
    {
      label: "Status",
      value: (
        <LoanAndCreditFacilityStatusBadge
          data-testid="credit-facility-status-badge"
          status={creditFacilityDetails.status}
        />
      ),
    },
  ]

  const footerContent = (
    <>
      {creditFacilityDetails.subjectCanUpdateCollateral && (
        <Button
          variant="outline"
          data-testid="update-collateral-button"
          onClick={() => setOpenCollateralUpdateDialog(true)}
        >
          Update Collateral
        </Button>
      )}
      {creditFacilityDetails.approvalProcess.status ===
        ApprovalProcessStatus.InProgress &&
        creditFacilityDetails.approvalProcess.subjectCanSubmitDecision && (
          <>
            <Button
              data-testid="credit-facility-approve-button"
              variant="outline"
              onClick={() => setOpenApprovalDialog(true)}
            >
              Approve
            </Button>
            <Button
              data-testid="credit-facility-deny-button"
              variant="outline"
              onClick={() => setOpenDenialDialog(true)}
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
        title="Credit Facility"
        details={details}
        footerContent={footerContent}
        errorMessage={creditFacilityDetails.approvalProcess.deniedReason}
      />

      <CreditFacilityCollateralUpdateDialog
        creditFacilityId={creditFacilityId}
        openDialog={openCollateralUpdateDialog}
        setOpenDialog={setOpenCollateralUpdateDialog}
      />
      <ApprovalDialog
        approvalProcess={creditFacilityDetails?.approvalProcess as ApprovalProcess}
        openApprovalDialog={openApprovalDialog}
        setOpenApprovalDialog={() => {
          setOpenApprovalDialog(false)
        }}
        refetch={refetch}
      />
      <DenialDialog
        approvalProcess={creditFacilityDetails?.approvalProcess as ApprovalProcess}
        openDenialDialog={openDenialDialog}
        setOpenDenialDialog={() => {
          setOpenDenialDialog(false)
        }}
        refetch={refetch}
      />
    </>
  )
}

export default CreditFacilityDetailsCard
