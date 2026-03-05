use std::env;
use std::sync::Arc;
use tokio::sync::Mutex;
use log::{info, error};

mod engine;
mod geyser_client;
mod jito;
mod router;
mod strategies;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::dotenv().ok();
    env_logger::init();

    info!("Starting Solana Sniper Bot Execution Engine...");

    let rpc_url = env::var("RPC_URL").expect("RPC_URL must be set");
    let wss_url = env::var("WSS_URL").expect("WSS_URL must be set");
    
    // Initialize the high-speed geyser stream
    let geyser_manager = Arc::new(Mutex::new(geyser_client::GeyserManager::new(&wss_url).await?));
    
    // Spin up strategy evaluators
    let mut sniper = strategies::LiquiditySniper::new(geyser_manager.clone());
    
    info!("Engine initialized. Connecting to Geyser plugin and Jito Block Engine...");
    
    // Wait for shutdown signal
    tokio::signal::ctrl_c().await?;
    info!("Shutting down safely...");
    
    Ok(())
}
