"use client"

import Link from "next/link"
import { HiArrowRight } from "react-icons/hi"

import { ReactNode } from "react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/ui/card"
import { Button } from "@/ui/button"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/ui/tooltip"

type DashboardCardProps = {
  h1?: ReactNode
  h2?: ReactNode
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
          {h1 && <CardTitle className="text-3xl font-bold">{h1}</CardTitle>}
          {h2 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-base mb-0.5 text-[0.87rem] text-muted-foreground ml-2">
                    {h2}
                  </span>
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
