"use client"

import { SessionProvider } from "next-auth/react"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <SessionProvider basePath="/admin-panel/api/auth">{children}</SessionProvider>
}
