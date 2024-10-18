use darling::ToTokens;
use proc_macro2::TokenStream;
use quote::{quote, TokenStreamExt};

use super::RepositoryOptions;

pub struct PostPersistHook<'a> {
    event: &'a syn::Ident,
    error: &'a syn::Type,
    hook: &'a Option<syn::Ident>,
}

impl<'a> From<&'a RepositoryOptions> for PostPersistHook<'a> {
    fn from(opts: &'a RepositoryOptions) -> Self {
        Self {
            event: opts.event(),
            error: opts.err(),
            hook: &opts.post_persist_hook,
        }
    }
}

impl<'a> ToTokens for PostPersistHook<'a> {
    fn to_tokens(&self, tokens: &mut TokenStream) {
        let event = &self.event;
        let error = &self.error;

        let hook = if let Some(hook) = self.hook {
            quote! {
                self.#hook(db, events).await?;
                Ok(())
            }
        } else {
            quote! {
                Ok(())
            }
        };

        tokens.append_all(quote! {
            #[inline(always)]
            async fn execute_post_persist_hook(&self,
                db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
                events: impl Iterator<Item = &es_entity::PersistedEvent<#event>>
            ) -> Result<(), #error> {
                #hook
            }
        });
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn post_persist_hook() {
        let event = syn::Ident::new("EntityEvent", proc_macro2::Span::call_site());
        let error = syn::parse_str("es_entity::EsRepoError").unwrap();
        let hook = None;

        let hook = PostPersistHook {
            event: &event,
            error: &error,
            hook: &hook,
        };

        let mut tokens = TokenStream::new();
        hook.to_tokens(&mut tokens);

        let expected = quote! {
            #[inline(always)]
            async fn execute_post_persist_hook(&self,
                db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
                events: impl Iterator<Item = &es_entity::PersistedEvent<EntityEvent>>
            ) -> Result<(), es_entity::EsRepoError> {
                Ok(())
            }
        };

        assert_eq!(tokens.to_string(), expected.to_string());
    }
}
