"use client"
import React from "react"

import { cva, type VariantProps } from "class-variance-authority"

import { DetailItem, DetailItemProps, DetailsGroup } from "../items"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/card"

import { Separator } from "@/ui/separator"

const footerVariants = cva("pt-4 pb-4 gap-4", {
  variants: {
    alignment: {
      left: "flex-row",
      right: "flex-row-reverse",
    },
  },
  defaultVariants: {
    alignment: "right",
  },
})

export interface DetailsCardProps extends VariantProps<typeof footerVariants> {
  title: string
  description?: string
  details: DetailItemProps[]
  footerContent?: React.JSX.Element
  errorMessage?: string | undefined | null
  className?: string
  columns?: number
}

export const DetailsCard: React.FC<DetailsCardProps> = ({
  title,
  description,
  details,
  footerContent,
  errorMessage,
  alignment,
  className,
  columns,
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <DetailsGroup columns={columns}>
          {details.map((detail) => (
            <DetailItem key={detail.label?.toString()} {...detail} />
          ))}
        </DetailsGroup>
      </CardContent>
      {errorMessage && (
        <CardFooter className="text-destructive">{errorMessage}</CardFooter>
      )}
      {footerContent && (
        <>
          <Separator />
          <CardFooter className={footerVariants({ alignment })}>
            {footerContent}
          </CardFooter>
        </>
      )}
    </Card>
  )
}
