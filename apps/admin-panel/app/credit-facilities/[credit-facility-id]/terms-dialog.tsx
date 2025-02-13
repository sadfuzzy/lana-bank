"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@lana/web/ui/dialog"

import { GetCreditFacilityLayoutDetailsQuery } from "@/lib/graphql/generated"
import { formatDate, formatInterval, formatPeriod } from "@/lib/utils"
import { DetailsCard, DetailItemProps } from "@/components/details"

type CreditFacilityTermsDialogProps = {
  openTermsDialog: boolean
  setOpenTermsDialog: (isOpen: boolean) => void
  creditFacility: NonNullable<GetCreditFacilityLayoutDetailsQuery["creditFacility"]>
}

export const CreditFacilityTermsDialog: React.FC<CreditFacilityTermsDialogProps> = ({
  openTermsDialog,
  setOpenTermsDialog,
  creditFacility,
}) => {
  const details: DetailItemProps[] = [
    {
      label: "Duration",
      value: `${creditFacility.creditFacilityTerms.duration.units} ${formatPeriod(
        creditFacility.creditFacilityTerms.duration.period,
      )}`,
    },
    {
      label: "Interest (APR)",
      value: `${creditFacility.creditFacilityTerms.annualRate}%`,
    },
    {
      label: "Accrual Interval",
      value: formatInterval(creditFacility.creditFacilityTerms.accrualInterval),
    },
    {
      label: "Target/initial CVL %",
      value: `${creditFacility.creditFacilityTerms.initialCvl}%`,
    },
    {
      label: "Margin call CVL %",
      value: `${creditFacility.creditFacilityTerms.marginCallCvl}%`,
    },
    {
      label: "Liquidation CVL %",
      value: `${creditFacility.creditFacilityTerms.liquidationCvl}%`,
    },
    {
      label: "Date created",
      value: formatDate(creditFacility.createdAt),
    },
    {
      label: "Incurrence Interval",
      value: formatInterval(creditFacility.creditFacilityTerms.incurrenceInterval),
    },
    {
      label: "Structuring Fee Rate",
      value: `${creditFacility.creditFacilityTerms.oneTimeFeeRate}%`,
    },
  ]

  return (
    <Dialog open={openTermsDialog} onOpenChange={setOpenTermsDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Credit Facility Terms</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <DetailsCard columns={2} variant="container" details={details} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
