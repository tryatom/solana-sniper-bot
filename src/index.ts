import { Command } from 'commander';
import { Connection, Keypair } from '@solana/web3.js';
import * as dotenv from 'dotenv';
import { spawn } from 'child_process';

dotenv.config();

const program = new Command();

program
  .name('solana-sniper')
  .description('CLI to launch different strategies for the Rust engine')
  .version('2.1.0');

program
  .option('-m, --mode <mode>', 'Strategy mode: sniper, copytrade, mempool')
  .option('-t, --target <wallet>', 'Target wallet for copy trading')
  .parse(process.argv);

const options = program.opts();

async function main() {
  console.log(`[Manager] Bootstrapping execution environment for mode: ${options.mode}`);
  
  // Example of starting the highly optimized rust binary
  const engineProc = spawn('./target/release/solana-sniper-bot', [options.mode || 'sniper']);

  engineProc.stdout.on('data', (data) => {
    console.log(`[Engine]: ${data.toString().trim()}`);
  });

  engineProc.stderr.on('data', (data) => {
    console.error(`[Engine Error]: ${data.toString().trim()}`);
  });

  process.on('SIGINT', () => {
    console.log('[Manager] Terminating engine...');
    engineProc.kill('SIGINT');
    process.exit(0);
  });
}

main().catch(console.error);
