pub mod config;
mod db;

use anyhow::Context;
use clap::Parser;
use std::{fs, path::PathBuf};

use self::config::{Config, EnvOverride};

#[derive(Parser)]
#[clap(long_about = None)]
struct Cli {
    #[clap(
        short,
        long,
        env = "LAVA_CONFIG",
        default_value = "lava.yml",
        value_name = "FILE"
    )]
    config: PathBuf,
    #[clap(
        long,
        env = "LAVA_HOME",
        default_value = ".lava",
        value_name = "DIRECTORY"
    )]
    lava_home: String,
    #[clap(env = "PG_CON")]
    pg_con: String,
    #[clap(env = "BITFINEX_KEY", default_value = "")]
    bfx_key: String,
    #[clap(env = "BITFINEX_SECRET", default_value = "")]
    bfx_secret: String,
}

pub async fn run() -> anyhow::Result<()> {
    let cli = Cli::parse();

    let config = Config::from_path(
        cli.config,
        EnvOverride {
            db_con: cli.pg_con,
            bfx_key: cli.bfx_key,
            bfx_secret: cli.bfx_secret,
        },
    )?;

    run_cmd(&cli.lava_home, config).await?;

    Ok(())
}

async fn run_cmd(lava_home: &str, config: Config) -> anyhow::Result<()> {
    lava_tracing::init_tracer(config.tracing)?;
    store_server_pid(lava_home, std::process::id())?;

    let (send, mut receive) = tokio::sync::mpsc::channel(1);
    let mut handles = Vec::new();
    let pool = db::init_pool(&config.db).await?;
    let app = crate::app::LavaApp::run(pool.clone(), config.app).await?;
    let admin_app = app.clone();

    let admin_send = send.clone();
    handles.push(tokio::spawn(async move {
        let _ = admin_send.try_send(
            crate::server::admin::run(config.admin_server, admin_app)
                .await
                .context("Admin server error"),
        );
    }));

    let api_send = send.clone();
    handles.push(tokio::spawn(async move {
        let _ = api_send.try_send(
            crate::server::public::run(config.public_server, app)
                .await
                .context("Public server error"),
        );
    }));

    let reason = receive.recv().await.expect("Didn't receive msg");
    for handle in handles {
        handle.abort();
    }

    reason
}

pub fn store_server_pid(lava_home: &str, pid: u32) -> anyhow::Result<()> {
    create_lava_dir(lava_home)?;
    let _ = fs::remove_file(format!("{lava_home}/server-pid"));
    fs::write(format!("{lava_home}/server-pid"), pid.to_string()).context("Writing PID file")?;
    Ok(())
}

fn create_lava_dir(lava_home: &str) -> anyhow::Result<()> {
    let _ = fs::create_dir(lava_home);
    Ok(())
}
