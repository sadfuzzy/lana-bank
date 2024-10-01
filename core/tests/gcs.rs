use lava_core::{
    service_account::ServiceAccountConfig,
    storage::{config::StorageConfig, Storage},
};

#[tokio::test]
async fn upload_doc() -> anyhow::Result<()> {
    let sa_creds_base64 = if let Ok(sa_creds_base64) = std::env::var("SA_CREDS_BASE64") {
        sa_creds_base64
    } else {
        return Ok(());
    };

    let sa = ServiceAccountConfig::default().set_sa_creds_base64(sa_creds_base64)?;

    let config = if let Ok(name_prefix) = std::env::var("DEV_ENV_NAME_PREFIX") {
        StorageConfig::new_dev_mode(name_prefix, sa)
    } else {
        StorageConfig {
            service_account: Some(sa),
            root_folder: "gha".to_string(),
            bucket_name: "gha-volcano-documents".to_string(),
        }
    };

    let storage = Storage::new(&config);

    let file = "test".as_bytes().to_vec();
    let filename = format!("test-{}.txt", uuid::Uuid::new_v4());

    let _ = storage.upload(file, &filename, "application/txt").await;

    let res = storage._list("".to_string()).await?;

    assert!(res.iter().any(|x| x == &filename));

    Ok(())
}
