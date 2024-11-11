"use client"

import { useRouter } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/primitive/card"

import Balance from "@/components/balance/balance"

import { GetCustomerQuery } from "@/lib/graphql/generated"
import { formatCollateralizationState, formatDate } from "@/lib/utils"
import { LoanAndCreditFacilityStatusBadge } from "@/app/loans/status-badge"
import DataTable, { Column } from "@/app/data-table"

type CreditFacility = NonNullable<
  GetCustomerQuery["customer"]
>["creditFacilities"][number]

type CustomerCreditFacilitiesTableProps = {
  creditFacilities: NonNullable<GetCustomerQuery["customer"]>["creditFacilities"]
}

export const CustomerCreditFacilitiesTable: React.FC<
  CustomerCreditFacilitiesTableProps
> = ({ creditFacilities }) => {
  const columns: Column<CreditFacility>[] = [
    {
      key: "status",
      header: "Status",
      render: (status) => <LoanAndCreditFacilityStatusBadge status={status} />,
    },
    {
      key: "balance",
      header: "Outstanding Balance",
      render: (_, facility) => (
        <Balance amount={facility.balance.outstanding.usdBalance} currency="usd" />
      ),
    },
    {
      key: "balance",
      header: "Collateral (BTC)",
      render: (_, facility) => (
        <Balance amount={facility.balance.collateral.btcBalance} currency="btc" />
      ),
    },
    {
      key: "collateralizationState",
      header: "Collateralization State",
      render: (state) => formatCollateralizationState(state),
    },
    {
      key: "createdAt",
      header: "Created At",
      render: (date) => formatDate(date),
    },
  ]

  const router = useRouter()
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Credit Facilities</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          data={creditFacilities}
          columns={columns}
          emptyMessage="No credit facilities found for this customer"
          onRowClick={(facility) => {
            router.push(`/credit-facilities/${facility.creditFacilityId}`)
          }}
        />
      </CardContent>
    </Card>
  )
}
