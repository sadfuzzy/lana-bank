#[tokio::main]
async fn main() -> anyhow::Result<()> {
    lava_cli::run().await
}
