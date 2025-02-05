import * as React from "react"

import { ReactNode } from "react"

import { Card, CardHeader, CardTitle, CardDescription } from "@lana/web/ui/card"

import { meQuery } from "@/lib/graphql/query/me"

export default async function Home() {
  const data = await meQuery()
  if (data instanceof Error) {
    return <div>{data.message}</div>
  }

  return (
    <main className="max-w-7xl mx-auto">
      <div className="flex gap-2 mt-2 p-2">
        <BalanceCard
          title="Pending Balance"
          description="Funds in process, not available yet"
          h1={data.me?.customer.depositAccount.balance.pending}
        />
        <BalanceCard
          title="Settled Balance"
          description="Funds ready to use or withdraw"
          h1={data.me?.customer.depositAccount.balance.settled}
        />
      </div>
    </main>
  )
}

type BalanceCardProps = {
  h1?: ReactNode
  title: string
  description: string
}

const BalanceCard: React.FC<BalanceCardProps> = ({ h1, title, description }) => {
  return (
    <Card className="w-full" data-testid={title.toLowerCase().replace(" ", "-")}>
      <CardHeader>
        <CardDescription className="text-lg font-medium">{title}</CardDescription>
        <div className="flex flex-col">
          <CardTitle className="text-4xl">{h1}</CardTitle>
        </div>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}
