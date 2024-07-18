import { Badge, BadgeProps } from "@/components/primitive/badge"
import { LoanStatus } from "@/lib/graphql/generated"
import { cn } from "@/lib/utils"

interface LoanBadgeProps extends BadgeProps {
  status: string
}

export const LoanBadge = ({ status, className, ...otherProps }: LoanBadgeProps) => {
  const variant =
    status === LoanStatus.Active
      ? "success"
      : status === LoanStatus.New
        ? "default"
        : "secondary"

  return (
    <Badge variant={variant} className={cn(className)} {...otherProps}>
      {status}
    </Badge>
  )
}

LoanBadge.displayName = "LoanBadge"
