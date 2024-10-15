import { useState, forwardRef, useEffect } from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(props.value || "")

    useEffect(() => {
      if (type === "number" && props.value !== undefined) {
        const formattedValue = formatNumber(props.value.toString())
        setDisplayValue(formattedValue)
      } else {
        setDisplayValue(props.value || "")
      }
    }, [props.value, type])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value

      if (type === "number") {
        const numericValue = value.replaceAll(",", "").replace(/[^0-9.-]/g, "")

        if (
          numericValue !== "" &&
          !isNaN(parseFloat(numericValue)) &&
          isFinite(parseFloat(numericValue))
        ) {
          setDisplayValue(formatNumber(numericValue))
          onChange?.({
            ...e,
            target: { ...e.target, value: numericValue, name: props.name || "" },
          })
        } else if (numericValue === "") {
          setDisplayValue(numericValue)
        }
      } else {
        setDisplayValue(value)
        onChange?.(e)
      }
    }

    return (
      <input
        type={type === "number" ? "text" : type}
        className={cn(
          "flex h-9 w-full rounded-md bg-input-text px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
        onChange={handleChange}
        value={displayValue}
      />
    )
  },
)

Input.displayName = "Input"

export { Input }

const formatNumber = (value: string) => Number(value).toLocaleString("en-US")
