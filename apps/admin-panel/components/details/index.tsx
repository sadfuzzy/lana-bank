import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const detailsGroupVariants = cva("", {
  variants: {
    layout: {
      vertical: "grid gap-6",
      horizontal: "flex flex-col",
    },
  },
  defaultVariants: {
    layout: "vertical",
  },
})

type LayoutType = NonNullable<VariantProps<typeof detailsGroupVariants>["layout"]>

interface DetailsGroupProps
  extends Omit<VariantProps<typeof detailsGroupVariants>, "layout"> {
  children: React.ReactNode
  className?: string
  layout?: LayoutType
  columns?: number
}

interface DetailItemProps {
  label: React.ReactNode
  value: React.ReactNode
  className?: string
  onClick?: (() => void) | null
  showHoverEffect?: boolean
  labelTestId?: string
  valueTestId?: string
  keyClassName?: string
}

const DetailsGroupContext = React.createContext<LayoutType>("vertical")

const DetailsGroup = ({
  children,
  layout = "vertical",
  className,
  columns,
}: DetailsGroupProps) => {
  const childrenArray = React.Children.toArray(children)
  const totalItems = childrenArray.length
  let gridColumns = totalItems > 2 ? "grid-cols-4" : "grid-cols-2"
  if (columns) {
    gridColumns = "grid-cols-" + columns
  }

  return (
    <DetailsGroupContext.Provider value={layout}>
      <div
        className={cn(
          detailsGroupVariants({ layout }),
          layout === "vertical" && gridColumns,
          className,
        )}
      >
        {childrenArray}
      </div>
    </DetailsGroupContext.Provider>
  )
}

const DetailItem = ({
  label,
  value,
  className,
  onClick = null,
  showHoverEffect = false,
  labelTestId,
  valueTestId,
}: DetailItemProps) => {
  const layout = React.useContext(DetailsGroupContext)

  const styles = {
    container: cn(
      "rounded-md font-semibold flex-wrap",
      layout === "vertical"
        ? "flex flex-col justify-between"
        : "flex justify-between items-center p-1",
      (showHoverEffect || onClick) && "hover:bg-secondary",
      className,
    ),
    label: cn("text-muted-foreground", layout === "vertical" ? "text-sm" : "font-normal"),
    value: cn("text-md"),
  }

  return (
    <div
      className={styles.container}
      onClick={onClick || undefined}
      data-testid={labelTestId}
    >
      <div className={styles.label}>{label}</div>
      <div className={styles.value} data-testid={valueTestId}>
        {value}
      </div>
    </div>
  )
}

export { DetailItem, DetailsGroup, type LayoutType }
