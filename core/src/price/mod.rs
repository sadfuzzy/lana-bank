mod bfx_client;
pub mod error;

use cached::proc_macro::cached;

use crate::primitives::{PriceOfOneBTC, UsdCents};

use bfx_client::BfxClient;
use error::PriceError;

#[derive(Clone, Default)]
pub struct Price {
    bfx: BfxClient,
}

impl Price {
    pub fn new() -> Self {
        Self {
            bfx: BfxClient::new(),
        }
    }

    pub async fn usd_cents_per_btc(&self) -> Result<PriceOfOneBTC, PriceError> {
        usd_cents_per_btc_cached(&self.bfx).await
    }
}

#[cached(time = 60, result = true, key = "()", convert = r#"{}"#)]
async fn usd_cents_per_btc_cached(bfx: &BfxClient) -> Result<PriceOfOneBTC, PriceError> {
    let last_price = bfx.btc_usd_tick().await?.last_price;
    Ok(PriceOfOneBTC::new(UsdCents::try_from_usd(last_price)?))
}
