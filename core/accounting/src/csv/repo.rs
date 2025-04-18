use sqlx::PgPool;

use es_entity::*;

use crate::primitives::{AccountingCsvId, LedgerAccountId};

use super::{entity::*, error::*, primitives::*};

#[derive(EsRepo, Clone)]
#[es_repo(
    entity = "AccountingCsv",
    err = "AccountingCsvError",
    columns(
        csv_type(ty = "AccountingCsvType"),
        ledger_account_id(ty = "Option<LedgerAccountId>", list_for),
    )
)]
pub struct AccountingCsvRepo {
    pool: PgPool,
}

impl AccountingCsvRepo {
    pub fn new(pool: &PgPool) -> Self {
        Self { pool: pool.clone() }
    }
}

mod accounting_csv_type_sqlx {
    use crate::csv::AccountingCsvType;
    use sqlx::{Type, postgres::*};

    impl Type<Postgres> for AccountingCsvType {
        fn type_info() -> PgTypeInfo {
            <String as Type<Postgres>>::type_info()
        }

        fn compatible(ty: &PgTypeInfo) -> bool {
            <String as Type<Postgres>>::compatible(ty)
        }
    }

    impl sqlx::Encode<'_, Postgres> for AccountingCsvType {
        fn encode_by_ref(
            &self,
            buf: &mut PgArgumentBuffer,
        ) -> Result<sqlx::encode::IsNull, Box<dyn std::error::Error + Sync + Send>> {
            <String as sqlx::Encode<'_, Postgres>>::encode(self.to_string(), buf)
        }
    }

    impl<'r> sqlx::Decode<'r, Postgres> for AccountingCsvType {
        fn decode(value: PgValueRef<'r>) -> Result<Self, Box<dyn std::error::Error + Sync + Send>> {
            let s = <String as sqlx::Decode<Postgres>>::decode(value)?;
            Ok(s.parse().map_err(|e: strum::ParseError| Box::new(e))?)
        }
    }

    impl PgHasArrayType for AccountingCsvType {
        fn array_type_info() -> PgTypeInfo {
            <String as sqlx::postgres::PgHasArrayType>::array_type_info()
        }
    }
}
