mod bfx_client;
mod error;

use crate::primitives::{PriceOfOneBTC, UsdCents};

use bfx_client::BfxClient;
use error::PriceError;

pub struct Price {
    bfx: BfxClient,
}

impl Price {
    pub fn new() -> Self {
        Price {
            bfx: BfxClient::new(),
        }
    }

    pub async fn usd_cents_per_btc(&self) -> Result<PriceOfOneBTC, PriceError> {
        let last_price = self.bfx.btc_usd_tick().await?.last_price;
        Ok(PriceOfOneBTC::new(UsdCents::try_from_usd(last_price)?))
    }
}

impl Default for Price {
    fn default() -> Self {
        Self::new()
    }
}
