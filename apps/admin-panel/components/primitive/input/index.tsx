"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  numeric?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, defaultValue = "", numeric = false, ...props }, ref) => {
    const [_displayValue, setDisplayValue] = React.useState(defaultValue)
    let displayValue = _displayValue

    const isNumeric = numeric && type === "number"

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      "use client"
      let value = e.target.value

      if (isNumeric) {
        value = value.replaceAll(",", "").replace(/\D/g, "")
      }

      setDisplayValue(value)
      props.onChange && props.onChange({ ...e, target: { ...e.target, value } })
    }

    if (isNumeric && _displayValue !== "") {
      displayValue = Number(_displayValue).toLocaleString("en-US")
    }
    return (
      <input
        type={isNumeric ? "text" : type}
        value={displayValue}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
        onChange={handleChange}
      />
    )
  },
)
Input.displayName = "Input"

export { Input }
