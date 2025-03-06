mod helpers;

use lana_app::{app::*, applicant::*, customer::CustomerType, primitives::Subject};

use std::env;
use uuid::Uuid;

fn load_config_from_env() -> Option<SumsubConfig> {
    let sumsub_key = env::var("SUMSUB_KEY").ok()?;
    let sumsub_secret = env::var("SUMSUB_SECRET").ok()?;

    Some(SumsubConfig {
        sumsub_key,
        sumsub_secret,
    })
}

fn get_random_credentials() -> (String, String) {
    let random_id = Uuid::new_v4().to_string();
    let email = format!("test_{}@example.com", random_id);
    let telegram_id = format!("test_{}_telegram", random_id);
    (email, telegram_id)
}

#[tokio::test]
async fn create_permalink() -> anyhow::Result<()> {
    let sumsub_config = load_config_from_env();
    if sumsub_config.is_none() {
        println!("not running the test");
        return Ok(());
    };
    let pool = helpers::init_pool().await?;
    let app_config = AppConfig {
        sumsub: sumsub_config.unwrap(),
        ..Default::default()
    };
    let app = LanaApp::run(pool, app_config).await?;

    let (email, telegram_id) = get_random_credentials();
    let customer = app
        .customers()
        .create(
            &Subject::System,
            email,
            telegram_id,
            CustomerType::Individual,
        )
        .await?;
    let customer_id = customer.id;

    match app
        .applicants()
        .create_permalink(&Subject::System, customer_id)
        .await
    {
        Ok(PermalinkResponse { url }) => {
            assert!(!url.is_empty(), "The returned URL should not be empty");
            assert!(url.starts_with("http"), "The URL should start with 'http'");
        }
        Err(e) => {
            panic!("Request failed: {:?}", e);
        }
    }
    Ok(())
}
