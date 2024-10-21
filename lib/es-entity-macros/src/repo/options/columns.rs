use darling::FromMeta;
use quote::quote;

#[derive(Default)]
pub struct Columns {
    all: Vec<Column>,
}

impl Columns {
    #[cfg(test)]
    pub fn new(id: &syn::Ident, columns: impl IntoIterator<Item = Column>) -> Self {
        let all = columns.into_iter().collect();
        let mut res = Columns { all };
        res.set_id_column(id);
        res
    }

    pub fn set_id_column(&mut self, ty: &syn::Ident) {
        let mut all = vec![
            Column::new(
                syn::Ident::new("id", proc_macro2::Span::call_site()),
                syn::parse_str(&ty.to_string()).unwrap(),
            ),
            Column {
                name: syn::Ident::new("created_at", proc_macro2::Span::call_site()),
                opts: ColumnOpts {
                    ty: syn::parse_quote!(chrono::DateTime<chrono::Utc>),
                    accessor: Accessor {
                        both: Some(syn::parse_quote!(events()
                            .entity_first_persisted_at()
                            .expect("entity not persisted"))),
                        new: None,
                    },
                    list_by: Some(true),
                    find_by: Some(false),
                    update: Some(false),
                },
            },
        ];
        all.append(&mut self.all);
        self.all = all;
    }

    pub fn all_find_by(&self) -> impl Iterator<Item = &Column> {
        self.all.iter().filter(|c| c.opts.find_by())
    }

    pub fn all_list_by(&self) -> impl Iterator<Item = &Column> {
        self.all.iter().filter(|c| c.opts.list_by())
    }

    pub fn updates_needed(&self) -> bool {
        self.all.len() > 2
    }

    pub fn variable_assignments(&self, ident: syn::Ident) -> proc_macro2::TokenStream {
        let assignments = self.all.iter().filter_map(|c| {
            if c.opts.update() {
                Some(c.variable_assignment(&ident))
            } else {
                None
            }
        });
        quote! {
            #(#assignments)*
        }
    }

    pub fn variable_assignments_for_create(&self, ident: syn::Ident) -> proc_macro2::TokenStream {
        let assignments = self.all.iter().filter_map(|c| {
            if c.opts.update() {
                Some(c.variable_assignment_for_create(&ident))
            } else {
                None
            }
        });
        quote! {
            #(#assignments)*
        }
    }

    pub fn names(&self) -> Vec<String> {
        self.all
            .iter()
            .filter_map(|c| {
                if c.opts.update() {
                    Some(c.name.to_string())
                } else {
                    None
                }
            })
            .collect()
    }

    pub fn placeholders(&self) -> String {
        let count = self.all.iter().filter(|c| c.opts.update()).count();
        (1..=count)
            .map(|i| format!("${}", i))
            .collect::<Vec<_>>()
            .join(", ")
    }

    pub fn sql_updates(&self) -> String {
        self.all
            .iter()
            .skip(1)
            .filter(|c| c.opts.update())
            .enumerate()
            .map(|(idx, column)| format!("{} = ${}", column.name, idx + 2))
            .collect::<Vec<_>>()
            .join(", ")
    }

    pub fn query_args(&self) -> Vec<proc_macro2::TokenStream> {
        self.all
            .iter()
            .filter(|c| c.opts.update())
            .map(|column| {
                let ident = &column.name;
                let ty = &column.opts.ty;
                quote! {
                    #ident as &#ty
                }
            })
            .collect()
    }
}

impl FromMeta for Columns {
    fn from_list(items: &[darling::ast::NestedMeta]) -> darling::Result<Self> {
        let all = items
            .iter()
            .map(Column::from_nested_meta)
            .collect::<Result<Vec<_>, _>>()?;
        Ok(Columns { all })
    }
}

pub struct Column {
    name: syn::Ident,
    opts: ColumnOpts,
}

