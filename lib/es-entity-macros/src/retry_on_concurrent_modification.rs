use syn::ItemFn;

pub fn make(input: ItemFn) -> darling::Result<proc_macro2::TokenStream> {
    let mut inner_fn = input.clone();
    let inner_ident = syn::Ident::new(
        &format!("{}_exec_one", &input.sig.ident),
        input.sig.ident.span(),
    );
    inner_fn.sig.ident = inner_ident.clone();
    inner_fn.vis = syn::Visibility::Inherited;
    inner_fn.attrs = vec![];

    let attrs = &input.attrs;
    let vis = &input.vis;
    let sig = &input.sig;

    let inputs: Vec<_> = input
        .sig
        .inputs
        .iter()
        .filter_map(|input| match input {
            syn::FnArg::Receiver(_) => None,
            syn::FnArg::Typed(pat_type) => Some(&pat_type.pat),
        })
        .collect();

    let outer_fn = quote::quote! {
        #( #attrs )*
        #vis #sig {
            let max_retries = 3;
            for n in 1..=max_retries {
                let result = self.#inner_ident(#(#inputs),*).await;
                if n == max_retries {
                    return result;
                }
                if let Err(e) = result.as_ref() {
                    if e.was_concurrent_modification() {
                        continue;
                    }
                }
                return result;
            }
            unreachable!();
        }
    };

    let output = quote::quote! {
        #inner_fn
        #outer_fn
    };
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;
    use syn::parse_quote;

    #[test]
    fn retry_on_concurrent_modification() {
        let input = parse_quote! {
            #[retry_on_concurrent_modification]
            #[instrument(name = "test")]
            pub async fn test(&self, a: u32) -> Result<(), es_entity::EsRepoError> {
                self.repo.update().await?;
                Ok(())
            }
        };

        let output = make(input).unwrap();
        let expected = quote::quote! {
            async fn test_exec_one(&self, a: u32) -> Result<(), es_entity::EsRepoError> {
                self.repo.update().await?;
                Ok(())
            }

            #[retry_on_concurrent_modification]
            #[instrument(name = "test")]
            pub async fn test(&self, a: u32) -> Result<(), es_entity::EsRepoError> {
                let max_retries = 3;
                for n in 1..=max_retries {
                    let result = self.test_exec_one(a).await;
                    if n == max_retries {
                        return result;
                    }
                    if let Err(e) = result.as_ref() {
                        if e.was_concurrent_modification() {
                            continue;
                        }
                    }
                    return result;
                }
                unreachable!();
            }
        };
        assert_eq!(output.to_string(), expected.to_string());
    }
}
