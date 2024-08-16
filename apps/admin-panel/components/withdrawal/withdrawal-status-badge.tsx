import { Badge } from "@/components/primitive/badge"
import { WithdrawalStatus } from "@/lib/graphql/generated"

export type StatusBadgeProps = {
  status: WithdrawalStatus
}

export const WithdrawalStatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const variant =
    status === WithdrawalStatus.Initiated
      ? "default"
      : status === WithdrawalStatus.Confirmed
        ? "success"
        : status === WithdrawalStatus.Cancelled
          ? "destructive"
          : "default"

  return <Badge variant={variant}>{status}</Badge>
}
