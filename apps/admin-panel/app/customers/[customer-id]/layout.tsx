"use client"

import { gql } from "@apollo/client"

import { useEffect } from "react"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@lana/web/ui/tab"

import { ScrollArea, ScrollBar } from "@lana/web/ui/scroll-area"

import { CustomerDetailsCard } from "./details"

import { KycStatus } from "./kyc-status"

import { CustomerAccountBalances } from "./balances"

import { useTabNavigation } from "@/hooks/use-tab-navigation"
import {
  Customer as CustomerType,
  useGetCustomerBasicDetailsQuery,
} from "@/lib/graphql/generated"
import { useCreateContext } from "@/app/create"
import { useBreadcrumb } from "@/app/breadcrumb-provider"
import { DetailsPageSkeleton } from "@/components/details-page-skeleton"

const TABS = [
  { id: "1", url: "/", tabLabel: "Transactions" },
  { id: "2", url: "/credit-facilities", tabLabel: "Credit Facilities" },
  { id: "4", url: "/documents", tabLabel: "Documents" },
]

gql`
  query GetCustomerBasicDetails($id: UUID!) {
    customer(id: $id) {
      id
      customerId
      email
      telegramId
      status
      level
      createdAt
      depositAccount {
        id
        depositAccountId
        balance {
          settled
          pending
        }
      }
    }
  }
`

export default function CustomerLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { "customer-id": string }
}) {
  const { "customer-id": customerId } = params
  const { currentTab, handleTabChange } = useTabNavigation(TABS, customerId)

  const { setCustomLinks, resetToDefault } = useBreadcrumb()

  const { setCustomer } = useCreateContext()
  const { data, loading, error } = useGetCustomerBasicDetailsQuery({
    variables: { id: customerId },
  })

  useEffect(() => {
    data?.customer && setCustomer(data?.customer as CustomerType)
    return () => setCustomer(null)
  }, [data?.customer, setCustomer])

  useEffect(() => {
    if (data?.customer) {
      const currentTabData = TABS.find((tab) => tab.url === currentTab)
      setCustomLinks([
        { title: "Dashboard", href: "/dashboard" },
        { title: "Customers", href: "/customers" },
        { title: data.customer.email, href: `/customers/${customerId}` },
        ...(currentTabData?.url === "/"
          ? []
          : [{ title: currentTabData?.tabLabel ?? "", isCurrentPage: true as const }]),
      ])
    }
    return () => {
      resetToDefault()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.customer, currentTab])

  if (loading && !data) return <DetailsPageSkeleton detailItems={3} tabs={6} />
  if (error) return <div className="text-destructive">{error.message}</div>
  if (!data || !data.customer) return null

  return (
    <main className="max-w-7xl m-auto">
      <CustomerDetailsCard customer={data.customer} />
      <div className="flex flex-col md:flex-row w-full gap-2 my-2">
        <KycStatus customerId={customerId} />
        <CustomerAccountBalances balance={data.customer.depositAccount.balance} />
      </div>
      <Tabs
        defaultValue={TABS[0].url}
        value={currentTab}
        onValueChange={handleTabChange}
        className="mt-2"
      >
        <ScrollArea>
          <div className="relative h-10">
            <TabsList className="flex absolute h-10">
              {TABS.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.url} id={`tab-${tab.id}`}>
                  {tab.tabLabel}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        {TABS.map((tab) => (
          <TabsContent key={tab.id} value={tab.url}>
            {children}
          </TabsContent>
        ))}
      </Tabs>
    </main>
  )
}
