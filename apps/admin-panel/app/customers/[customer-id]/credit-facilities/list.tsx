"use client"

import CardWrapper from "@/components/card-wrapper"
import Balance from "@/components/balance/balance"
import { GetCustomerCreditFacilitiesQuery } from "@/lib/graphql/generated"
import { formatCollateralizationState, formatDate } from "@/lib/utils"
import { LoanAndCreditFacilityStatusBadge } from "@/app/loans/status-badge"
import DataTable, { Column } from "@/components/data-table"

type CreditFacility = NonNullable<
  GetCustomerCreditFacilitiesQuery["customer"]
>["creditFacilities"][number]

type CustomerCreditFacilitiesTableProps = {
  creditFacilities: NonNullable<
    GetCustomerCreditFacilitiesQuery["customer"]
  >["creditFacilities"]
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

  return (
    <CardWrapper
      title="Credit Facilities"
      description="Credit Facilities for this Customer"
    >
      <DataTable
        data={creditFacilities}
        columns={columns}
        navigateTo={(facility) => `/credit-facilities/${facility.creditFacilityId}`}
      />
    </CardWrapper>
  )
}
