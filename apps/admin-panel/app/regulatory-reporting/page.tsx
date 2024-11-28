"use client"

import React, { useEffect, useState, useCallback, useMemo } from "react"
import { gql } from "@apollo/client"
import { PiWarningCircleFill, PiCheckCircleFill } from "react-icons/pi"

import { ReportCreateDialog } from "./create-dialog"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select"
import {
  ReportProgress,
  useReportDownloadLinksMutation,
  useReportsQuery,
  Report,
} from "@/lib/graphql/generated"
import { Button } from "@/ui/button"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card"
import { Skeleton } from "@/ui/skeleton"

gql`
  query Reports {
    reports {
      reportId
      createdAt
      lastError
      progress
    }
  }

  mutation ReportDownloadLinks($input: ReportDownloadLinksGenerateInput!) {
    reportDownloadLinksGenerate(input: $input) {
      reportId
      links {
        reportName
        url
      }
    }
  }
`

const REFETCH_INTERVAL = 5000

const LoadingSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Skeleton className="h-6 w-32" />
        <div style={{ marginLeft: "calc(48px + 2rem)" }}>
          <Skeleton className="h-10 w-80" />
        </div>
      </div>

      <div className="flex gap-4">
        <Skeleton className="h-6 w-32" />
        <div style={{ marginLeft: "calc(48px + 2rem)" }}>
          <Skeleton className="h-6 w-64" />
        </div>
      </div>

      <div className="flex gap-4">
        <Skeleton className="h-6 w-32" />
        <div style={{ marginLeft: "calc(48px + 2rem)" }}>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-6 w-96" />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Skeleton className="h-6 w-32" />
        <div style={{ marginLeft: "calc(48px + 2rem)" }}>
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  )
}

const RegulatoryReportingPage: React.FC = () => {
  const { data, loading, error, refetch: refetchReports } = useReportsQuery()
  const [
    generateLinks,
    { data: linksData, error: generateLinkError, loading: generateLinkLoading },
  ] = useReportDownloadLinksMutation()

  const [selectedReport, setSelectedReport] = useState<string | undefined>(undefined)
  const [openReportCreateDialog, setOpenReportCreateDialog] = useState(false)

  const selectedReportDetails = useMemo(() => {
    return data?.reports?.find((r) => r.reportId === selectedReport)
  }, [data, selectedReport])

  useEffect(() => {
    if (data?.reports && data.reports.length > 0) {
      setSelectedReport(data.reports[0].reportId)
    }
  }, [data])

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (selectedReportDetails?.progress === ReportProgress.Running) {
      intervalId = setInterval(() => {
        refetchReports()
      }, REFETCH_INTERVAL)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [selectedReportDetails, refetchReports])

  const handleGenerateLinks = useCallback(async () => {
    if (!selectedReport) return

    try {
      await generateLinks({
        variables: { input: { reportId: selectedReport } },
      })
    } catch (error) {
      console.error("Error generating links:", error)
    }
  }, [selectedReport, generateLinks])

  if (error) return <p className="text-destructive">{error.message}</p>

  return (
    <>
      <Card className="max-w-7xl m-auto">
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="flex flex-col gap-1">
            <CardTitle>Report Management</CardTitle>
            <CardDescription>
              Generate and manage regulatory reports, track their status, and download
              generated documents.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            className="ml-4"
            onClick={() => setOpenReportCreateDialog(true)}
          >
            Generate Report
          </Button>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="max-w-[50rem]">
              <LoadingSkeleton />
            </div>
          ) : data?.reports && data.reports.length > 0 ? (
            <div className="max-w-[50rem] space-y-6">
              <ReportSelector
                reports={data?.reports || []}
                selectedReport={selectedReport}
                onSelectReport={setSelectedReport}
              />
              {selectedReport && selectedReportDetails && (
                <ReportDetails
                  selectedReportDetails={selectedReportDetails}
                  onGenerateLinks={handleGenerateLinks}
                  generateLinkLoading={generateLinkLoading}
                  linksData={linksData?.reportDownloadLinksGenerate}
                />
              )}
            </div>
          ) : (
            <p>No reports found</p>
          )}
          {generateLinkError && (
            <p className="text-destructive mt-4">Error: {generateLinkError.message}</p>
          )}
        </CardContent>
      </Card>

      <ReportCreateDialog
        setOpenReportCreateDialog={setOpenReportCreateDialog}
        openReportCreateDialog={openReportCreateDialog}
        refetch={refetchReports}
      />
    </>
  )
}

