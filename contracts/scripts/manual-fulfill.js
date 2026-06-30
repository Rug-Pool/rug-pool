require('dotenv').config();
const { createPublicClient, createWalletClient, http, defineChain } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const fs = require('fs');
const path = require('path');

const MONAD_TESTNET = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: [process.env.MONAD_TESTNET_RPC] } },
});

const account = privateKeyToAccount(process.env.DEPLOYER_PRIVATE_KEY);
const publicClient = createPublicClient({ chain: MONAD_TESTNET, transport: http() });
const walletClient = createWalletClient({ chain: MONAD_TESTNET, transport: http(), account });

async function main() {
  const dep = JSON.parse(fs.readFileSync(
    path.join(__dirname, '..', 'deployments.json'), 'utf8'
  ));
  const vrfAbi = JSON.parse(fs.readFileSync(
    path.join(__dirname, '..', 'abis', 'VRFConsumer.json'), 'utf8'
  ));

  const VRF = dep.contracts.VRFConsumer;

  // These are set per simulation run
  const COIN_ADDRESS = process.argv[2];
  const CYCLE_NUMBER = BigInt(process.argv[3] || '1');
  const MANUAL_SEED = process.argv[4] ||
    '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';

  if (!COIN_ADDRESS) {
    console.error('Usage: node manual-fulfill.js <coinAddress> <cycleNumber> [seed]');
    process.exit(1);
  }

  console.log(`VRFConsumer: ${VRF}`);
  console.log(`Coin: ${COIN_ADDRESS}`);
  console.log(`Cycle: ${CYCLE_NUMBER}`);
  console.log(`Seed: ${MANUAL_SEED}`);
  console.log('Calling manualFulfill...');

  const h = await walletClient.writeContract({
    address: VRF,
    abi: vrfAbi,
    functionName: 'manualFulfill',
    args: [COIN_ADDRESS, CYCLE_NUMBER, MANUAL_SEED]
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash: h });
  console.log(`tx: ${h}`);
  console.log(`status: ${receipt.status}`);
  console.log('manualFulfill complete ✅');
}

main().catch(console.error);
