import { CustomerDetailsCard } from "./details"
import { CustomerAccountBalances } from "./balances"
import { CustomerLoansTable } from "./loans"
import { CustomerTransactionsTable } from "./transactions"
import { KycStatus } from "./kyc-status"

import { PageHeading } from "@/components/page-heading"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/primitive/tab"

function customerDetails({
  params,
}: {
  params: {
    "customer-id": string
  }
}) {
  const { "customer-id": customerId } = params
  return (
    <main className="max-w-7xl m-auto">
      <PageHeading>Customer Details</PageHeading>
      <CustomerDetailsCard customerId={customerId} />
      <Tabs defaultValue="overview" className="mt-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="kyc">KYC Status</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <CustomerAccountBalances customerId={customerId} />
          <CustomerLoansTable customerId={customerId} />
          <CustomerTransactionsTable customerId={customerId} />
          <KycStatus customerId={customerId} />
        </TabsContent>
        <TabsContent value="balances">
          <CustomerAccountBalances customerId={customerId} />
        </TabsContent>
        <TabsContent value="loans">
          <CustomerLoansTable customerId={customerId} />
        </TabsContent>
        <TabsContent value="transactions">
          <CustomerTransactionsTable customerId={customerId} />
        </TabsContent>
        <TabsContent value="kyc">
          <KycStatus customerId={customerId} />
        </TabsContent>
      </Tabs>
    </main>
  )
}

export default customerDetails
