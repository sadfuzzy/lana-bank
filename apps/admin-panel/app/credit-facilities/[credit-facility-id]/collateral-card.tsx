import React from "react"

import Balance from "@/components/balance/balance"
import { DetailsCard, DetailItemProps } from "@/components/details"
import {
  CreditFacilityStatus,
  DisbursalStatus,
  GetCreditFacilityLayoutDetailsQuery,
  useGetRealtimePriceUpdatesQuery,
} from "@/lib/graphql/generated"
import { CENTS_PER_USD, SATS_PER_BTC } from "@/lib/utils"
import { Satoshis, UsdCents } from "@/types"

type CreditFacilityOverviewProps = {
  creditFacility: NonNullable<GetCreditFacilityLayoutDetailsQuery["creditFacility"]>
}

const getCvlStatus = (
  currentCvl: number,
  marginCallCvl: number,
  liquidationCvl: number,
) => {
  if (currentCvl >= marginCallCvl) return { label: "High", color: "text-success" }
  if (currentCvl >= liquidationCvl) return { label: "Moderate", color: "text-warning" }
  return { label: "Critical", color: "text-destructive" }
}

const CvlStatusText: React.FC<{
  currentCvl: number
  marginCallCvl: number
  liquidationCvl: number
}> = ({ currentCvl, marginCallCvl, liquidationCvl }) => {
  const { label, color } = getCvlStatus(currentCvl, marginCallCvl, liquidationCvl)
  return <span className={`font-medium ${color}`}>{label}</span>
}

export const CreditFacilityCollateral: React.FC<CreditFacilityOverviewProps> = ({
  creditFacility,
}) => {
  const basisAmountInCents = calculateBaseAmountInCents(creditFacility)
  const MarginCallPrice = calculatePrice({
    cvlPercentage: creditFacility.creditFacilityTerms.marginCallCvl,
    basisAmountInCents,
    collateralInSatoshis: creditFacility.collateral,
  })
  const LiquidationCallPrice = calculatePrice({
    cvlPercentage: creditFacility.creditFacilityTerms.liquidationCvl,
    basisAmountInCents,
    collateralInSatoshis: creditFacility.collateral,
  })

  const { data: priceInfo } = useGetRealtimePriceUpdatesQuery({
    fetchPolicy: "cache-only",
  })

  const collateralInUsd = priceInfo
    ? (creditFacility.balance.collateral.btcBalance / SATS_PER_BTC) *
      (priceInfo.realtimePrice.usdCentsPerBtc / CENTS_PER_USD)
    : 0

  const collateralDependentDetails: DetailItemProps[] = [
    {
      label: "Collateral balance (BTC)",
      value: (
        <Balance amount={creditFacility.balance.collateral.btcBalance} currency="btc" />
      ),
    },
    {
      label: "Current BTC/USD Price",
      value: priceInfo && (
        <Balance amount={priceInfo.realtimePrice.usdCentsPerBtc} currency="usd" />
      ),
    },
    {
      label: "Collateral value (USD)",
      value: priceInfo && (
        <Balance amount={(collateralInUsd * CENTS_PER_USD) as UsdCents} currency="usd" />
      ),
    },
    {
      label: `Margin Call Price BTC/USD (${creditFacility.creditFacilityTerms.marginCallCvl}%)`,
      value: <Balance amount={MarginCallPrice as UsdCents} currency="usd" />,
    },
    {
      label: `Liquidation Price BTC/USD (${creditFacility.creditFacilityTerms.liquidationCvl}%)`,
      value: <Balance amount={LiquidationCallPrice as UsdCents} currency="usd" />,
    },
    {
      label: `Collateral to reach target (${creditFacility.creditFacilityTerms.initialCvl}%)`,
      value: (
        <Balance
          amount={(creditFacility.collateralToMatchInitialCvl ?? 0) as Satoshis}
          currency="btc"
        />
      ),
      valueTestId: "collateral-to-reach-target",
    },
    {
      label: "Current CVL",
      value: (
        <div className="flex items-center gap-2">
          <span>{creditFacility.currentCvl.total}%</span>
          {creditFacility.status === CreditFacilityStatus.Active && (
            <CvlStatusText
              currentCvl={creditFacility.currentCvl.total}
              marginCallCvl={creditFacility.creditFacilityTerms.marginCallCvl}
              liquidationCvl={creditFacility.creditFacilityTerms.liquidationCvl}
            />
          )}
        </div>
      ),
    },
  ]

  return (
    <DetailsCard
      className="w-full"
      title="Collateral"
      details={collateralDependentDetails}
      columns={2}
    />
  )
}

const calculatePrice = ({
  cvlPercentage,
  basisAmountInCents,
  collateralInSatoshis,
}: {
  cvlPercentage: number
  basisAmountInCents: number
  collateralInSatoshis: number
}) => {
  if (collateralInSatoshis === 0) return 0
  const cvlDecimal = cvlPercentage / 100
  const basisAmountUsd = basisAmountInCents / CENTS_PER_USD
  const collateralBtc = collateralInSatoshis / SATS_PER_BTC
  const priceUsd = (cvlDecimal * basisAmountUsd) / collateralBtc
  const priceInCents = priceUsd * CENTS_PER_USD
  return priceInCents
}

export const calculateBaseAmountInCents = ({
  status,
  facilityAmount,
  disbursals,
  balance,
}: {
  status: CreditFacilityStatus
  facilityAmount: number
  disbursals: { status: DisbursalStatus }[]
  balance: { outstanding: { usdBalance: number } }
}) => {
  if (
    [
      CreditFacilityStatus.PendingCollateralization,
      CreditFacilityStatus.PendingApproval,
    ].includes(status)
  ) {
    return facilityAmount
  }

  if (status === CreditFacilityStatus.Active) {
    const hasApprovedDisbursals = disbursals.some(
      (d) => d.status === DisbursalStatus.Approved,
    )
    return hasApprovedDisbursals ? balance.outstanding.usdBalance : facilityAmount
  }

  return 0
}
