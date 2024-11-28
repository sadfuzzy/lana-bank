"use client"

import type { ComponentProps } from "react"

import { UserBlock } from "./user-block"
import { MarketRate } from "./market-rate"
import { NavSection } from "./nav-section"
import {
  navDashboardItems,
  navMainItems,
  navTransactionItems,
  navFinanceItems,
} from "./nav-items"

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/ui/sidebar"

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <UserBlock />
      </SidebarHeader>

      <SidebarContent className="mt-4">
        <NavSection items={navDashboardItems} />
        <NavSection items={navMainItems} />
        <NavSection items={navTransactionItems} label="Transactions" />
        <NavSection items={navFinanceItems} label="Financial Reports" />
      </SidebarContent>

      <SidebarFooter>
        <MarketRate />
      </SidebarFooter>
    </Sidebar>
  )
}

export * from "./nav-section"
export * from "./user-block"
export * from "./market-rate"
export * from "./nav-items"
