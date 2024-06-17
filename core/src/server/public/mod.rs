pub mod graphql;

mod config;

use async_graphql::ServerError;
use async_graphql::{EmptySubscription, Schema};
use async_graphql_axum::{GraphQLRequest, GraphQLResponse};
use axum::{routing::get, Extension, Router};
use axum_extra::headers::HeaderMap;

use serde::{Deserialize, Serialize};

use crate::{app::LavaApp, primitives::UserId};

use super::jwks::{Claims, JwtDecoderState, RemoteJwksDecoder};

pub use config::*;

use std::sync::Arc;

pub async fn run(config: PublicServerConfig, app: LavaApp) -> anyhow::Result<()> {
    let schema = graphql::schema(Some(app.clone()));

    let jwks_decoder = Arc::new(RemoteJwksDecoder::new(config.jwks_url.clone()));
    let decoder = jwks_decoder.clone();
    tokio::spawn(async move {
        decoder.refresh_keys_periodically().await;
    });

    let app = Router::new()
        .route(
            "/graphql",
            get(playground).post(axum::routing::post(graphql_handler)),
        )
        .with_state(JwtDecoderState {
            decoder: jwks_decoder,
        })
        .layer(Extension(schema));

    println!("Starting public graphql server on port {}", config.port);
    let listener =
        tokio::net::TcpListener::bind(&std::net::SocketAddr::from(([0, 0, 0, 0], config.port)))
            .await?;
    axum::serve(listener, app.into_make_service()).await?;
    Ok(())
}

pub struct AuthContext {
    pub user_id: UserId,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JwtClaims {
    sub: String,
}

pub async fn graphql_handler(
    headers: HeaderMap,
    schema: Extension<Schema<graphql::Query, graphql::Mutation, EmptySubscription>>,
    Claims(jwt_claims): Claims<JwtClaims>,
    req: GraphQLRequest,
) -> GraphQLResponse {
    lava_tracing::http::extract_tracing(&headers);
    let mut req = req.into_inner();

    let user_id: UserId = match jwt_claims.sub.parse() {
        Ok(user_id) => user_id,
        Err(_) => {
            let error = ServerError::new("Invalid user id", None);
            let response = async_graphql::Response::from_errors(vec![error]);
            return GraphQLResponse::from(response);
        }
    };

    let auth_context = AuthContext { user_id };

    req = req.data(auth_context);

    schema.execute(req).await.into()
}

async fn playground() -> impl axum::response::IntoResponse {
    axum::response::Html(async_graphql::http::playground_source(
        async_graphql::http::GraphQLPlaygroundConfig::new("/graphql"),
    ))
}
