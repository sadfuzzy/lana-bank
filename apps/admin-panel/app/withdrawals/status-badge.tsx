import { Badge, BadgeProps } from "@lana/web/ui/badge"
import { useTranslations } from "next-intl"

import { WithdrawalStatus } from "@/lib/graphql/generated"

interface StatusBadgeProps extends BadgeProps {
  status: WithdrawalStatus
}

const getVariant = (status: WithdrawalStatus): BadgeProps["variant"] => {
  switch (status) {
    case WithdrawalStatus.PendingApproval:
      return "default"
    case WithdrawalStatus.PendingConfirmation:
      return "default"
    case WithdrawalStatus.Confirmed:
      return "success"
    case WithdrawalStatus.Cancelled:
      return "destructive"
    case WithdrawalStatus.Denied:
      return "destructive"
    default:
      return "default"
  }
}

export const WithdrawalStatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  ...props
}) => {
  const t = useTranslations("Withdrawals.WithdrawalStatus")
  const variant = getVariant(status)

  const getTranslatedStatus = (status: WithdrawalStatus): string => {
    switch (status) {
      case WithdrawalStatus.PendingApproval:
        return t("pendingApproval", { defaultMessage: "PENDING APPROVAL" }).toUpperCase()
      case WithdrawalStatus.PendingConfirmation:
        return t("pendingConfirmation", {
          defaultMessage: "PENDING CONFIRMATION",
        }).toUpperCase()
      case WithdrawalStatus.Confirmed:
        return t("confirmed", { defaultMessage: "CONFIRMED" }).toUpperCase()
      case WithdrawalStatus.Cancelled:
        return t("cancelled", { defaultMessage: "CANCELLED" }).toUpperCase()
      case WithdrawalStatus.Denied:
        return t("denied", { defaultMessage: "DENIED" }).toUpperCase()
      default:
        return String(status).replace(/_/g, " ").toUpperCase()
    }
  }

  return (
    <Badge variant={variant} {...props}>
      {getTranslatedStatus(status)}
    </Badge>
  )
}
