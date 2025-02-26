"use client"

import { useTranslations } from "next-intl"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@lana/web/ui/card"

import CommitteesList from "./list"

const Committees: React.FC = () => {
  const t = useTranslations("Committees")

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <CommitteesList />
        </CardContent>
      </Card>
    </>
  )
}

export default Committees
