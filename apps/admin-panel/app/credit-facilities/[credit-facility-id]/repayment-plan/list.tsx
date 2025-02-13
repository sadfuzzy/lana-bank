"use client"

import React from "react"

import { Badge, BadgeProps } from "@lana/web/ui/badge"

import DataTable, { Column } from "@/components/data-table"

import { GetCreditFacilityRepaymentPlanQuery } from "@/lib/graphql/generated"

import { formatDate } from "@/lib/utils"
import Balance from "@/components/balance/balance"
import CardWrapper from "@/components/card-wrapper"

type RepaymentPlan = NonNullable<
  NonNullable<
    GetCreditFacilityRepaymentPlanQuery["creditFacility"]
  >["repaymentPlan"][number]
>

type CreditFacilityRepaymentPlanProps = {
  creditFacility: NonNullable<GetCreditFacilityRepaymentPlanQuery["creditFacility"]>
}

export const CreditFacilityRepaymentPlan: React.FC<CreditFacilityRepaymentPlanProps> = ({
  creditFacility,
}) => {
  const columns: Column<RepaymentPlan>[] = [
    {
      key: "repaymentType",
      header: "Type",
      render: (type) => getRepaymentTypeDisplay(type),
    },
    {
      key: "initial",
      header: "Initial Amount",
      render: (amount) => <Balance amount={amount} currency="usd" />,
    },
    {
      key: "outstanding",
      header: "Outstanding",
      render: (amount) => <Balance amount={amount} currency="usd" />,
    },
    {
      key: "dueAt",
      header: "Due Date",
      render: (date) => formatDate(date),
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      render: (_, repayment) => {
        return <RepaymentStatusBadge status={repayment.status} />
      },
    },
  ]

  const repaymentPlanData = creditFacility?.repaymentPlan ?? []

  return (
    <CardWrapper
      title="Repayment Plan"
      description="Repayment plan associated with this credit facility"
    >
      <DataTable
        data={repaymentPlanData}
        columns={columns}
        emptyMessage="No Plan found"
        autoFocus={false}
      />
    </CardWrapper>
  )
}

interface StatusBadgeProps extends BadgeProps {
  status: RepaymentPlan["status"]
}

const getStatusVariant = (status: RepaymentPlan["status"]): BadgeProps["variant"] => {
  switch (status) {
    case "UPCOMING":
      return "default"
    case "DUE":
      return "warning"
    case "OVERDUE":
      return "destructive"
    case "PAID":
      return "success"
    default:
      return "default"
  }
}

const RepaymentStatusBadge: React.FC<StatusBadgeProps> = ({ status, ...props }) => {
  const variant = getStatusVariant(status)
  return (
    <Badge variant={variant} {...props}>
      {status}
    </Badge>
  )
}

const getRepaymentTypeDisplay = (type: RepaymentPlan["repaymentType"]) => {
  switch (type) {
    case "DISBURSAL":
      return "Principal"
    case "INTEREST":
      return "Interest"
    default:
      return type
  }
}
