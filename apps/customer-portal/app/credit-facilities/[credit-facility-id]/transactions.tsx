"use client"

import React from "react"

import DataTable, { Column } from "@lana/web/components/data-table"

import {
  MeQuery,
  CreditFacilityHistoryEntry,
  CollateralAction,
  CollateralizationState,
} from "@/lib/graphql/generated"

import { formatDate, cn } from "@/lib/utils"

import Balance from "@/components/balance"

export const formatTransactionType = (typename: string) => {
  return typename
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^\w/, (c) => c.toUpperCase())
}

export const formatCollateralAction = (collateralAction: CollateralAction) => {
  return collateralAction === CollateralAction.Add ? "(Added)" : "(Removed)"
}

const formatTransactionTypeWithoutPrefix = (type: string) => {
  const formattedType = formatTransactionType(type)
  return formattedType.replace("Credit Facility", "").trim()
}

export const formatCollateralizationState = (
  collateralizationState: CollateralizationState,
) => {
  return collateralizationState
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

type CreditFacilityTransactionsProps = {
  creditFacility: NonNullable<MeQuery["me"]["customer"]["creditFacilities"][0]>
}

export const CreditFacilityTransactions: React.FC<CreditFacilityTransactionsProps> = ({
  creditFacility,
}) => {
  const columns: Column<CreditFacilityHistoryEntry>[] = [
    {
      key: "__typename",
      header: "Transaction Type",
      render: (
        _: CreditFacilityHistoryEntry["__typename"],
        transaction: CreditFacilityHistoryEntry,
      ) => {
        if (!transaction.__typename) return "Unknown Transaction Type"

        switch (transaction.__typename) {
          case "CreditFacilityCollateralUpdated":
            return (
              <div className="flex flex-row gap-1">
                <div>{formatTransactionTypeWithoutPrefix(transaction.__typename)}</div>
                <div className="text-textColor-secondary text-sm">
                  {formatCollateralAction(transaction.action)}
                </div>
              </div>
            )
          case "CreditFacilityCollateralizationUpdated":
            return (
              <div className="flex flex-row gap-1">
                <div>{formatTransactionTypeWithoutPrefix(transaction.__typename)}</div>
                <div className="text-textColor-secondary text-sm">
                  ({formatCollateralizationState(transaction.state)})
                </div>
              </div>
            )
          default:
            return formatTransactionTypeWithoutPrefix(transaction.__typename)
        }
      },
    },
    {
      key: "recordedAt",
      header: "Recorded At",
      render: (recordedAt: string | null | undefined) =>
        recordedAt ? formatDate(recordedAt) : "-",
    },
    {
      key: "__typename",
      header: "Amount",
      align: "right",
      render: (
        _: CreditFacilityHistoryEntry["__typename"],
        transaction: CreditFacilityHistoryEntry,
      ) => {
        switch (transaction.__typename) {
          case "CreditFacilityCollateralUpdated":
            return (
              <div
                className={cn(
                  "flex justify-end gap-1",
                  transaction.action === CollateralAction.Add
                    ? "text-success"
                    : "text-destructive",
                )}
              >
                <div>{transaction.action === CollateralAction.Add ? "+" : "-"}</div>
                <Balance amount={transaction.satoshis} currency="btc" align="end" />
              </div>
            )
          case "CreditFacilityCollateralizationUpdated":
            return (
              <div className="flex flex-col gap-1 justify-end">
                <Balance amount={transaction.collateral} currency="btc" align="end" />
              </div>
            )
          case "CreditFacilityOrigination":
          case "CreditFacilityIncrementalPayment":
          case "CreditFacilityDisbursalExecuted":
          case "CreditFacilityInterestAccrued":
            return <Balance amount={transaction.cents} currency="usd" align="end" />
          default:
            return <span>-</span>
        }
      },
    },
  ]

  return (
    <DataTable
      data={creditFacility.transactions}
      columns={columns}
      emptyMessage={
        <div className="min-h-[10rem] w-full border rounded-md flex items-center justify-center">
          No transactions found
        </div>
      }
    />
  )
}
