"use client"

import React, { ReactNode } from "react"
import Link from "next/link"
import { cva, type VariantProps } from "class-variance-authority"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/card"
import { DetailItem, DetailsGroup } from "@/components/details"
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

export type DetailItemType = {
  label: string
  value: ReactNode
  href?: string
  hover?: boolean
  valueTestId?: string
}

export interface DetailsCardProps extends VariantProps<typeof footerVariants> {
  title: string
  description?: string
  details: DetailItemType[]
  footerContent?: ReactNode
  errorMessage?: string | undefined | null
  hideFooterSeparator?: boolean
  className?: string
  columns?: number
}

const DetailsCard = ({
  title,
  description,
  details,
  footerContent,
  errorMessage,
  alignment,
  hideFooterSeparator = false,
  className,
  columns,
}: DetailsCardProps) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <DetailsGroup columns={columns}>
          {details.map((detail) => {
            const detailItem = (
              <DetailItem
                showHoverEffect={detail.href ? true : false}
                label={detail.label}
                value={detail.value}
                valueTestId={detail.valueTestId}
              />
            )

            return detail.href ? (
              <Link key={detail.label} href={detail.href}>
                {detailItem}
              </Link>
            ) : (
              detailItem
            )
          })}
        </DetailsGroup>
      </CardContent>
      {errorMessage && (
        <CardFooter className="text-destructive">{errorMessage}</CardFooter>
      )}
      {footerContent && (
        <>
          {!hideFooterSeparator && <Separator />}
          <CardFooter className={footerVariants({ alignment })}>
            {footerContent}
          </CardFooter>
        </>
      )}
    </Card>
  )
}

export default DetailsCard
