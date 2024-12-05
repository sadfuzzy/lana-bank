"use client"

import CreateButton, { CreateContextProvider } from "./create"
import { BreadcrumbProvider } from "./breadcrumb-provider"
import { DynamicBreadcrumb } from "./dynamic-breadcrumb"

import { RealtimePriceUpdates } from "@/components/realtime-price"

export const AppLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <BreadcrumbProvider>
      <CreateContextProvider>
        <div className="container mx-auto p-2">
          <div className="max-w-7xl w-full mx-auto">
            <header className="flex justify-between items-center mb-2 align-middle">
              <DynamicBreadcrumb />
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
