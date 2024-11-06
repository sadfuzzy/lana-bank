"use client"

import Link from "next/link"
import { HiArrowRight } from "react-icons/hi"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/primitive/card"
import { Button } from "@/components/primitive/button"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/primitive/tooltip"

type DashboardCardProps = {
  h1?: string
  h2?: string
  h2PopupDescription?: string
  title: string
  description: string
  to?: string
  buttonToRight?: boolean
  content?: React.ReactElement
  buttonText?: string
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  h1,
  h2,
  h2PopupDescription,
  title,
  description,
  to = "",
  content,
  buttonToRight = false,
  buttonText = "",
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-end gap-2">
          {h1 && <CardTitle className="text-2xl font-bold">{h1}</CardTitle>}
          {h2 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-base text-muted-foreground mb-1">{h2}</span>
                </TooltipTrigger>
                {h2PopupDescription && (
                  <TooltipContent className="max-w-xs">
                    <p>{h2PopupDescription}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {content}
        {to && (
          <div className={`${buttonToRight ? "text-right" : ""}`}>
            <Link href={to}>
              <Button variant="outline">
                {buttonText || "View Details"}
                <HiArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DashboardCard
