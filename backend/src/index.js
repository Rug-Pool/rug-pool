import express from 'express';
import { createPublicClient, createWalletClient, http, defineChain, decodeEventLog } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { saveCoin, getCoin, getAllCoins, savePurchase, getPurchases } from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTRACTS = join(__dirname, '..', '..', 'contracts');
config({ path: join(CONTRACTS, '.env') });

const MONAD = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: [process.env.MONAD_TESTNET_RPC] } },
});

const pub = createPublicClient({ chain: MONAD, transport: http() });
const account = privateKeyToAccount(process.env.DEPLOYER_PRIVATE_KEY);
const wallet = createWalletClient({ chain: MONAD, transport: http(), account });

const DEP = JSON.parse(readFileSync(join(CONTRACTS, 'deployments.json'), 'utf8')).contracts;

function loadAbi(name) {
  const p = join(CONTRACTS, 'out', `${name}.sol`, `${name}.json`);
  return JSON.parse(readFileSync(p, 'utf8')).abi;
}

const registryAbi = loadAbi('MemberRegistry');
const factoryAbi = loadAbi('CoinFactory');
const rugAbi = loadAbi('RugPool');
const vrfAbi = loadAbi('VRFConsumer');
const treasuryAbi = loadAbi('Treasury');

const app = express();
app.use(express.json({ limit: '10mb' }));

// Register the relayer (deployer) as a member so buy() doesn't revert
(async () => {
  try {
    const registered = await pub.readContract({
      address: DEP.MemberRegistry, abi: registryAbi, functionName: 'isRegistered', args: [account.address],
    });
    if (!registered) {
      const fee = await pub.readContract({ address: DEP.MemberRegistry, abi: registryAbi, functionName: 'registrationFee' });
      const hash = await wallet.writeContract({
        address: DEP.MemberRegistry, abi: registryAbi, functionName: 'register', value: fee,
      });
      const receipt = await pub.waitForTransactionReceipt({ hash });
      console.log('Relayer registered as member', receipt.status);
    } else {
      console.log('Relayer already registered');
    }
  } catch (e) { console.error('Failed to register relayer', e.message); }
})();

app.use('/uploads', express.static(join(__dirname, '..', 'public', 'uploads')));

function mapCoin(token, coinInfo, rugState) {
  return {
    address: token,
    name: coinInfo.name,
    ticker: coinInfo.ticker,
    description: coinInfo.description,
    imageUrl: coinInfo.imageUrl,
    creator: coinInfo.creator,
    verified: coinInfo.isVerified,
    flipConfig: coinInfo.flipConfig,
    maxSupply: coinInfo.maxSupply?.toString(),
    launchTime: Number(coinInfo.launchTime),
    rugPool: rugState ? {
      cycle: Number(rugState.currentCycle),
      cycleStartTime: Number(rugState.cycleStartTime),
      cycleDuration: Number(rugState.cycleDuration),
      exitProbability: Number(rugState.exitProbability),
      active: rugState.active,
      totalHolders: Number(rugState.totalHolders),
      poolValue: rugState.poolValue?.toString(),
      totalSupply: rugState.totalSupply?.toString(),
    } : null,
  };
}

// Health check
app.get('/', (req, res) => res.json({ status: 'ok', network: 'monad_testnet' }));

// POST /register — Register as founding member (admin-relayed)
app.post('/register', async (req, res) => {
  try {
    const fee = await pub.readContract({ address: DEP.MemberRegistry, abi: registryAbi, functionName: 'registrationFee' });
    const hash = await wallet.writeContract({
      address: DEP.MemberRegistry, abi: registryAbi, functionName: 'register', value: fee,
    });
    const receipt = await pub.waitForTransactionReceipt({ hash });
    res.json({ tx: hash, status: receipt.status, fee: fee.toString() });
  } catch (e) { res.status(400).json({ error: e.shortMessage || e.message }); }
});

// GET /member/:address — Check if wallet is a registered member
app.get('/member/:address', async (req, res) => {
  try {
    const registered = await pub.readContract({
      address: DEP.MemberRegistry, abi: registryAbi, functionName: 'isRegistered', args: [req.params.address],
    });
    res.json({ registered, address: req.params.address });
  } catch (e) { res.status(400).json({ error: e.shortMessage || e.message }); }
});

