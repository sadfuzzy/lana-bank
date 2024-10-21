use convert_case::{Case, Casing};
use darling::ToTokens;
use proc_macro2::{Span, TokenStream};
use quote::{quote, TokenStreamExt};

use super::options::*;

pub struct CursorStruct<'a> {
    id: &'a syn::Ident,
    entity: &'a syn::Ident,
    column_name: &'a syn::Ident,
    column_type: &'a syn::Type,
}

impl<'a> CursorStruct<'a> {
    fn name(&self) -> String {
        format!(
            "{}By{}Cursor",
            self.entity,
            self.column_name.to_string().to_case(Case::UpperCamel)
        )
    }
}

impl<'a> ToTokens for CursorStruct<'a> {
    fn to_tokens(&self, tokens: &mut TokenStream) {
        let struct_ident = syn::Ident::new(
            &format!(
                "{}By{}Cursor",
                self.entity,
                self.column_name.to_string().to_case(Case::UpperCamel)
            ),
            Span::call_site(),
        );
        let id = &self.id;

        let field = if &self.column_name.to_string() != "id" {
            let column_name = &self.column_name;
            let column_type = &self.column_type;
            quote! {
                pub #column_name: #column_type,
            }
        } else {
            quote! {}
        };

        tokens.append_all(quote! {
            #[derive(serde::Serialize, serde::Deserialize)]
            pub struct #struct_ident {
                pub id: #id,
                #field
            }
        });
    }
}

pub struct ListByFn<'a> {
    id: &'a syn::Ident,
    entity: &'a syn::Ident,
    column_name: &'a syn::Ident,
    column_type: &'a syn::Type,
    table_name: &'a str,
    error: &'a syn::Type,
}

impl<'a> ListByFn<'a> {
    pub fn new(
        column_name: &'a syn::Ident,
        column_type: &'a syn::Type,
        opts: &'a RepositoryOptions,
    ) -> Self {
        Self {
            column_name,
            column_type,
            id: opts.id(),
            entity: opts.entity(),
            table_name: opts.table_name(),
            error: opts.err(),
        }
    }

