"use client"
import React, { useState } from "react"

import { TermsTemplateQuery } from "@/lib/graphql/generated"
import { DetailItem, DetailsGroup } from "@/components/details"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitive/card"
import { formatDate, formatInterval, formatPeriod } from "@/lib/utils"
import { Button } from "@/components/primitive/button"
import { UpdateTermsTemplateDialog } from "@/components/terms-template/update-dialog"

type TermsTemplateDetailsProps = {
  termsTemplate: NonNullable<TermsTemplateQuery["termsTemplate"]>
  refetch: () => void
}

const TermsTemplateDetailsCard: React.FC<TermsTemplateDetailsProps> = ({
  termsTemplate,
  refetch,
}) => {
  const [openUpdateTermsTemplateDialog, setOpenUpdateTermsTemplateDialog] =
    useState(false)

  return (
    <>
      <UpdateTermsTemplateDialog
        termsTemplate={termsTemplate}
        openUpdateTermsTemplateDialog={openUpdateTermsTemplateDialog}
        setOpenUpdateTermsTemplateDialog={setOpenUpdateTermsTemplateDialog}
        refetch={refetch}
      />

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex flex-col space-y-1.5">
              {termsTemplate.name}
            </CardTitle>
            <CardDescription className="text-sm text-textColor-secondary">
              {termsTemplate.termsId}
            </CardDescription>
          </div>
          <Button onClick={() => setOpenUpdateTermsTemplateDialog(true)}>Update</Button>
        </CardHeader>

        <CardContent>
          <DetailsGroup>
            <DetailItem label="Created At" value={formatDate(termsTemplate.createdAt)} />
            <DetailItem
              label="Duration"
              value={`${termsTemplate.values.duration.units} ${formatPeriod(termsTemplate.values.duration.period)}`}
            />
            <DetailItem
              label="Accrual Interval"
              value={formatInterval(termsTemplate.values.accrualInterval)}
            />
            <DetailItem
              label="Incurrence Interval"
              value={formatInterval(termsTemplate.values.incurrenceInterval)}
            />
            <DetailItem
              label="Annual Rate"
              value={`${termsTemplate.values.annualRate}%`}
            />
            <DetailItem
              label="Initial CVL"
              value={`${termsTemplate.values.initialCvl}%`}
            />
            <DetailItem
              label="Margin Call CVL"
              value={`${termsTemplate.values.marginCallCvl}%`}
            />
            <DetailItem
              label="Liquidation CVL"
              value={`${termsTemplate.values.liquidationCvl}%`}
            />
          </DetailsGroup>
        </CardContent>
      </Card>
    </>
  )
}

export default TermsTemplateDetailsCard