impl FromMeta for Column {
    fn from_nested_meta(item: &darling::ast::NestedMeta) -> darling::Result<Self> {
        match item {
            darling::ast::NestedMeta::Meta(
                meta @ syn::Meta::NameValue(syn::MetaNameValue {
                    value:
                        syn::Expr::Lit(syn::ExprLit {
                            lit: syn::Lit::Str(ref lit_str),
                            ..
                        }),
                    ..
                }),
            ) => {
                let name = meta.path().get_ident().cloned().ok_or_else(|| {
                    darling::Error::custom("Expected identifier").with_span(meta.path())
                })?;
                Ok(Column::new(name, syn::parse_str(&lit_str.value())?))
            }
            darling::ast::NestedMeta::Meta(meta @ syn::Meta::List(_)) => {
                let name = meta.path().get_ident().cloned().ok_or_else(|| {
                    darling::Error::custom("Expected identifier").with_span(meta.path())
                })?;
                let column = Column {
                    name,
                    opts: ColumnOpts::from_meta(meta)?,
                };
                Ok(column)
            }
            _ => Err(
                darling::Error::custom("Expected name-value pair or attribute list")
                    .with_span(item),
            ),
        }
    }
}

impl Column {
    pub fn new(name: syn::Ident, ty: syn::Type) -> Self {
        Column {
            name,
            opts: ColumnOpts::new(ty),
        }
    }

    pub fn name(&self) -> &syn::Ident {
        &self.name
    }

    pub fn ty(&self) -> &syn::Type {
        &self.opts.ty
    }

    pub fn accessor(&self) -> proc_macro2::TokenStream {
        self.opts.accessor(&self.name)
    }

    fn variable_assignment_for_create(&self, ident: &syn::Ident) -> proc_macro2::TokenStream {
        let name = &self.name;
        let accessor = self.opts.new_accessor(name);
        quote! {
            let #name = &#ident.#accessor;
        }
    }

    fn variable_assignment(&self, ident: &syn::Ident) -> proc_macro2::TokenStream {
        let name = &self.name;
        let accessor = self.opts.accessor(name);
        quote! {
            let #name = &#ident.#accessor;
        }
    }
}

#[derive(FromMeta)]
struct ColumnOpts {
    ty: syn::Type,
    #[darling(default)]
    accessor: Accessor,
    #[darling(default)]
    find_by: Option<bool>,
    #[darling(default)]
    list_by: Option<bool>,
    #[darling(default)]
    update: Option<bool>,
}

impl ColumnOpts {
    fn new(ty: syn::Type) -> Self {
        ColumnOpts {
            ty,
            accessor: Default::default(),
            find_by: None,
            list_by: None,
            update: None,
        }
    }

    fn find_by(&self) -> bool {
        self.find_by.unwrap_or(true)
    }

    fn list_by(&self) -> bool {
        self.list_by.unwrap_or(true)
    }

    fn update(&self) -> bool {
        self.update.unwrap_or(true)
    }

    fn accessor(&self, name: &syn::Ident) -> proc_macro2::TokenStream {
        if let Some(both) = &self.accessor.both {
            quote! {
                #both
            }
        } else {
            quote! {
                #name
            }
        }
    }

    fn new_accessor(&self, name: &syn::Ident) -> proc_macro2::TokenStream {
        if let Some(new) = &self.accessor.new {
            quote! {
                #new
            }
        } else {
            self.accessor(name)
        }
    }
}

#[derive(Default, FromMeta)]
struct Accessor {
    new: Option<syn::Expr>,
    both: Option<syn::Expr>,
}

#[cfg(test)]
mod tests {
    use darling::FromMeta;
    use syn::parse_quote;

    use super::*;

    #[test]
    fn column_opts_from_list() {
        let input: syn::Meta = parse_quote!(thing(
            ty = "crate::module::Thing",
            list_by = false,
            accessor(new = "accessor_fn()")
        ));
        let values = ColumnOpts::from_meta(&input).expect("Failed to parse Field");
        assert_eq!(values.ty, parse_quote!(crate::module::Thing));
        assert!(!values.list_by());
        assert!(values.find_by());
        assert!(values.update());
        assert_eq!(values.accessor.new.unwrap(), parse_quote!(accessor_fn()));
    }

    #[test]
    fn columns_from_list() {
        let input: syn::Meta = parse_quote!(columns(
            name = "String",
            email(ty = "String", list_by = false, accessor(both = "email()"))
        ));
        let columns = Columns::from_meta(&input).expect("Failed to parse Fields");
        assert_eq!(columns.all.len(), 2);

        assert_eq!(columns.all[0].name.to_string(), "name");

        assert_eq!(columns.all[1].name.to_string(), "email");
        assert!(!columns.all[1].opts.list_by());
        assert_eq!(
            columns.all[1]
                .opts
                .accessor(&parse_quote!(email))
                .to_string(),
            quote!(email()).to_string()
        );
    }
}
