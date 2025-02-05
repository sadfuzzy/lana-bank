import type { Metadata } from "next"
import { Inter_Tight } from "next/font/google"

// eslint-disable-next-line import/no-unassigned-import
import "./globals.css"
import { PublicEnvScript } from "next-runtime-env"

import { ThemeProvider } from "next-themes"

import { Toaster } from "@lana/web/ui/toast"

export const metadata: Metadata = {
  title: "lana Bank",
  description: "Where the lana keeps flowing",
}
const inter = Inter_Tight({ subsets: ["latin"], display: "auto" })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      {process.env.NODE_ENV === "development" ||
      process.env.RUNNING_IN_CI === "true" ? null : (
        <head>
          <PublicEnvScript />
        </head>
      )}
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
