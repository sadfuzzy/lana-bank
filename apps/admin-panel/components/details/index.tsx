import * as React from "react"

import { cn } from "@/lib/utils"

const DetailsGroup = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return <div className={cn("flex flex-col", className)}>{children}</div>
}

const DetailItem = ({
  label,
  value,
  className,
  onClick = null,
  hover = false,
  keyTestId,
  valueTestId,
}: {
  label: React.ReactNode
  value: React.ReactNode
  className?: string
  onClick?: null | (() => void)
  hover?: boolean
  keyTestId?: string
  valueTestId?: string
}) => {
  const onClickHoverClass = onClick ? "hover:cursor-pointer hover:bg-secondary" : ""

  const hoverClass = hover ? "hover:bg-secondary" : ""

  return (
    <div
      className={cn(
        "flex justify-between items-center p-1 rounded-md font-semibold flex-wrap",
        className,
        onClickHoverClass,
        hoverClass,
      )}
      onClick={onClick || undefined}
      data-testid={keyTestId}
    >
      <div className="text-muted-foreground font-normal">{label}</div>
      <div data-testid={valueTestId}>{value}</div>
    </div>
  )
}

export { DetailItem, DetailsGroup }
