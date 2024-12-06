"use client"

import type { ComponentProps } from "react"

import { UserBlock } from "./user-block"
import { NavSection } from "./nav-section"
import {
  navDashboardItems,
  navTransactionItems,
  navFinanceItems,
  navLoansItems,
  navCustomersItems,
  navAdminItems,
} from "./nav-items"

import { Sidebar, SidebarContent, SidebarHeader } from "@/ui/sidebar"

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <UserBlock />
      </SidebarHeader>
      <SidebarContent className="mt-4">
        <NavSection items={navDashboardItems} />
        <NavSection items={navLoansItems} label="Loans" />
        <NavSection items={navCustomersItems} label="Customers" />
        <NavSection items={navTransactionItems} label="Transactions" />
        <NavSection items={navAdminItems} label="Administration" />
        <NavSection items={navFinanceItems} label="Financial Reports" />
      </SidebarContent>
    </Sidebar>
  )
}
export * from "./nav-section"
export * from "./user-block"
export * from "./market-rate"
export * from "./nav-items"
