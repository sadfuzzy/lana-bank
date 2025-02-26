"use client"

import { useTranslations } from "next-intl"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@lana/web/ui/card"

import DepositsList from "./list"

const Deposits: React.FC = () => {
  const t = useTranslations("Deposits")

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <DepositsList />
        </CardContent>
      </Card>
    </>
  )
}

export default Deposits
