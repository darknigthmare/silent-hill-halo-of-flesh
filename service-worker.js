const CACHE='halo-of-flesh-v0.5.0';
const SHELL=[
  '/','/index.html','/styles.css','/manifest.webmanifest',
  '/assets/icons/icon-192.svg','/assets/icons/icon-512.svg',
  '/modules/unified-versus.html','/modules/chronicles.html','/modules/archive.html',
  '/modules/roster-command.html','/modules/finisher-archive.html','/modules/combat-academy.html',
  '/modules/versus.css','/modules/chronicles.css','/modules/archive.css',
  '/src/data.js','/src/movesets.js','/src/shared.js','/src/renderers.js','/src/fight.js','/src/command.js','/src/versus.js','/src/chronicles.js','/src/archive.js',
  '/data/content-stats.json','/data/sources.json','/data/roster.json','/data/stages.json','/data/chronicles.json','/data/combat-rules.json','/data/coverage-audit.json','/data/fatalities.json','/data/movesets.json'
];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    const copy=response.clone();
    if(new URL(event.request.url).origin===self.location.origin)caches.open(CACHE).then(cache=>cache.put(event.request,copy));
    return response;
  }).catch(()=>event.request.mode==='navigate'?caches.match('/index.html'):Response.error())));
});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
