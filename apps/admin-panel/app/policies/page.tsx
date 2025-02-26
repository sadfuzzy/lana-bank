"use client"

import { useTranslations } from "next-intl"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@lana/web/ui/card"

import PolicyList from "./list"

const Policies: React.FC = () => {
  const t = useTranslations("Policies")

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <PolicyList />
        </CardContent>
      </Card>
    </>
  )
}

export default Policies
