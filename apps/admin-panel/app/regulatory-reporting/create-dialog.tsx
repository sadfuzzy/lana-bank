import React from "react"
import { gql } from "@apollo/client"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@lana/web/ui/dialog"
import { Button } from "@lana/web/ui/button"

import { useTranslations } from "next-intl"

import { useReportCreateMutation } from "@/lib/graphql/generated"

gql`
  mutation ReportCreate {
    reportCreate {
      report {
        reportId
        createdAt
        lastError
        progress
      }
    }
  }
`
type ReportCreateDialogProps = {
  setOpenReportCreateDialog: (isOpen: boolean) => void
  openReportCreateDialog: boolean
  refetch: () => void
}

export const ReportCreateDialog: React.FC<ReportCreateDialogProps> = ({
  setOpenReportCreateDialog,
  openReportCreateDialog,
  refetch,
}) => {
  const t = useTranslations("Reports.createDialog")
  const tCommon = useTranslations("Common")
  const [createReport, { loading }] = useReportCreateMutation()

  const handleCreateReport = async () => {
    try {
      const result = await createReport()
      if (result.data?.reportCreate?.report) {
        toast.success(t("success"))
        refetch()
        setOpenReportCreateDialog(false)
      } else {
        throw new Error("No data returned from mutation")
      }
    } catch (error) {
      console.error("Error creating report:", error)
      toast.error(t("error"))
    }
  }

  return (
    <Dialog open={openReportCreateDialog} onOpenChange={setOpenReportCreateDialog}>
      <DialogContent data-testid="create-report-dialog">
        <DialogHeader>
          <DialogTitle data-testid="dialog-title">{t("title")}</DialogTitle>
          <DialogDescription data-testid="dialog-description">
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpenReportCreateDialog(false)}>
            {tCommon("cancel")}
          </Button>
          <Button
            data-testid="create-report-submit"
            onClick={handleCreateReport}
            loading={loading}
          >
            {loading ? t("creating") : t("create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