// POST /register-user — Register a user as founding member (admin-relayed)
app.post('/register-user', async (req, res) => {
  try {
    const { address, badgeVariant } = req.body;
    if (!address) return res.status(400).json({ error: 'Wallet address required' });
    const registered = await pub.readContract({
      address: DEP.MemberRegistry, abi: registryAbi, functionName: 'isRegistered', args: [address],
    });
    if (registered) return res.json({ status: 'already_registered' });
    const fee = await pub.readContract({ address: DEP.MemberRegistry, abi: registryAbi, functionName: 'registrationFee' });
    const hash = await wallet.writeContract({
      address: DEP.MemberRegistry, abi: registryAbi, functionName: 'registerFor',
      args: [address], value: fee,
    });
    const receipt = await pub.waitForTransactionReceipt({ hash });
    res.json({ status: 'registered', tx: hash, badgeVariant });
  } catch (e) { res.status(400).json({ error: e.shortMessage || e.message }); }
});

// POST /launch — Launch a new coin (admin-relayed)
app.post('/launch', async (req, res) => {
  try {
    const { name, ticker, description, imageUrl, initialPrice, maxSupply, flipConfig, wantsVerified, creator } = req.body;
    if (!creator) return res.status(400).json({ error: 'Creator wallet address required' });
    const registered = await pub.readContract({
      address: DEP.MemberRegistry, abi: registryAbi, functionName: 'isRegistered', args: [creator],
    });
    if (!registered) {
      return res.status(400).json({ error: 'Your wallet is not registered as a founding member. Please register first.' });
    }
    const value = wantsVerified
      ? await pub.readContract({ address: DEP.CoinFactory, abi: factoryAbi, functionName: 'verifiedBadgeFee' })
      : 0n;
    // Call contract with ONLY essential on-chain data — skip heavy strings (imageUrl, description)
    const hash = await wallet.writeContract({
      address: DEP.CoinFactory, abi: factoryAbi, functionName: 'launchCoinFor',
      args: [creator, name, ticker, '', '', BigInt(initialPrice), BigInt(maxSupply), flipConfig, !!wantsVerified],
      value,
    });
    const receipt = await pub.waitForTransactionReceipt({ hash });

    // Extract token address from CoinLaunched event
    let tokenAddress = null;
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({ abi: factoryAbi, data: log.data, topics: log.topics });
        if (decoded.eventName === 'CoinLaunched') {
          tokenAddress = decoded.args.tokenAddress;
          break;
        }
      } catch {}
    }

    if (tokenAddress) {
      saveCoin(tokenAddress, { name, ticker, description, imageUrl, creator });
    }

    res.json({ tx: hash, status: receipt.status, creator, tokenAddress });
  } catch (e) { res.status(400).json({ error: e.shortMessage || e.message }); }
});

// POST /buy — Buy tokens (admin-relayed)
app.post('/buy', async (req, res) => {
  try {
    const { coinAddress, minTokensOut, value, user } = req.body;
    const hash = await wallet.writeContract({
      address: DEP.RugPool, abi: rugAbi, functionName: 'buy',
      args: [coinAddress, BigInt(minTokensOut || 0)], value: BigInt(value),
    });
    const receipt = await pub.waitForTransactionReceipt({ hash });
    if (user && receipt.status === 'success') {
      const cs = await pub.readContract({ address: DEP.RugPool, abi: rugAbi, functionName: 'getCoinState', args: [coinAddress] });
      const poolVal = cs.poolValue;
      const totalSupply = cs.totalSupply;
      const tokensOut = totalSupply > 0n ? (BigInt(value) * totalSupply) / poolVal : 0n;
      savePurchase(user, coinAddress, value, tokensOut.toString(), hash);
    }
    res.json({ tx: hash, status: receipt.status });
  } catch (e) { res.status(400).json({ error: e.shortMessage || e.message }); }
});

// GET /coins — List all coins
app.get('/coins', async (req, res) => {
  try {
    const allCoins = await pub.readContract({ address: DEP.CoinFactory, abi: factoryAbi, functionName: 'getAllCoins' });
    const dbCoins = getAllCoins();
    const dbMap = Object.fromEntries(dbCoins.map(c => [c.address, c]));
    const results = [];
    for (const token of allCoins) {
      const ci = await pub.readContract({ address: DEP.CoinFactory, abi: factoryAbi, functionName: 'getCoin', args: [token] });
      let rs = null;
      try {
        rs = await pub.readContract({ address: DEP.RugPool, abi: rugAbi, functionName: 'getCoinState', args: [token] });
      } catch {}
      const coin = mapCoin(token, ci, rs);
      const meta = dbMap[token.toLowerCase()] || {};
      coin.imageUrl = meta.imageUrl || coin.imageUrl;
      coin.description = meta.description || coin.description;
      results.push(coin);
    }
    res.json(results);
  } catch (e) { res.status(500).json({ error: e.shortMessage || e.message }); }
});

