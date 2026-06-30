const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { createPublicClient, createWalletClient, http, defineChain } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');

const ROOT = path.join(__dirname, '..');
const MONAD = defineChain({
  id: 10143, name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: [process.env.MONAD_TESTNET_RPC] } },
});

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function loadAbi(name) {
  const art = JSON.parse(fs.readFileSync(path.join(ROOT, 'out', name + '.sol', name + '.json'), 'utf8'));
  return art.abi;
}

const chainAbi = loadAbi('CoinFactory');
const rugAbi = loadAbi('RugPool');
const vrfAbi = loadAbi('VRFConsumer');
const treasuryAbi = loadAbi('Treasury');

const DEP = JSON.parse(fs.readFileSync(path.join(ROOT, 'deployments.json'), 'utf8'));
const REGISTRY = DEP.contracts.MemberRegistry;
const COIN_FACTORY = DEP.contracts.CoinFactory;
const RUG_POOL = DEP.contracts.RugPool;
const VRF_ADDR = DEP.contracts.VRFConsumer;
const TREASURY = DEP.contracts.Treasury;

const { generatePrivateKey } = require('viem/accounts');
const acc = privateKeyToAccount(process.env.DEPLOYER_PRIVATE_KEY);
const pub = createPublicClient({ chain: MONAD, transport: http() });
const w = createWalletClient({ chain: MONAD, transport: http(), account: acc });
const ALICE = acc.address;
const WALLETS = [];
const NAMES = {};

const registryAbi = loadAbi('MemberRegistry');

const SCRIPTS = [
  { file: 'test-registry.js', label: 'test-registry.js' },
  { file: 'test-factory.js',  label: 'test-factory.js' },
  { file: 'test-vrf.js',      label: 'test-vrf.js' },
  { file: 'test-treasury.js', label: 'test-treasury.js' },
  { file: 'test-rugpool.js',  label: 'test-rugpool.js' },
];

const TEST_SEED = '0x1111111111111111111111111111111111111111111111111111111111111111';
const results = [];

function withRetry(fn, retries = 3, delayMs = 5000) {
  return (async () => {
    for (let i = 0; i < retries; i++) {
      try { return await fn(); }
      catch (err) {
        console.log(`  Attempt ${i + 1} failed: ${err.message}`);
        if (i === retries - 1) throw err;
        console.log(`  Retrying in ${delayMs / 1000}s...`);
        await sleep(delayMs);
      }
    }
  })();
}

function runScript(script) {
  return new Promise((resolve) => {
    const start = Date.now();
    const child = spawn('node', [path.join('scripts', script.file)], {
      cwd: ROOT, stdio: ['inherit', 'inherit', 'inherit'],
    });
    child.on('close', (code) => {
      resolve({ label: script.label, code, elapsed: ((Date.now() - start) / 1000).toFixed(1) });
    });
  });
}

