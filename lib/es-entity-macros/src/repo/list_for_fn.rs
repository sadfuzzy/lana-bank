use darling::ToTokens;
use proc_macro2::{Span, TokenStream};
use quote::{quote, TokenStreamExt};

use super::{list_by_fn::CursorStruct, options::*};

pub struct ListForFn<'a> {
    entity: &'a syn::Ident,
    id: &'a syn::Ident,
    for_column: &'a Column,
    by_column: &'a Column,
    table_name: &'a str,
    error: &'a syn::Type,
    delete: DeleteOption,
}

impl<'a> ListForFn<'a> {
    pub fn new(for_column: &'a Column, by_column: &'a Column, opts: &'a RepositoryOptions) -> Self {
        Self {
            for_column,
            by_column,
            id: opts.id(),
            entity: opts.entity(),
            table_name: opts.table_name(),
            error: opts.err(),
            delete: opts.delete,
        }
    }

    fn cursor(&'a self) -> CursorStruct<'a> {
        CursorStruct {
            column: self.by_column,
            id: self.id,
            entity: self.entity,
        }
    }
}

impl<'a> ToTokens for ListForFn<'a> {
    fn to_tokens(&self, tokens: &mut TokenStream) {
        let entity = self.entity;
        let cursor = self.cursor();
        let cursor_ident = cursor.ident();
        let error = self.error;

        let by_column_name = self.by_column.name();

        let for_column_name = self.for_column.name();
        let for_column_type = self.for_column.ty();

        let destructure_tokens = self.cursor().destructure_tokens();
        let select_columns = cursor.select_columns();
        let order_by = cursor.order_by();
        let condition = cursor.condition(1);
        let arg_tokens = cursor.query_arg_tokens();

        for delete in [DeleteOption::No, DeleteOption::Soft] {
            let fn_name = syn::Ident::new(
                &format!(
                    "list_for_{}_by_{}{}",
                    for_column_name,
                    by_column_name,
                    delete.include_deletion_fn_postfix()
                ),
                Span::call_site(),
            );

            let query = format!(
                r#"SELECT {}, {} FROM {} WHERE (({} = $1) AND ({})){} ORDER BY {} LIMIT $2"#,
                for_column_name,
                select_columns,
                self.table_name,
                for_column_name,
                condition,
                if delete == DeleteOption::No {
                    self.delete.not_deleted_condition()
                } else {
                    ""
                },
                order_by,
            );

            tokens.append_all(quote! {
                pub async fn #fn_name(
                    &self,
                    #for_column_name: #for_column_type,
                    cursor: es_entity::PaginatedQueryArgs<cursor::#cursor_ident>,
                ) -> Result<es_entity::PaginatedQueryRet<#entity, cursor::#cursor_ident>, #error> {
                    #destructure_tokens

                    let (entities, has_next_page) = es_entity::es_query!(
                        self.pool(),
                        #query,
                        #for_column_name as #for_column_type,
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
    fn list_for_fn() {
        let entity = Ident::new("Entity", Span::call_site());
        let error = syn::parse_str("es_entity::EsRepoError").unwrap();
        let id = syn::Ident::new("EntityId", proc_macro2::Span::call_site());
        let by_column = Column::for_id(syn::parse_str("EntityId").unwrap());
        let for_column = Column::new(
            syn::Ident::new("customer_id", proc_macro2::Span::call_site()),
            syn::parse_str("Uuid").unwrap(),
        );

        let persist_fn = ListForFn {
            entity: &entity,
            id: &id,
            for_column: &for_column,
            by_column: &by_column,
            table_name: "entities",
            error: &error,
            delete: DeleteOption::No,
        };

        let mut tokens = TokenStream::new();
        persist_fn.to_tokens(&mut tokens);

        let expected = quote! {
            pub async fn list_for_customer_id_by_id(
                &self,
                customer_id: Uuid,
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
                    "SELECT customer_id, id FROM entities WHERE ((customer_id = $1) AND (COALESCE(id > $3, true))) ORDER BY id LIMIT $2",
                    customer_id as Uuid,
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
}
