"use client"

import { useGetRealtimePriceUpdatesQuery } from "@/lib/graphql/generated"
import { currencyConverter } from "@/lib/utils"
import { Skeleton } from "@/ui/skeleton"

export function MarketRate() {
  const { data, loading } = useGetRealtimePriceUpdatesQuery()
  const usdBtcRate = currencyConverter
    .centsToUsd(data?.realtimePrice?.usdCentsPerBtc || NaN)
    .toLocaleString()

  if (loading) return <Skeleton className="h-4 w-full py-2" />

  return (
    <div className="flex items-center px-2 py-2 gap-1 text-sm text-muted-foreground font-medium">
      <div>USD/BTC Market Rate: </div>
      <div>{String(usdBtcRate) === "NaN" ? "Not Available" : `$${usdBtcRate}`}</div>
    </div>
  )
}
