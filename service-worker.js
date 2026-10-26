const VERSION = '0.9.6';
const CACHE_REVISION = 'parallel-20261026-pass10';
// BITMAP_REVISION_BEGIN
const BITMAP_REVISION = '4d5ed7a5f4596f084a1725939e5c9e8049b44e0305c7c22a35ba2d53639731cc';
// BITMAP_REVISION_END
const CACHE_PREFIX = 'halo-of-flesh';
const STATIC_CACHE = `${CACHE_PREFIX}-static-v${VERSION}-${CACHE_REVISION}-${BITMAP_REVISION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-v${VERSION}-${CACHE_REVISION}-${BITMAP_REVISION}`;
const OFFLINE_URL = '/offline.html';

const ESSENTIAL_SHELL = [
  // SPRITE_ASSETS_BEGIN
  "/assets/sprites/film_red_pyramid_film_175.36b284a5f726.png",
  "/assets/sprites/sh1_air_screamer_001.49a50bf77b97.png",
  "/assets/sprites/sh1_air_screamer_001.9b5e20f622b4.png",
  "/assets/sprites/sh1_air_screamer_001.f208137d6414.png",
  "/assets/sprites/sh1_creeper_009.0ed910ef61d0.png",
  "/assets/sprites/sh1_floatstinger_016.09f3672541e8.png",
  "/assets/sprites/sh1_groaner_003.82984139e47a.png",
  "/assets/sprites/sh1_groaner_003.b1df281db9ab.png",
  "/assets/sprites/sh1_groaner_003.cfa48c2c5630.png",
  "/assets/sprites/sh1_groaner_003.ff3410acb3a0.png",
  "/assets/sprites/sh1_hanged_scratcher_011.ab639ab99e1c.png",
  "/assets/sprites/sh1_mumbler_006.38861850b609.png",
  "/assets/sprites/sh1_night_flutter_002.ad502d70da3d.png",
  "/assets/sprites/sh1_puppet_doctor_013.16b6777faa95.png",
  "/assets/sprites/sh1_puppet_nurse_012.14857368f9d9.png",
  "/assets/sprites/sh1_romper_010.09a1f60ce398.png",
  "/assets/sprites/sh1_romper_010.6ceba51e9d28.png",
  "/assets/sprites/sh1_romper_010.f5be63471b21.png",
  "/assets/sprites/sh1_romper_010.fa62c070efdd.png",
  "/assets/sprites/sh1_split_head_014.0422e5926e4d.png",
  "/assets/sprites/sh1_split_head_014.2b9d7a5ec550.png",
  "/assets/sprites/sh1_split_head_014.483ae08e94aa.png",
  "/assets/sprites/sh1_split_head_014.e48107f497d7.png",
  "/assets/sprites/sh1_twinfeeler_015.7097962c69fe.png",
  "/assets/sprites/sh1_wormhead_004.08501d7f2bd5.png",
  "/assets/sprites/sh1_wormhead_004.16f970ba8d80.png",
  "/assets/sprites/sh1_wormhead_004.339fd5045d59.png",
  "/assets/sprites/sh1_wormhead_004.aebf12dd2f70.png",
  "/assets/sprites/sh2_bubble_head_nurse_024.fc01d3735b74.png",
  "/assets/sprites/sh2_creeper_025.84618d11d580.png",
  "/assets/sprites/sh2_eddie_dombrowski_032.a6b898f61d40.png",
  "/assets/sprites/sh2_lying_figure_020.86ac95da85c7.png",
  "/assets/sprites/sh2_red_pyramid_thing_great_knife_029.b681982c38d8.png",
  "/assets/sprites/sh2_red_pyramid_thing_spear_030.9ba1d2d57009.png",
  "/assets/sprites/sh3_closer_036.83102a051acb.png",
  "/assets/sprites/sh3_closer_036.a571dd362666.png",
  "/assets/sprites/sh3_closer_036.e00beefd711f.png",
  "/assets/sprites/sh3_closer_036.f18918ff7e87.png",
  "/assets/sprites/sh3_double_head_040.0ef012666f82.png",
  "/assets/sprites/sh3_double_head_040.6d8c0b112533.png",
  "/assets/sprites/sh3_double_head_040.a0885231d6ff.png",
  "/assets/sprites/sh3_double_head_040.fd9ce712ec8f.png",
  "/assets/sprites/sh3_insane_cancer_041.00201a3d31ac.png",
  "/assets/sprites/sh3_leonard_wolf_048.70857b7708e8.png",
  "/assets/sprites/sh3_memory_of_alessa_049.06e554d4f1a9.png",
  "/assets/sprites/sh3_memory_of_alessa_049.6e965c6ce5f6.png",
  "/assets/sprites/sh3_memory_of_alessa_049.e44abe7d8249.png",
  "/assets/sprites/sh3_missionary_047.83ad51e81ec4.png",
  "/assets/sprites/sh3_numb_body_large_038.ac97bc943228.png",
  "/assets/sprites/sh3_numb_body_small_037.3904c1567965.png",
  "/assets/sprites/sh3_numb_body_small_037.974da23966d7.png",
  "/assets/sprites/sh3_numb_body_small_037.9ddda808b57c.png",
  "/assets/sprites/sh3_numb_body_small_037.a69b62b7c58a.png",
  "/assets/sprites/sh3_nurse_revolver_044.f4651e9f2b8e.png",
  "/assets/sprites/sh3_pendulum_039.6bfe8afc9ed6.png",
  "/assets/sprites/sh3_scraper_045.2bfdc425582b.png",
  "/assets/sprites/sh3_slurper_042.269a6ac1ed42.png",
  "/assets/sprites/sh3_slurper_042.3f0598df95a4.png",
  "/assets/sprites/sh3_slurper_042.5cda350161d4.png",
  "/assets/sprites/sh3_slurper_042.ccdea6132d6f.png",
  "/assets/sprites/sh4_bottom_065.b0daf4900078.png",
  "/assets/sprites/sh4_cynthia_velasquez_victim_16.0cf7eb3b5514.png",
  "/assets/sprites/sh4_gum_head_new_type_058.5bd345e719cc.png",
  "/assets/sprites/sh4_gum_head_old_type_057.53de39c93d92.png",
  "/assets/sprites/sh4_hummer_055.8561079c64dc.png",
  "/assets/sprites/sh4_hummer_055.9d51cedd24be.png",
  "/assets/sprites/sh4_hummer_055.b6ec9f61d826.png",
  "/assets/sprites/sh4_hummer_055.ce4b2fdfbc00.png",
  "/assets/sprites/sh4_jimmy_stone_victim_1.2e0fb62d4d50.png",
  "/assets/sprites/sh4_patient_060.735bcaec2736.png",
  "/assets/sprites/sh4_richard_braintree_victim_19.0355a497acf2.png",
  "/assets/sprites/sh4_sniffer_dog_female_054.013381fb3f35.png",
  "/assets/sprites/sh4_sniffer_dog_female_054.167e0e26ebd6.png",
  "/assets/sprites/sh4_sniffer_dog_female_054.3180b9553b30.png",
  "/assets/sprites/sh4_sniffer_dog_female_054.efa3851269cf.png",
  "/assets/sprites/sh4_sniffer_dog_male_053.121baef62376.png",
  "/assets/sprites/sh4_toadstool_061.a638ed6ea7d7.png",
  "/assets/sprites/sh4_tremer_blue_063.5bcfad8047d2.png",
  "/assets/sprites/sh4_tremer_red_064.19432685fd21.png",
  "/assets/sprites/sh4_twin_victim_059.6db9971d6f09.png",
  "/assets/sprites/sh4_twin_victim_059.80b4e2ee7ffa.png",
  "/assets/sprites/sh4_walter_sullivan_072.7c27f4ac64aa.png",
  "/assets/sprites/sh4_wheelchair_068.d81a108b0a69.png",
  "/assets/sprites/sh4_whitestool_062.bcbd83497241.png",
  // SPRITE_ASSETS_END
  // STAGE_BITMAP_ASSETS_BEGIN
  "/assets/stages/alchemilla.waiting-room.2ef1639ee034.png",
  "/assets/stages/brookhaven_roof.before-fall.52cd844d609c.png",
  "/assets/stages/lakeview.lobby.7bc2120c786c.png",
  "/assets/stages/midwich.courtyard.c9728428d63d.png",
  "/assets/stages/shopping_mall.helens-bakery.0e2670100789.png",
  "/assets/stages/woodside.corridor.c6ac083599d0.png",
  // STAGE_BITMAP_ASSETS_END
  '/',
  '/index.html',
  '/offline.html',
  '/404.html',
  '/styles.css',

  '/manifest.webmanifest',
  '/src/data.js',
  '/src/production-reference.js',
  '/src/combat-reference-policy.js',
  '/src/weapon-phases.js',
  '/src/stage-reference-policy.js',
  '/src/lore-cinematics.js',
  '/src/reference-ui.js',
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
  '/src/stage-bitmaps.js',
  '/src/stage-bitmap-manifest.js',
  '/src/sprite-animation.js',
  '/src/sprite-poses.js',
  '/src/presentation-sequences.js',
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
