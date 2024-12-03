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
import { BreadCrumbWrapper } from "@/components/breadcrumb-wrapper"
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

  const { setCustomer } = useCreateContext()
  const { data, loading, error, refetch } = useGetCustomerBasicDetailsQuery({
    variables: { id: customerId },
  })

  useEffect(() => {
    data?.customer && setCustomer(data?.customer as CustomerType)
    return () => setCustomer(null)
  }, [data?.customer, setCustomer])

  if (loading) return <DetailsPageSkeleton detailItems={3} tabs={6} />
  if (error) return <div className="text-destructive">{error.message}</div>
  if (!data || !data.customer) return null

  const currentTabData = TABS.find((tab) => tab.url === currentTab)

  const breadcrumbLinks = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Customers", href: "/customers" },
    { title: data.customer.email, href: `/customers/${customerId}` },
    ...(currentTabData?.url === "/"
      ? []
      : [{ title: currentTabData?.tabLabel ?? "", isCurrentPage: true as const }]),
  ]

  return (
    <main className="max-w-7xl m-auto">
      <BreadCrumbWrapper links={breadcrumbLinks} />
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
