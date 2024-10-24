mod columns;
mod delete;

use convert_case::{Case, Casing};
use darling::FromDeriveInput;

pub use columns::*;
pub use delete::*;

#[derive(FromDeriveInput)]
#[darling(attributes(es_repo), map = "Self::update_defaults")]
pub struct RepositoryOptions {
    pub ident: syn::Ident,
    #[darling(default)]
    pub columns: Columns,
    #[darling(default)]
    pub post_persist_hook: Option<syn::Ident>,
    #[darling(default)]
    pub delete: DeleteOption,

    #[darling(rename = "entity")]
    entity_ident: syn::Ident,
    #[darling(default, rename = "new")]
    new_entity_ident: Option<syn::Ident>,
    #[darling(default, rename = "event")]
    event_ident: Option<syn::Ident>,
    #[darling(default, rename = "id")]
    id_ty: Option<syn::Ident>,
    #[darling(default, rename = "err")]
    err_ty: Option<syn::Type>,
    #[darling(default, rename = "tbl")]
    table_name: Option<String>,
    #[darling(default, rename = "events_tbl")]
    events_table_name: Option<String>,
}

impl RepositoryOptions {
    fn update_defaults(mut self) -> Self {
        let entity_name = self.entity_ident.to_string();
        if self.new_entity_ident.is_none() {
            self.new_entity_ident = Some(syn::Ident::new(
                &format!("New{}", entity_name),
                proc_macro2::Span::call_site(),
            ));
        }
        if self.event_ident.is_none() {
            self.event_ident = Some(syn::Ident::new(
                &format!("{}Event", entity_name),
                proc_macro2::Span::call_site(),
            ));
        }
        if self.id_ty.is_none() {
            self.id_ty = Some(syn::Ident::new(
                &format!("{}Id", entity_name),
                proc_macro2::Span::call_site(),
            ));
        }
        if self.err_ty.is_none() {
            self.err_ty =
                Some(syn::parse_str("es_entity::EsRepoError").expect("Failed to parse error type"));
        }
        if self.table_name.is_none() {
            self.table_name =
                Some(pluralizer::pluralize(&entity_name, 2, false).to_case(Case::Snake));
        }
        if self.events_table_name.is_none() {
            self.events_table_name = Some(format!("{}Events", entity_name).to_case(Case::Snake));
        }

        self.columns
            .set_id_column(self.id_ty.as_ref().expect("Id not set"));

        self
    }

    pub fn entity(&self) -> &syn::Ident {
        &self.entity_ident
    }

    pub fn table_name(&self) -> &str {
        self.table_name.as_ref().expect("Table name is not set")
    }

    pub fn id(&self) -> &syn::Ident {
        self.id_ty.as_ref().expect("ID identifier is not set")
    }

    pub fn event(&self) -> &syn::Ident {
        self.event_ident
            .as_ref()
            .expect("Event identifier is not set")
    }

    pub fn events_table_name(&self) -> &str {
        self.events_table_name
            .as_ref()
            .expect("Events table name is not set")
    }

    pub fn new_entity(&self) -> &syn::Ident {
        self.new_entity_ident
            .as_ref()
            .expect("New entity identifier is not set")
    }

    pub fn err(&self) -> &syn::Type {
        self.err_ty.as_ref().expect("Error identifier is not set")
    }
}
