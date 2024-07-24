use axum::{
    extract::Json, http::StatusCode, response::IntoResponse, routing::post, Extension, Router,
};
use serde::{Deserialize, Serialize};

use crate::{app::LavaApp, server::jwks::JwtDecoderState};

#[derive(Deserialize, std::fmt::Debug, Serialize)]
pub struct AuthCallbackPayload {
    email: String,
    flow_id: String,
    flow_type: String,
    identity_id: String,
    schema_id: String,
    transient_payload: serde_json::Value,
}

pub async fn auth_callback(
    Extension(app): Extension<LavaApp>,
    Json(payload): Json<AuthCallbackPayload>,
) -> impl IntoResponse {
    // Log the received HTTP method and JSON payload
    println!("Received auth callback with payload: {:?}", payload);

    let email = payload.email;
    let id = match payload.identity_id.parse() {
        Ok(id) => id,
        Err(error) => {
            println!("Error parsing identity_id: {:?}", error);
            return (StatusCode::BAD_REQUEST, "Invalid identity_id format").into_response();
        }
    };

    match app.customers().create_customers(id, email).await {
        Ok(user) => axum::Json(serde_json::json!( {
            "identity": { "id": user.id }
        }))
        .into_response(),
        Err(error) => {
            println!("Error creating user: {:?}", error);
            (StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error").into_response()
        }
    }
}

pub fn auth_routes() -> Router<JwtDecoderState> {
    Router::new().route("/auth/callback", post(auth_callback))
}
