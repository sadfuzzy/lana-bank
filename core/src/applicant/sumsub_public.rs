use crate::primitives::CustomerId;

pub fn get_user_link_sumsub(user_id: CustomerId) -> String {
    format!(
        "https://cockpit.sumsub.com/checkus#/applicants/individual?limit=10&page=0&searchQuery={}",
        user_id
    )
}
