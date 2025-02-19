use core_price::Price;

#[tokio::test]
async fn get_price() -> anyhow::Result<()> {
    let price = Price::new();
    let res = price.usd_cents_per_btc().await;
    assert!(res.is_ok());

    Ok(())
}
