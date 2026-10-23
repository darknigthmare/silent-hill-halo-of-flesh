import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { request as httpRequest } from 'node:http';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const project=resolve(fileURLToPath(new URL('../',import.meta.url)));
const read=(path)=>readFile(resolve(project,path),'utf8');
const port=43819;
const base=`http://127.0.0.1:${port}`;
let server;

async function waitForServer(){
  const started=Date.now();
  while(Date.now()-started<15000){
    try{const response=await fetch(base);if(response.ok)return;}catch{}
    await new Promise(resolveWait=>setTimeout(resolveWait,120));
  }
  throw new Error('Serveur QA inaccessible');
}
function rawRequest(path,{method='GET'}={}){
  return new Promise((resolveRequest,reject)=>{
    const request=httpRequest({hostname:'127.0.0.1',port,path,method},response=>{
      const chunks=[];
      response.on('data',chunk=>chunks.push(chunk));
      response.on('end',()=>resolveRequest({status:response.statusCode,headers:response.headers,body:Buffer.concat(chunks).toString('utf8')}));
    });
    request.on('error',reject);request.end();
  });
}

before(async()=>{
  server=spawn(process.execPath,['scripts/server.mjs',String(port)],{cwd:project,stdio:['ignore','pipe','pipe']});
  await waitForServer();
});
after(()=>server?.kill('SIGTERM'));

test('service worker separates versioned static and runtime caches with navigation-only offline fallback',async()=>{
  const worker=await read('service-worker.js');
  assert.match(worker,/const BITMAP_REVISION = '[a-f0-9]{64}';/);
  assert.match(worker,/STATIC_CACHE = `\$\{CACHE_PREFIX\}-static-v\$\{VERSION\}-\$\{CACHE_REVISION\}-\$\{BITMAP_REVISION\}`/);
  assert.match(worker,/RUNTIME_CACHE = `\$\{CACHE_PREFIX\}-runtime-v\$\{VERSION\}-\$\{CACHE_REVISION\}-\$\{BITMAP_REVISION\}`/);
  assert.match(worker,/request\.mode\s*===\s*'navigate'/);
  assert.match(worker,/matchCached\(OFFLINE_URL\)/);
  assert.doesNotMatch(worker,/event\.request\.mode==='navigate'\?caches\.match\('\/index\.html'\)/);
});

test('service worker keeps the 8 MB moveset catalogue out of precache and includes recovery pages',async()=>{
  const worker=await read('service-worker.js');
  const blocks=['ESSENTIAL_SHELL','OPTIONAL_SHELL'].map(name=>worker.match(new RegExp(`const ${name}\\s*=\\s*\\[([\\s\\S]*?)\\];`))?.[1]||'').join('\n');
  assert.match(blocks,/\/offline\.html/);
  assert.match(blocks,/\/404\.html/);
  assert.match(blocks,/\/src\/stage-director\.js/);
  assert.doesNotMatch(blocks,/\/data\/movesets\.json/);
});

