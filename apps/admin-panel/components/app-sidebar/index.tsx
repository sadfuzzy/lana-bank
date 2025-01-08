"use client"

import type { ComponentProps } from "react"

import { ShipWheel } from "lucide-react"

import Link from "next/link"

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

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/ui/sidebar"

import { env } from "@/env"

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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <ShipWheel className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Lana Bank</span>
                  <span className="truncate text-xs">v{env.NEXT_PUBLIC_APP_VERSION}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
export * from "./nav-section"
export * from "./user-block"
export * from "./market-rate"
export * from "./nav-items"
