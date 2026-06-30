require('dotenv').config();
const { createPublicClient, createWalletClient, http, defineChain } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function withRetry(fn, retries = 3, delayMs = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      console.log(`  Attempt ${i + 1} failed: ${err.message}`);
      if (i === retries - 1) throw err;
      console.log(`  Retrying in ${delayMs / 1000}s...`);
      await sleep(delayMs);
    }
  }
}

const MONAD = defineChain({
  id: 10143, name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: [process.env.MONAD_TESTNET_RPC] } },
});

const account = privateKeyToAccount(process.env.DEPLOYER_PRIVATE_KEY);
const pub = createPublicClient({ chain: MONAD, transport: http() });
const w = createWalletClient({ chain: MONAD, transport: http(), account });

const SIM_COIN = '0x704631Ccb8C0F06feD752EB2441b3c446648b75f';
const RUG_POOL = '0x1b68e000bb7788477d7a9a3f0315beea71501652';

const ALICE = account.address;
const BOB = '0xe6c730a9d2f25A7B2D9E5A4f2d70730a70c61A25';
const CAROL = '0x77f6a59631212034de0c32F3DAF90fe943E202BE';
const NAMES = { [ALICE]: 'Alice', [BOB]: 'Bob', [CAROL]: 'Carol' };
const WALLETS = [ALICE, BOB, CAROL];

function loadAbi(name) {
  const art = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'out', name + '.sol', name + '.json'), 'utf8'));
  return art.abi;
}

const rugAbi = loadAbi('RugPool');
const vrfAbi = loadAbi('VRFConsumer');
const treasuryAbi = loadAbi('Treasury');
const VRF_ADDR = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'deployments.json'), 'utf8')).contracts.VRFConsumer;
const TREASURY_ADDR = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'deployments.json'), 'utf8')).contracts.Treasury;

async function getCoinState() {
  const c = await pub.readContract({ address: RUG_POOL, abi: rugAbi, functionName: 'coins', args: [SIM_COIN] });
  return {
    cycle: Number(c[2]), start: Number(c[3]), dur: Number(c[4]),
    prob: Number(c[5]), active: c[6], holders: Number(c[7]),
    pool: c[8], supply: c[9],
  };
}

async function getHolder(wallet) {
  const h = await pub.readContract({ address: RUG_POOL, abi: rugAbi, functionName: 'holders', args: [SIM_COIN, wallet] });
  return { joinCycle: Number(h[0]), joinTS: Number(h[1]), balance: h[2], active: h[3] };
}

async function getBalances() {
  const b = {};
  for (const w of WALLETS) b[w] = await pub.getBalance({ address: w });
  return b;
}

