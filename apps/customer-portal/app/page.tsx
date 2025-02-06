import { ArrowDownUp, CreditCard, Clock, CheckCircle2 } from "lucide-react"

import { DetailItemProps, DetailsCard } from "@lana/web/components/details"
import { Badge } from "@lana/web/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@lana/web/ui/tab"

import { Alert, AlertDescription, AlertTitle } from "@lana/web/ui/alert"

import React from "react"

import { CustomerTransactionsTable } from "./transaction"
import { CustomerCreditFacilitiesTable } from "./credit-facility"

import { meQuery } from "@/lib/graphql/query/me"
import { AccountStatus, KycLevel } from "@/lib/graphql/generated"
import { formatDate } from "@/lib/utils"
import { BalanceCard } from "@/components/balance-card"
import Balance from "@/components/balance"

export default async function Home() {
  const data = await meQuery()
  if (data instanceof Error) {
    return <div className="text-destructive">{data.message}</div>
  }

  const customer = data.me?.customer

  const details: DetailItemProps[] = [
    {
      label: "Email",
      value: customer.email,
    },
    { label: "Joined On", value: formatDate(customer.createdAt) },
    {
      label: "Telegram",
      value: customer.telegramId,
    },
    {
      label: "Account Status",
      value: (
        <Badge
          variant={customer.status === AccountStatus.Active ? "success" : "secondary"}
        >
          {customer.status}
        </Badge>
      ),
    },
  ]

  const transactions = [
    ...(customer?.depositAccount.deposits || []),
    ...(customer?.depositAccount.withdrawals || []),
  ].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <main className="max-w-7xl mx-auto px-2 flex flex-col gap-2">
      <Message level={customer.level} />
      <DetailsCard
        title={<div className="text-md font-medium text-primary">Welcome Back!</div>}
        details={details}
      />
      <div className="flex flex-col md:flex-row gap-2">
        <BalanceCard
          icon={<Clock className="h-4 w-4 text-orange-500" />}
          title="Pending Balance"
          description="Funds in process, not available yet"
          h1={
            <Balance
              amount={data.me?.customer.depositAccount.balance.pending}
              currency="usd"
            />
          }
          variant="pending"
        />
        <BalanceCard
          icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
          title="Settled Balance"
          description="Funds ready to use or withdraw"
          h1={
            <Balance
              amount={data.me?.customer.depositAccount.balance.settled}
              currency="usd"
            />
          }
          variant="settled"
        />
      </div>
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="flex h-12 w-full items-center rounded-lg bg-muted p-1">
          <TabsTrigger
            value="transactions"
            className="flex h-full flex-1 items-center justify-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:text-primary"
          >
            <ArrowDownUp className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger
            value="credit-facilities"
            className="flex h-full flex-1 items-center justify-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:text-primary"
          >
            <CreditCard className="h-4 w-4" />
            Credit Facilities
          </TabsTrigger>
        </TabsList>
        <TabsContent value="transactions" className="mt-2">
          <CustomerTransactionsTable transactions={transactions} />
        </TabsContent>
        <TabsContent value="credit-facilities" className="mt-2">
          <CustomerCreditFacilitiesTable creditFacilities={customer.creditFacilities} />
        </TabsContent>
      </Tabs>
    </main>
  )
}

function Message({ level }: { level: KycLevel }) {
  return (
    level === KycLevel.NotKyced && (
      <Alert variant="destructive">
        <AlertTitle>Account Not Active</AlertTitle>
        <AlertDescription>
          Please complete KYC verification and contact admin to activate your account.
        </AlertDescription>
      </Alert>
    )
  )
}
