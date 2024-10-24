use convert_case::{Case, Casing};
use darling::ToTokens;
use proc_macro2::{Span, TokenStream};
use quote::{quote, TokenStreamExt};

use super::options::*;

pub struct CursorStruct<'a> {
    pub id: &'a syn::Ident,
    pub entity: &'a syn::Ident,
    pub column: &'a Column,
}

impl<'a> CursorStruct<'a> {
    fn name(&self) -> String {
        format!(
            "{}By{}Cursor",
            self.entity,
            self.column.name().to_string().to_case(Case::UpperCamel)
        )
    }

    pub fn ident(&self) -> syn::Ident {
        syn::Ident::new(&self.name(), Span::call_site())
    }

    pub fn select_columns(&self) -> String {
        if self.column.is_id() {
            "id".to_string()
        } else {
            format!("{}, id", self.column.name())
        }
    }

    pub fn order_by(&self) -> String {
        if self.column.is_id() {
            "id".to_string()
        } else if self.column.is_optional() {
            format!("{} NULLS FIRST, id", self.column.name())
        } else {
            format!("{}, id", self.column.name())
        }
    }

    pub fn condition(&self, offset: u32) -> String {
        let id_offset = offset + 2;
        let column_offset = offset + 3;

        if self.column.is_id() {
            format!("COALESCE(id > ${id_offset}, true)")
        } else if self.column.is_optional() {
            format!(
                "({0} IS NOT DISTINCT FROM ${column_offset}) AND COALESCE(id > ${id_offset}, true) OR COALESCE({0} > ${column_offset}, {0} IS NOT NULL)",
                self.column.name(),
            )
        } else {
            format!(
                "COALESCE(({0}, id) > (${column_offset}, ${id_offset}), ${id_offset} IS NULL)",
                self.column.name(),
            )
        }
    }

    pub fn query_arg_tokens(&self) -> TokenStream {
        let id = self.id;

        if self.column.is_id() {
            quote! {
                (first + 1) as i64,
                id as Option<#id>,
            }
        } else if self.column.is_optional() {
            let column_name = self.column.name();
            let column_type = self.column.ty();
            quote! {
                (first + 1) as i64,
                id as Option<#id>,
                #column_name as #column_type,
            }
        } else {
            let column_name = self.column.name();
            let column_type = self.column.ty();
            quote! {
                (first + 1) as i64,
                id as Option<#id>,
                #column_name as Option<#column_type>,
            }
        }
    }

    pub fn destructure_tokens(&self) -> TokenStream {
        let column_name = self.column.name();

        let mut after_args = quote! {
            (id, #column_name)
        };
        let mut after_destruction = quote! {
            (Some(after.id), Some(after.#column_name))
        };
        let mut after_default = quote! {
            (None, None)
        };

        if self.column.is_id() {
            after_args = quote! {
                id
            };
            after_destruction = quote! {
                Some(after.id)
            };
            after_default = quote! {
                None
            };
        } else if self.column.is_optional() {
            after_destruction = quote! {
                (Some(after.id), after.#column_name)
            };
        }

        quote! {
            let es_entity::PaginatedQueryArgs { first, after } = cursor;
            let #after_args = if let Some(after) = after {
                #after_destruction
            } else {
                #after_default
            };
        }
    }
}

impl<'a> ToTokens for CursorStruct<'a> {
    fn to_tokens(&self, tokens: &mut TokenStream) {
        let entity = self.entity;
        let accessor = &self.column.accessor();
        let ident = self.ident();
        let id = &self.id;

        let (field, from_impl) = if self.column.is_id() {
            (quote! {}, quote! {})
        } else {
            let column_name = self.column.name();
            let column_type = self.column.ty();
            (
                quote! {
                    pub #column_name: #column_type,
                },
                quote! {
                    #column_name: entity.#accessor.clone(),
                },
            )
        };

        tokens.append_all(quote! {
            #[derive(Debug, serde::Serialize, serde::Deserialize)]
            pub struct #ident {
                pub id: #id,
                #field
            }

            impl From<&#entity> for #ident {
                fn from(entity: &#entity) -> Self {
                    Self {
                        id: entity.id.clone(),
                        #from_impl
                    }
                }
            }
        });
    }
}

pub struct ListByFn<'a> {
    id: &'a syn::Ident,
    entity: &'a syn::Ident,
    column: &'a Column,
    table_name: &'a str,
    error: &'a syn::Type,
    delete: DeleteOption,
}

