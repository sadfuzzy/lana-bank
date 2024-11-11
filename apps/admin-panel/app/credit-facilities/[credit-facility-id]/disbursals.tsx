"use client"

import React from "react"

import { useRouter } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/primitive/card"
import { GetCreditFacilityDetailsQuery } from "@/lib/graphql/generated"
import Balance from "@/components/balance/balance"
import { formatDate } from "@/lib/utils"
import DataTable, { Column } from "@/app/data-table"
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
  const router = useRouter()

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
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Disbursals</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={creditFacility.disbursals}
            columns={columns}
            emptyMessage="No disbursals found"
            onRowClick={(disbursal) =>
              router.push(`/disbursals/${disbursal.disbursalId}`)
            }
          />
        </CardContent>
      </Card>
    </>
  )
}
