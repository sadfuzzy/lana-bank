import React from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lana/web/ui/card"

import { cn } from "@/lib/utils"

interface CardWrapperProps {
  title: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export default function CardWrapper({
  title,
  description,
  children,
  className,
}: CardWrapperProps) {
  return (
    <Card className={cn("w-full", className)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  )
}
