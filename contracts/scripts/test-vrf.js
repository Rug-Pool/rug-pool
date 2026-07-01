require('dotenv').config();
const { createPublicClient, createWalletClient, http, keccak256, toHex, encodePacked } = require('viem');
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

const publicClient = createPublicClient({
  chain: MONAD_TESTNET,
  transport: http(),
});

const walletClient = createWalletClient({
  chain: MONAD_TESTNET,
  transport: http(),
  account: ACCOUNT,
});

const DEPLOYMENTS = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'deployments.json'), 'utf8'));
const VRF = DEPLOYMENTS.contracts.VRFConsumer;
const RUG_POOL = DEPLOYMENTS.contracts.RugPool;
const PYTH_ENTROPY = process.env.PYTH_ENTROPY_ADDRESS;
const PYTH_PROVIDER = process.env.PYTH_ENTROPY_PROVIDER;

const state = JSON.parse(fs.readFileSync(path.join(__dirname, 'test-state.json'), 'utf8'));

const abi = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'abis', 'VRFConsumer.json'), 'utf8'));

let passed = 0;
let failed = 0;

function deriveOutcome(seed, wallet, cycleNumber, exitProbability) {
  const hash = keccak256(encodePacked(['bytes32', 'address', 'uint256'], [seed, wallet, BigInt(cycleNumber)]));
  return BigInt(hash) % 100n < BigInt(exitProbability);
}

function pass(name) {
  console.log(`  ✅ PASS — ${name}`);
  passed++;
}

function fail(name, msg) {
  console.log(`  ❌ FAIL — ${name}: ${msg}`);
  failed++;
}