async function main() {
  console.log('=== Cycle 2 Simulation ===\n');

  // ── STEP A: Check current state ──
  console.log('--- STEP A: Check current state ---');
  let coin = await getCoinState();
  console.log('SIM coin state:', JSON.stringify(coin, (k, v) => typeof v === 'bigint' ? v.toString() : v, 2));
  if (coin.cycle !== 2) {
    console.log(`Expected cycle 2, got ${coin.cycle}. Aborting.`);
    return;
  }
  console.log('Current cycle is 2 — ready for new buyers.\n');

  // ── STEP B: New buyers enter Cycle 2 ──
  console.log('--- STEP B: New buyers enter Cycle 2 ---');
  const bobClient = createWalletClient({
    chain: MONAD, transport: http(),
    account: privateKeyToAccount(process.env.BOB_PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY),
  });
  const carolClient = createWalletClient({
    chain: MONAD, transport: http(),
    account: privateKeyToAccount(process.env.CAROL_PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY),
  });

  async function buy(wallet, label, monAmount) {
    const client = wallet === ALICE ? w : wallet === BOB ? bobClient : carolClient;
    const h = await withRetry(() => client.writeContract({
      address: RUG_POOL, abi: rugAbi, functionName: 'buy',
      args: [SIM_COIN, 0n], value: monAmount,
    }));
    const r = await withRetry(() => pub.waitForTransactionReceipt({ hash: h }));
    const bal = await getHolder(wallet);
    console.log(`${label} bought ${(Number(bal.balance) / 1e18).toFixed(2)} SIM for ${Number(monAmount) / 1e18} MON (tx ${r.transactionHash})`);
  }

  await buy(ALICE, 'Alice', 500000000000000000n); // 0.5 MON
  await new Promise(r => setTimeout(r, 5000));
  await buy(BOB, 'Bob', 300000000000000000n); // 0.3 MON
  await new Promise(r => setTimeout(r, 5000));
  await buy(CAROL, 'Carol', 200000000000000000n); // 0.2 MON
  console.log('All buys confirmed ✅\n');

  // ── STEP C: Wait for cycle to end ──
  console.log('--- STEP C: Wait for cycle to end ---');
  coin = await getCoinState();
  console.log(`Cycle started, duration: ${coin.dur}s, checking every 10s...`);
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 10000));
    const ready = await pub.readContract({ address: RUG_POOL, abi: rugAbi, functionName: 'isFlipReady', args: [SIM_COIN] });
    console.log(`  check ${i + 1}: isFlipReady = ${ready}`);
    if (ready) break;
  }
  const ready = await pub.readContract({ address: RUG_POOL, abi: rugAbi, functionName: 'isFlipReady', args: [SIM_COIN] });
  if (!ready) { console.log('Cycle did not end in time. Aborting.'); return; }
  console.log('Cycle ended ✅\n');

  // ── STEP D: Trigger flip ──
  console.log('--- STEP D: Trigger flip ---');
  const vrfFee = await pub.readContract({ address: VRF_ADDR, abi: vrfAbi, functionName: 'getRequestFee', args: [] });
  const fee = vrfFee;
  console.log(`VRF fee: ${Number(fee) / 1e18} MON`);
  let tx = await withRetry(() => w.writeContract({
    address: RUG_POOL, abi: rugAbi, functionName: 'triggerFlip',
    args: [SIM_COIN], value: fee,
  }));
  let r = await withRetry(() => pub.waitForTransactionReceipt({ hash: tx }));
  console.log(`triggerFlip tx: ${r.transactionHash} ✅\n`);

  // ── STEP E: Manually fulfill with mixed-outcome seed ──
  console.log('--- STEP E: Find seed with mixed Heads/Tails ---');
  const candidateSeeds = [
    '0x1111111111111111111111111111111111111111111111111111111111111111',
    '0x2222222222222222222222222222222222222222222222222222222222222222',
    '0x3333333333333333333333333333333333333333333333333333333333333333',
    '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef',
  ];
  let chosenSeed = null;
  for (const seed of candidateSeeds) {
    const outcomes = [];
    for (const wallet of WALLETS) {
      const result = await pub.readContract({
        address: VRF_ADDR, abi: vrfAbi, functionName: 'deriveOutcome',
        args: [seed, wallet, 2n, 33],
      });
      outcomes.push(result);
      console.log(`  ${NAMES[wallet]}: ${result ? 'HEADS' : 'TAILS'}`);
    }
    const unique = new Set(outcomes);
    if (unique.size > 1) {
      chosenSeed = seed;
      console.log(`  => Seed ${seed} gives mixed outcomes, using this one.`);
      break;
    }
    console.log(`  => Seed ${seed} gives all same outcome (${outcomes[0] ? 'HEADS' : 'TAILS'}), skipping.\n`);
  }
  if (!chosenSeed) {
    console.log('No mixed-outcome seed found among candidates. Aborting.');
    return;
  }

  console.log(`\nCalling manualFulfill(${SIM_COIN}, 2, ${chosenSeed})...`);
  tx = await withRetry(() => w.writeContract({
    address: VRF_ADDR, abi: vrfAbi, functionName: 'manualFulfill',
    args: [SIM_COIN, 2n, chosenSeed],
  }));
  r = await withRetry(() => pub.waitForTransactionReceipt({ hash: tx }));
  console.log(`manualFulfill tx: ${r.transactionHash} ✅\n`);

  // ── STEP F: Log final state ──
  console.log('--- STEP F: Final state ---');
  coin = await getCoinState();
  console.log('SIM coin:', JSON.stringify(coin, (k, v) => typeof v === 'bigint' ? v.toString() : v, 2));
  for (const wallet of WALLETS) {
    const h = await getHolder(wallet);
    console.log(`${NAMES[wallet]}:`, JSON.stringify(h, (k, v) => typeof v === 'bigint' ? v.toString() : v));
  }

  // Read treasury pendingFees and topLoser
  try {
    const pending = await pub.readContract({ address: TREASURY_ADDR, abi: treasuryAbi, functionName: 'pendingFees', args: [] });
    const topLoser = await pub.readContract({ address: TREASURY_ADDR, abi: treasuryAbi, functionName: 'getCurrentTopLoser', args: [] });
    console.log(`Treasury pending fees: ${Number(pending) / 1e18} MON`);
    console.log(`Top loser: ${topLoser[0]} lost ${Number(topLoser[1]) / 1e18} MON`);
  } catch (e) { console.log('Treasury query error:', e.message); }

  // ── STEP G: Summary ──
  console.log('\n--- STEP G: Summary ---');
  console.log('=== Cycle 2 Simulation Complete ===');
  console.log(`Seed used: ${chosenSeed}`);

  const exitQ = await pub.readContract({ address: RUG_POOL, abi: rugAbi, functionName: 'getExitQueue', args: [SIM_COIN] });
  console.log(`Exit queue: ${exitQ.length} entries`);
  for (let i = 0; i < exitQ.length; i++) {
    console.log(`  ${i}: ${exitQ[i][0]} (${NAMES[exitQ[i][0]] || 'unknown'}) — ${Number(exitQ[i][3]) / 1e18} SIM`);
  }

  for (const wallet of WALLETS) {
    const h = await getHolder(wallet);
    const outcome = await pub.readContract({
      address: VRF_ADDR, abi: vrfAbi, functionName: 'deriveOutcome',
      args: [chosenSeed, wallet, 2n, 33],
    });
    const label = outcome ? 'HEADS' : 'TAILS';
    const payout = outcome ? 'exited with payout' : 'sacrificed';
    console.log(`${NAMES[wallet]}: ${label} — ${payout}`);
  }
  console.log('=====================================');
}

main().catch(e => console.error(e));