async function simulate() {
  const start = Date.now();
  console.log(`\n>>> Running inline simulation >>>\n`);

  // ── Generate Bob and Carol wallets ──
  console.log('Generating test wallets...');
  const bobKey = generatePrivateKey();
  const carolKey = generatePrivateKey();
  const bobAcc = privateKeyToAccount(bobKey);
  const carolAcc = privateKeyToAccount(carolKey);
  const BOB = bobAcc.address;
  const CAROL = carolAcc.address;
  NAMES[BOB] = 'Bob';
  NAMES[CAROL] = 'Carol';
  WALLETS.push(BOB, CAROL);
  console.log(`  Bob:   ${BOB}`);
  console.log(`  Carol: ${CAROL}\n`);

  // ── Fund Bob and Carol ──
  console.log('Funding Bob and Carol with 1 MON each...');
  let h = await withRetry(() => w.sendTransaction({ to: BOB, value: 1000000000000000000n }));
  await withRetry(() => pub.waitForTransactionReceipt({ hash: h }));
  console.log(`  Funded Bob`);
  h = await withRetry(() => w.sendTransaction({ to: CAROL, value: 1000000000000000000n }));
  await withRetry(() => pub.waitForTransactionReceipt({ hash: h }));
  console.log(`  Funded Carol\n`);

  // ── Register Bob and Carol ──
  console.log('Registering wallets (0.5 MON each)...');
  const bobClient = createWalletClient({ chain: MONAD, transport: http(), account: bobAcc });
  const carolClient = createWalletClient({ chain: MONAD, transport: http(), account: carolAcc });
  const REG_FEE = 500000000000000000n;
  h = await withRetry(() => bobClient.writeContract({
    address: REGISTRY, abi: registryAbi, functionName: 'register', value: REG_FEE,
  }));
  await withRetry(() => pub.waitForTransactionReceipt({ hash: h }));
  console.log(`  Bob registered`);
  h = await withRetry(() => carolClient.writeContract({
    address: REGISTRY, abi: registryAbi, functionName: 'register', value: REG_FEE,
  }));
  await withRetry(() => pub.waitForTransactionReceipt({ hash: h }));
  console.log(`  Carol registered\n`);

  // ── Launch a fresh coin ──
  console.log('Launching CHAIN coin...');
  const COIN_NAME = 'ChainTest';
  const TICKER = 'CHAIN';
  const MAX_SUPPLY = 1000000000000000000000000000n; // 1B tokens
  const INITIAL_PRICE = 1000000000n; // 1 gwei per token => initialPoolValue = 1 MON

  const txHash = await withRetry(() => w.writeContract({
    address: COIN_FACTORY, abi: chainAbi, functionName: 'launchCoin',
    args: [COIN_NAME, TICKER, '', '', INITIAL_PRICE, MAX_SUPPLY, 33, false],
  }));
  let r = await withRetry(() => pub.waitForTransactionReceipt({ hash: txHash }));
  const eventLog = r.logs.find(l => l.address.toLowerCase() === RUG_POOL.toLowerCase());
  const coinAddr = eventLog ? '0x' + eventLog.topics[1].slice(26) : null;
  if (!coinAddr) { throw new Error('Could not extract coin address from logs'); }
  console.log(`  CHAIN coin at: ${coinAddr} ✅\n`);

  // ── Set 60s cycle ──
  console.log('Setting cycle duration to 60s...');
  await withRetry(() => w.writeContract({
    address: RUG_POOL, abi: rugAbi, functionName: 'setCycleDuration',
    args: [coinAddr, 60n],
  }));
  console.log('  cycleDuration now: 60s ✅\n');

  // ── Staggered buys ──
  async function doBuy(client, wallet, label, amount) {
    const bh = await withRetry(() => client.writeContract({
      address: RUG_POOL, abi: rugAbi, functionName: 'buy',
      args: [coinAddr, 0n], value: amount,
    }));
    await withRetry(() => pub.waitForTransactionReceipt({ hash: bh }));
    const bal = await pub.readContract({ address: RUG_POOL, abi: rugAbi, functionName: 'holders', args: [coinAddr, wallet] });
    console.log(`  ${label} bought ${(Number(bal[2]) / 1e18).toFixed(2)} CHAIN for ${Number(amount) / 1e18} MON`);
  }

  await doBuy(w, ALICE, 'Alice', 500000000000000000n);
  console.log('  Waiting 5s...'); await sleep(5000);
  await doBuy(bobClient, BOB, 'Bob', 300000000000000000n);
  console.log('  Waiting 5s...'); await sleep(5000);
  await doBuy(carolClient, CAROL, 'Carol', 200000000000000000n);
  console.log('  All buys confirmed ✅\n');

  // ── Wait for cycle to end ──
  console.log('Waiting for cycle to end (60s)...');
  for (let i = 0; i < 30; i++) {
    await sleep(5000);
    const ready = await pub.readContract({ address: RUG_POOL, abi: rugAbi, functionName: 'isFlipReady', args: [coinAddr] });
    if (ready) { console.log('  isFlipReady = true ✅\n'); break; }
    console.log(`  checking... (${(i + 1) * 5}s)`);
  }

  // ── Trigger flip ──
  console.log('Triggering flip...');
  const fee = await pub.readContract({ address: VRF_ADDR, abi: vrfAbi, functionName: 'getRequestFee', args: [] });
  console.log(`  VRF fee: ${Number(fee) / 1e18} MON`);
  const flipTx = await withRetry(() => w.writeContract({
    address: RUG_POOL, abi: rugAbi, functionName: 'triggerFlip',
    args: [coinAddr], value: fee,
  }));
  await withRetry(() => pub.waitForTransactionReceipt({ hash: flipTx }));
  console.log(`  triggerFlip tx: ${flipTx} ✅\n`);

  // ── Auto-fulfill VRF ──
  console.log('Auto-fulfilling VRF with test seed...');
  const fulfillTx = await withRetry(() => w.writeContract({
    address: VRF_ADDR, abi: vrfAbi, functionName: 'manualFulfill',
    args: [coinAddr, 1n, TEST_SEED],
  }));
  await withRetry(() => pub.waitForTransactionReceipt({ hash: fulfillTx }));
  console.log(`  manualFulfill tx: ${fulfillTx} ✅\n`);

  // ── Verify outcomes ──
  console.log('Verifying outcomes...\n');
  for (let i = 0; i < WALLETS.length; i++) {
    const wallet = WALLETS[i];
    const name = NAMES[wallet] || `Wallet ${i}`;
    const h = await pub.readContract({ address: RUG_POOL, abi: rugAbi, functionName: 'holders', args: [coinAddr, wallet] });
    const outcome = await pub.readContract({
      address: VRF_ADDR, abi: vrfAbi, functionName: 'deriveOutcome',
      args: [TEST_SEED, wallet, 1n, 33],
    });
    const bal = await pub.getBalance({ address: wallet });
    const label = outcome ? 'HEADS' : 'TAILS';
    const detail = outcome ? 'exited with payout' : 'sacrificed';
    console.log(`  ${name} (${wallet.slice(0, 10)}...): ${label} — ${detail}`);
    console.log(`    tokens: ${(Number(h[2]) / 1e18).toFixed(2)} CHAIN, MON: ${(Number(bal) / 1e18).toFixed(4)} MON`);
  }

  const coin = await pub.readContract({ address: RUG_POOL, abi: rugAbi, functionName: 'coins', args: [coinAddr] });
  console.log(`\n  Coin: cycle=${Number(coin[2])} active=${coin[6]} pool=${(Number(coin[8]) / 1e18).toFixed(4)} MON`);

  let treasuryFees = '0', topLoser = '0x0', topLoss = '0';
  try {
    const f = await pub.readContract({ address: TREASURY, abi: treasuryAbi, functionName: 'pendingFees', args: [] });
    treasuryFees = (Number(f) / 1e18).toFixed(6);
    const l = await pub.readContract({ address: TREASURY, abi: treasuryAbi, functionName: 'getCurrentTopLoser', args: [] });
    topLoser = l[0]; topLoss = (Number(l[1]) / 1e18).toFixed(4);
  } catch (e) { console.log(`  Treasury query error: ${e.message}`); }
  console.log(`  Treasury pending fees: ${treasuryFees} MON`);
  console.log(`  Top loser: ${topLoser} lost ${topLoss} MON`);

  return { elapsed: ((Date.now() - start) / 1000).toFixed(1), coinAddr };
}

