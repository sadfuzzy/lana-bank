// use serde::{Deserialize, Serialize};

// use super::Withdraw;

// #[derive(Debug, Serialize, Deserialize)]
// pub struct WithdrawByIdCursor {
//     pub withdrawal_created_at: chrono::DateTime<chrono::Utc>,
// }

// impl From<Withdraw> for WithdrawByIdCursor {
//     fn from(withdraw: Withdraw) -> Self {
//         Self {
//             withdrawal_created_at: withdraw.created_at(),
//         }
//     }
// }
