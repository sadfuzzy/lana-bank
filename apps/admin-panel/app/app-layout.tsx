"use client"

import CreateButton, { CreateContextProvider } from "./create"
import { BreadcrumbProvider } from "./breadcrumb-provider"
import { DynamicBreadcrumb } from "./dynamic-breadcrumb"

import { RealtimePriceUpdates } from "@/components/realtime-price"
import { SidebarTrigger } from "@/ui/sidebar"

export const AppLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <BreadcrumbProvider>
      <CreateContextProvider>
        <div className="container mx-auto p-2">
          <div className="max-w-7xl w-full mx-auto">
            <header className="flex justify-between items-center mb-2 align-middle">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                <DynamicBreadcrumb />
              </div>
              <CreateButton />
            </header>
            <RealtimePriceUpdates />
            <main>{children}</main>
          </div>
        </div>
      </CreateContextProvider>
    </BreadcrumbProvider>
  )
}