async function main() {
  console.log('=== Starting Chain Test Suite ===\n');

  // Steps 1-5
  for (const script of SCRIPTS) {
    console.log(`>>> Running ${script.file} >>>\n`);
    const result = await runScript(script);
    results.push(result);
    if (result.code !== 0) {
      console.log(`\n!!! ${script.label} FAILED with exit code ${result.code}. Stopping. !!!\n`);
      printSummary();
      process.exit(1);
    }
    console.log(`\n<<< ${script.label} PASSED (${result.elapsed}s) <<<\n`);
  }

  // Step 6 — inline simulation
  let simResult;
  try {
    simResult = await simulate();
    results.push({ label: 'simulation (inline)', code: 0, elapsed: simResult.elapsed });
    console.log(`\n<<< simulation PASSED (${simResult.elapsed}s) <<<\n`);
  } catch (err) {
    results.push({ label: 'simulation (inline)', code: 1, elapsed: '0.0' });
    console.log(`\n!!! simulation FAILED: ${err.message} !!!\n`);
    printSummary();
    process.exit(1);
  }

  printSummary();
}

function printSummary() {
  const totalTime = results.reduce((acc, r) => acc + parseFloat(r.elapsed), 0);
  const passed = results.filter(r => r.code === 0).length;
  const total = results.length;

  console.log('=== Chain Test Summary ===');
  for (const r of results) {
    const status = r.code === 0 ? '✅ PASS' : '❌ FAIL';
    console.log(`${r.label.padEnd(22)} ${status}   (${r.elapsed}s)`);
  }
  console.log('');
  console.log(`Total time: ${totalTime.toFixed(1)}s`);
  console.log(`Overall: ${passed}/${total} scripts passed`);
  console.log('===========================');
}

main().catch(err => { console.error('Chain runner error:', err); process.exit(1); });
