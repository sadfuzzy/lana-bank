"use client"
import React, { useEffect, useState } from "react"
import { gql } from "@apollo/client"

import Link from "next/link"

import { useSearchParams } from "next/navigation"
import { IoEllipsisHorizontal } from "react-icons/io5"

import { CreateTermsTemplateDialog } from "./create"

import { PageHeading } from "@/components/page-heading"
import { Button } from "@/components/primitive/button"
import {
  TermsTemplate,
  useMeQuery,
  useTermsTemplatesQuery,
} from "@/lib/graphql/generated"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitive/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/primitive/table"
import { formatPeriod } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/primitive/dropdown-menu"
import { UpdateTermsTemplateDialog } from "@/components/terms-template/update-dialog"

gql`
  query TermsTemplates {
    termsTemplates {
      id
      name
      termsId
      createdAt
      subjectCanUpdateTermsTemplate
      values {
        annualRate
        accrualInterval
        incurrenceInterval
        liquidationCvl
        marginCallCvl
        initialCvl
        duration {
          period
          units
        }
      }
    }
  }
`

function TermPage() {
  const searchParams = useSearchParams()

  const { data, refetch, loading, error } = useTermsTemplatesQuery()
  const [openCreateTermsTemplateDialog, setOpenCreateTermsTemplateDialog] =
    useState<boolean>(false)
  const [openUpdateTermsTemplateDialog, setOpenUpdateTermsTemplateDialog] =
    useState<TermsTemplate | null>(null)

  useEffect(() => {
    if (searchParams.get("create")) setOpenCreateTermsTemplateDialog(true)
  }, [searchParams, setOpenCreateTermsTemplateDialog])

  return (
    <main>
      {openUpdateTermsTemplateDialog && (
        <UpdateTermsTemplateDialog
          termsTemplate={openUpdateTermsTemplateDialog}
          openUpdateTermsTemplateDialog={Boolean(openUpdateTermsTemplateDialog)}
          setOpenUpdateTermsTemplateDialog={() => setOpenUpdateTermsTemplateDialog(null)}
          refetch={refetch}
        />
      )}
      <CreateTermsTemplateDialog
        openCreateTermsTemplateDialog={openCreateTermsTemplateDialog}
        setOpenCreateTermsTemplateDialog={setOpenCreateTermsTemplateDialog}
        refetch={refetch}
      />
      <Card>
        <CardHeader>
          <CardTitle>Terms Templates</CardTitle>
          <CardDescription>
            Terms template that can be used with loan and credit facility
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="mt-6">Loading...</p>
          ) : error ? (
            <p className="text-destructive mt-6">{error.message}</p>
          ) : data?.termsTemplates && data.termsTemplates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Annual Rate</TableHead>
                  <TableHead>Initial CVL</TableHead>
                  <TableHead>MarginCall CVL</TableHead>
                  <TableHead>Liquidation CVL</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.termsTemplates.map((termsTemplate) => (
                  <TableRow key={termsTemplate.termsId}>
                    <TableCell className="hover:underline">
                      <Link href={`/terms-templates/${termsTemplate.termsId}`}>
                        {termsTemplate.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {String(termsTemplate.values.duration.units) +
                        " " +
                        formatPeriod(termsTemplate.values.duration.period)}
                    </TableCell>
                    <TableCell>{termsTemplate.values.annualRate}%</TableCell>
                    <TableCell>{termsTemplate.values.initialCvl}%</TableCell>
                    <TableCell>{termsTemplate.values.marginCallCvl}%</TableCell>
                    <TableCell>{termsTemplate.values.liquidationCvl}%</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost">
                            <IoEllipsisHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="text-sm">
                          <DropdownMenuItem>
                            <Link href={`/terms-templates/${termsTemplate.termsId}`}>
                              View details
                            </Link>
                          </DropdownMenuItem>
                          {termsTemplate.subjectCanUpdateTermsTemplate && (
                            <DropdownMenuItem
                              onClick={() =>
                                setOpenUpdateTermsTemplateDialog(termsTemplate)
                              }
                            >
                              Update
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="mt-6">No data found</p>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

export default TermPage
