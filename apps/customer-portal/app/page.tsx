import { ArrowDownUp, CreditCard, Wallet } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@lana/web/ui/tab"

import { Alert, AlertDescription, AlertTitle } from "@lana/web/ui/alert"

import React from "react"

import { CustomerTransactionsTable } from "./transaction"
import { CustomerCreditFacilitiesTable } from "./credit-facility"

import UserDetailsCard from "./user-details-card"

import { meQuery } from "@/lib/graphql/query/me"
import { KycLevel } from "@/lib/graphql/generated"
import { BalanceCard } from "@/components/balance-card"
import Balance from "@/components/balance"

export default async function Home() {
  const data = await meQuery()
  if (data instanceof Error) {
    return <div className="text-destructive">{data.message}</div>
  }

  const totalBalanceInCents =
    data.me?.customer.depositAccount.balance.settled +
    data.me?.customer.depositAccount.balance.pending

  const customer = data.me?.customer

  const transactions = [
    ...(customer?.depositAccount.deposits || []),
    ...(customer?.depositAccount.withdrawals || []),
  ].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <main className="max-w-7xl mx-auto px-2 flex flex-col gap-2">
      <Message level={customer.level} />
      <div className="block md:hidden">
        <BalanceCard
          icon={<Wallet className="h-4 w-4 text-foreground dark:text-foreground" />}
          title="Balance"
          h1={<Balance amount={totalBalanceInCents} currency="usd" />}
          variant="balance"
        />
      </div>
      <UserDetailsCard customer={customer} totalBalanceInCents={totalBalanceInCents} />

      <Tabs defaultValue="credit-facilities" className="w-full">
        <TabsList className="flex h-12 w-full items-center rounded-lg bg-muted p-1">
          <TabsTrigger
            value="credit-facilities"
            className="flex h-full flex-1 items-center justify-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:text-primary"
          >
            <CreditCard className="h-4 w-4" />
            Credit Facilities
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="flex h-full flex-1 items-center justify-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:text-primary"
          >
            <ArrowDownUp className="h-4 w-4" />
            Transactions
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
