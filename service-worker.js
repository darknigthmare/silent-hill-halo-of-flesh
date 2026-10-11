const VERSION = '0.6.1';
const CACHE_PREFIX = 'halo-of-flesh';
const STATIC_CACHE = `${CACHE_PREFIX}-static-v${VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-v${VERSION}`;
const OFFLINE_URL = '/offline.html';

const ESSENTIAL_SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/404.html',
  '/styles.css',
  '/manifest.webmanifest',
  '/src/data.js',
  '/src/movesets.js',
  '/src/shared.js',
  '/src/renderers.js',
  '/src/fight.js',
  '/src/command.js',
  '/src/versus.js',
  '/src/chronicles.js',
  '/src/archive.js',
];

const OPTIONAL_SHELL = [
  '/assets/icons/icon-192.svg',
  '/assets/icons/icon-512.svg',
  '/modules/unified-versus.html',
  '/modules/chronicles.html',
  '/modules/archive.html',
  '/modules/roster-command.html',
  '/modules/finisher-archive.html',
  '/modules/combat-academy.html',
  '/modules/versus.css',
  '/modules/chronicles.css',
  '/modules/archive.css',
];

const NEVER_CACHE = new Set([
  '/service-worker.js',
  // Export exhaustif de plusieurs mégaoctets : disponible en ligne, jamais imposé au cache critique.
  '/data/movesets.json',
]);

function isSameOrigin(request) {
  try { return new URL(request.url).origin === self.location.origin; }
  catch { return false; }
}

function canStore(request, response) {
  if (!response || !response.ok || response.type === 'opaque' || request.method !== 'GET') return false;
  const url = new URL(request.url);
  if (NEVER_CACHE.has(url.pathname) || request.headers.has('range')) return false;
  const policy = response.headers.get('Cache-Control') || '';
  return !/no-store/i.test(policy);
}

async function cacheOne(cache, path) {
  const request = new Request(path, { cache: 'reload', credentials: 'same-origin' });
  const response = await fetch(request);
  if (!response.ok) throw new Error(`Pré-cache impossible (${response.status}) : ${path}`);
  await cache.put(request, response);
}

async function installShell() {
  const cache = await caches.open(STATIC_CACHE);
  await Promise.all(ESSENTIAL_SHELL.map((path) => cacheOne(cache, path)));
  // Une page de compatibilité secondaire ne doit jamais empêcher l’installation complète.
  await Promise.allSettled(OPTIONAL_SHELL.map((path) => cacheOne(cache, path)));
}

async function storeRuntime(request, response) {
  if (!canStore(request, response)) return response;
  const cache = await caches.open(RUNTIME_CACHE);
  await cache.put(request, response.clone());
  return response;
}

async function networkFirstNavigation(event) {
  const request = event.request;
  try {
    const preload = await event.preloadResponse;
    if (preload) return storeRuntime(request, preload);
    const response = await fetch(request);
    return storeRuntime(request, response);
  } catch {
    const cached = await caches.match(request, { ignoreSearch: true });
    return cached || caches.match(OFFLINE_URL) || new Response('Archive hors ligne indisponible.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request, { ignoreSearch: true });
  const update = fetch(request)
    .then((response) => storeRuntime(request, response))
    .catch(() => null);
  if (cached) {
    void update;
    return cached;
  }
  return (await update) || Response.error();
}

async function networkFirstData(request) {
  const url = new URL(request.url);
  if (NEVER_CACHE.has(url.pathname)) return fetch(request);
  try {
    return await storeRuntime(request, await fetch(request));
  } catch {
    return (await caches.match(request, { ignoreSearch: true })) || Response.error();
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(installShell());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keep = new Set([STATIC_CACHE, RUNTIME_CACHE]);
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => key.startsWith(`${CACHE_PREFIX}-`) && !keep.has(key))
      .map((key) => caches.delete(key)));
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    clients.forEach((client) => client.postMessage({ type: 'SHHF_SW_ACTIVATED', version: VERSION }));
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || !isSameOrigin(request) || request.headers.has('range')) return;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(event));
    return;
  }
  if (url.pathname.startsWith('/data/')) {
    event.respondWith(networkFirstData(request));
    return;
  }
  event.respondWith(staleWhileRevalidate(request));
});

self.addEventListener('message', (event) => {
  const type = event.data?.type;
  if (type === 'SKIP_WAITING') {
    event.waitUntil(self.skipWaiting());
    return;
  }
  if (type === 'CLEAR_CACHES') {
    event.waitUntil((async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key.startsWith(`${CACHE_PREFIX}-`)).map((key) => caches.delete(key)));
      await installShell();
      event.source?.postMessage?.({ type: 'SHHF_CACHES_CLEARED', version: VERSION });
    })());
    return;
  }
  if (type === 'GET_VERSION') event.source?.postMessage?.({ type: 'SW_VERSION', version: VERSION });
});
