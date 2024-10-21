use darling::ToTokens;
use proc_macro2::{Span, TokenStream};
use quote::{quote, TokenStreamExt};

use super::options::*;

pub struct FindByFn<'a> {
    entity: &'a syn::Ident,
    column_name: &'a syn::Ident,
    column_type: &'a syn::Type,
    table_name: &'a str,
    error: &'a syn::Type,
}

impl<'a> FindByFn<'a> {
    pub fn new(
        column_name: &'a syn::Ident,
        column_type: &'a syn::Type,
        opts: &'a RepositoryOptions,
    ) -> Self {
        Self {
            column_name,
            column_type,
            entity: opts.entity(),
            table_name: opts.table_name(),
            error: opts.err(),
        }
    }
}

impl<'a> ToTokens for FindByFn<'a> {
    fn to_tokens(&self, tokens: &mut TokenStream) {
        let entity = self.entity;
        let column_name = &self.column_name;
        let column_type = &self.column_type;
        let error = self.error;

        let fn_name = syn::Ident::new(&format!("find_by_{}", column_name), Span::call_site());
        let fn_via = syn::Ident::new(&format!("find_by_{}_via", column_name), Span::call_site());
        let fn_in_tx =
            syn::Ident::new(&format!("find_by_{}_in_tx", column_name), Span::call_site());

        let query = format!(
            r#"SELECT id FROM {} WHERE {} = $1"#,
            self.table_name, column_name
        );

        tokens.append_all(quote! {
            pub async fn #fn_name(
                &self,
                #column_name: #column_type
            ) -> Result<#entity, #error> {
                self.#fn_via(self.pool(), #column_name).await
            }

            pub async fn #fn_in_tx(
                &self,
                db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
                #column_name: #column_type
            ) -> Result<#entity, #error> {
                self.#fn_via(&mut **db, #column_name).await
            }

            async fn #fn_via(
                &self,
                executor: impl sqlx::Executor<'_, Database = sqlx::Postgres>,
                #column_name: #column_type
            ) -> Result<#entity, #error> {
                es_entity::es_query!(
                        executor,
                        #query,
                        #column_name as #column_type,
                )
                    .fetch_one()
                    .await
            }
        });
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use proc_macro2::Span;
    use syn::{parse_quote, Ident};

    #[test]
    fn find_by_fn() {
        let column_name = parse_quote!(id);
        let column_type = parse_quote!(EntityId);
        let entity = Ident::new("Entity", Span::call_site());
        let error = syn::parse_str("es_entity::EsRepoError").unwrap();

        let persist_fn = FindByFn {
            column_name: &column_name,
            column_type: &column_type,
            entity: &entity,
            table_name: "entities",
            error: &error,
        };

        let mut tokens = TokenStream::new();
        persist_fn.to_tokens(&mut tokens);

        let expected = quote! {
            pub async fn find_by_id(
                &self,
                id: EntityId
            ) -> Result<Entity, es_entity::EsRepoError> {
                self.find_by_id_via(self.pool(), id).await
            }

            pub async fn find_by_id_in_tx(
                &self,
                db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
                id: EntityId
            ) -> Result<Entity, es_entity::EsRepoError> {
                self.find_by_id_via(&mut **db, id).await
            }

            async fn find_by_id_via(
                &self,
                executor: impl sqlx::Executor<'_, Database = sqlx::Postgres>,
                id: EntityId
            ) -> Result<Entity, es_entity::EsRepoError> {
                es_entity::es_query!(
                        executor,
                        "SELECT id FROM entities WHERE id = $1",
                        id as EntityId,
                )
                    .fetch_one()
                    .await
            }
        };

        assert_eq!(tokens.to_string(), expected.to_string());
    }
}
