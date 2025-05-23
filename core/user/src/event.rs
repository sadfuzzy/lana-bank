use serde::{Deserialize, Serialize};

use crate::primitives::{RoleId, RoleName, UserId};

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum CoreUserEvent {
    UserCreated {
        id: UserId,
        email: String,
    },
    UserRemoved {
        id: UserId,
    },
    UserGrantedRole {
        id: UserId,
        role: RoleName,
    },
    UserRevokedRole {
        id: UserId,
        role: RoleName,
    },

    RoleCreated {
        id: RoleId,
        name: RoleName,
    },
    RoleGainedPermission {
        id: RoleId,
        object: String,
        action: String,
    },
    RoleLostPermission {
        id: RoleId,
        object: String,
        action: String,
    },
}