// GET /coin/:id — Get single coin detail
app.get('/coin/:id', async (req, res) => {
  try {
    const token = req.params.id;
    const ci = await pub.readContract({ address: DEP.CoinFactory, abi: factoryAbi, functionName: 'getCoin', args: [token] });
    let rs = null;
    try {
      rs = await pub.readContract({ address: DEP.RugPool, abi: rugAbi, functionName: 'getCoinState', args: [token] });
    } catch {}
    const coin = mapCoin(token, ci, rs);
    const meta = getCoin(token);
    if (meta) {
      coin.imageUrl = meta.imageUrl || coin.imageUrl;
      coin.description = meta.description || coin.description;
    }
    res.json(coin);
  } catch (e) { res.status(404).json({ error: 'Coin not found', detail: e.shortMessage || e.message }); }
});

// GET /leaderboard — Top loser
app.get('/leaderboard', async (req, res) => {
  try {
    const tl = await pub.readContract({ address: DEP.Treasury, abi: treasuryAbi, functionName: 'getCurrentTopLoser' });
    const fees = await pub.readContract({ address: DEP.Treasury, abi: treasuryAbi, functionName: 'getPendingFees' });
    res.json({ topLoser: tl[0], amount: tl[1].toString(), pendingFees: fees.toString() });
  } catch (e) { res.status(500).json({ error: e.shortMessage || e.message }); }
});

// POST /flip — Trigger flip (admin only)
app.post('/flip', async (req, res) => {
  try {
    const { coinAddress } = req.body;
    const fee = await pub.readContract({ address: DEP.VRFConsumer, abi: vrfAbi, functionName: 'getRequestFee' });
    const hash = await wallet.writeContract({
      address: DEP.RugPool, abi: rugAbi, functionName: 'triggerFlip',
      args: [coinAddress], value: fee,
    });
    const receipt = await pub.waitForTransactionReceipt({ hash });
    res.json({ tx: hash, status: receipt.status, vrfFee: fee.toString() });
  } catch (e) { res.status(400).json({ error: e.shortMessage || e.message }); }
});

// GET /portfolio/:wallet — Get portfolio for a wallet
app.get('/portfolio/:wallet', async (req, res) => {
  try {
    const walletAddr = req.params.wallet;
    const allCoins = await pub.readContract({ address: DEP.CoinFactory, abi: factoryAbi, functionName: 'getAllCoins' });
    const dbPurchases = getPurchases(walletAddr);
    const dbMap = {};
    for (const p of dbPurchases) {
      if (!dbMap[p.coin_address]) dbMap[p.coin_address] = 0n;
      dbMap[p.coin_address] += BigInt(p.tokens_out);
    }
    const positions = [];
    for (const token of allCoins) {
      const ci = await pub.readContract({ address: DEP.CoinFactory, abi: factoryAbi, functionName: 'getCoin', args: [token] });
      let hi = null;
      let dbBalance = dbMap[token.toLowerCase()] || 0n;
      try {
        hi = await pub.readContract({ address: DEP.RugPool, abi: rugAbi, functionName: 'getHolderInfo', args: [token, walletAddr] });
      } catch {}
      const onChainBalance = hi && hi.tokenBalance > 0n ? hi.tokenBalance : 0n;
      const totalBalance = onChainBalance + dbBalance;
      if (totalBalance > 0n) {
        positions.push({
          coin: ci.name,
          ticker: ci.ticker,
          tokenAddress: token,
          tokenBalance: totalBalance.toString(),
          cycleJoined: hi ? Number(hi.cycleJoined) : 0,
          isActive: hi ? hi.isActive : true,
        });
      }
    }
    res.json({ wallet: walletAddr, positions });
  } catch (e) { res.status(500).json({ error: e.shortMessage || e.message }); }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Rug Pool API running on port ${PORT}`));
