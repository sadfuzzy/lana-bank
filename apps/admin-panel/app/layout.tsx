import type { Metadata } from "next"
import { Inter_Tight } from "next/font/google"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

import { authOptions } from "./api/auth/[...nextauth]/options"
import { AuthSessionProvider } from "./session-provider"

import { AppLayout } from "./app-layout"

import ApolloServerWrapper from "@/lib/apollo-client/server-wrapper"
import { Toast } from "@/components/toast"
import { SidebarProvider, SidebarInset } from "@/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

// eslint-disable-next-line import/no-unassigned-import
import "./globals.css"
import { env } from "@/env"

export const metadata: Metadata = {
  title: "Lana Bank | Admin Panel",
}

const inter = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter",
})

const PUBLIC_PAGES = ["/auth/login", "/auth/error", "/auth/verify"]

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headerList = await headers()
  const currentPath = headerList.get("x-current-path") || "/"
  const appVersion = env.NEXT_PUBLIC_APP_VERSION
  const session = await getServerSession(authOptions)
  if (!session && !PUBLIC_PAGES.includes(currentPath)) redirect("/auth/login")
  if (session && PUBLIC_PAGES.includes(currentPath)) redirect("/")
  if (session && ["/", "/app"].includes(currentPath)) redirect("/dashboard")

  const isPublicPage = PUBLIC_PAGES.includes(currentPath)

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-background`}>
        <AuthSessionProvider session={session}>
          <ApolloServerWrapper>
            <Toast />
            {isPublicPage ? (
              <main className="h-screen w-full flex flex-col">{children}</main>
            ) : (
              <SidebarProvider>
                <AppSidebar appVersion={appVersion} />
                <SidebarInset className="min-h-screen md:peer-data-[variant=inset]:shadow-none border">
                  <AppLayout>{children}</AppLayout>
                </SidebarInset>
              </SidebarProvider>
            )}
          </ApolloServerWrapper>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
