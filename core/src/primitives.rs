use rust_decimal::Decimal;
use rust_decimal_macros::dec;
use serde::{Deserialize, Serialize};

use std::fmt;

crate::entity_id! { UserId }
crate::entity_id! { FixedTermLoanId }
crate::entity_id! { LineOfCreditContractId }
crate::entity_id! { JobId }

impl From<FixedTermLoanId> for LedgerAccountId {
    fn from(id: FixedTermLoanId) -> Self {
        LedgerAccountId::from(id.0)
    }
}
impl From<FixedTermLoanId> for JobId {
    fn from(id: FixedTermLoanId) -> Self {
        JobId::from(id.0)
    }
}

pub enum DebitOrCredit {
    Debit,
    Credit,
}

pub use cala_types::primitives::{
    AccountId as LedgerAccountId, Currency, JournalId as LedgerJournalId,
    TxTemplateId as LedgerTxTemplateId,
};

pub const SATS_PER_BTC: Decimal = dec!(100_000_000);

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct Satoshis(Decimal);

impl fmt::Display for Satoshis {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl Default for Satoshis {
    fn default() -> Self {
        Self::ZERO
    }
}

impl Satoshis {
    pub const ZERO: Self = Self(Decimal::ZERO);
    pub const ONE: Self = Self(Decimal::ONE);

    pub fn to_btc(self) -> Decimal {
        self.0 / SATS_PER_BTC
    }

    pub fn from_btc(btc: Decimal) -> Self {
        Self(btc * SATS_PER_BTC)
    }

    pub fn into_inner(self) -> Decimal {
        self.0
    }

    pub fn flip_sign(self) -> Self {
        Self(self.0 * Decimal::NEGATIVE_ONE)
    }

    pub fn abs(&self) -> Self {
        Self(self.0.abs())
    }
}

impl From<Decimal> for Satoshis {
    fn from(sats: Decimal) -> Self {
        Self(sats)
    }
}

impl From<u64> for Satoshis {
    fn from(sats: u64) -> Self {
        Self(Decimal::from(sats))
    }
}

impl From<i32> for Satoshis {
    fn from(sats: i32) -> Self {
        Self(Decimal::from(sats))
    }
}

impl From<u32> for Satoshis {
    fn from(sats: u32) -> Self {
        Self(Decimal::from(sats))
    }
}

impl From<i64> for Satoshis {
    fn from(sats: i64) -> Self {
        Self(Decimal::from(sats as u64))
    }
}

impl std::ops::Add<Satoshis> for Satoshis {
    type Output = Satoshis;
    fn add(self, rhs: Satoshis) -> Self {
        Self(self.0 + rhs.0)
    }
}

impl std::ops::Sub<Satoshis> for Satoshis {
    type Output = Satoshis;
    fn sub(self, rhs: Satoshis) -> Self {
        Self(self.0 - rhs.0)
    }
}

impl std::ops::Mul<Satoshis> for Satoshis {
    type Output = Satoshis;
    fn mul(self, rhs: Satoshis) -> Self {
        Self(self.0 * rhs.0)
    }
}

impl std::ops::Mul<i32> for Satoshis {
    type Output = Satoshis;
    fn mul(self, rhs: i32) -> Self {
        self * Satoshis::from(rhs)
    }
}

impl std::ops::Mul<usize> for Satoshis {
    type Output = Satoshis;
    fn mul(self, rhs: usize) -> Self {
        Satoshis::from(self.0 * Decimal::from(rhs))
    }
}

impl std::ops::Div<Satoshis> for Satoshis {
    type Output = Satoshis;
    fn div(self, rhs: Satoshis) -> Self {
        Self(self.0 / rhs.0)
    }
}

impl std::ops::AddAssign<Satoshis> for Satoshis {
    fn add_assign(&mut self, rhs: Satoshis) {
        *self = Self(self.0 + rhs.0)
    }
}

impl std::ops::SubAssign<Satoshis> for Satoshis {
    fn sub_assign(&mut self, rhs: Satoshis) {
        *self = Self(self.0 - rhs.0)
    }
}

impl std::iter::Sum for Satoshis {
    fn sum<I: Iterator<Item = Self>>(iter: I) -> Self {
        iter.fold(Satoshis::ZERO, |a, b| a + b)
    }
}

impl<'a> std::iter::Sum<&'a Satoshis> for Satoshis {
    fn sum<I: Iterator<Item = &'a Self>>(iter: I) -> Self {
        iter.fold(Satoshis::ZERO, |a, b| a + *b)
    }
}
