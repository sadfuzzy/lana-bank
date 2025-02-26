import { Badge, BadgeProps } from "@lana/web/ui/badge"
import { useTranslations } from "next-intl"

import { CreditFacilityStatus } from "@/lib/graphql/generated"
import { cn } from "@/lib/utils"

interface LoanAndCreditFacilityStatusBadgeProps extends BadgeProps {
  status: CreditFacilityStatus
}

const getVariant = (status: CreditFacilityStatus): BadgeProps["variant"] => {
  switch (status) {
    case CreditFacilityStatus.Active:
      return "success"
    case CreditFacilityStatus.PendingApproval:
      return "default"
    case CreditFacilityStatus.PendingCollateralization:
      return "warning"
    case CreditFacilityStatus.Closed:
      return "secondary"
    case CreditFacilityStatus.Matured:
      return "secondary"
  }
}

export const LoanAndCreditFacilityStatusBadge = ({
  status,
  className,
  ...otherProps
}: LoanAndCreditFacilityStatusBadgeProps) => {
  const t = useTranslations("CreditFacilities.CreditFacilityStatus")
  const variant = getVariant(status)

  const getTranslatedStatus = (status: CreditFacilityStatus): string => {
    switch (status) {
      case CreditFacilityStatus.Active:
        return t("active", { defaultMessage: "ACTIVE" }).toUpperCase()
      case CreditFacilityStatus.PendingApproval:
        return t("pendingApproval", { defaultMessage: "PENDING APPROVAL" }).toUpperCase()
      case CreditFacilityStatus.PendingCollateralization:
        return t("pendingCollateralization", {
          defaultMessage: "PENDING COLLATERALIZATION",
        }).toUpperCase()
      case CreditFacilityStatus.Closed:
        return t("closed", { defaultMessage: "CLOSED" }).toUpperCase()
      case CreditFacilityStatus.Matured:
        return t("matured", { defaultMessage: "MATURED" }).toUpperCase()
    }
  }

  return (
    <Badge variant={variant} className={cn(className)} {...otherProps}>
      {getTranslatedStatus(status)}
    </Badge>
  )
}
