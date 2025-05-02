"use client"

import React from "react"
import { useTranslations } from "next-intl"

import { CollateralizationStateLabel } from "@/app/credit-facilities/label"
import CardWrapper from "@/components/card-wrapper"
import Balance from "@/components/balance/balance"
import {
  GetCreditFacilityTransactionsQuery,
  CreditFacilityHistoryEntry,
  CollateralAction,
} from "@/lib/graphql/generated"
import { formatCollateralAction, formatDate, cn } from "@/lib/utils"
import DataTable, { Column } from "@/components/data-table"

type CreditFacilityTransactionsProps = {
  creditFacility: NonNullable<GetCreditFacilityTransactionsQuery["creditFacility"]>
}

export const CreditFacilityTransactions: React.FC<CreditFacilityTransactionsProps> = ({
  creditFacility,
}) => {
  const t = useTranslations("CreditFacilities.CreditFacilityDetails.Transactions")

  const columns: Column<CreditFacilityHistoryEntry>[] = [
    {
      key: "__typename",
      header: t("columns.transactionType"),
      render: (
        _: CreditFacilityHistoryEntry["__typename"],
        transaction: CreditFacilityHistoryEntry,
      ) => {
        if (!transaction.__typename) return t("messages.unknownType")

        switch (transaction.__typename) {
          case "CreditFacilityCollateralUpdated":
            return (
              <div className="flex flex-row gap-1">
                <div>{t("transactionTypes.collateralUpdated")}</div>
                <div className="text-textColor-secondary text-sm">
                  {formatCollateralAction(transaction.action)}
                </div>
              </div>
            )
          case "CreditFacilityCollateralizationUpdated":
            return (
              <div className="flex flex-row gap-1">
                <div>{t("transactionTypes.collateralizationUpdated")}</div>
                <div className="text-textColor-secondary text-sm">
                  (<CollateralizationStateLabel state={transaction.state} />)
                </div>
              </div>
            )
          case "CreditFacilityOrigination":
            return t("transactionTypes.origination")
          case "CreditFacilityIncrementalPayment":
            return t("transactionTypes.incrementalPayment")
          case "CreditFacilityDisbursalExecuted":
            return t("transactionTypes.disbursalExecuted")
          case "CreditFacilityInterestAccrued":
            return t("transactionTypes.interestAccrued")
        }
        const exhaustiveCheck: never = transaction.__typename
        return exhaustiveCheck
      },
    },
    {
      key: "recordedAt",
      header: t("columns.recordedAt"),
      render: (recordedAt: string | null | undefined) =>
        recordedAt ? formatDate(recordedAt, { includeTime: false }) : "-",
    },
    {
      key: "__typename",
      header: t("columns.amount"),
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
    <CardWrapper title={t("title")} description={t("description")}>
      <DataTable
        data={creditFacility.history}
        columns={columns}
        emptyMessage={t("messages.emptyTable")}
      />
    </CardWrapper>
  )
}
