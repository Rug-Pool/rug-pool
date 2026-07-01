import Privy, { LocalStorage, getUserEmbeddedEthereumWallet } from '@privy-io/js-sdk-core';
import { createPublicClient, http, defineChain } from 'viem';

const REDIRECT_URI = `${location.origin}/`;

let privy: Privy;

export const privyState = $state({
  isReady: false,
  isLoggedIn: false,
  address: null as string | null,
  balance: null as string | null,
});

const MONAD = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: [import.meta.env.VITE_MONAD_RPC || 'https://testnet-rpc.monad.xyz'] } },
});

const pub = createPublicClient({ chain: MONAD, transport: http() });

export async function initPrivy() {
  const appId = import.meta.env.VITE_PRIVY_APP_ID;
  console.log('[Privy] init', appId);
  if (!appId) { privyState.isReady = true; return; }
  privy = new Privy({ appId, storage: new LocalStorage() });
  await privy.initialize();
  const token = await privy.getAccessToken();
  if (token) {
    privyState.isLoggedIn = true;
    try {
      const u = await privy.user.get();
      applyUser(u);
    } catch (e) { console.log('[Privy] session restore failed', e); }
  }
  if (!privyState.address) {
    try {
      const stored = localStorage.getItem('user');
      if (stored) { const p = JSON.parse(stored); if (p?.address) privyState.address = p.address; }
    } catch { /* ignore */ }
  }
  privyState.isReady = true;
}

async function createWalletViaApi() {
  try {
    const token = await privy.getAccessToken();
    if (!token) return null;
    const internal = (privy as any)._privyInternal;
    const route = { path: '/api/v1/wallets', method: 'POST' as const };
    await internal.fetch(route, { body: { chain_type: 'ethereum' } });
    const u = await privy.user.get();
    return u.user;
  } catch (e) { console.warn('[Privy] wallet API error', e); return null; }
}

export async function loginWithX() {
  const { url } = await privy.auth.oauth.generateURL('twitter', REDIRECT_URI);
  console.log('[Privy] redirect', url);
  location.href = url;
}

export async function handleOAuthRedirect(): Promise<boolean> {
  const params = new URLSearchParams(location.search);
  console.log('[Privy] oauth redirect params:', Object.fromEntries(params));
  const code = params.get('privy_oauth_code') || params.get('code');
  const returnedState = params.get('privy_oauth_state') || params.get('state');
  if (!code || !returnedState) return false;
  try {
    const provider = (params.get('privy_oauth_provider') || 'twitter') as any;
    const auth = await privy.auth.oauth.loginWithCode(code, returnedState, provider);
    privyState.isLoggedIn = true;
    applyUser(auth.user);
    if (!privyState.address) {
      try {
        const u = await createWalletViaApi();
        if (u) applyUser(u);
      } catch (e2) {
        console.warn('[Privy] embedded wallet creation skipped', e2);
      }
    }
    if (privyState.address) {
      const b = await pub.getBalance({ address: privyState.address as `0x${string}` });
      privyState.balance = (Number(b) / 1e18).toFixed(4);
    }
    history.replaceState({}, '', '/');
    return true;
  } catch (e) { console.error('[Privy] OAuth failed', e); return false; }
}

function applyUser(u: any) {
  privyState.address = null;
  if (!u?.linked_accounts) return;
  const wallet = getUserEmbeddedEthereumWallet(u);
  privyState.address = wallet?.address ?? null;
  console.log('[Privy] applyUser address:', privyState.address);
  if (privyState.address) {
    localStorage.setItem('user', JSON.stringify({ address: privyState.address }));
  }
}

export async function logout() {
  privyState.isLoggedIn = false;
  privyState.address = null;
  privyState.balance = null;
  localStorage.removeItem('user');
}
