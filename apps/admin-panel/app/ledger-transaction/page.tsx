"use client"

import { useRouter } from "next/navigation"

export default function LedgerAccount() {
  const router = useRouter()
  router.push("/journal")

  return <></>
}
