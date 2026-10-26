import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {ROSTER,getFighter} from '../src/data.js';
import {bodyProfile} from '../src/combat-geometry.js';
import {SPRITES} from '../src/sprite-manifest.js';
import {spriteFor,spriteCoverage,poseKey,frameFor,rasterPlacement,SpriteCache,drawRasterMonster,paintRasterPortrait} from '../src/sprite-system.js';
const air=getFighter('sh1_air_screamer_001'),film=getFighter('film_red_pyramid_film_175'),art=spriteFor(air),f=art.frames[0];
const missing=ROSTER.find(fighter=>!spriteFor(fighter));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function harness({fail=false,hang=false,wrong=false,delay=0,...options}={}){
 const images=[];let pending=0,peak=0;
 const cache=new SpriteCache({url:x=>x,timeout:80,...options,createImage:()=>{
  const im={naturalWidth:f.width,naturalHeight:f.height,decode:async()=>{}};
  Object.defineProperty(im,'src',{set(path){const registered=Object.values(SPRITES).flatMap(asset=>asset.frames).find(frame=>frame.path===path)||f;im.naturalWidth=registered.width;im.naturalHeight=registered.height;images.push(im);pending++;peak=Math.max(peak,pending);if(hang)return;setTimeout(()=>{pending--;if(wrong)im.naturalWidth=4;if(fail)im.onerror?.();else im.onload?.();},delay);}});return im;
 }});return {cache,images,get peak(){return peak;}};
}
function ctx(){const calls=[],gradient={addColorStop(){}};return new Proxy({calls,canvas:{width:720,height:500},createLinearGradient:()=>gradient},{get:(o,k)=>k in o?o[k]:(...a)=>calls.push([k,...a])});}
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('raster coverage counts real exact-ID assets, not roster entries or resized copies',()=>{
 const c=spriteCoverage(ROSTER),registered=Object.keys(SPRITES).length;assert.equal(c.total,230);assert.equal(c.integrated,registered);assert.equal(c.missing.length,230-registered);assert.equal(c.certified,0);assert.equal(c.animatedClips,1);
});
test('film bitmap is not silently used for the SH2 original or spear',()=>{
 const filmArt=spriteFor(film),knife=spriteFor('sh2_red_pyramid_thing_great_knife_029'),spear=spriteFor('sh2_red_pyramid_thing_spear_030');
 assert.ok(filmArt);assert.ok(knife);assert.ok(spear);
 assert.equal(knife.source,'sh2');assert.equal(spear.source,'sh2');
 assert.notEqual(knife.frames[0].path,filmArt.frames[0].path);assert.notEqual(spear.frames[0].path,filmArt.frames[0].path);
 assert.notEqual(knife.frames[0].path,spear.frames[0].path);
 assert.equal(spriteFor({...getFighter(knife.fighterId),source:'film'}),null);
});
test('an explicit source mismatch rejects otherwise valid ID',()=>assert.equal(spriteFor({...air,source:'film'}),null));
test('unknown and inherited property names never resolve as images',()=>{
 for(const id of ['__proto__','constructor','toString','','air_screamer'])assert.equal(spriteFor(id),null);
});
test('no ID case normalization or fuzzy aliases are used',()=>assert.equal(spriteFor(air.id.toUpperCase()),null));
test('each runtime bitmap has its actual digest, PNG header and native dimensions',async()=>{
 const paths=new Set();for(const asset of Object.values(SPRITES))for(const frame of asset.frames){const b=await readFile(new URL('../'+frame.path,import.meta.url));assert.equal(createHash('sha256').update(b).digest('hex'),frame.sha256);assert.equal(b.length,frame.bytes);assert.equal(b.readUInt32BE(16),frame.width);assert.equal(b.readUInt32BE(20),frame.height);assert.equal(b[25],6);paths.add(frame.path);}assert.equal(paths.size,Object.values(SPRITES).reduce((sum,asset)=>sum+asset.frames.length,0));
});
test('mirrored presentation reuses an image but is not counted as generated animation',()=>{
 const single=spriteFor(film);
 assert.match(single.mirrorPolicy,/not independently/);assert.equal(single.animatedClips,0);assert.equal(single.frames.length,1);
 assert.match(art.mirrorPolicy,/not independently/);assert.equal(art.animatedClips,1);assert.equal(art.frames.length,3);
 assert.equal(new Set(art.frames.map(frame=>frame.pixelSHA256)).size,3,'flight uses genuinely different images');
});
test('pose priority and missing pose fallback are explicit',()=>{
 assert.equal(poseKey({ko:true,hurt:true}), 'ko');assert.equal(poseKey({hurt:true,moveKey:'neutralLight'}),'hurt');assert.equal(poseKey({crouching:true}),'crouch');assert.equal(frameFor(art,{ko:true,frame:900}),f);
});
test('future frame clips advance using simulation ticks only',()=>{
 const frames=[{path:'a'},{path:'b'},{path:'c'}],a={frames,clips:{idle:{frames:[0],ticksPerFrame:1,loop:false},walk:{frames:[0,1,2],ticksPerFrame:5,loop:true}}};
 assert.equal(frameFor(a,{moving:true,frame:0}),frames[0]);assert.equal(frameFor(a,{moving:true,frame:5}),frames[1]);assert.equal(frameFor(a,{moving:true,frame:15}),frames[0]);assert.equal(frameFor(a,{moving:true,frame:14}),frames[2]);
});
test('non-looping future pose clips hold their final actual frame',()=>{
 const a={frames:[{path:'a'},{path:'b'}],clips:{idle:{frames:[0,1],ticksPerFrame:2,loop:false}}};assert.equal(frameFor(a,{frame:99}),a.frames[1]);
});
test('native aspect ratio is preserved for all roster size profiles',()=>{
 for(const fighter of ROSTER){const p=rasterPlacement(fighter,f,640,594);near(p.width/p.height,f.width/f.height);near(p.height*f.bodyHeight,bodyProfile(fighter).height*bodyProfile(fighter).scale);}
});
test('left and right raster anchors are exact mirror positions around the actor',()=>{
 const a=rasterPlacement(film,spriteFor(film).frames[0],500,594,1),b=rasterPlacement(film,spriteFor(film).frames[0],500,594,-1);near(a.x+b.x+a.width,1000);near(a.y,b.y);near(a.width,b.width);
});
test('grounded feet and floating bodies retain their source geometry offsets',()=>{
 for(const fighter of [film,air]){const frame=spriteFor(fighter).frames[0],p=rasterPlacement(fighter,frame,640,594),body=bodyProfile(fighter);near(p.y+frame.anchor[1]*p.height,594-(body.bottom||0)*body.scale);}
});
test('cache deduplicates requests and decoding for repeated portraits',async()=>{
 const h=harness();const a=h.cache.load(f),b=h.cache.load(f);assert.equal(a,b);await a;assert.equal(h.images.length,1);assert.equal(h.cache.status(f.path),'ready');assert.equal(h.cache.peek(f.path),h.images[0]);
});
test('cache caps concurrent decoders',async()=>{
 const h=harness({concurrency:2,delay:4});await Promise.all(Array.from({length:7},(_,i)=>h.cache.load({...f,path:'test-'+i})));assert.ok(h.peak<=2);
});
test('failed assets do not auto-retry on every render frame',async()=>{
 const h=harness({fail:true});await h.cache.load(f);for(let i=0;i<50;i++)await h.cache.load(f);assert.equal(h.images.length,1);assert.equal(h.cache.status(f.path),'error');
});
test('a new explicit preflight retries a failed asset',async()=>{
 const h=harness({fail:true});await h.cache.load(f);await h.cache.load(f,{retry:true});assert.equal(h.images.length,2);
});
test('decoder errors and dimensions mismatches fail safely',async()=>{
 const h=harness({wrong:true});assert.equal(await h.cache.load(f),null);assert.equal(h.cache.status(f.path),'error');
});
test('a stalled image has a bounded timeout and releases its slot',async()=>{
 const h=harness({hang:true,timeout:8});assert.equal(await h.cache.load(f),null);assert.equal(h.cache.active,0);
});
test('an unavailable browser image API is a controlled load failure',async()=>{
 const cache=new SpriteCache({createImage(){throw Error('no browser');}});assert.equal(await cache.load(f),null);assert.equal(cache.status(f.path),'error');
});
test('LRU eviction frees unpinned decoded images',async()=>{
 const bytes=f.width*f.height*4,h=harness({maxBytes:bytes+1});await h.cache.load({...f,path:'a'});await h.cache.load({...f,path:'b'});assert.equal(h.cache.status('a'),'absent');assert.equal(h.cache.status('b'),'ready');assert.ok(h.cache.bytes<=bytes+1);
});
test('current combat images survive LRU eviction',async()=>{
 const bytes=f.width*f.height*4,h=harness({maxBytes:bytes+1});h.cache.pin([{...f,path:'a'}]);await h.cache.load({...f,path:'a'});await h.cache.load({...f,path:'b'});assert.equal(h.cache.status('a'),'ready');assert.equal(h.cache.status('b'),'error');assert.equal(h.cache.entries.get('b').error,'memory-budget');
});
test('preflight refuses missing art before issuing any network load',async()=>{
 const h=harness(),result=await h.cache.prepare([film,missing]);assert.equal(result.ok,false);assert.equal(result.missing.length,1);assert.equal(h.images.length,0);
});
test('preflight reports successful decode even when long-run unpinned frames were evicted',async()=>{
 const h=harness({maxBytes:f.width*f.height*4+1});const result=await h.cache.prepare([air,film]);assert.equal(result.ok,true);assert.ok(h.cache.bytes<=h.cache.maxBytes);assert.equal(h.cache.entries.size,1);
});
test('diagnostic mode is explicit and lists all missing IDs',async()=>{
 const h=harness();const result=await h.cache.prepare([missing],{diagnostic:true});assert.equal(result.ok,true);assert.equal(result.missing.length,1);
});
test('battle rendering issues a raster draw, not skeletal geometry',async()=>{
 const h=harness();await h.cache.load(f);const c=ctx(),draw=drawRasterMonster(c,air,640,594,{cache:h.cache,shadow:false});assert.equal(draw.kind,'raster');assert.equal(c.calls.filter(x=>x[0]==='drawImage').length,1);assert.ok(!c.calls.some(x=>['moveTo','lineTo','arc','bezierCurveTo'].includes(x[0])));
});
test('missing art uses a labeled card instead of fabricated anatomy',()=>{
 const c=ctx(),h=harness();const result=drawRasterMonster(c,missing,640,594,{cache:h.cache});assert.equal(result.kind,'missing');assert.ok(c.calls.some(x=>x[0]==='fillText'&&x[1]==='VISUEL À PRODUIRE'));assert.ok(!c.calls.some(x=>x[0]==='drawImage'));
});
test('asynchronous portrait completion cannot paint the previous selected ID',async()=>{
 const h=harness({delay:10}),c=ctx(),canvas={width:720,height:500,dataset:{},getContext:()=>c,setAttribute(){}};
 paintRasterPortrait(canvas,air,{cache:h.cache});paintRasterPortrait(canvas,missing,{cache:h.cache});await sleep(25);assert.equal(canvas.dataset.artStatus,'missing');assert.ok(!c.calls.some(x=>x[0]==='drawImage'));
});
test('single loaded bitmap paints both left-facing and right-facing portraits',async()=>{
 const h=harness(),c=ctx(),canvas={width:720,height:500,dataset:{},getContext:()=>c,setAttribute(){}};await h.cache.load(art.portrait);paintRasterPortrait(canvas,air,{cache:h.cache,facing:-1});assert.equal(canvas.dataset.artStatus,'raster');assert.ok(c.calls.some(x=>x[0]==='scale'&&x[1]===-1));
});
test('all monster entry points route through raster code; command hero has no old drawing functions',async()=>{
 const renderer=await readFile(new URL('../src/renderers.js',import.meta.url),'utf8'),command=await readFile(new URL('../src/command.js',import.meta.url),'utf8');assert.match(renderer,/drawRasterMonster as drawMonster/);assert.match(renderer,/paintRasterPortrait as renderPortrait/);for(const name of ['drawHumanoid','drawWeapon','drawExecutioner','drawFlower','drawNurse'])assert.ok(!new RegExp('function '+name+'\\(').test(renderer+command),name);
});
test('every actual sprite path is in the generated offline shell',async()=>{
 const sw=await readFile(new URL('../service-worker.js',import.meta.url),'utf8');for(const asset of Object.values(SPRITES))for(const frame of asset.frames)assert.ok(sw.includes('/'+frame.path));assert.ok(sw.includes('/src/sprite-system.js'));assert.ok(sw.includes('/modules/sprite-workshop.html'));
});

