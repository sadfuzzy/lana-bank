import type { Metadata } from "next"
import { Inter_Tight } from "next/font/google"

import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

import { authOptions } from "./api/auth/[...nextauth]/options"
import { AuthSessionProvider } from "./session-provider"

import CreateButton, { CreateContextProvider } from "./create"
import NavBar from "./navbar"

import { RealtimePriceUpdates } from "@/components/realtime-price"
import ApolloServerWrapper from "@/lib/apollo-client/server-wrapper"

// eslint-disable-next-line import/no-unassigned-import
import "./globals.css"
import { Toast } from "@/components/toast"

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

  const session = await getServerSession(authOptions)
  if (!session && !PUBLIC_PAGES.includes(currentPath)) redirect("/auth/login")
  if (session && PUBLIC_PAGES.includes(currentPath)) redirect("/")
  if (session && ["/", "/app"].includes(currentPath)) redirect("/dashboard")

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased w-screen h-screen select-none`}>
        <AuthSessionProvider session={session}>
          <ApolloServerWrapper>
            <Toast />
            {PUBLIC_PAGES.includes(currentPath) ? (
              children
            ) : (
              <AppLayout>{children}</AppLayout>
            )}
          </ApolloServerWrapper>
        </AuthSessionProvider>
      </body>
    </html>
  )
}

const AppLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <CreateContextProvider>
    <RealtimePriceUpdates />
    <div className="bg-soft h-full w-full flex flex-col md:flex-row">
      <NavBar />
      <div className="flex-1 pt-[72px] md:pt-2 p-2 max-h-screen overflow-hidden bg-secondary/50">
        <div className="p-2 border rounded-md flex flex-col w-full h-full bg-background">
          <div className="md:flex gap-2 hidden pb-2 justify-between items-center max-w-7xl mx-auto w-full">
            <div className="font-semibold text-sm p-2 px-4 bg-secondary rounded-md">
              Welcome to Lana Bank
            </div>
            <CreateButton />
          </div>
          <main className="h-full overflow-y-auto no-scrollbar max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  </CreateContextProvider>
)