const ReportSelector: React.FC<{
  reports: Array<{ reportId: string; createdAt: string }>
  selectedReport: string | undefined
  onSelectReport: (reportId: string) => void
}> = ({ reports, selectedReport, onSelectReport }) => {
  return (
    <KeyValueItem
      label="Select Report"
      value={
        <div className="w-80">
          <Select value={selectedReport} onValueChange={onSelectReport}>
            <SelectTrigger>
              <SelectValue placeholder="Select a report" />
            </SelectTrigger>
            <SelectContent>
              {reports.length > 0 ? (
                reports.map((report) => (
                  <SelectItem key={report.reportId} value={report.reportId}>
                    {formatDate(report.createdAt)}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="">No reports found</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      }
    />
  )
}

const ReportDetails: React.FC<{
  selectedReportDetails: Report
  onGenerateLinks: () => void
  generateLinkLoading: boolean
  linksData?: { reportId: string; links: Array<{ reportName: string; url: string }> }
}> = ({ selectedReportDetails, onGenerateLinks, generateLinkLoading, linksData }) => {
  return (
    <div className="space-y-6">
      <KeyValueItem label="Report ID" value={selectedReportDetails.reportId} />
      {selectedReportDetails.lastError && (
        <KeyValueItem label="Last Error" value={selectedReportDetails.lastError} />
      )}
      <KeyValueItem
        label="Status"
        value={formatStatus({
          reportProgress: selectedReportDetails.progress,
          createdAt: selectedReportDetails.createdAt,
        })}
      />
      <KeyValueItem
        label="Downloads"
        value={
          linksData && linksData.reportId === selectedReportDetails.reportId ? (
            <DownloadLinks links={linksData.links} />
          ) : (
            <Button
              onClick={onGenerateLinks}
              variant={
                selectedReportDetails.progress === ReportProgress.Running
                  ? "secondary"
                  : "default"
              }
              disabled={
                generateLinkLoading ||
                selectedReportDetails.progress === ReportProgress.Running
              }
              loading={generateLinkLoading}
            >
              Generate Links
            </Button>
          )
        }
      />
    </div>
  )
}

const DownloadLinks: React.FC<{
  links: Array<{ reportName: string; url: string }>
}> = ({ links }) => {
  return (
    <ul className="list-disc pl-5">
      {links.map((link, index) => (
        <li key={index}>
          <a
            href={link.url}
            download={link.reportName}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {link.reportName}
          </a>
        </li>
      ))}
    </ul>
  )
}

const formatStatus = ({
  reportProgress,
  createdAt,
}: {
  reportProgress: ReportProgress
  createdAt: string
}) => {
  switch (reportProgress) {
    case ReportProgress.Running:
      return (
        <p className="text-warning flex items-center gap-2">
          <PiWarningCircleFill className="w-5 h-5" /> Running (last triggered on{" "}
          {formatDate(createdAt)})
        </p>
      )
    case ReportProgress.Complete:
      return (
        <p className="text-success flex items-center gap-2">
          <PiCheckCircleFill className="w-5 h-5" />
          Operational (last report created on {formatDate(
            createdAt,
          )})
        </p>
      )
    default:
      return null
  }
}

const KeyValueItem: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => {
  return (
    <div className="flex gap-4">
      <span className="w-32 font-semibold">{label}:</span>
      <div style={{ marginLeft: "calc(48px + 2rem)" }}>{value}</div>
    </div>
  )
}

export default RegulatoryReportingPage
