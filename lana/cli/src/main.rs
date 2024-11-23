#[tokio::main]
async fn main() -> anyhow::Result<()> {
    lana_cli::run().await
}
