use serde::{Deserialize, Serialize};

use cala_ledger::account_set::{AccountSetMemberId, AccountSetMembersByExternalIdCursor};

use crate::primitives::LedgerAccountId;

use super::value::LedgerAccount;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LedgerAccountChildrenCursor {
    pub id: LedgerAccountId,
    pub external_id: Option<String>,
}

impl From<LedgerAccountChildrenCursor> for AccountSetMembersByExternalIdCursor {
    fn from(cursor: LedgerAccountChildrenCursor) -> Self {
        Self {
            id: AccountSetMemberId::AccountSet(cursor.id.into()),
            external_id: cursor.external_id,
        }
    }
}

impl From<AccountSetMembersByExternalIdCursor> for LedgerAccountChildrenCursor {
    fn from(cursor: AccountSetMembersByExternalIdCursor) -> Self {
        let id = match cursor.id {
            AccountSetMemberId::AccountSet(id) => id.into(),
            _ => panic!("Unexpected non-AccountSet cursor id found"),
        };
        Self {
            id,
            external_id: cursor.external_id,
        }
    }
}

impl From<&LedgerAccount> for LedgerAccountChildrenCursor {
    fn from(account: &LedgerAccount) -> Self {
        Self {
            id: account.id,
            external_id: account.cala_external_id.clone(),
        }
    }
}

impl es_entity::graphql::async_graphql::connection::CursorType for LedgerAccountChildrenCursor {
    type Error = String;

    fn encode_cursor(&self) -> String {
        use base64::{Engine as _, engine::general_purpose};
        let json = serde_json::to_string(self).expect("could not serialize cursor");
        general_purpose::STANDARD_NO_PAD.encode(json.as_bytes())
    }

    fn decode_cursor(s: &str) -> Result<Self, Self::Error> {
        use base64::{Engine as _, engine::general_purpose};
        let bytes = general_purpose::STANDARD_NO_PAD
            .decode(s.as_bytes())
            .map_err(|e| e.to_string())?;
        let json = String::from_utf8(bytes).map_err(|e| e.to_string())?;
        serde_json::from_str(&json).map_err(|e| e.to_string())
    }
}