    pub fn cursor(&'a self) -> CursorStruct<'a> {
        CursorStruct {
            column_name: self.column_name,
            column_type: self.column_type,
            id: self.id,
            entity: self.entity,
        }
    }
}

impl<'a> ToTokens for ListByFn<'a> {
    fn to_tokens(&self, tokens: &mut TokenStream) {
        let id = self.id;
        let entity = self.entity;
        let column_name = &self.column_name;
        let column_type = &self.column_type;
        let cursor = syn::Ident::new(&self.cursor().name(), Span::call_site());
        let error = self.error;

        let fn_name = syn::Ident::new(&format!("list_by_{}", column_name), Span::call_site());
        let name = column_name.to_string();
        let mut column = format!("{}, ", name);
        let mut where_pt = format!("({}, id) > ($3, $2)", name);
        let mut order_by = format!("{}, ", name);
        let mut arg_tokens = quote! {
            #column_name as Option<#column_type>,
        };
        let mut cursor_arg = quote! {
            #column_name: last.#column_name.clone(),
        };
        let mut after_args = quote! {
            (id, #column_name)
        };
        let mut after_destruction = quote! {
            (Some(after.id), Some(after.#column_name))
        };
        let mut after_default = quote! {
            (None, None)
        };

        if &name == "id" {
            column = String::new();
            where_pt = "id > $2".to_string();
            order_by = String::new();
            arg_tokens = quote! {};
            cursor_arg = quote! {};
            after_args = quote! {
                id
            };
            after_destruction = quote! {
                Some(after.id)
            };
            after_default = quote! {
                None
            };
        };

        let query = format!(
            r#"SELECT {}id FROM {} WHERE ({}) OR $2 IS NULL ORDER BY {}id LIMIT $1"#,
            column, self.table_name, where_pt, order_by
        );

        tokens.append_all(quote! {
            pub async fn #fn_name(
                &self,
                cursor: es_entity::PaginatedQueryArgs<cursor::#cursor>,
            ) -> Result<es_entity::PaginatedQueryRet<#entity, cursor::#cursor>, #error> {
                let es_entity::PaginatedQueryArgs { first, after } = cursor;
                let #after_args = if let Some(after) = after {
                    #after_destruction
                } else {
                    #after_default
                };

                let (entities, has_next_page) = es_entity::es_query!(
                    self.pool(),
                    #query,
                    (first + 1) as i64,
                    id as Option<#id>,
                    #arg_tokens
                )
                    .fetch_n(first)
                    .await?;

                let mut end_cursor = None;
                if let Some(last) = entities.last() {
                    end_cursor = Some(cursor::#cursor {
                        id: last.id.clone(),
                        #cursor_arg
                    });
                }

                Ok(es_entity::PaginatedQueryRet {
                    entities,
                    has_next_page,
                    end_cursor,
                })
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
    fn cursor_struct_by_id() {
        let id_type = Ident::new("EntityId", Span::call_site());
        let entity = Ident::new("Entity", Span::call_site());
        let column_name = Ident::new("id", Span::call_site());
        let column_type = syn::parse_str(&id_type.to_string()).unwrap();

        let cursor = CursorStruct {
            column_name: &column_name,
            column_type: &column_type,
            id: &id_type,
            entity: &entity,
        };

        let mut tokens = TokenStream::new();
        cursor.to_tokens(&mut tokens);

        let expected = quote! {
            #[derive(serde::Serialize, serde::Deserialize)]
            pub struct EntityByIdCursor {
                pub id: EntityId,
            }
        };

        assert_eq!(tokens.to_string(), expected.to_string());
    }

    #[test]
    fn cursor_struct_by_created_at() {
        let id_type = Ident::new("EntityId", Span::call_site());
        let entity = Ident::new("Entity", Span::call_site());
        let column_name = Ident::new("created_at", Span::call_site());
        let column_type = syn::parse_str("DateTime<Utc>").unwrap();

        let cursor = CursorStruct {
            column_name: &column_name,
            column_type: &column_type,
            id: &id_type,
            entity: &entity,
        };

        let mut tokens = TokenStream::new();
        cursor.to_tokens(&mut tokens);

        let expected = quote! {
            #[derive(serde::Serialize, serde::Deserialize)]
            pub struct EntityByCreatedAtCursor {
                pub id: EntityId,
                pub created_at: DateTime<Utc>,
            }
        };

        assert_eq!(tokens.to_string(), expected.to_string());
    }

    #[test]
    fn list_by_fn() {
        let id_type = Ident::new("EntityId", Span::call_site());
        let column_name = parse_quote!(id);
        let column_type = parse_quote!(EntityId);
        let entity = Ident::new("Entity", Span::call_site());
        let error = syn::parse_str("es_entity::EsRepoError").unwrap();

        let persist_fn = ListByFn {
            column_name: &column_name,
            column_type: &column_type,
            id: &id_type,
            entity: &entity,
            table_name: "entities",
            error: &error,
        };

        let mut tokens = TokenStream::new();
        persist_fn.to_tokens(&mut tokens);

        let expected = quote! {
            pub async fn list_by_id(
                &self,
                cursor: es_entity::PaginatedQueryArgs<cursor::EntityByIdCursor>,
            ) -> Result<es_entity::PaginatedQueryRet<Entity, cursor::EntityByIdCursor>, es_entity::EsRepoError> {
                let es_entity::PaginatedQueryArgs { first, after } = cursor;
                let id = if let Some(after) = after {
                    Some(after.id)
                } else {
                    None
                };
                let (entities, has_next_page) = es_entity::es_query!(
                    self.pool(),
                    "SELECT id FROM entities WHERE (id > $2) OR $2 IS NULL ORDER BY id LIMIT $1",
                    (first + 1) as i64,
                    id as Option<EntityId>,
                )
                    .fetch_n(first)
                    .await?;
                let mut end_cursor = None;
                if let Some(last) = entities.last() {
                    end_cursor = Some(cursor::EntityByIdCursor {
                        id: last.id.clone(),
                    });
                }

                Ok(es_entity::PaginatedQueryRet {
                    entities,
                    has_next_page,
                    end_cursor,
                })
            }
        };

        assert_eq!(tokens.to_string(), expected.to_string());
    }

    #[test]
    fn list_by_fn_name() {
        let id_type = Ident::new("EntityId", Span::call_site());
        let column_name = parse_quote!(name);
        let column_type = parse_quote!(String);
        let entity = Ident::new("Entity", Span::call_site());
        let error = syn::parse_str("es_entity::EsRepoError").unwrap();

        let persist_fn = ListByFn {
            column_name: &column_name,
            column_type: &column_type,
            id: &id_type,
            entity: &entity,
            table_name: "entities",
            error: &error,
        };

        let mut tokens = TokenStream::new();
        persist_fn.to_tokens(&mut tokens);

        let expected = quote! {
            pub async fn list_by_name(
                &self,
                cursor: es_entity::PaginatedQueryArgs<cursor::EntityByNameCursor>,
            ) -> Result<es_entity::PaginatedQueryRet<Entity, cursor::EntityByNameCursor>, es_entity::EsRepoError> {
                let es_entity::PaginatedQueryArgs { first, after } = cursor;
                let (id, name) = if let Some(after) = after {
                    (Some(after.id), Some(after.name))
                } else {
                    (None, None)
                };

                let (entities, has_next_page) = es_entity::es_query!(
                        self.pool(),
                        "SELECT name, id FROM entities WHERE ((name, id) > ($3, $2)) OR $2 IS NULL ORDER BY name, id LIMIT $1",
                        (first + 1) as i64,
                        id as Option<EntityId>,
                        name as Option<String>,
                )
                    .fetch_n(first)
                    .await?;

                let mut end_cursor = None;
                if let Some(last) = entities.last() {
                    end_cursor = Some(cursor::EntityByNameCursor {
                        id: last.id.clone(),
                        name: last.name.clone(),
                    });
                }

                Ok(es_entity::PaginatedQueryRet {
                    entities,
                    has_next_page,
                    end_cursor,
                })
            }
        };

        assert_eq!(tokens.to_string(), expected.to_string());
    }
}
