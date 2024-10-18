mod create_fn;
mod find_all_fn;
mod find_by_fn;
mod list_by_fn;
mod options;
mod persist_events_fn;
mod persist_fn;
mod post_persist_hook;

use darling::{FromDeriveInput, ToTokens};
use proc_macro2::TokenStream;
use quote::{quote, TokenStreamExt};

use options::RepositoryOptions;

pub fn derive(ast: syn::DeriveInput) -> darling::Result<proc_macro2::TokenStream> {
    let opts = RepositoryOptions::from_derive_input(&ast)?;
    let repo = EsRepo::from(&opts);
    Ok(quote!(#repo))
}
pub struct EsRepo<'a> {
    repo: &'a syn::Ident,
    persist_events_fn: persist_events_fn::PersistEventsFn<'a>,
    persist_fn: persist_fn::PersistFn<'a>,
    create_fn: create_fn::CreateFn<'a>,
    find_by_fns: Vec<find_by_fn::FindByFn<'a>>,
    find_all_fn: find_all_fn::FindAllFn<'a>,
    post_persist_hook: post_persist_hook::PostPersistHook<'a>,
    list_by_fns: Vec<list_by_fn::ListByFn<'a>>,
}

impl<'a> From<&'a RepositoryOptions> for EsRepo<'a> {
    fn from(opts: &'a RepositoryOptions) -> Self {
        let find_by_fns = opts
            .columns
            .all_find_by()
            .map(|c| find_by_fn::FindByFn::new(c.name(), c.ty(), opts))
            .collect();
        let list_by_fns = opts
            .columns
            .all_list_by()
            .map(|c| list_by_fn::ListByFn::new(c.name(), c.ty(), opts))
            .collect();

        Self {
            repo: &opts.ident,
            persist_events_fn: persist_events_fn::PersistEventsFn::from(opts),
            persist_fn: persist_fn::PersistFn::from(opts),
            create_fn: create_fn::CreateFn::from(opts),
            find_by_fns,
            find_all_fn: find_all_fn::FindAllFn::from(opts),
            post_persist_hook: post_persist_hook::PostPersistHook::from(opts),
            list_by_fns,
        }
    }
}

impl<'a> ToTokens for EsRepo<'a> {
    fn to_tokens(&self, tokens: &mut TokenStream) {
        let repo = &self.repo;
        let persist_events_fn = &self.persist_events_fn;
        let persist_fn = &self.persist_fn;
        let create_fn = &self.create_fn;
        let find_by_fns = &self.find_by_fns;
        let find_all_fn = &self.find_all_fn;
        let post_persist_hook = &self.post_persist_hook;
        let cursors = self.list_by_fns.iter().map(|l| l.cursor());
        let list_by_fns = &self.list_by_fns;

        tokens.append_all(quote! {
            pub mod cursor {
                use super::*;

                #(#cursors)*
            }

            impl #repo {
                #[inline(always)]
                fn pool(&self) -> &sqlx::PgPool {
                    &self.pool
                }

                #post_persist_hook
                #persist_events_fn
                #create_fn
                #persist_fn
                #(#find_by_fns)*
                #find_all_fn
                #(#list_by_fns)*
            }
        });
    }
}
