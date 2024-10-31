use async_graphql::*;

use crate::primitives::*;

use lava_app::report::Report as DomainReport;

#[derive(SimpleObject)]
pub(super) struct Report {
    report_id: UUID,
    created_at: Timestamp,
    last_error: Option<String>,
    progress: ReportProgress,
}

impl From<DomainReport> for Report {
    fn from(report: DomainReport) -> Self {
        Self {
            report_id: UUID::from(report.id),
            created_at: report.created_at().into(),
            last_error: report.last_error(),
            progress: report.progress(),
        }
    }
}

#[derive(SimpleObject)]
pub(super) struct ReportCreatePayload {
    report: Report,
}

impl From<lava_app::report::Report> for ReportCreatePayload {
    fn from(report: lava_app::report::Report) -> Self {
        Self {
            report: Report::from(report),
        }
    }
}

#[derive(SimpleObject)]
pub(super) struct ReportDownloadLink {
    report_name: String,
    url: String,
}

impl From<lava_app::report::ReportDownloadLink> for ReportDownloadLink {
    fn from(link: lava_app::report::ReportDownloadLink) -> Self {
        Self {
            report_name: link.report_name,
            url: link.url,
        }
    }
}

#[derive(InputObject)]
pub(super) struct ReportDownloadLinksGenerateInput {
    pub report_id: UUID,
}

#[derive(SimpleObject)]
pub(super) struct ReportDownloadLinksGeneratePayload {
    report_id: UUID,
    links: Vec<ReportDownloadLink>,
}

impl From<lava_app::report::GeneratedReportDownloadLinks> for ReportDownloadLinksGeneratePayload {
    fn from(generated_links: lava_app::report::GeneratedReportDownloadLinks) -> Self {
        Self {
            report_id: UUID::from(generated_links.report_id),
            links: generated_links
                .links
                .into_iter()
                .map(ReportDownloadLink::from)
                .collect(),
        }
    }
}
