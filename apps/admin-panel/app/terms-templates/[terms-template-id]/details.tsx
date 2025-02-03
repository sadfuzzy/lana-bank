"use client"
import React, { useState } from "react"

import { Button } from "@lana/web/ui/button"

import { TermsTemplateQuery } from "@/lib/graphql/generated"
import { DetailsCard, DetailItemProps } from "@/components/details"
import { formatDate, formatInterval, formatPeriod } from "@/lib/utils"
import { UpdateTermsTemplateDialog } from "@/app/terms-templates/[terms-template-id]/update"

type TermsTemplateDetailsProps = {
  termsTemplate: NonNullable<TermsTemplateQuery["termsTemplate"]>
}

const TermsTemplateDetailsCard: React.FC<TermsTemplateDetailsProps> = ({
  termsTemplate,
}) => {
  const [openUpdateTermsTemplateDialog, setOpenUpdateTermsTemplateDialog] =
    useState(false)

  const details: DetailItemProps[] = [
    { label: "Name", value: termsTemplate.name },
    { label: "Created At", value: formatDate(termsTemplate.createdAt) },
    {
      label: "Duration",
      value: `${termsTemplate.values.duration.units} ${formatPeriod(
        termsTemplate.values.duration.period,
      )}`,
    },
    {
      label: "Accrual Interval",
      value: formatInterval(termsTemplate.values.accrualInterval),
    },
    {
      label: "Incurrence Interval",
      value: formatInterval(termsTemplate.values.incurrenceInterval),
    },
    {
      label: "Annual Rate",
      value: `${termsTemplate.values.annualRate}%`,
    },
    {
      label: "Initial CVL",
      value: `${termsTemplate.values.initialCvl}%`,
    },
    {
      label: "Margin Call CVL",
      value: `${termsTemplate.values.marginCallCvl}%`,
    },
    {
      label: "Liquidation CVL",
      value: `${termsTemplate.values.liquidationCvl}%`,
    },
    {
      label: "Structuring Fee Rate",
      value: `${termsTemplate.values.oneTimeFeeRate}%`,
    },
  ]

  const footerContent = (
    <Button
      variant="outline"
      onClick={() => setOpenUpdateTermsTemplateDialog(true)}
      data-testid="terms-template-update-button"
    >
      Update
    </Button>
  )

  return (
    <>
      <UpdateTermsTemplateDialog
        termsTemplate={termsTemplate}
        openUpdateTermsTemplateDialog={openUpdateTermsTemplateDialog}
        setOpenUpdateTermsTemplateDialog={setOpenUpdateTermsTemplateDialog}
      />

      <DetailsCard
        title="Terms Template"
        details={details}
        footerContent={footerContent}
        className="w-full"
      />
    </>
  )
}

export default TermsTemplateDetailsCard
