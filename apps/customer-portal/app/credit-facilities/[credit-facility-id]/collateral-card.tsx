import { DetailsCard } from "@lana/web/components/details"

import React from "react"

import Balance from "@/components/balance"
import { CreditFacility } from "@/lib/graphql/generated"

function CollateralCard({ data }: { data: NonNullable<CreditFacility> }) {
  const collateralData = [
    {
      label: "Collateral Balance (BTC)",
      value: <Balance amount={data.balance.collateral.btcBalance} currency="btc" />,
    },
    // { label: "Current BTC/USD Price", value: "$98,092.14" },
    // { label: "Collateral Balance (USD)", value: "$1,000,092.14" },
    // { label: "Disbursed and Outstanding", value: "$250,000.00" },
    // { label: "Current CVL", value: `${data.currentCvl.total}%` },
    // { label: "Margin Call Price", value: "$49,939.99 / BTC" },
    // { label: "Liquidation Price", value: "$45,939.99 / BTC" },
    // { label: "Collateral to Reach Full CVL (150%)", value: "0.89029300 BTC" },
  ]
  return (
    <DetailsCard
      className="w-full"
      title="Collateral"
      details={collateralData}
      columns={2}
    />
  )
}

export default CollateralCard
