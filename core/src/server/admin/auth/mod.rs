use axum::{
    extract::Json,
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::post,
    Extension, Router,
};
use serde::{Deserialize, Serialize};

use crate::{app::LavaApp, primitives::UserId};

#[derive(Deserialize, std::fmt::Debug, Serialize)]
pub struct AuthCallbackPayload {
    email: String,
    flow_id: String,
    flow_type: String,
    identity_id: String,
    schema_id: String,
    transient_payload: serde_json::Value,
}

#[derive(Deserialize, Serialize)]
pub struct IdentityPayload {
    id: UserId,
}

#[derive(Deserialize, Serialize)]
pub struct ResponsePayload {
    pub identity: IdentityPayload,
}

impl IntoResponse for ResponsePayload {
    fn into_response(self) -> Response {
        let body = match serde_json::to_string(&self) {
            Ok(value) => value,
            Err(error) => {
                println!("Error serializing response payload: {:?}", error);
                return (StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error")
                    .into_response();
            }
        };

        Response::builder()
            .status(StatusCode::OK)
            .header("Content-Type", "application/json")
            .body(body.into())
            .expect("Failed to build response")
    }
}
pub async fn auth_callback(
    Extension(app): Extension<LavaApp>,
    Json(payload): Json<AuthCallbackPayload>,
) -> impl IntoResponse {
    // Log the received HTTP method and JSON payload
    println!("Received auth callback with payload: {:?}", payload);

    let email = payload.email;
    let id = match payload.identity_id.parse() {
        Ok(uuid) => uuid,
        Err(error) => {
            println!("Error parsing identity_id: {:?}", error);
            return (StatusCode::BAD_REQUEST, "Invalid identity_id format").into_response();
        }
    };

    match app.users().create_user(id, email).await {
        Ok(user) => ResponsePayload {
            identity: { IdentityPayload { id: user.id } },
        }
        .into_response(),

        Err(error) => {
            println!("Error creating user: {:?}", error);
            (StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error").into_response()
        }
    }
}

pub fn auth_routes() -> Router {
    Router::new().route("/auth/callback", post(auth_callback))
}
