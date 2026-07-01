const API_BASE = '/api';

async function r(url: string, opts?: RequestInit) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const j = await res.json(); msg = j.error || msg; } catch {}
    throw new Error(msg);
  }
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    throw new Error('Backend is not running — start the API server first');
  }
  return res.json();
}

export async function register() {
  return r('/register', { method: 'POST', body: '{}' });
}

export async function checkMember(address: string): Promise<{ registered: boolean }> {
  return r(`/member/${address}`);
}

export async function registerUser(address: string, badgeVariant: string) {
  return r('/register-user', {
    method: 'POST',
    body: JSON.stringify({ address, badgeVariant }),
  });
}

export async function launch(body: {
  name: string; ticker: string; description: string; imageUrl: string;
  initialPrice: string; initialLiquidity: string; maxSupply: string;
  flipConfig: number; wantsVerified: boolean; creator: string; badgeVariant: string;
}) {
  return r('/launch', { method: 'POST', body: JSON.stringify(body) });
}

export async function buy(coinAddress: string, value: string, minTokensOut = '0', user = '') {
  return r('/buy', {
    method: 'POST',
    body: JSON.stringify({ coinAddress, value, minTokensOut, user }),
  });
}

export async function getCoins(): Promise<any[]> {
  return r('/coins');
}

export async function getCoin(id: string): Promise<any> {
  return r(`/coin/${id}`);
}

export async function getLeaderboard(): Promise<any> {
  return r('/leaderboard');
}

export async function triggerFlip(coinAddress: string) {
  return r('/flip', {
    method: 'POST',
    body: JSON.stringify({ coinAddress }),
  });
}

export async function getPortfolio(wallet: string): Promise<any> {
  return r(`/portfolio/${wallet}`);
}

export function parseValue(v: string): string {
  const parts = v.split('.');
  const whole = parts[0] || '0';
  const frac = (parts[1] || '').padEnd(18, '0').slice(0, 18);
  return whole + frac;
}
