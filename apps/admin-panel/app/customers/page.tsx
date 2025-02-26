"use client"

import { useTranslations } from "next-intl"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@lana/web/ui/card"

import CustomersList from "./list"

const Customers: React.FC = () => {
  const t = useTranslations("Customers")

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <CustomersList />
        </CardContent>
      </Card>
    </>
  )
}

export default Customers
