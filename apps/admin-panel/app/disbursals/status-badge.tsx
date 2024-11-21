import { Badge, BadgeProps } from "@/ui/badge"
import { DisbursalStatus } from "@/lib/graphql/generated"

interface StatusBadgeProps extends BadgeProps {
  status: DisbursalStatus
}

const getVariant = (status: DisbursalStatus): BadgeProps["variant"] => {
  switch (status) {
    case DisbursalStatus.New:
      return "default"
    case DisbursalStatus.Approved:
      return "default"
    case DisbursalStatus.Confirmed:
      return "success"
    case DisbursalStatus.Denied:
      return "destructive"
    default:
      return "default"
  }
}

export const DisbursalStatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  ...props
}) => {
  const variant = getVariant(status)
  return (
    <Badge variant={variant} {...props}>
      {status}
    </Badge>
  )
}
