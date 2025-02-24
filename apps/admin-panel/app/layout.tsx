import type { Metadata } from "next"

import { Inter_Tight } from "next/font/google"

import AppLoading from "./app-loading"

import { Authenticated } from "./auth/session"

export const metadata: Metadata = {
  title: "Lana Bank",
  description:
    "Unlock the power of Bitcoin-backed lending with Lana Bank – fast, secure, and seamless",
}

// eslint-disable-next-line import/no-unassigned-import
import "./globals.css"

const inter = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter",
})

const RootLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-background`}>
        <AppLoading>
          <Authenticated>{children}</Authenticated>
        </AppLoading>
      </body>
    </html>
  )
}

export default RootLayout
