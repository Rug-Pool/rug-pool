require('dotenv').config();
const { createPublicClient, createWalletClient, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
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

const REGISTRY = '0x079c4457ced137841e90bd13cfa059a904380aa2';

const abi = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'abis', 'MemberRegistry.json'), 'utf8')
);

let passed = 0;
let failed = 0;

function pass(name) { console.log(`  ✅ PASS — ${name}`); passed++; }
function fail(name, msg) { console.log(`  ❌ FAIL — ${name}: ${msg}`); failed++; }

async function main() {
  console.log('=== MemberRegistry Tests ===\n');
  console.log(`Contract: ${REGISTRY}`);
  console.log(`Deployer: ${DEPLOYER}\n`);

  const fee = await publicClient.readContract({ address: REGISTRY, abi, functionName: 'registrationFee' });
  console.log(`Registration fee: ${fee} wei (${Number(fee) / 1e18} MON)\n`);

  const alreadyRegistered = await publicClient.readContract({
    address: REGISTRY, abi, functionName: 'isRegistered', args: [DEPLOYER],
  });
  console.log(`Deployer already registered: ${alreadyRegistered}\n`);

  // TEST 1 — Registration status (adaptive)
  console.log('TEST 1 — Registration status check');
  if (alreadyRegistered) {
    pass('deployer is already registered');
  } else {
    fail('deployer is already registered', 'expected true, got false');
  }

  // TEST 2 — If not registered, register now. If already registered, skip.
  console.log('\nTEST 2 — Register (skip if already registered)');
  if (!alreadyRegistered) {
    try {
      const hash = await walletClient.writeContract({
        address: REGISTRY, abi, functionName: 'register', args: [], value: fee,
      });
      console.log(`  Tx: ${hash}`);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status === 'success') {
        pass('register() succeeded');
      } else {
        fail('register() succeeded', `tx status: ${receipt.status}`);
      }
    } catch (err) {
      fail('register() succeeded', err.shortMessage || err.message);
    }
  } else {
    pass('already registered (skipping write)');
  }

  // TEST 3 — isRegistered returns true
  console.log('\nTEST 3 — isRegistered returns true');
  const after = await publicClient.readContract({
    address: REGISTRY, abi, functionName: 'isRegistered', args: [DEPLOYER],
  });
  if (after === true) {
    pass('isRegistered = true');
  } else {
    fail('isRegistered = true', `got ${after}`);
  }

  // TEST 4 — getMemberSince returns non-zero timestamp
  console.log('\nTEST 4 — getMemberSince returns non-zero timestamp');
  const ts = await publicClient.readContract({
    address: REGISTRY, abi, functionName: 'getMemberSince', args: [DEPLOYER],
  });
  if (ts > 0n) {
    console.log(`  Timestamp: ${ts}`);
    pass('getMemberSince returns non-zero timestamp');
  } else {
    fail('getMemberSince returns non-zero timestamp', `got ${ts}`);
  }

  // TEST 5 — totalMembers > 0
  console.log('\nTEST 5 — totalMembers > 0');
  const total = await publicClient.readContract({ address: REGISTRY, abi, functionName: 'totalMembers' });
  if (total > 0n) {
    pass(`totalMembers = ${total} (> 0)`);
  } else {
    fail('totalMembers > 0', `got ${total}`);
  }

  // TEST 6 — Duplicate register reverts
  console.log('\nTEST 6 — Duplicate register reverts');
  try {
    const hash = await walletClient.writeContract({
      address: REGISTRY, abi, functionName: 'register', args: [], value: fee,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === 'reverted') {
      pass('duplicate register reverted');
    } else {
      fail('duplicate register reverted', `tx status: ${receipt.status}`);
    }
  } catch (e) {
    if (e.shortMessage?.includes('Already registered') || e.shortMessage?.includes('reverted')) {
      pass('duplicate register reverted');
    } else {
      fail('duplicate register reverted', e.shortMessage || e.message);
    }
  }

  // TEST 7 — Wrong fee reverts
  console.log('\nTEST 7 — Wrong fee reverts');
  try {
    const hash = await walletClient.writeContract({
      address: REGISTRY, abi, functionName: 'register', args: [], value: 1n,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === 'reverted') {
      pass('wrong fee register reverted');
    } else {
      fail('wrong fee register reverted', `tx status: ${receipt.status}`);
    }
  } catch (e) {
    if (e.shortMessage?.includes('Incorrect fee') || e.shortMessage?.includes('reverted')) {
      pass('wrong fee register reverted');
    } else {
      fail('wrong fee register reverted', e.shortMessage || e.message);
    }
  }

  console.log(`\n=== MemberRegistry Tests: ${passed}/${passed + failed} passed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
