import React from "react"
import { Skeleton } from "@/components/primitive/skeleton"
import { LuLoader2 } from "react-icons/lu"

export default function Loading() {
  return (
    <div className="relative w-full">
      <Skeleton className="h-80 w-full" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <LuLoader2 className="h-8 w-8 animate-spin" />
        <span className="text-sm font-medium">Loading...</span>
      </div>
    </div>
  )
}
