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
  labelComponent,
  valueComponent,
  onClick = null,
  hover = false,
}: {
  label?: string
  value?: string
  className?: string
  labelComponent?: React.ReactNode
  valueComponent?: React.ReactNode
  onClick?: null | (() => void)
  hover?: boolean
}) => {
  const onClickHoverClass = onClick
    ? "hover:cursor-pointer hover:bg-secondary-foreground"
    : ""

  const hoverClass = hover ? "hover:bg-secondary-foreground" : ""

  return (
    <div
      className={cn(
        "flex justify-between items-center p-1 px-2 rounded-md",
        className,
        onClickHoverClass,
        hoverClass,
      )}
      onClick={onClick || undefined}
    >
      {labelComponent ? (
        labelComponent
      ) : (
        <p className="text-textColor-secondary">{label}</p>
      )}
      {valueComponent ? valueComponent : <p>{value}</p>}
    </div>
  )
}

export { DetailItem, DetailsGroup }
