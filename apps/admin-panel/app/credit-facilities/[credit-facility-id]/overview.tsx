"use client"

import React from "react"

import Balance from "@/components/balance/balance"
import DetailsCard from "@/components/details-card"
import {
  CreditFacilityStatus,
  DisbursalStatus,
  GetCreditFacilityDetailsQuery,
} from "@/lib/graphql/generated"
import { CENTS_PER_USD, SATS_PER_BTC, formatDate } from "@/lib/utils"
import { UsdCents } from "@/types"

import { VotersCard } from "@/app/disbursals/[disbursal-id]/voters"

type CreditFacilityOverviewProps = {
  creditFacility: NonNullable<GetCreditFacilityDetailsQuery["creditFacility"]>
}

export const CreditFacilityOverview: React.FC<CreditFacilityOverviewProps> = ({
  creditFacility,
}) => {
  const basisAmountInCents = calculateBaseAmountInCents(creditFacility)

  const MarginCallPrice = calculatePrice({
    cvlPercentage: creditFacility.creditFacilityTerms.marginCallCvl,
    basisAmountInCents: basisAmountInCents,
    collateralInSatoshis: creditFacility.collateral,
  })

  const LiquidationCallPrice = calculatePrice({
    cvlPercentage: creditFacility.creditFacilityTerms.liquidationCvl,
    basisAmountInCents: basisAmountInCents,
    collateralInSatoshis: creditFacility.collateral,
  })

  const requiredDetails = [
    {
      label: "Collateral balance",
      value: (
        <Balance amount={creditFacility.balance.collateral.btcBalance} currency="btc" />
      ),
    },
    {
      label: "Facility Remaining",
      value: (
        <Balance
          amount={creditFacility.balance.facilityRemaining.usdBalance}
          currency="usd"
        />
      ),
    },
    {
      label: "Total Disbursed",
      value: (
        <Balance
          amount={creditFacility.balance.disbursed.total.usdBalance}
          currency="usd"
        />
      ),
    },
    {
      label: "Outstanding Disbursed",
      value: (
        <Balance
          amount={creditFacility.balance.disbursed.outstanding.usdBalance}
          currency="usd"
        />
      ),
    },
    {
      label: "Total Interest",
      value: (
        <Balance
          amount={creditFacility.balance.interest.total.usdBalance}
          currency="usd"
        />
      ),
    },
    {
      label: "Outstanding Interest",
      value: (
        <Balance
          amount={creditFacility.balance.interest.outstanding.usdBalance}
          currency="usd"
        />
      ),
    },
    {
      label: "Total Outstanding Balance",
      value: (
        <Balance amount={creditFacility.balance.outstanding.usdBalance} currency="usd" />
      ),
    },
    {
      label: "Current CVL ",
      value: `${creditFacility.currentCvl.total}%`,
    },
  ]

  const optionalDetails = [
    creditFacility.collateralToMatchInitialCvl && {
      label: `Collateral to reach target (${creditFacility.creditFacilityTerms.initialCvl}%)`,
      value: (
        <Balance amount={creditFacility.collateralToMatchInitialCvl} currency="btc" />
      ),
      valueTestId: "collateral-to-reach-target",
    },
    creditFacility.expiresAt && {
      label: "Expires at",
      value: formatDate(creditFacility.expiresAt),
    },
  ]

  const collateralDependentDetails =
    creditFacility.collateral > 0
      ? [
          {
            label: `Margin Call Price BTC/USD (${creditFacility.creditFacilityTerms.marginCallCvl}%)`,
            value: <Balance amount={MarginCallPrice as UsdCents} currency="usd" />,
          },
          {
            label: `Liquidation Call Price BTC/USD (${creditFacility.creditFacilityTerms.liquidationCvl}%)`,
            value: <Balance amount={LiquidationCallPrice as UsdCents} currency="usd" />,
          },
        ]
      : [
          {
            label: "Margin Call CVL",
            value: `${creditFacility.creditFacilityTerms.marginCallCvl}%`,
          },
          {
            label: "Liquidation Call CVL",
            value: `${creditFacility.creditFacilityTerms.liquidationCvl}%`,
          },
        ]

  const overviewDetails = [
    ...requiredDetails,
    ...optionalDetails.filter(Boolean),
    ...collateralDependentDetails,
  ]

  return (
    <>
      <DetailsCard
        title="Overview"
        description="Credit Facility Overview"
        details={overviewDetails}
      />
      <VotersCard approvalProcess={creditFacility.approvalProcess} />
    </>
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
