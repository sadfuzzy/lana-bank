import * as React from "react"

import { ChevronDown } from "@/components/icons"
import { cn } from "@/lib/utils"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "flex h-9 border w-full rounded-md bg-input-text px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-8",
            className,
          )}
          ref={ref}
          {...props}
        >
          {props.children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronDown className="h-4 w-4 text-button-text-secondary" />
        </div>
      </div>
    )
  },
)
Select.displayName = "Select"

export { Select }
