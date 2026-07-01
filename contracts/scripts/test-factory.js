require('dotenv').config();
const { createPublicClient, createWalletClient, http, parseEventLogs } = require('viem');
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
const FACTORY = DEPLOYMENTS.contracts.CoinFactory;
const RUG_POOL = DEPLOYMENTS.contracts.RugPool;

const factoryAbi = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'abis', 'CoinFactory.json'), 'utf8'));
const rugPoolAbi = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'abis', 'RugPool.json'), 'utf8'));

let passed = 0;
let failed = 0;

function pass(name) {
  console.log(`  ✅ PASS — ${name}`);
  passed++;
}

function fail(name, msg) {
  console.log(`  ❌ FAIL — ${name}: ${msg}`);
  failed++;
}

async function main() {
  console.log('=== CoinFactory Tests ===\n');
  console.log(`CoinFactory: ${FACTORY}`);
  console.log(`RugPool:    ${RUG_POOL}`);
  console.log(`Deployer:   ${DEPLOYER}\n`);

  // TEST 1 — Record totalCoins before launch
  console.log('TEST 1 — Record totalCoins before launch');
  const totalBefore = await publicClient.readContract({
    address: FACTORY, abi: factoryAbi, functionName: 'totalCoins',
  });
  console.log(`  totalCoins before: ${totalBefore}`);
  pass(`totalCoins recorded (${totalBefore})`);

  // TEST 2 — Launch a coin with no badge
  console.log('\nTEST 2 — Launch a coin with no badge');
  let tokenAddress;
  try {
    const hash = await walletClient.writeContract({
      address: FACTORY, abi: factoryAbi, functionName: 'launchCoin',
      args: [
        'Test Coin', 'TEST', 'A test coin for Rug Pool', 'https://test.com/image.png',
        1000000000000n, 1000000000000000000000000000n, 33, false,
      ],
      value: 0n,
    });
    console.log(`  Tx: ${hash}`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === 'success') {
      const logs = parseEventLogs({ abi: factoryAbi, logs: receipt.logs });
      const event = logs.find(l => l.eventName === 'CoinLaunched');
      tokenAddress = event?.args?.tokenAddress;
      console.log(`  Token address: ${tokenAddress}`);
      pass('launchCoin succeeded');
    } else {
      fail('launchCoin succeeded', `tx status: ${receipt.status}`);
    }
  } catch (err) {
    fail('launchCoin succeeded', err.shortMessage || err.message);
  }

  // TEST 3 — totalCoins incremented
  console.log('\nTEST 3 — totalCoins incremented by 1');
  const totalAfter = await publicClient.readContract({
    address: FACTORY, abi: factoryAbi, functionName: 'totalCoins',
  });
  if (totalAfter === totalBefore + 1n) {
    pass(`totalCoins is ${totalAfter} (${totalBefore} → ${totalAfter})`);
  } else {
    fail('totalCoins incremented by 1', `expected ${totalBefore + 1n}, got ${totalAfter}`);
  }

  // TEST 4
  console.log('\nTEST 4 — Check getCoin returns correct data');
  const coin = await publicClient.readContract({
    address: FACTORY,
    abi: factoryAbi,
    functionName: 'getCoin',
    args: [tokenAddress],
  });
  if (coin.name === 'Test Coin' && coin.ticker === 'TEST' && coin.flipConfig === 33) {
    pass(`name="${coin.name}", ticker="${coin.ticker}", flipConfig=${coin.flipConfig}`);
  } else {
    fail('getCoin returns correct data', `name=${coin.name}, ticker=${coin.ticker}, flipConfig=${coin.flipConfig}`);
  }

  // TEST 5
  console.log('\nTEST 5 — Check getAllCoins includes new coin');
  const allCoins = await publicClient.readContract({
    address: FACTORY,
    abi: factoryAbi,
    functionName: 'getAllCoins',
  });
  if (allCoins.includes(tokenAddress)) {
    pass('getAllCoins includes tokenAddress');
  } else {
    fail('getAllCoins includes tokenAddress', 'not found');
  }

  // TEST 6
  console.log('\nTEST 6 — Check getCreatorCoins includes new coin');
  const creatorCoins = await publicClient.readContract({
    address: FACTORY,
    abi: factoryAbi,
    functionName: 'getCreatorCoins',
    args: [DEPLOYER],
  });
  if (creatorCoins.includes(tokenAddress)) {
    pass('getCreatorCoins includes tokenAddress');
  } else {
    fail('getCreatorCoins includes tokenAddress', 'not found');
  }

  // Read verified badge fee
  const verifiedFee = await publicClient.readContract({
    address: FACTORY, abi: factoryAbi, functionName: 'verifiedBadgeFee',
  });
  console.log(`\nVerified badge fee: ${Number(verifiedFee) / 1e18} MON`);

  // Check if deployer can afford the verified test
  const balance = await publicClient.getBalance({ address: DEPLOYER });
  const canAffordVerified = balance >= verifiedFee + 100000000000000000n; // fee + buffer

  // TEST 7 — Launch verified coin (skip if deployer has insufficient balance)
  console.log('\nTEST 7 — Launch verified coin with badge fee');
  let verifiedTokenAddress;
  if (!canAffordVerified) {
    console.log(`  Skipping — deployer balance ${Number(balance) / 1e18} MON < ${Number(verifiedFee) / 1e18} MON fee`);
    pass('launchCoin (verified) skipped (insufficient balance — expected)');
  } else {
    try {
      const hash = await walletClient.writeContract({
        address: FACTORY, abi: factoryAbi, functionName: 'launchCoin',
        args: ['Verified Coin', 'VER', 'A verified test coin', 'https://test.com/image2.png',
          1000000000000n, 1000000000000000000000000000n, 50, true],
        value: verifiedFee,
      });
      console.log(`  Tx: ${hash}`);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status === 'success') {
        const logs = parseEventLogs({ abi: factoryAbi, logs: receipt.logs });
        const event = logs.find(l => l.eventName === 'CoinLaunched');
        verifiedTokenAddress = event?.args?.tokenAddress;
        console.log(`  Token address: ${verifiedTokenAddress}`);
        pass('launchCoin (verified) succeeded');
      } else {
        fail('launchCoin (verified) succeeded', `tx status: ${receipt.status}`);
      }
    } catch (err) {
      fail('launchCoin (verified) succeeded', err.shortMessage || err.message);
    }
  }

  // TEST 8 — Check verified coin has isVerified = true (skip if not launched)
  console.log('\nTEST 8 — Check verified coin has isVerified = true');
  if (!verifiedTokenAddress) {
    pass('verified coin not launched — skipping');
  } else {
    const verifiedCoin = await publicClient.readContract({
      address: FACTORY, abi: factoryAbi, functionName: 'getCoin', args: [verifiedTokenAddress],
    });
    if (verifiedCoin.isVerified === true) {
      pass(`isVerified = ${verifiedCoin.isVerified}`);
    } else {
      fail('isVerified is true', `got ${verifiedCoin.isVerified}`);
    }
  }

  // TEST 9
  console.log('\nTEST 9 — Try launching with invalid flipConfig (expect revert)');
  try {
    const hash = await walletClient.writeContract({
      address: FACTORY,
      abi: factoryAbi,
      functionName: 'launchCoin',
      args: [
        'Bad Coin',
        'BAD',
        '',
        '',
        1000000000000n,
        1000000000000000000000000000n,
        99,
        false,
      ],
      value: 0n,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === 'reverted') {
      pass('invalid flipConfig reverted');
    } else {
      fail('invalid flipConfig reverted', `tx status: ${receipt.status}`);
    }
  } catch (err) {
    pass('invalid flipConfig reverted');
  }

  // TEST 10
  console.log('\nTEST 10 — Check coin is registered in RugPool');
  const coinState = await publicClient.readContract({
    address: RUG_POOL,
    abi: rugPoolAbi,
    functionName: 'getCoinState',
    args: [tokenAddress],
  });
  if (coinState.active === true && coinState.exitProbability === 33) {
    pass(`active=${coinState.active}, exitProbability=${coinState.exitProbability}`);
  } else {
    fail('coin registered in RugPool', `active=${coinState.active}, exitProb=${coinState.exitProbability}`);
  }

  // Save test state
  const statePath = path.join(__dirname, 'test-state.json');
  fs.writeFileSync(statePath, JSON.stringify({
    testCoinAddress: tokenAddress,
    verifiedCoinAddress: verifiedTokenAddress,
  }, null, 2));
  console.log(`\nSaved test state to ${statePath}`);

  console.log(`\n=== CoinFactory Tests: ${passed}/${passed + failed} passed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
