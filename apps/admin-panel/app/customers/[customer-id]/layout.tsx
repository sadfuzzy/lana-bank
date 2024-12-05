"use client"

import { gql } from "@apollo/client"
import { useEffect } from "react"

import { CustomerDetailsCard } from "./details"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/ui/tab"
import { useTabNavigation } from "@/hooks/use-tab-navigation"
import {
  Customer as CustomerType,
  useGetCustomerBasicDetailsQuery,
} from "@/lib/graphql/generated"
import { useCreateContext } from "@/app/create"
import { useBreadcrumb } from "@/app/breadcrumb-provider"
import { DetailsPageSkeleton } from "@/components/details-page-skeleton"

const TABS = [
  { url: "/", tabLabel: "Overview" },
  { url: "/credit-facilities", tabLabel: "Credit Facilities" },
  { url: "/transactions", tabLabel: "Transactions" },
  { url: "/documents", tabLabel: "Documents" },
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
  const { data, loading, error, refetch } = useGetCustomerBasicDetailsQuery({
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

  if (loading) return <DetailsPageSkeleton detailItems={3} tabs={6} />
  if (error) return <div className="text-destructive">{error.message}</div>
  if (!data || !data.customer) return null

  return (
    <main className="max-w-7xl m-auto">
      <CustomerDetailsCard customer={data.customer} refetch={refetch} />
      <Tabs value={currentTab} onValueChange={handleTabChange} className="mt-2">
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.url} value={tab.url}>
              {tab.tabLabel}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map((tab) => (
          <TabsContent key={tab.url} value={tab.url}>
            {children}
          </TabsContent>
        ))}
      </Tabs>
    </main>
  )
}
