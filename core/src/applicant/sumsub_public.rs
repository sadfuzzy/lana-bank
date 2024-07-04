use crate::primitives::UserId;

pub fn get_user_link_sumsub(user_id: UserId) -> String {
    format!(
        "https://cockpit.sumsub.com/checkus#/applicants/individual?limit=10&page=0&searchQuery={}",
        user_id
    )
}
