import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../service-worker.js',import.meta.url),'utf8');
const origin='https://halo.test';
function worker({offline=false,quota=false,cacheUnavailable=false}={}){
 const stores=new Map(),listeners=new Map(),calls=[];
 const key=r=>new URL(typeof r==='string'?r:r.url,origin).href;
 const cache=name=>{if(!stores.has(name))stores.set(name,new Map());const map=stores.get(name);return {
  async match(req,options={}){const url=key(req);for(const [k,v] of map)if(k===url||options.ignoreSearch&&k.split('?')[0]===url.split('?')[0])return v.clone();},
  async put(req,response){if(quota)throw Error('QuotaExceededError');map.set(key(req),response.clone());},
  async keys(){return [...map.keys()].map(url=>new Request(url));},async delete(req){return map.delete(key(req));}
 };};
 const caches={async open(name){if(cacheUnavailable)throw Error('SecurityError');return cache(name);},async keys(){return [...stores.keys()];},async delete(name){return stores.delete(name);},async match(req,options){if(cacheUnavailable)throw Error('SecurityError');for(const name of stores.keys()){const result=await cache(name).match(req,options);if(result)return result;}}};
 class LocalRequest extends Request{constructor(req,init){super(typeof req==='string'?new URL(req,origin):req,init);}}
 const scope={location:{origin},registration:{},clients:{claim:async()=>{},matchAll:async()=>[]},addEventListener:(k,fn)=>listeners.set(k,fn)};
 const context=vm.createContext({self:scope,caches,URL,Request:LocalRequest,Response,console,fetch:async req=>{calls.push(key(req));if(offline)throw Error('offline');return new Response('NETWORK',{headers:{'Cache-Control':'public'}});}});
 vm.runInContext(source,context);
 return {context,stores,calls,cache,async fetch(path,{mode='cors',preload}={}){
  const request=new LocalRequest(path);Object.defineProperty(request,'mode',{value:mode});
  let response;const background=[];listeners.get('fetch')({request,preloadResponse:Promise.resolve(preload),respondWith(p){response=p;},waitUntil(p){background.push(p);}});
  const resolved=await response;await Promise.all(background);return {response:resolved,background:background.length};
 }};
}
test('offline with no cached fallback returns an actual 503 Response',async()=>{
 const w=worker({offline:true});const {response}=await w.fetch('/lost',{mode:'navigate'});
 assert.ok(response instanceof Response);assert.equal(response.status,503);
});
test('cache quota failure cannot discard a successful network navigation',async()=>{
 const w=worker({quota:true});const {response}=await w.fetch('/index.html',{mode:'navigate'});
 assert.ok(response instanceof Response);assert.equal(await response.text(),'NETWORK');
});
test('cache quota failure cannot discard a successful data response',async()=>{
 const w=worker({quota:true});const {response}=await w.fetch('/data/content-stats.json');assert.equal(await response.text(),'NETWORK');
});
test('cache quota failure cannot discard a fetched sprite',async()=>{
 const w=worker({quota:true});const {response}=await w.fetch('/assets/sprites/a.png');assert.equal(await response.text(),'NETWORK');
});
test('blocked CacheStorage does not prevent otherwise available online resources',async()=>{
 for(const [path,mode] of [['/index.html','navigate'],['/src/data.js','cors'],['/data/content-stats.json','cors'],['/assets/sprites/a.png','cors']]){
  const w=worker({cacheUnavailable:true});assert.equal(await (await w.fetch(path,{mode})).response.text(),'NETWORK');
 }
});
test('background revalidation is attached to the fetch event lifetime',async()=>{
 const w=worker();await w.cache('halo-of-flesh-static-v'+/const VERSION = '([^']+)'/.exec(source)[1]).put('/src/data.js',new Response('CACHED'));
 const {background}=await w.fetch('/src/data.js');assert.equal(background,1);
});
test('new runtime entries take precedence over an older shell entry',async()=>{
 const w=worker({offline:true});const version=/const VERSION = '([^']+)'/.exec(source)[1];
 await w.cache(`halo-of-flesh-static-v${version}`).put('/data/check.json',new Response('OLD'));
 await w.cache(`halo-of-flesh-runtime-v${version}`).put('/data/check.json',new Response('NEW'));
 assert.equal(await (await w.fetch('/data/check.json')).response.text(),'NEW');
});
test('offline fallback is used only for navigation, never as JavaScript bytes',async()=>{
 const w=worker({offline:true});const version=/const VERSION = '([^']+)'/.exec(source)[1];await w.cache(`halo-of-flesh-static-v${version}`).put('/offline.html',new Response('OFFLINE'));
 assert.equal(await (await w.fetch('/unknown',{mode:'navigate'})).response.text(),'OFFLINE');
 assert.equal((await w.fetch('/src/absent.js')).response.type,'error');
});
test('runtime cache remains bounded across repeated query URLs',async()=>{
 const w=worker();for(let i=0;i<150;i++)await w.fetch('/data/query.json?i='+i);
 const version=/const VERSION = '([^']+)'/.exec(source)[1],cache=w.cache(`halo-of-flesh-runtime-v${version}`);
 assert.equal((await cache.keys()).length,128);assert.equal(await cache.match('/data/query.json?i=0'),undefined);assert.ok(await cache.match('/data/query.json?i=149'));
});
test('navigation preload survives a storage quota failure',async()=>{
 const w=worker({quota:true});const {response}=await w.fetch('/index.html',{mode:'navigate',preload:new Response('PRELOAD')});
 assert.equal(await response.text(),'PRELOAD');assert.equal(w.calls.length,0);
});
test('cache-disabled offline navigation still returns a controlled 503',async()=>{
 const w=worker({cacheUnavailable:true,offline:true});assert.equal((await w.fetch('/lost',{mode:'navigate'})).response.status,503);
});
