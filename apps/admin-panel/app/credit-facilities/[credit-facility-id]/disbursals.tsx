"use client"

import React from "react"

import CardWrapper from "@/components/card-wrapper"
import { GetCreditFacilityDetailsQuery } from "@/lib/graphql/generated"
import Balance from "@/components/balance/balance"
import { formatDate } from "@/lib/utils"
import DataTable, { Column } from "@/components/data-table"
import { DisbursalStatusBadge } from "@/app/disbursals/status-badge"

type Disbursal = NonNullable<
  GetCreditFacilityDetailsQuery["creditFacility"]
>["disbursals"][number]

type CreditFacilityDisbursalsProps = {
  creditFacility: NonNullable<GetCreditFacilityDetailsQuery["creditFacility"]>
}

export const CreditFacilityDisbursals: React.FC<CreditFacilityDisbursalsProps> = ({
  creditFacility,
}) => {
  const columns: Column<Disbursal>[] = [
    {
      key: "amount",
      header: "Amount",
      render: (amount) => <Balance amount={amount} currency="usd" />,
    },
    {
      key: "createdAt",
      header: "Created At",
      render: (date) => formatDate(date),
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      render: (_, disbursal) => {
        return <DisbursalStatusBadge status={disbursal.status} />
      },
    },
  ]

  return (
    <>
      <CardWrapper
        title="Disbursals"
        description="Disbursals associated with this credit facility"
      >
        <DataTable
          data={creditFacility.disbursals}
          columns={columns}
          emptyMessage="No disbursals found"
          navigateTo={(disbursal) => `/disbursals/${disbursal.disbursalId}`}
        />
      </CardWrapper>
    </>
  )
}
