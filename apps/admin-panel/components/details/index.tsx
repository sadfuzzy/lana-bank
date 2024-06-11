import * as React from "react"

import { cn } from "@/lib/utils"

const DetailsGroup = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col">{children}</div>
}

const DetailItem = ({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) => {
  return (
    <div
      className={cn(
        "flex justify-between items-center hover:bg-secondary-foreground p-1 px-2 rounded-md",
        className,
      )}
    >
      <p className="text-textColor-secondary">{label}</p>
      <p>{value}</p>
    </div>
  )
}

export { DetailItem, DetailsGroup }
