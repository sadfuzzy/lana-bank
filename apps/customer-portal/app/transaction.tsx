"use client"

import React from "react"
import DataTable, { Column } from "@lana/web/components/data-table"
import { Badge, BadgeProps } from "@lana/web/ui/badge"

import { ArrowUpCircle, ArrowDownCircle } from "lucide-react"

import { MeQuery, WithdrawalStatus } from "@/lib/graphql/generated"
import { formatDate } from "@/lib/utils"
import Balance from "@/components/balance"

type Deposit = NonNullable<
  MeQuery["me"]["customer"]
>["depositAccount"]["deposits"][number]
type Withdrawal = NonNullable<
  MeQuery["me"]["customer"]
>["depositAccount"]["withdrawals"][number]
type Transaction = Deposit | Withdrawal

const isWithdrawal = (transaction: Transaction): transaction is Withdrawal => {
  return "withdrawalId" in transaction
}

type CustomerTransactionsTableProps = {
  transactions: Transaction[]
}

export const CustomerTransactionsTable: React.FC<CustomerTransactionsTableProps> = ({
  transactions,
}) => {
  const columns: Column<Transaction>[] = [
    {
      key: "createdAt",
      header: "Date",
      render: (value: string) => formatDate(value),
    },
    {
      key: "reference",
      header: "Type",
      render: (_: string, record: Transaction) => (
        <div className="flex items-center gap-2">
          {isWithdrawal(record) ? (
            <>
              <span>Withdrawal</span>
              <ArrowUpCircle className="w-4 h-4 text-destructive" />
            </>
          ) : (
            <>
              <span>Deposit</span>
              <ArrowDownCircle className="w-4 h-4 text-success" />
            </>
          )}
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (value: number) => <Balance amount={value} currency="usd" />,
    },
    {
      key: "reference",
      header: "Status",
      render: (_: string, record: Transaction) =>
        isWithdrawal(record) ? <WithdrawalStatusBadge status={record.status} /> : "N/A",
    },
  ]

  return (
    <DataTable
      data={transactions}
      columns={columns}
      emptyMessage={
        <div className="min-h-[10rem] w-full border rounded-md flex items-center justify-center">
          No transactions found
        </div>
      }
      className="w-full table-fixed"
      headerClassName="bg-secondary [&_tr:hover]:!bg-secondary"
    />
  )
}

interface StatusBadgeProps extends BadgeProps {
  status: WithdrawalStatus
}

const getVariant = (status: WithdrawalStatus) => {
  switch (status) {
    case WithdrawalStatus.PendingApproval:
      return "default"
    case WithdrawalStatus.Confirmed:
      return "success"
    case WithdrawalStatus.Cancelled:
      return "destructive"
    case WithdrawalStatus.Denied:
      return "destructive"
    default:
      return "default"
  }
}

export const WithdrawalStatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const variant = getVariant(status)
  return <Badge variant={variant}>{status.split("_").join(" ")}</Badge>
}
