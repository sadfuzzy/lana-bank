"use client"

import React from "react"

import CardWrapper from "@/components/card-wrapper"
import Balance from "@/components/balance/balance"
import {
  GetCreditFacilityTransactionsQuery,
  CreditFacilityHistoryEntry,
  CollateralAction,
} from "@/lib/graphql/generated"
import {
  formatCollateralAction,
  formatCollateralizationState,
  formatDate,
  formatTransactionType,
  cn,
} from "@/lib/utils"
import DataTable, { Column } from "@/components/data-table"

const formatTransactionTypeWithoutPrefix = (type: string) => {
  const formattedType = formatTransactionType(type)
  return formattedType.replace("Credit Facility", "").trim()
}

type CreditFacilityTransactionsProps = {
  creditFacility: NonNullable<GetCreditFacilityTransactionsQuery["creditFacility"]>
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
        recordedAt ? formatDate(recordedAt, { includeTime: false }) : "-",
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
    <CardWrapper title="Transactions" description="Credit Facility Transactions">
      <DataTable
        data={creditFacility.transactions}
        columns={columns}
        autoFocus={false}
        emptyMessage="No transactions found"
      />
    </CardWrapper>
  )
}
