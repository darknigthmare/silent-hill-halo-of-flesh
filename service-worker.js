const VERSION = '0.9.5';
const CACHE_PREFIX = 'halo-of-flesh';
const STATIC_CACHE = `${CACHE_PREFIX}-static-v${VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-v${VERSION}`;
const OFFLINE_URL = '/offline.html';

const ESSENTIAL_SHELL = [
  // SPRITE_ASSETS_BEGIN
  "/assets/sprites/film_red_pyramid_film_175.36b284a5f726.png",
  "/assets/sprites/sh1_air_screamer_001.d8f940210f1c.png",
  // SPRITE_ASSETS_END
  '/',
  '/index.html',
  '/offline.html',
  '/404.html',
  '/styles.css',

  '/manifest.webmanifest',
  '/src/data.js',
  '/src/stage-director.js',
  '/src/stage-cinematics.js',
  '/src/stage-hazard-renderer.js',
  '/src/stage-architecture.js',
  '/src/stage-lore-policy.js',
  '/src/combat-geometry.js',
  '/src/combat-resolution.js',
  '/src/movesets.js',
  '/src/shared.js',
  '/src/save-store.js',
  '/src/run-progress.js',
  '/src/player-input.js',
  '/src/touch-controls.js',
  '/src/playflow-ui.js',
  '/src/renderers.js',
  '/src/sprite-system.js',
  '/src/sprite-animation.js',
  '/src/sprite-framing.js',
  '/src/sprite-inspector.js',
  '/src/sprite-clips.js',
  '/src/sprite-clip-editor.js',
  '/src/sprite-manifest.js',
  '/src/sprite-workshop.js',
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
  '/modules/sprite-workshop.html',
  '/modules/sprite-workshop.css',
  '/data/sprite-coverage.json',
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

// A cached copy is an optimization, never a condition for delivering a valid response.
const MAX_RUNTIME_ENTRIES = 128;
async function matchCached(request, options = {}) {
  try {
    for (const name of [RUNTIME_CACHE, STATIC_CACHE]) {
      const response = await (await caches.open(name)).match(request, options);
      if (response) return response;
    }
  } catch { /* CacheStorage may be disabled; the network can still work. */ }
  return null;
}
async function storeRuntime(request, response) {
  if (!canStore(request, response)) return response;
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    await cache.put(request, response.clone());
    const keys = await cache.keys();
    await Promise.all(keys.slice(0, Math.max(0, keys.length - MAX_RUNTIME_ENTRIES)).map(key => cache.delete(key)));
  } catch { /* Quota/security failures must not discard already fetched bytes. */ }
  return response;
}
async function networkFirstNavigation(event) {
  const request = event.request;
  try {
    let preload;
    try { preload = await event.preloadResponse; } catch { /* Retry ordinary fetch. */ }
    return await storeRuntime(request, preload || await fetch(request));
  } catch {
    const cached = await matchCached(request, { ignoreSearch: true });
    if (cached) return cached;
    const fallback = await matchCached(OFFLINE_URL);
    return fallback || new Response('Archive hors ligne indisponible.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
async function staleWhileRevalidate(event) {
  const request = event.request;
  const update = fetch(request).then(response => storeRuntime(request, response)).catch(() => null);
  // Register synchronously: a returned cached response must not terminate the refresh.
  event.waitUntil(update.then(() => undefined));
  const cached = await matchCached(request, { ignoreSearch: true });
  return cached || (await update) || Response.error();
}
async function networkFirstData(request) {
  const url = new URL(request.url);
  if (NEVER_CACHE.has(url.pathname)) return fetch(request);
  try {
    return await storeRuntime(request, await fetch(request));
  } catch {
    return (await matchCached(request, { ignoreSearch: true })) || Response.error();
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
  if(url.pathname.startsWith('/assets/sprites/')){
    event.respondWith((async()=>{try{return (await matchCached(request)) || (await storeRuntime(request,await fetch(request)));}catch{return Response.error();}})());
    return;
  }
  if (url.pathname.startsWith('/data/')) {
    event.respondWith(networkFirstData(request));
    return;
  }
  event.respondWith(staleWhileRevalidate(event));
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
