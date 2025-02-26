"use client"

import { useTranslations } from "next-intl"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@lana/web/ui/card"

import WithdrawalsList from "./list"

const Withdrawals: React.FC = () => {
  const t = useTranslations("Withdrawals")

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <WithdrawalsList />
        </CardContent>
      </Card>
    </>
  )
}

export default Withdrawals
