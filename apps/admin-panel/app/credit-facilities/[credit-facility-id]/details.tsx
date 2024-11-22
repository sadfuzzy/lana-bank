"use client"

import React from "react"

import { CreditFacilityCollateralUpdateDialog } from "../collateral-update"

import { CreditFacilityApproveDialog } from "../approve"

import { CreditFacilityDisbursalInitiateDialog } from "../disbursal-initiate"

import { CreditFacilityPartialPaymentDialog } from "../partial-payment"

import {
  ApprovalProcess,
  ApprovalProcessStatus,
  CreditFacility,
  CreditFacilityStatus,
  GetCreditFacilityDetailsQuery,
} from "@/lib/graphql/generated"
import { Button } from "@/ui/button"
import Balance from "@/components/balance/balance"
import { formatCollateralizationState } from "@/lib/utils"
import { LoanAndCreditFacilityStatusBadge } from "@/app/loans/status-badge"

import ApprovalDialog from "@/app/approval-process/approve"
import DenialDialog from "@/app/approval-process/deny"
import { DetailsCard, DetailItemProps } from "@/components/details"

type CreditFacilityDetailsProps = {
  creditFacilityId: string
  creditFacilityDetails: NonNullable<GetCreditFacilityDetailsQuery["creditFacility"]>
  refetch: () => void
}

const CreditFacilityDetailsCard: React.FC<CreditFacilityDetailsProps> = ({
  creditFacilityId,
  creditFacilityDetails,
  refetch,
}) => {
  const [openCollateralUpdateDialog, setOpenCollateralUpdateDialog] =
    React.useState(false)
  const [openDisbursalInitiateDialog, setOpenDisbursalInitiateDialog] =
    React.useState(false)
  const [openApprovalDialog, setOpenApprovalDialog] = React.useState(false)
  const [openDenialDialog, setOpenDenialDialog] = React.useState(false)
  const [openApproveDialog, setOpenApproveDialog] = React.useState(false)
  const [openPartialPaymentDialog, setOpenPartialPaymentDialog] = React.useState(false)

  const details: DetailItemProps[] = [
    {
      label: "Customer Email",
      value: "siddharthtiwarikreplin12@gmail.com",
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
      {creditFacilityDetails.subjectCanInitiateDisbursal &&
        creditFacilityDetails.status === CreditFacilityStatus.Active && (
          <Button
            variant="outline"
            data-testid="initiate-disbursal-button"
            onClick={() => setOpenDisbursalInitiateDialog(true)}
          >
            Initiate Disbursal
          </Button>
        )}
      {creditFacilityDetails.subjectCanRecordPayment &&
        creditFacilityDetails.status === CreditFacilityStatus.Active && (
          <Button
            variant="outline"
            data-testid="make-payment-button"
            onClick={() => setOpenPartialPaymentDialog(true)}
          >
            Make Payment
          </Button>
        )}
      {creditFacilityDetails.approvalProcess.status ===
        ApprovalProcessStatus.InProgress &&
        creditFacilityDetails.approvalProcess.subjectCanSubmitDecision && (
          <>
            <Button variant="outline" onClick={() => setOpenApprovalDialog(true)}>
              Approve
            </Button>
            <Button variant="outline" onClick={() => setOpenDenialDialog(true)}>
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
      <CreditFacilityDisbursalInitiateDialog
        creditFacilityId={creditFacilityId}
        openDialog={openDisbursalInitiateDialog}
        setOpenDialog={setOpenDisbursalInitiateDialog}
      />
      <CreditFacilityApproveDialog
        creditFacilityDetails={creditFacilityDetails as CreditFacility}
        openDialog={openApproveDialog}
        setOpenDialog={setOpenApproveDialog}
      />
      <CreditFacilityPartialPaymentDialog
        creditFacilityId={creditFacilityId}
        openDialog={openPartialPaymentDialog}
        setOpenDialog={setOpenPartialPaymentDialog}
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
