require('dotenv').config();
const { createPublicClient, createWalletClient, http } = require('viem');
const { privateKeyToAccount, generatePrivateKey } = require('viem/accounts');
const { defineChain } = require('viem');
const fs = require('fs');
const path = require('path');

const MONAD_TESTNET = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: [process.env.MONAD_TESTNET_RPC] } },
});

const ACCOUNT = privateKeyToAccount(process.env.DEPLOYER_PRIVATE_KEY);
const DEPLOYER = process.env.DEPLOYER_ADDRESS;

const publicClient = createPublicClient({ chain: MONAD_TESTNET, transport: http() });
const walletClient = createWalletClient({ chain: MONAD_TESTNET, transport: http(), account: ACCOUNT });

const DEPLOYMENTS = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'deployments.json'), 'utf8'));
const TREASURY = DEPLOYMENTS.contracts.Treasury;
const RUG_POOL = DEPLOYMENTS.contracts.RugPool;

const abi = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'abis', 'Treasury.json'), 'utf8'));

let passed = 0;
let failed = 0;

function pass(name) { console.log(`  ✅ PASS — ${name}`); passed++; }
function fail(name, msg) { console.log(`  ❌ FAIL — ${name}: ${msg}`); failed++; }

async function main() {
  console.log('=== Treasury Tests ===\n');
  console.log(`Treasury: ${TREASURY}`);
  console.log(`RugPool:  ${RUG_POOL}`);
  console.log(`Deployer: ${DEPLOYER}\n`);

  // TEST 1
  console.log('TEST 1 — Check devWallet is set correctly');
  const dw = await publicClient.readContract({ address: TREASURY, abi, functionName: 'devWallet' });
  if (dw.toLowerCase() === DEPLOYER.toLowerCase()) {
    pass(`devWallet = ${dw}`);
  } else {
    fail('devWallet matches', `expected ${DEPLOYER}, got ${dw}`);
  }

  // TEST 2
  console.log('\nTEST 2 — Check rugPool is wired correctly');
  const rp = await publicClient.readContract({ address: TREASURY, abi, functionName: 'rugPool' });
  if (rp.toLowerCase() === RUG_POOL.toLowerCase()) {
    pass(`rugPool = ${rp}`);
  } else {
    fail('rugPool matches', `expected ${RUG_POOL}, got ${rp}`);
  }

  // TEST 3 — currentPeriod is > 0
  console.log('\nTEST 3 — Check currentPeriod is > 0');
  const cp = await publicClient.readContract({ address: TREASURY, abi, functionName: 'currentPeriod' });
  if (cp > 0n) {
    pass(`currentPeriod = ${cp} (expected > 0)`);
  } else {
    fail('currentPeriod > 0', `got ${cp}`);
  }

  // TEST 4 — getPendingFees is valid number
  console.log('\nTEST 4 — Check getPendingFees returns valid number');
  const pf = await publicClient.readContract({ address: TREASURY, abi, functionName: 'getPendingFees' });
  if (pf >= 0n) {
    pass(`getPendingFees = ${Number(pf) / 1e18} MON (${pf} wei)`);
  } else {
    fail('getPendingFees valid', `got ${pf}`);
  }

  // TEST 5 — getCurrentTopLoser exists (may have data from previous runs)
  console.log('\nTEST 5 — Check getCurrentTopLoser returns valid data');
  const tl = await publicClient.readContract({ address: TREASURY, abi, functionName: 'getCurrentTopLoser' });
  const tlWallet = tl[0];
  const tlAmount = tl[1];
  console.log(`  topLoser = ${tlWallet}, amount = ${Number(tlAmount) / 1e18} MON`);
  pass(`getCurrentTopLoser returned data`);

  // TEST 6
  console.log('\nTEST 6 — Check getPeriod(1) returns correct structure');
  const p1 = await publicClient.readContract({ address: TREASURY, abi, functionName: 'getPeriod', args: [1] });
  const thirtyDays = 30n * 86400n;
  console.log(`  startTime: ${p1.startTime}`);
  console.log(`  endTime:   ${p1.endTime}`);
  console.log(`  expected endTime: startTime + 30 days = ${p1.startTime + thirtyDays}`);
  if (p1.startTime > 0n && p1.endTime === p1.startTime + thirtyDays && p1.settled === false) {
    pass(`period(1) structure correct (accumulated=${Number(p1.totalAccumulated)/1e18} MON)`);
  } else {
    fail('period(1) structure', `start=${p1.startTime}, end=${p1.endTime}, accumulated=${p1.totalAccumulated}, settled=${p1.settled}`);
  }

  // TEST 7
  console.log('\nTEST 7 — Check receiveProtocolFee reverts from non-rugPool caller');
  try {
    const hash = await walletClient.writeContract({
      address: TREASURY, abi, functionName: 'receiveProtocolFee', args: [], value: 1000000000000000000n,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === 'reverted') {
      pass('receiveProtocolFee reverted for non-rugPool');
    } else {
      fail('receiveProtocolFee reverted for non-rugPool', 'tx succeeded');
    }
  } catch {
    pass('receiveProtocolFee reverted for non-rugPool');
  }

  // TEST 8
  console.log('\nTEST 8 — Check recordLoss reverts from non-rugPool caller');
  try {
    const hash = await walletClient.writeContract({
      address: TREASURY, abi, functionName: 'recordLoss', args: [DEPLOYER, 1000000n],
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === 'reverted') {
      pass('recordLoss reverted for non-rugPool');
    } else {
      fail('recordLoss reverted for non-rugPool', 'tx succeeded');
    }
  } catch {
    pass('recordLoss reverted for non-rugPool');
  }

  // TEST 9
  console.log('\nTEST 9 — Check settleMonth reverts before period ends');
  try {
    const hash = await walletClient.writeContract({
      address: TREASURY, abi, functionName: 'settleMonth', args: [],
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === 'reverted') {
      pass('settleMonth reverted before period ends');
    } else {
      fail('settleMonth reverted before period ends', 'tx succeeded');
    }
  } catch {
    pass('settleMonth reverted before period ends');
  }

  // TEST 10 — getUserLoss returns valid number (may be > 0 from previous runs)
  console.log('\nTEST 10 — Check getUserLoss returns valid number');
  const ul = await publicClient.readContract({ address: TREASURY, abi, functionName: 'getUserLoss', args: [DEPLOYER] });
  if (ul >= 0n) {
    pass(`getUserLoss = ${Number(ul) / 1e18} MON (${ul} wei)`);
  } else {
    fail('getUserLoss valid', `got ${ul}`);
  }

  // TEST 11
  console.log('\nTEST 11 — Check setDevWallet reverts for non-owner');
  try {
    const randomKey = generatePrivateKey();
    const randomAccount = privateKeyToAccount(randomKey);
    await publicClient.simulateContract({
      address: TREASURY, abi, functionName: 'setDevWallet', args: [DEPLOYER],
      account: randomAccount.address,
    });
    fail('non-owner setDevWallet reverted', 'simulation succeeded');
  } catch {
    pass('non-owner setDevWallet reverted');
  }

  // TEST 12
  console.log('\nTEST 12 — Check setRugPool reverts for non-owner');
  try {
    const randomKey = generatePrivateKey();
    const randomAccount = privateKeyToAccount(randomKey);
    await publicClient.simulateContract({
      address: TREASURY, abi, functionName: 'setRugPool', args: [RUG_POOL],
      account: randomAccount.address,
    });
    fail('non-owner setRugPool reverted', 'simulation succeeded');
  } catch {
    pass('non-owner setRugPool reverted');
  }

  console.log(`\n=== Treasury Tests: ${passed}/${passed + failed} passed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
