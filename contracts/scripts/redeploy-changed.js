require('dotenv').config();
const { createPublicClient, createWalletClient, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { defineChain } = require('viem');
const fs = require('fs');
const path = require('path');

const MONAD = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: [process.env.MONAD_TESTNET_RPC] } },
});

const account = privateKeyToAccount(process.env.DEPLOYER_PRIVATE_KEY);
const pub = createPublicClient({ chain: MONAD, transport: http() });
const wallet = createWalletClient({ chain: MONAD, transport: http(), account });

function loadArtifact(name) {
  const p = path.join(__dirname, '..', 'out', `${name}.sol`, `${name}.json`);
  const a = JSON.parse(fs.readFileSync(p, 'utf8'));
  return { abi: a.abi, bytecode: a.bytecode.object };
}

async function deploy(name, args = []) {
  const { abi, bytecode } = loadArtifact(name);
  console.log(`\nDeploying ${name}...`);
  const hash = await wallet.deployContract({ abi, bytecode, args });
  const receipt = await pub.waitForTransactionReceipt({ hash });
  console.log(`  ${name} at: ${receipt.contractAddress}`);
  return { address: receipt.contractAddress, abi };
}

async function write(label, address, abi, fn, args, value = 0n) {
  console.log(`  ${fn}...`);
  const hash = await wallet.writeContract({ address, abi, functionName: fn, args, value });
  const r = await pub.waitForTransactionReceipt({ hash });
  console.log(`  ${fn} confirmed block ${r.blockNumber}`);
}

async function main() {
  const dep = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'deployments.json'), 'utf8')).contracts;
  const rugPoolAddr = dep.RugPool;
  const existingRegistry = dep.MemberRegistry;
  const treasuryAddr = dep.Treasury;
  const vrfAddr = dep.VRFConsumer;

  console.log('=== Minimal re-deploy: MemberRegistry + CoinFactory ===');
  console.log(`Deployer: ${account.address}  Balance: ${await pub.getBalance({ address: account.address })}`);
  console.log(`Existing RugPool: ${rugPoolAddr}`);
  console.log(`Existing MemberRegistry: ${existingRegistry}`);

  // 1. Deploy new MemberRegistry
  const mr = await deploy('MemberRegistry', []);
  const newRegistry = mr.address;

  // 2. Deploy new CoinFactory (takes memberRegistry address)
  const cf = await deploy('CoinFactory', [newRegistry]);
  const newFactory = cf.address;

  // Wiring
  console.log('\n--- Wiring ---');

  // rugPool.setMemberRegistry(newRegistry)
  const rugAbi = loadArtifact('RugPool').abi;
  await write('setMemberRegistry', rugPoolAddr, rugAbi, 'setMemberRegistry', [newRegistry]);

  // rugPool.setCoinFactory(newFactory)
  await write('setCoinFactory', rugPoolAddr, rugAbi, 'setCoinFactory', [newFactory]);

  // newCoinFactory.setRugPool(rugPoolAddr)
  await write('setRugPool', newFactory, cf.abi, 'setRugPool', [rugPoolAddr]);

  // Save new deployments.json
  const deployments = {
    network: 'monad_testnet',
    deployedAt: new Date().toISOString(),
    contracts: {
      MemberRegistry: newRegistry,
      Treasury: treasuryAddr,
      VRFConsumer: vrfAddr,
      CoinFactory: newFactory,
      RugPool: rugPoolAddr,
    },
  };
  fs.writeFileSync(path.join(__dirname, '..', 'deployments.json'), JSON.stringify(deployments, null, 2));
  console.log('\nSaved deployments.json');
  console.log('=== Done ===');
}

main().catch(e => { console.error('Failed:', e); process.exit(1); });
