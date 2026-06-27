type Route = { page: 'feed'; params: {} }
  | { page: 'coin'; params: { id: string } }
  | { page: 'leaderboard'; params: {} }
  | { page: 'onboard'; params: {} }
  | { page: 'faq'; params: {} }
  | { page: 'launch'; params: {} }
  | { page: 'portfolio'; params: {} };

let currentRoute = $state<Route>({ page: 'feed', params: {} });

function parseRoute(): Route {
  const hash = window.location.hash.slice(1) || '/';

  if (hash.startsWith('/coin/')) {
    const id = hash.replace('/coin/', '');
    return { page: 'coin', params: { id } };
  }
  if (hash === '/leaderboard') {
    return { page: 'leaderboard', params: {} };
  }
  if (hash === '/onboard') {
    return { page: 'onboard', params: {} };
  }
  if (hash === '/faq') {
    return { page: 'faq', params: {} };
  }
  if (hash === '/launch') {
    return { page: 'launch', params: {} };
  }
  if (hash === '/portfolio') {
    return { page: 'portfolio', params: {} };
  }
  return { page: 'feed', params: {} };
}

function handleHashChange() {
  currentRoute = parseRoute();
}

export function initRouter() {
  window.addEventListener('hashchange', handleHashChange);
  currentRoute = parseRoute();
}

export function navigate(path: string) {
  window.location.hash = path;
}

export function getRoute() {
  return currentRoute;
}