impl<'a> ListByFn<'a> {
    pub fn new(column: &'a Column, opts: &'a RepositoryOptions) -> Self {
        Self {
            column,
            id: opts.id(),
            entity: opts.entity(),
            table_name: opts.table_name(),
            error: opts.err(),
            delete: opts.delete,
        }
    }

    pub fn cursor(&'a self) -> CursorStruct<'a> {
        CursorStruct {
            column: self.column,
            id: self.id,
            entity: self.entity,
        }
    }
}

impl<'a> ToTokens for ListByFn<'a> {
    fn to_tokens(&self, tokens: &mut TokenStream) {
        let entity = self.entity;
        let column_name = self.column.name();
        let cursor = self.cursor();
        let cursor_ident = cursor.ident();
        let error = self.error;

        let destructure_tokens = self.cursor().destructure_tokens();
        let select_columns = cursor.select_columns();
        let order_by = cursor.order_by();
        let condition = cursor.condition(0);
        let arg_tokens = cursor.query_arg_tokens();

        for delete in [DeleteOption::No, DeleteOption::Soft] {
            let fn_name = syn::Ident::new(
                &format!(
                    "list_by_{}{}",
                    column_name,
                    delete.include_deletion_fn_postfix()
                ),
                Span::call_site(),
            );
            let query = format!(
                r#"SELECT {} FROM {} WHERE ({}){} ORDER BY {} LIMIT $1"#,
                select_columns,
                self.table_name,
                condition,
                if delete == DeleteOption::No {
                    self.delete.not_deleted_condition()
                } else {
                    ""
                },
                order_by
            );

            tokens.append_all(quote! {
                pub async fn #fn_name(
                    &self,
                    cursor: es_entity::PaginatedQueryArgs<cursor::#cursor_ident>,
                ) -> Result<es_entity::PaginatedQueryRet<#entity, cursor::#cursor_ident>, #error> {
                    #destructure_tokens

                    let (entities, has_next_page) = es_entity::es_query!(
                        self.pool(),
                        #query,
                        #arg_tokens
                    )
                        .fetch_n(first)
                        .await?;

                    let end_cursor = entities.last().map(cursor::#cursor_ident::from);

                    Ok(es_entity::PaginatedQueryRet {
                        entities,
                        has_next_page,
                        end_cursor,
                    })
                }
            });

            if delete == self.delete {
                break;
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use proc_macro2::Span;
    use syn::Ident;

    #[test]
    fn cursor_struct_by_id() {
        let id_type = Ident::new("EntityId", Span::call_site());
        let entity = Ident::new("Entity", Span::call_site());
        let by_column = Column::for_id(syn::parse_str("EntityId").unwrap());

        let cursor = CursorStruct {
            column: &by_column,
            id: &id_type,
            entity: &entity,
        };

        let mut tokens = TokenStream::new();
        cursor.to_tokens(&mut tokens);

        let expected = quote! {
            #[derive(Debug, serde::Serialize, serde::Deserialize)]
            pub struct EntityByIdCursor {
                pub id: EntityId,
            }

            impl From<&Entity> for EntityByIdCursor {
                fn from(entity: &Entity) -> Self {
                    Self {
                        id: entity.id.clone(),
                    }
                }
            }
        };

        assert_eq!(tokens.to_string(), expected.to_string());
    }

    #[test]
    fn cursor_struct_by_created_at() {
        let id_type = Ident::new("EntityId", Span::call_site());
        let entity = Ident::new("Entity", Span::call_site());
        let by_column = Column::for_created_at();

        let cursor = CursorStruct {
            column: &by_column,
            id: &id_type,
            entity: &entity,
        };

        let mut tokens = TokenStream::new();
        cursor.to_tokens(&mut tokens);

        let expected = quote! {
            #[derive(Debug, serde::Serialize, serde::Deserialize)]
            pub struct EntityByCreatedAtCursor {
                pub id: EntityId,
                pub created_at: chrono::DateTime<chrono::Utc>,
            }

            impl From<&Entity> for EntityByCreatedAtCursor {
                fn from(entity: &Entity) -> Self {
                    Self {
                        id: entity.id.clone(),
                        created_at: entity.events()
                            .entity_first_persisted_at()
                            .expect("entity not persisted")
                            .clone(),
                    }
                }
            }
        };

        assert_eq!(tokens.to_string(), expected.to_string());
    }

    #[test]
    fn list_by_fn() {
        let id_type = Ident::new("EntityId", Span::call_site());
        let entity = Ident::new("Entity", Span::call_site());
        let error = syn::parse_str("es_entity::EsRepoError").unwrap();
        let column = Column::for_id(syn::parse_str("EntityId").unwrap());

        let persist_fn = ListByFn {
            column: &column,
            id: &id_type,
            entity: &entity,
            table_name: "entities",
            error: &error,
            delete: DeleteOption::Soft,
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
                    "SELECT id FROM entities WHERE (COALESCE(id > $2, true)) AND deleted = FALSE ORDER BY id LIMIT $1",
                    (first + 1) as i64,
                    id as Option<EntityId>,
                )
                    .fetch_n(first)
                    .await?;
                let end_cursor = entities.last().map(cursor::EntityByIdCursor::from);
                Ok(es_entity::PaginatedQueryRet {
                    entities,
                    has_next_page,
                    end_cursor,
                })
            }

            pub async fn list_by_id_include_deleted(
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
                    "SELECT id FROM entities WHERE (COALESCE(id > $2, true)) ORDER BY id LIMIT $1",
                    (first + 1) as i64,
                    id as Option<EntityId>,
                )
                    .fetch_n(first)
                    .await?;
                let end_cursor = entities.last().map(cursor::EntityByIdCursor::from);
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
        let entity = Ident::new("Entity", Span::call_site());
        let error = syn::parse_str("es_entity::EsRepoError").unwrap();
        let column = Column::new(
            syn::Ident::new("name", proc_macro2::Span::call_site()),
            syn::parse_str("String").unwrap(),
        );

        let persist_fn = ListByFn {
            column: &column,
            id: &id_type,
            entity: &entity,
            table_name: "entities",
            error: &error,
            delete: DeleteOption::No,
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
                        "SELECT name, id FROM entities WHERE (COALESCE((name, id) > ($3, $2), $2 IS NULL)) ORDER BY name, id LIMIT $1",
                        (first + 1) as i64,
                        id as Option<EntityId>,
                        name as Option<String>,
                )
                    .fetch_n(first)
                    .await?;

                let end_cursor = entities.last().map(cursor::EntityByNameCursor::from);

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
    fn list_by_fn_optional_column() {
        let id_type = Ident::new("EntityId", Span::call_site());
        let entity = Ident::new("Entity", Span::call_site());
        let error = syn::parse_str("es_entity::EsRepoError").unwrap();
        let column = Column::new(
            syn::Ident::new("value", proc_macro2::Span::call_site()),
            syn::parse_str("Option<rust_decimal::Decimal>").unwrap(),
        );

        let persist_fn = ListByFn {
            column: &column,
            id: &id_type,
            entity: &entity,
            table_name: "entities",
            error: &error,
            delete: DeleteOption::No,
        };

        let mut tokens = TokenStream::new();
        persist_fn.to_tokens(&mut tokens);

        let expected = quote! {
            pub async fn list_by_value(
                &self,
                cursor: es_entity::PaginatedQueryArgs<cursor::EntityByValueCursor>,
            ) -> Result<es_entity::PaginatedQueryRet<Entity, cursor::EntityByValueCursor>, es_entity::EsRepoError> {
                let es_entity::PaginatedQueryArgs { first, after } = cursor;
                let (id, value) = if let Some(after) = after {
                    (Some(after.id), after.value)
                } else {
                    (None, None)
                };

                let (entities, has_next_page) = es_entity::es_query!(
                        self.pool(),
                        "SELECT value, id FROM entities WHERE ((value IS NOT DISTINCT FROM $3) AND COALESCE(id > $2, true) OR COALESCE(value > $3, value IS NOT NULL)) ORDER BY value NULLS FIRST, id LIMIT $1",
                        (first + 1) as i64,
                        id as Option<EntityId>,
                        value as Option<rust_decimal::Decimal>,
                )
                    .fetch_n(first)
                    .await?;

                let end_cursor = entities.last().map(cursor::EntityByValueCursor::from);

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
