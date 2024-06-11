import React from "react"
import { cva, VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap p-2 px-4 rounded-xl text-sm font-medium transition focus:outline-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-button-text",
        secondary: "bg-secondary",
        ghost: "bg-transparent hover:bg-secondary",
        transparent: "bg-transparent",
        link: "bg-transparent hover:underline",
        outline: "bg-transparent border-2 border-primary",
      },
      enabled: {
        true: "opacity-100 cursor-pointer",
        false: "opacity-50 cursor-not-allowed",
      },
    },
    defaultVariants: {
      variant: "primary",
      enabled: true,
    },
  },
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = (props: ButtonProps) => {
  const { variant, enabled, className, ...otherProps } = props
  const buttonClass = cn(buttonVariants({ variant, enabled }), className)

  return <button className={buttonClass} {...otherProps}></button>
}
Button.displayName = "Button"

export { Button }
