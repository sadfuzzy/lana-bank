"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lana/web/ui/card"

import Balance from "@/components/balance/balance"
import DataTable, { Column } from "@/components/data-table"
import { GetCustomerTransactionHistoryQuery } from "@/lib/graphql/generated"
import { formatDate } from "@/lib/utils"
import { WithdrawalStatusBadge } from "@/app/withdrawals/status-badge"
import { UsdCents } from "@/types"
import { DisbursalStatusBadge } from "@/app/disbursals/status-badge"

type HistoryNode = NonNullable<
  GetCustomerTransactionHistoryQuery["customer"]
>["depositAccount"]["history"]["edges"][number]["node"]

type CustomerTransactionsTableProps = {
  historyEntries: HistoryNode[]
}

export const CustomerTransactionsTable: React.FC<CustomerTransactionsTableProps> = ({
  historyEntries,
}) => {
  // TEMP FIX: for unknown entries
  const validEntries = historyEntries.filter(
    (entry) =>
      entry.__typename &&
      [
        "DepositEntry",
        "WithdrawalEntry",
        "CancelledWithdrawalEntry",
        "DisbursalEntry",
        "PaymentEntry",
      ].includes(entry.__typename),
  )

  const columns: Column<HistoryNode>[] = [
    {
      key: "__typename",
      header: "Date",
      render: (_: HistoryNode["__typename"], entry: { recordedAt: string }) => {
        if (!entry.recordedAt) return "-"
        return formatDate(entry.recordedAt, { includeTime: true })
      },
    },
    {
      key: "__typename",
      header: "Type",
      render: (type: HistoryNode["__typename"]) => {
        switch (type) {
          case "DepositEntry":
            return "Deposit"
          case "WithdrawalEntry":
          case "CancelledWithdrawalEntry":
            return "Withdrawal"
          case "DisbursalEntry":
            return "Disbursal"
          case "PaymentEntry":
            return "Payment"
          default:
            return "-"
        }
      },
    },
    {
      key: "__typename",
      header: "Amount",
      render: (_: HistoryNode["__typename"], entry: HistoryNode) => {
        switch (entry.__typename) {
          case "DepositEntry":
            return <Balance amount={entry.deposit.amount} currency="usd" />
          case "WithdrawalEntry":
          case "CancelledWithdrawalEntry":
            return <Balance amount={entry.withdrawal.amount} currency="usd" />
          case "DisbursalEntry":
            return <Balance amount={entry.disbursal.amount} currency="usd" />
          case "PaymentEntry":
            return (
              <Balance
                amount={
                  (entry.payment.disbursalAmount +
                    entry.payment.interestAmount) as UsdCents
                }
                currency="usd"
              />
            )
          default:
            return "-"
        }
      },
    },
    {
      key: "__typename",
      header: "Status",
      render: (_: HistoryNode["__typename"], entry: HistoryNode) => {
        switch (entry.__typename) {
          case "WithdrawalEntry":
          case "CancelledWithdrawalEntry":
            return <WithdrawalStatusBadge status={entry.withdrawal.status} />
          case "DisbursalEntry":
            return <DisbursalStatusBadge status={entry.disbursal.status} />
          default:
            return "-"
        }
      },
    },
  ]

  const getNavigateUrl = (entry: HistoryNode): string | null => {
    switch (entry.__typename) {
      case "WithdrawalEntry":
      case "CancelledWithdrawalEntry":
        return `/withdrawals/${entry.withdrawal.withdrawalId}`
      case "DisbursalEntry":
        return `/disbursals/${entry.disbursal.disbursalId}`
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
        <CardDescription>Transactions for this Customer</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          data={validEntries}
          columns={columns}
          emptyMessage="No transactions found"
          navigateTo={getNavigateUrl}
          className="w-full table-fixed"
          headerClassName="bg-secondary [&_tr:hover]:!bg-secondary"
        />
      </CardContent>
    </Card>
  )
}
