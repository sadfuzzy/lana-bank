use sqlx::PgPool;

#[derive(Clone)]
pub(super) struct FixedTermLoanRepo {
    _pool: PgPool,
}

impl FixedTermLoanRepo {
    pub fn new(pool: PgPool) -> Self {
        Self { _pool: pool }
    }
}
