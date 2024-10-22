use darling::ToTokens;
use proc_macro2::TokenStream;
use quote::{quote, TokenStreamExt};

use super::options::*;

pub struct UpdateFn<'a> {
    entity: &'a syn::Ident,
    table_name: &'a str,
    columns: &'a Columns,
    error: &'a syn::Type,
}

impl<'a> From<&'a RepositoryOptions> for UpdateFn<'a> {
    fn from(opts: &'a RepositoryOptions) -> Self {
        Self {
            entity: opts.entity(),
            error: opts.err(),
            columns: &opts.columns,
            table_name: opts.table_name(),
        }
    }
}

impl<'a> ToTokens for UpdateFn<'a> {
    fn to_tokens(&self, tokens: &mut TokenStream) {
        let entity = self.entity;
        let error = self.error;
        let update_tokens = if self.columns.updates_needed() {
            let assignments = self
                .columns
                .variable_assignments_for_update(syn::parse_quote! { entity });
            let column_updates = self.columns.sql_updates();
            let query = format!(
                "UPDATE {} SET {} WHERE id = $1",
                self.table_name, column_updates,
            );
            let args = self.columns.update_query_args();
            Some(quote! {
            #assignments
            sqlx::query!(
                #query,
                #(#args),*
            )
                .execute(&mut **db)
                .await?;
            })
        } else {
            None
        };

        tokens.append_all(quote! {
            #[inline(always)]
            fn extract_events<T, E>(entity: &mut T) -> &mut es_entity::EntityEvents<E>
            where
                T: es_entity::EsEntity<E>,
                E: es_entity::EsEvent,
            {
                entity.events_mut()
            }

            pub async fn update(
                &self,
                entity: &mut #entity
            ) -> Result<(), #error> {
                let mut db = self.pool().begin().await?;
                let res = self.update_in_tx(&mut db, entity).await?;
                db.commit().await?;
                Ok(res)
            }

            pub async fn update_in_tx(
                &self,
                db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
                entity: &mut #entity
            ) -> Result<(), #error> {
                if !Self::extract_events(entity).any_new() {
                    return Ok(());
                }

                #update_tokens
                let events = Self::extract_events(entity);
                let n_events = self.persist_events(db, events).await?;

                self.execute_post_persist_hook(db, events.last_persisted(n_events)).await?;

                Ok(())
            }
        });
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use proc_macro2::Span;
    use syn::Ident;

    #[test]
    fn update_fn() {
        let id = syn::parse_str("EntityId").unwrap();
        let entity = Ident::new("Entity", Span::call_site());
        let error = syn::parse_str("es_entity::EsRepoError").unwrap();

        let columns = Columns::new(
            &id,
            [Column::new(
                Ident::new("name", Span::call_site()),
                syn::parse_str("String").unwrap(),
            )],
        );

        let update_fn = UpdateFn {
            entity: &entity,
            table_name: "entities",
            error: &error,
            columns: &columns,
        };

        let mut tokens = TokenStream::new();
        update_fn.to_tokens(&mut tokens);

        let expected = quote! {
            #[inline(always)]
            fn extract_events<T, E>(entity: &mut T) -> &mut es_entity::EntityEvents<E>
            where
                T: es_entity::EsEntity<E>,
                E: es_entity::EsEvent,
            {
                entity.events_mut()
            }

            pub async fn update(
                &self,
                entity: &mut Entity
            ) -> Result<(), es_entity::EsRepoError> {
                let mut db = self.pool().begin().await?;
                let res = self.update_in_tx(&mut db, entity).await?;
                db.commit().await?;
                Ok(res)
            }

            pub async fn update_in_tx(
                &self,
                db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
                entity: &mut Entity
            ) -> Result<(), es_entity::EsRepoError> {
                if !Self::extract_events(entity).any_new() {
                    return Ok(());
                }

                let id = &entity.id;
                let name = &entity.name;
                sqlx::query!(
                    "UPDATE entities SET name = $2 WHERE id = $1",
                    id as &EntityId,
                    name as &String
                )
                    .execute(&mut **db)
                    .await?;

                let events = Self::extract_events(entity);
                let n_events = self.persist_events(db, events).await?;

                self.execute_post_persist_hook(db, events.last_persisted(n_events)).await?;

                Ok(())
            }
        };

        assert_eq!(tokens.to_string(), expected.to_string());
    }

    #[test]
    fn update_fn_no_columns() {
        let id = syn::parse_str("EntityId").unwrap();
        let entity = Ident::new("Entity", Span::call_site());
        let error = syn::parse_str("es_entity::EsRepoError").unwrap();

        let mut columns = Columns::default();
        columns.set_id_column(&id);

        let update_fn = UpdateFn {
            entity: &entity,
            table_name: "entities",
            error: &error,
            columns: &columns,
        };

        let mut tokens = TokenStream::new();
        update_fn.to_tokens(&mut tokens);

        let expected = quote! {
            #[inline(always)]
            fn extract_events<T, E>(entity: &mut T) -> &mut es_entity::EntityEvents<E>
            where
                T: es_entity::EsEntity<E>,
                E: es_entity::EsEvent,
            {
                entity.events_mut()
            }

            pub async fn update(
                &self,
                entity: &mut Entity
            ) -> Result<(), es_entity::EsRepoError> {
                let mut db = self.pool().begin().await?;
                let res = self.update_in_tx(&mut db, entity).await?;
                db.commit().await?;
                Ok(res)
            }

            pub async fn update_in_tx(
                &self,
                db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
                entity: &mut Entity
            ) -> Result<(), es_entity::EsRepoError> {
                if !Self::extract_events(entity).any_new() {
                    return Ok(());
                }

                let events = Self::extract_events(entity);
                let n_events = self.persist_events(db, events).await?;

                self.execute_post_persist_hook(db, events.last_persisted(n_events)).await?;

                Ok(())
            }
        };

        assert_eq!(tokens.to_string(), expected.to_string());
    }
}