test('the essential offline shell contains the full static JavaScript dependency graph',async()=>{
  const worker=await read('service-worker.js');
  const block=worker.match(/const ESSENTIAL_SHELL\s*=\s*\[([\s\S]*?)\];/)?.[1];
  assert.ok(block);
  const paths=new Set([...block.matchAll(/['"]([^'"]+)['"]/g)].map(match=>match[1]));
  for(const path of paths){
    if(!path.endsWith('.js'))continue;
    const code=await read(path.slice(1));
    for(const match of code.matchAll(/\b(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g)){
      const dependency=new URL(match[1],`https://halo.test${path}`).pathname;
      assert.ok(paths.has(dependency),`${path} requires uncached ${dependency}`);
    }
  }
});

test('PWA manifest declares stable identity, scope, language and three Silent Hill shortcuts',async()=>{
  const manifest=JSON.parse(await read('manifest.webmanifest'));
  assert.equal(manifest.id,'/');
  assert.equal(manifest.scope,'/');
  assert.equal(manifest.lang,'fr');
  assert.equal(manifest.orientation,'any');
  assert.ok(manifest.display_override.includes('standalone'));
  assert.deepEqual(manifest.shortcuts.map(shortcut=>shortcut.url),['/index.html?module=versus','/index.html?module=training','/index.html?module=archive']);
});

test('all application HTML is compatible with the script-src self CSP',async()=>{
  const files=['index.html','offline.html','404.html','modules/unified-versus.html','modules/chronicles.html','modules/archive.html','modules/roster-command.html','modules/finisher-archive.html','modules/combat-academy.html'];
  for(const file of files){
    const html=await read(file);
    const inline=[...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].filter(match=>match[1].trim());
    assert.equal(inline.length,0,`${file} contient un script inline`);
  }
});

test('Vercel configuration applies CSP, frame, opener and resource isolation headers',async()=>{
  const config=JSON.parse(await read('vercel.json'));
  const headers=new Map(config.headers.flatMap(rule=>rule.headers||[]).map(header=>[header.key,header.value]));
  assert.match(headers.get('Content-Security-Policy'),/script-src 'self'/);
  assert.equal(headers.get('X-Frame-Options'),'SAMEORIGIN');
  assert.equal(headers.get('Cross-Origin-Opener-Policy'),'same-origin');
  assert.equal(headers.get('Cross-Origin-Resource-Policy'),'same-origin');
  assert.equal(headers.get('Service-Worker-Allowed'),'/');
});

test('Command Center exposes accessible status, memory backup, focus trap and pressed-state controls',async()=>{
  const html=await read('index.html');
  const script=await read('src/command.js');
  assert.match(html,/class="skip-link"/);
  assert.match(html,/id="systemStatus"[^>]*aria-live="polite"/);
  assert.match(html,/id="exportMemory"/);
  assert.match(html,/id="importMemory"/);
  assert.match(script,/setAttribute\('aria-pressed'/);
  assert.match(script,/function trapModalFocus/);
  assert.match(script,/MEMORY_SCHEMA = 'shhf-memory-v1'/);
});

test('cross-window navigation validates source and origin and child modules target their own origin',async()=>{
  const command=await read('src/command.js');
  const shared=await read('src/shared.js');
  assert.match(command,/event\.source !== frame\.contentWindow/);
  assert.match(command,/event\.origin !== expectedOrigin/);
  assert.match(shared,/postMessage\(\{type:'SHHF_RETURN'\},parentOrigin\(\)\)/);
  assert.match(shared,/location\.origin==='null'\?'\*':location\.origin/);
});

test('local server supports GET and HEAD, rejects writes and returns a real themed 404',async()=>{
  const get=await rawRequest('/');
  assert.equal(get.status,200);
  assert.match(get.body,/HALO OF FLESH|HALO OF FLESH ·/);
  const head=await rawRequest('/',{method:'HEAD'});
  assert.equal(head.status,200);
  assert.equal(head.body,'');
  const post=await rawRequest('/',{method:'POST'});
  assert.equal(post.status,405);
  assert.equal(post.headers.allow,'GET, HEAD');
  const missing=await rawRequest('/signal-that-does-not-exist');
  assert.equal(missing.status,404);
  assert.match(missing.body,/SIGNAL[\s\S]*PERDU/);
});

test('local server sends release security headers and rejects encoded traversal',async()=>{
  const response=await rawRequest('/');
  assert.match(response.headers['content-security-policy'],/default-src 'self'/);
  assert.equal(response.headers['x-frame-options'],'SAMEORIGIN');
  assert.equal(response.headers['cross-origin-opener-policy'],'same-origin');
  assert.equal(response.headers['cross-origin-resource-policy'],'same-origin');
  const traversal=await rawRequest('/%2e%2e%2fpackage.json');
  assert.equal(traversal.status,400);
  assert.doesNotMatch(traversal.body,/"name"\s*:\s*"silent-hill/);
});
