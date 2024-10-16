import * as React from "react"

import { cn } from "@/lib/utils"

interface KeyValueGroupProps extends React.HTMLAttributes<HTMLDivElement> {}
interface KeyValueCell extends React.HTMLAttributes<HTMLDivElement> {}
interface KeyComponentProps extends React.HTMLAttributes<HTMLParagraphElement> {}
interface valueProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const KeyValueGroup = React.forwardRef<HTMLDivElement, KeyValueGroupProps>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-0", className)} {...props}>
      {children}
    </div>
  ),
)
KeyValueGroup.displayName = "KeyValueGroup"

const KeyValueCell = React.forwardRef<HTMLDivElement, KeyValueCell>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex justify-between items-center p-1 px-2 hover:bg-secondary-foreground rounded-md",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
)
KeyValueCell.displayName = "KeyValueCell"

const Key = React.forwardRef<HTMLParagraphElement, KeyComponentProps>(
  ({ children, className, ...props }, ref) => (
    <p ref={ref} className={cn("text-textColor-secondary text-sm", className)} {...props}>
      {children}
    </p>
  ),
)
Key.displayName = "Key"

const Value = React.forwardRef<HTMLParagraphElement, valueProps>(
  ({ children, className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-md text-textColor-primary font-semibold", className)}
      {...props}
    >
      {children}
    </p>
  ),
)
Value.displayName = "Value"

export { KeyValueGroup, KeyValueCell, Key, Value }
