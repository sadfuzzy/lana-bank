use lava_core::*;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    cli::run().await
}
