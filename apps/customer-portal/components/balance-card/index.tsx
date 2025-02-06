import { Card, CardDescription, CardHeader, CardTitle } from "@lana/web/ui/card"
import { ReactNode } from "react"

type BalanceCardProps = {
  h1?: ReactNode
  title: string
  description: string
  icon?: ReactNode
  variant?: "pending" | "settled"
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  h1,
  title,
  description,
  icon,
  variant = "pending",
}) => {
  const getVariantClasses = (variant: "pending" | "settled") => {
    switch (variant) {
      case "pending":
        return "border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800"
      case "settled":
        return "border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800"
      default:
        return ""
    }
  }

  return (
    <Card
      className={`w-full transition-colors ${getVariantClasses(variant)}`}
      data-testid={title.toLowerCase().replace(" ", "-")}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon}
          <CardDescription className="text-md font-medium">{title}</CardDescription>
        </div>
        <div className="flex flex-col">
          <CardTitle
            className={`text-4xl ${
              variant === "pending"
                ? "text-orange-700 dark:text-orange-300"
                : "text-green-700 dark:text-green-300"
            }`}
          >
            {h1}
          </CardTitle>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
