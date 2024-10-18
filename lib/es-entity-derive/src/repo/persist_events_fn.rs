use darling::ToTokens;
use proc_macro2::TokenStream;
use quote::{quote, TokenStreamExt};

use super::options::*;

pub struct PersistEventsFn<'a> {
    id: &'a syn::Ident,
    event: &'a syn::Ident,
    events_table_name: &'a str,
}

impl<'a> From<&'a RepositoryOptions> for PersistEventsFn<'a> {
    fn from(opts: &'a RepositoryOptions) -> Self {
        Self {
            id: opts.id(),
            event: opts.event(),
            events_table_name: opts.events_table_name(),
        }
    }
}

impl<'a> ToTokens for PersistEventsFn<'a> {
    fn to_tokens(&self, tokens: &mut TokenStream) {
        let query = format!(
            "INSERT INTO {} (id, sequence, event_type, event) SELECT $1, ROW_NUMBER() OVER () + $2, unnested.event_type, unnested.event FROM UNNEST($3::text[], $4::jsonb[]) AS unnested(event_type, event) RETURNING recorded_at",
            self.events_table_name,
        );
        let id_type = &self.id;
        let event_type = &self.event;
        let id_tokens = quote! {
            id as &#id_type
        };

        tokens.append_all(quote! {
            async fn persist_events(
                &self,
                db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
                events: &mut es_entity::EntityEvents<#event_type>
            ) -> Result<usize, sqlx::Error> {
                let id = events.id();
                let offset = events.len_persisted();
                let serialized_events = events.serialize_new_events();
                let events_types = serialized_events.iter().map(|e| e.get("type").and_then(serde_json::Value::as_str).expect("Could not read event type").to_owned()).collect::<Vec<_>>();

                let rows = sqlx::query!(
                    #query,
                    #id_tokens,
                    offset as i32,
                    &events_types,
                    &serialized_events
                ).fetch_all(&mut **db).await?;

                let n_events = events.mark_new_events_persisted_at(rows[0].recorded_at);

                Ok(n_events)
            }
        });
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn persist_events_fn() {
        let id = syn::parse_str("EntityId").unwrap();
        let event = syn::Ident::new("EntityEvent", proc_macro2::Span::call_site());
        let persist_fn = PersistEventsFn {
            id: &id,
            event: &event,
            events_table_name: "entity_events",
        };

        let mut tokens = TokenStream::new();
        persist_fn.to_tokens(&mut tokens);

        let expected = quote! {
            async fn persist_events(
                &self,
                db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
                events: &mut es_entity::EntityEvents<EntityEvent>
            ) -> Result<usize, sqlx::Error> {
                let id = events.id();
                let offset = events.len_persisted();
                let serialized_events = events.serialize_new_events();
                let events_types = serialized_events.iter().map(|e| e.get("type").and_then(serde_json::Value::as_str).expect("Could not read event type").to_owned()).collect::<Vec<_>>();

                let rows = sqlx::query!(
                    "INSERT INTO entity_events (id, sequence, event_type, event) SELECT $1, ROW_NUMBER() OVER () + $2, unnested.event_type, unnested.event FROM UNNEST($3::text[], $4::jsonb[]) AS unnested(event_type, event) RETURNING recorded_at",
                    id as &EntityId,
                    offset as i32,
                    &events_types,
                    &serialized_events
                ).fetch_all(&mut **db).await?;

                let n_events = events.mark_new_events_persisted_at(rows[0].recorded_at);

                Ok(n_events)
            }
        };

        assert_eq!(tokens.to_string(), expected.to_string());
    }
}
