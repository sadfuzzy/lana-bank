use sqlx::PgPool;

use crate::{loan::LoanError, primitives::*};

use super::{TermValues, Terms};

#[derive(Clone)]
pub struct TermRepo {
    pool: PgPool,
}

impl TermRepo {
    pub fn new(pool: &PgPool) -> Self {
        Self { pool: pool.clone() }
    }

    pub async fn update_current(&self, terms: TermValues) -> Result<Terms, LoanError> {
        let row = sqlx::query!(
            r#"
            WITH updated AS (
                UPDATE loan_terms
                SET current = FALSE
                WHERE current IS TRUE
            )
            INSERT INTO loan_terms (current, values)
            VALUES (TRUE, $1)
            RETURNING id
            "#,
            serde_json::to_value(&terms).expect("should serialize term values"),
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(Terms {
            id: LoanTermsId::from(row.id),
            values: terms,
        })
    }

    pub async fn find_current(&self) -> Result<Terms, LoanError> {
        let row = sqlx::query!(
            r#"
            SELECT id, values
            FROM loan_terms
            WHERE current IS TRUE
            "#,
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(Terms {
            id: LoanTermsId::from(row.id),
            values: serde_json::from_value(row.values).expect("should deserialize term values"),
        })
    }
}
