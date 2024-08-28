use lava_core::price::Price;

#[tokio::test]
async fn get_price() -> anyhow::Result<()> {
    let price_service = Price::new();
    let res = price_service.usd_cents_per_btc().await;
    assert!(res.is_ok());

    Ok(())
}
