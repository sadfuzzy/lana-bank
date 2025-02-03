"use client"
import React, { useState } from "react"
import { gql } from "@apollo/client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lana/web/ui/card"

import DataTable, { Column } from "../../components/data-table"

import { TermsTemplate, useTermsTemplatesQuery } from "@/lib/graphql/generated"
import { formatPeriod } from "@/lib/utils"
import { UpdateTermsTemplateDialog } from "@/app/terms-templates/[terms-template-id]/update"

gql`
  fragment TermsTemplateFields on TermsTemplate {
    id
    name
    termsId
    createdAt
    subjectCanUpdateTermsTemplate
    values {
      annualRate
      accrualInterval
      incurrenceInterval
      liquidationCvl
      marginCallCvl
      initialCvl
      oneTimeFeeRate
      duration {
        period
        units
      }
    }
  }

  query TermsTemplates {
    termsTemplates {
      ...TermsTemplateFields
    }
  }
`

const columns: Column<TermsTemplate>[] = [
  {
    key: "name",
    header: "Name",
  },
  {
    key: "values",
    header: "Duration",
    render: (values) =>
      `${String(values.duration.units)} ${formatPeriod(values.duration.period)}`,
  },
  {
    key: "values",
    header: "Annual Rate",
    render: (values) => `${values.annualRate}%`,
  },
  {
    key: "values",
    header: "Initial CVL",
    render: (values) => `${values.initialCvl}%`,
  },
  {
    key: "values",
    header: "MarginCall CVL",
    render: (values) => `${values.marginCallCvl}%`,
  },
  {
    key: "values",
    header: "Liquidation CVL",
    render: (values) => `${values.liquidationCvl}%`,
  },
]

function TermPage() {
  const { data, loading, error } = useTermsTemplatesQuery()
  const [openUpdateTermsTemplateDialog, setOpenUpdateTermsTemplateDialog] =
    useState<TermsTemplate | null>(null)

  if (error) {
    return (
      <Card>
        <CardContent>
          <p className="text-destructive mt-6">{error.message}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <main>
      {openUpdateTermsTemplateDialog && (
        <UpdateTermsTemplateDialog
          termsTemplate={openUpdateTermsTemplateDialog}
          openUpdateTermsTemplateDialog={Boolean(openUpdateTermsTemplateDialog)}
          setOpenUpdateTermsTemplateDialog={() => setOpenUpdateTermsTemplateDialog(null)}
        />
      )}
      <Card>
        <CardHeader>
          <CardTitle>Terms Templates</CardTitle>
          <CardDescription>
            Terms template that can be used with loan and credit facility
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data?.termsTemplates || []}
            columns={columns}
            loading={loading}
            navigateTo={(template) => `/terms-templates/${template.termsId}`}
          />
        </CardContent>
      </Card>
    </main>
  )
}

export default TermPage
