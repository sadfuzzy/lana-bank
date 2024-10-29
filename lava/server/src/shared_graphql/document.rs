use async_graphql::*;

use crate::shared_graphql::primitives::*;

#[derive(Enum, Copy, Clone, Eq, PartialEq)]
pub enum DocumentStatus {
    Active,
    Archived,
}

#[derive(SimpleObject)]
pub struct Document {
    id: UUID,
    customer_id: UUID,
    filename: String,
    status: DocumentStatus,
}

#[derive(InputObject)]
pub struct DocumentCreateInput {
    pub file: Upload,
    pub customer_id: UUID,
}

#[derive(SimpleObject)]
pub struct DocumentCreatePayload {
    pub document: Document,
}

impl From<lava_app::document::Document> for Document {
    fn from(document: lava_app::document::Document) -> Self {
        Self {
            id: UUID::from(document.id),
            customer_id: UUID::from(document.customer_id),
            filename: document.filename,
            status: match document.status {
                lava_app::document::DocumentStatus::Active => DocumentStatus::Active,
                lava_app::document::DocumentStatus::Archived => DocumentStatus::Archived,
            },
        }
    }
}

impl From<lava_app::document::Document> for DocumentCreatePayload {
    fn from(document: lava_app::document::Document) -> Self {
        Self {
            document: document.into(),
        }
    }
}

// Add this to handle listing documents for a specific customer
#[derive(InputObject)]
pub struct DocumentListForCustomerInput {
    pub customer_id: UUID,
}

#[derive(SimpleObject)]
pub struct DocumentListForCustomerPayload {
    pub documents: Vec<Document>,
}

impl From<Vec<lava_app::document::Document>> for DocumentListForCustomerPayload {
    fn from(documents: Vec<lava_app::document::Document>) -> Self {
        Self {
            documents: documents.into_iter().map(Document::from).collect(),
        }
    }
}

#[derive(InputObject)]
pub struct DocumentDownloadLinksGenerateInput {
    pub document_id: UUID,
}

#[derive(SimpleObject)]
pub struct DocumentDownloadLinksGeneratePayload {
    document_id: UUID,
    link: String,
}

impl From<lava_app::document::GeneratedDocumentDownloadLink>
    for DocumentDownloadLinksGeneratePayload
{
    fn from(value: lava_app::document::GeneratedDocumentDownloadLink) -> Self {
        Self {
            document_id: UUID::from(value.document_id),
            link: value.link,
        }
    }
}

#[derive(InputObject)]
pub struct DocumentDeleteInput {
    pub document_id: UUID,
}

#[derive(SimpleObject)]
pub struct DocumentDeletePayload {
    pub deleted_document_id: UUID,
}

#[derive(InputObject)]
pub struct DocumentArchiveInput {
    pub document_id: UUID,
}

#[derive(SimpleObject)]
pub struct DocumentArchivePayload {
    pub document: Document,
}

impl From<lava_app::document::Document> for DocumentArchivePayload {
    fn from(document: lava_app::document::Document) -> Self {
        Self {
            document: document.into(),
        }
    }
}