test('portrait orientation combines presentation side with a left-facing native frame',async()=>{
 const h=harness();await h.cache.load(f);
 for(const explicit of [false,true])for(const facing of [-1,1]){
  const portrait={...art.portrait};if(explicit)portrait.facing=-1;else delete portrait.facing;
  const left={...art,frames:[{...f,facing:-1}],portrait},c=ctx(),canvas={width:720,height:500,dataset:{},getContext:()=>c,setAttribute(){}};
  paintRasterPortrait(canvas,air,{cache:h.cache,facing,registry:{[air.id]:left}});
  assert.ok(c.calls.some(x=>x[0]==='scale'&&x[1]===-facing));
 }
});
test('a portrait paints its successful decode even when the next queued image evicts it before the callback',async()=>{
 const cost=f.width*f.height*4,h=harness({maxBytes:cost+1,concurrency:1}),c=ctx();
 const canvas={width:300,height:200,dataset:{},getContext:()=>c,setAttribute(){}};
 paintRasterPortrait(canvas,air,{cache:h.cache});
 const first=h.cache.load(f),second=h.cache.load({...f,path:'portrait-next-in-queue'});
 assert.ok((await Promise.all([first,second])).every(Boolean));
 assert.equal(h.cache.status(f.path),'absent','the full-size first frame really was evicted');
 assert.equal(canvas.dataset.artStatus,'raster','painted pixels remain in the card');
 assert.ok(c.calls.some(call=>call[0]==='drawImage'&&call[1]===h.images[0]));
 assert.ok(h.cache.bytes<=h.cache.maxBytes);assert.equal(h.cache.reservedBytes,0);
});
test('over-budget pinned animation sets are rejected before changing the previous lease',()=>{
 const cost=f.width*f.height*4,h=harness({maxBytes:cost+1});h.cache.pin([{...f,path:'old'}]);
 assert.throws(()=>h.cache.pin([{...f,path:'one'},{...f,path:'two'}]),/memory/);
 assert.deepEqual([...h.cache.pins],['old']);assert.equal(h.images.length,0);
});
test('mirror combat pins each actual file only once',()=>{
 const h=harness({maxBytes:f.width*f.height*4});h.cache.pin([f,f]);assert.equal(h.cache.pins.size,1);
});
test('pinning unmeasured unknown paths cannot bypass the memory budget',()=>{
 const h=harness();assert.throws(()=>h.cache.pin(['unmeasured']),/dimensions/);
});
test('one oversized image is rejected without invoking a decoder',async()=>{
 const h=harness({maxBytes:100});assert.equal(await h.cache.load(f),null);assert.equal(h.images.length,0);assert.equal(h.cache.entries.get(f.path).error,'memory-budget');
});
test('in-flight reservations bound simultaneous decoded memory, not only the final LRU',async()=>{
 const cost=f.width*f.height*4,h=harness({maxBytes:cost+1,concurrency:4,delay:5});
 const results=await Promise.all(Array.from({length:6},(_,i)=>h.cache.load({...f,path:'reserved-'+i}).then(Boolean)));
 assert.ok(results.every(Boolean));assert.equal(h.peak,1);assert.equal(h.cache.reservedBytes,0);assert.ok(h.cache.bytes<=h.cache.maxBytes);
});
test('full pinned cache refuses unrelated decodes without a queued-load deadlock',async()=>{
 const h=harness({maxBytes:f.width*f.height*4});h.cache.pin([f]);await h.cache.load(f);
 assert.equal(await h.cache.load({...f,path:'unrelated'}),null);assert.equal(h.cache.queue.length,0);assert.equal(h.cache.reservedBytes,0);assert.equal(h.cache.peek(f.path),h.images[0]);
});
test('decoder timeout releases its memory reservation as well as concurrency',async()=>{
 const h=harness({hang:true,timeout:4});await h.cache.load(f);assert.equal(h.cache.reservedBytes,0);assert.equal(h.cache.active,0);
});
