use darling::ToTokens;
use proc_macro2::TokenStream;
use quote::{quote, TokenStreamExt};

use super::options::*;

pub struct CreateFn<'a> {
    new_entity: &'a syn::Ident,
    entity: &'a syn::Ident,
    table_name: &'a str,
    columns: &'a Columns,
    error: &'a syn::Type,
}

impl<'a> From<&'a RepositoryOptions> for CreateFn<'a> {
    fn from(opts: &'a RepositoryOptions) -> Self {
        Self {
            new_entity: opts.new_entity(),
            table_name: opts.table_name(),
            entity: opts.entity(),
            error: opts.err(),
            columns: &opts.columns,
        }
    }
}

impl<'a> ToTokens for CreateFn<'a> {
    fn to_tokens(&self, tokens: &mut TokenStream) {
        let new_entity = self.new_entity;
        let entity = self.entity;
        let error = self.error;

        let assignments = self
            .columns
            .variable_assignments(syn::parse_quote! { new_entity });

        let table_name = self.table_name;

        let column_names = self.columns.names();
        let placeholders = self.columns.placeholders();
        let args = self.columns.query_args();

        let query = format!(
            "INSERT INTO {} ({}) VALUES ({})",
            table_name,
            column_names.join(", "),
            placeholders,
        );

        tokens.append_all(quote! {
            #[inline(always)]
            fn convert_new<T, E>(item: T) -> es_entity::EntityEvents<E>
            where
                T: es_entity::IntoEvents<E>,
                E: es_entity::EsEvent,
            {
                item.into_events()
            }

            #[inline(always)]
            fn hydrate_entity<T, E>(events: es_entity::EntityEvents<E>) -> Result<T, #error>
            where
                T: es_entity::TryFromEvents<E>,
                #error: From<es_entity::EsEntityError>,
                E: es_entity::EsEvent,
            {
                Ok(T::try_from_events(events)?)
            }

            pub async fn create(
                &self,
                new_entity: #new_entity
            ) -> Result<#entity, #error> {
                let mut db = self.pool().begin().await?;
                let res = self.create_in_tx(&mut db, new_entity).await?;
                db.commit().await?;
                Ok(res)
            }

            pub async fn create_in_tx(
                &self,
                db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
                new_entity: #new_entity
            ) -> Result<#entity, #error> {
                #assignments

                 sqlx::query!(
                     #query,
                     #(#args),*
                )
                .execute(&mut **db)
                .await?;

                let mut events = Self::convert_new(new_entity);
                let n_events = self.persist_events(db, &mut events).await?;

                self.execute_post_persist_hook(db, events.last_persisted(n_events)).await?;

                Self::hydrate_entity(events)
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
    fn create_fn() {
        let new_entity = Ident::new("NewEntity", Span::call_site());
        let entity = Ident::new("Entity", Span::call_site());
        let error = syn::parse_str("es_entity::EsRepoError").unwrap();
        let id = Ident::new("EntityId", Span::call_site());
        let mut columns = Columns::default();
        columns.set_id_column(&id);

        let create_fn = CreateFn {
            new_entity: &new_entity,
            table_name: "entities",
            entity: &entity,
            error: &error,
            columns: &columns,
        };

        let mut tokens = TokenStream::new();
        create_fn.to_tokens(&mut tokens);

        let expected = quote! {
            #[inline(always)]
            fn convert_new<T, E>(item: T) -> es_entity::EntityEvents<E>
            where
                T: es_entity::IntoEvents<E>,
                E: es_entity::EsEvent,
            {
                item.into_events()
            }

            #[inline(always)]
            fn hydrate_entity<T, E>(events: es_entity::EntityEvents<E>) -> Result<T, es_entity::EsRepoError>
            where
                T: es_entity::TryFromEvents<E>,
                es_entity::EsRepoError: From<es_entity::EsEntityError>,
                E: es_entity::EsEvent,
            {
                Ok(T::try_from_events(events)?)
            }

            pub async fn create(
                &self,
                new_entity: NewEntity
            ) -> Result<Entity, es_entity::EsRepoError> {
                let mut db = self.pool().begin().await?;
                let res = self.create_in_tx(&mut db, new_entity).await?;
                db.commit().await?;
                Ok(res)
            }

            pub async fn create_in_tx(
                &self,
                db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
                new_entity: NewEntity
            ) -> Result<Entity, es_entity::EsRepoError> {
                let id = &new_entity.id;

                sqlx::query!("INSERT INTO entities (id) VALUES ($1)",
                    id as &EntityId
                )
                .execute(&mut **db)
                .await?;

                let mut events = Self::convert_new(new_entity);
                let n_events = self.persist_events(db, &mut events).await?;

                self.execute_post_persist_hook(db, events.last_persisted(n_events)).await?;

                Self::hydrate_entity(events)
            }
        };

        assert_eq!(tokens.to_string(), expected.to_string());
    }

    #[test]
    fn create_fn_with_index() {
        let new_entity = Ident::new("NewEntity", Span::call_site());
        let entity = Ident::new("Entity", Span::call_site());
        let error = syn::parse_str("es_entity::EsRepoError").unwrap();
        let id = Ident::new("EntityId", Span::call_site());

        let columns = Columns::new(
            &id,
            [Column::new(
                Ident::new("name", Span::call_site()),
                syn::parse_str("String").unwrap(),
            )],
        );

        let create_fn = CreateFn {
            new_entity: &new_entity,
            table_name: "entities",
            entity: &entity,
            error: &error,
            columns: &columns,
        };

        let mut tokens = TokenStream::new();
        create_fn.to_tokens(&mut tokens);

        let expected = quote! {
            #[inline(always)]
            fn convert_new<T, E>(item: T) -> es_entity::EntityEvents<E>
            where
                T: es_entity::IntoEvents<E>,
                E: es_entity::EsEvent,
            {
                item.into_events()
            }

            #[inline(always)]
            fn hydrate_entity<T, E>(events: es_entity::EntityEvents<E>) -> Result<T, es_entity::EsRepoError>
            where
                T: es_entity::TryFromEvents<E>,
                es_entity::EsRepoError: From<es_entity::EsEntityError>,
                E: es_entity::EsEvent,
            {
                Ok(T::try_from_events(events)?)
            }

            pub async fn create(
                &self,
                new_entity: NewEntity
            ) -> Result<Entity, es_entity::EsRepoError> {
                let mut db = self.pool().begin().await?;
                let res = self.create_in_tx(&mut db, new_entity).await?;
                db.commit().await?;
                Ok(res)
            }

            pub async fn create_in_tx(
                &self,
                db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
                new_entity: NewEntity
            ) -> Result<Entity, es_entity::EsRepoError> {
                let id = &new_entity.id;
                let name = &new_entity.name;

                sqlx::query!("INSERT INTO entities (id, name) VALUES ($1, $2)",
                    id as &EntityId,
                    name as &String
                )
                .execute(&mut **db)
                .await?;

                let mut events = Self::convert_new(new_entity);
                let n_events = self.persist_events(db, &mut events).await?;

                self.execute_post_persist_hook(db, events.last_persisted(n_events)).await?;

                Self::hydrate_entity(events)
            }
        };

        assert_eq!(tokens.to_string(), expected.to_string());
    }
}