async function main() {
  console.log('=== VRFConsumer Tests ===\n');
  console.log(`VRFConsumer:  ${VRF}`);
  console.log(`RugPool:      ${RUG_POOL}`);
  console.log(`Deployer:     ${DEPLOYER}\n`);

  // TEST 1
  console.log('TEST 1 — Check entropy address is set correctly');
  const entropy = await publicClient.readContract({
    address: VRF, abi, functionName: 'entropy',
  });
  if (entropy.toLowerCase() === PYTH_ENTROPY.toLowerCase()) {
    pass(`entropy = ${entropy}`);
  } else {
    fail('entropy matches', `expected ${PYTH_ENTROPY}, got ${entropy}`);
  }

  // TEST 2
  console.log('\nTEST 2 — Check entropyProvider is set correctly');
  const provider = await publicClient.readContract({
    address: VRF, abi, functionName: 'entropyProvider',
  });
  if (provider.toLowerCase() === PYTH_PROVIDER.toLowerCase()) {
    pass(`entropyProvider = ${provider}`);
  } else {
    fail('entropyProvider matches', `expected ${PYTH_PROVIDER}, got ${provider}`);
  }

  // TEST 3
  console.log('\nTEST 3 — Check rugPool is wired correctly');
  const rugPool = await publicClient.readContract({
    address: VRF, abi, functionName: 'rugPool',
  });
  if (rugPool.toLowerCase() === RUG_POOL.toLowerCase()) {
    pass(`rugPool = ${rugPool}`);
  } else {
    fail('rugPool matches', `expected ${RUG_POOL}, got ${rugPool}`);
  }

  // TEST 4
  console.log('\nTEST 4 — Get request fee');
  const fee = await publicClient.readContract({
    address: VRF, abi, functionName: 'getRequestFee',
  });
  console.log(`  Fee: ${fee} wei (${Number(fee) / 1e18} MON)`);
  if (fee > 0n) {
    pass('getRequestFee returns non-zero');
  } else {
    fail('getRequestFee returns non-zero', `got ${fee}`);
  }

  // TEST 5
  console.log('\nTEST 5 — Test deriveOutcome is deterministic');
  const seed = keccak256(toHex('test seed'));
  const r1 = await publicClient.readContract({
    address: VRF, abi, functionName: 'deriveOutcome',
    args: [seed, DEPLOYER, 1, 33],
  });
  const r2 = await publicClient.readContract({
    address: VRF, abi, functionName: 'deriveOutcome',
    args: [seed, DEPLOYER, 1, 33],
  });
  const r3 = await publicClient.readContract({
    address: VRF, abi, functionName: 'deriveOutcome',
    args: [seed, DEPLOYER, 1, 33],
  });
  if (r1 === r2 && r2 === r3) {
    pass(`all three returned ${r1}`);
  } else {
    fail('deterministic', `got ${r1}, ${r2}, ${r3}`);
  }

  // TEST 6
  console.log('\nTEST 6 — Test deriveOutcome returns different results for different wallets');
  const addr1 = '0x0000000000000000000000000000000000000001';
  const addr2 = '0x0000000000000000000000000000000000000002';
  const addr3 = '0x0000000000000000000000000000000000000003';
  const [w1, w2, w3] = await Promise.all([
    publicClient.readContract({ address: VRF, abi, functionName: 'deriveOutcome', args: [seed, addr1, 1, 33] }),
    publicClient.readContract({ address: VRF, abi, functionName: 'deriveOutcome', args: [seed, addr2, 1, 33] }),
    publicClient.readContract({ address: VRF, abi, functionName: 'deriveOutcome', args: [seed, addr3, 1, 33] }),
  ]);
  console.log(`  wallet1 (0x...001): ${w1}`);
  console.log(`  wallet2 (0x...002): ${w2}`);
  console.log(`  wallet3 (0x...003): ${w3}`);
  if (w1 !== w2 || w2 !== w3) {
    pass('not all same');
  } else {
    fail('not all same', `all returned ${w1}`);
  }

  // TEST 7
  console.log('\nTEST 7 — Test deriveOutcome distribution with exitProbability 33');
  const wallets33 = Array.from({ length: 300 }, (_, i) =>
    `0x${(i + 1).toString(16).padStart(40, '0')}`
  );
  const heads33 = wallets33.filter(w => deriveOutcome(seed, w, 1, 33)).length;
  const pct33 = (heads33 / 300 * 100).toFixed(1);
  console.log(`  Heads: ${heads33}/300 (${pct33}%)`);
  if (heads33 >= 75 && heads33 <= 123) {
    pass(`distribution 33%: ${heads33}/300 (${pct33}%)`);
  } else {
    fail('distribution 33%', `heads=${heads33}/300 expected ~25-41%`);
  }

  // TEST 8
  console.log('\nTEST 8 — Test deriveOutcome distribution with exitProbability 50');
  const heads50 = wallets33.filter(w => deriveOutcome(seed, w, 1, 50)).length;
  const pct50 = (heads50 / 300 * 100).toFixed(1);
  console.log(`  Heads: ${heads50}/300 (${pct50}%)`);
  if (heads50 >= 129 && heads50 <= 171) {
    pass(`distribution 50%: ${heads50}/300 (${pct50}%)`);
  } else {
    fail('distribution 50%', `heads=${heads50}/300 expected ~43-57%`);
  }

  // TEST 9
  console.log('\nTEST 9 — Check getCycleSeed returns zero before fulfillment');
  const cycleSeed = await publicClient.readContract({
    address: VRF, abi, functionName: 'getCycleSeed',
    args: [state.testCoinAddress, 1],
  });
  const zero = '0x0000000000000000000000000000000000000000000000000000000000000000';
  if (cycleSeed === zero) {
    pass('getCycleSeed returns zero before fulfillment');
  } else {
    fail('getCycleSeed returns zero', `got ${cycleSeed}`);
  }

  // TEST 10
  console.log('\nTEST 10 — Check setRugPool reverts for non-owner');
  try {
    const randomKey = generatePrivateKey();
    const randomAccount = privateKeyToAccount(randomKey);
    await publicClient.simulateContract({
      address: VRF,
      abi,
      functionName: 'setRugPool',
      args: [DEPLOYER],
      account: randomAccount.address,
    });
    fail('non-owner setRugPool reverted', 'simulation succeeded unexpectedly');
  } catch (err) {
    pass('non-owner setRugPool reverted');
  }

  console.log(`\n=== VRFConsumer Tests: ${passed}/${passed + failed} passed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
