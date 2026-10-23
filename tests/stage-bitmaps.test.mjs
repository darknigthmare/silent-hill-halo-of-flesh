import test from 'node:test';
import assert from 'node:assert/strict';
import {STAGES,getFighter} from '../src/data.js';
import {SpriteCache} from '../src/sprite-system.js';
import {STAGE_BITMAPS} from '../src/stage-bitmap-manifest.js';
import {StageBitmapCache,stageBitmapCache,validateStageBitmap,stageBitmapFor,stageBitmapFrames,prepareCombatAssets,pinCombatAssets,captureCombatAssetPins,drawStageBitmaps} from '../src/stage-bitmaps.js';
import {drawStage} from '../src/renderers.js';
const stage=STAGES.find(stage=>stage.id==='midwich'),air=getFighter('sh1_air_screamer_001');
function artFor(subject=stage,{mode='replace',frames=1}={}){
  return {stageId:subject.id,source:subject.source,status:'integrated-candidate',fidelity:'unverified',mode,layers:[{id:'background',rect:[0,0,1,1],ticksPerFrame:6,loop:true,
    frames:Array.from({length:frames},(_,i)=>{const sha256=String(i+1).repeat(64);return {path:`assets/stages/${subject.id}.fixture.${sha256.slice(0,12)}.png`,sha256,bytes:80,width:2,height:2};})}]};
}
function harness(Type=StageBitmapCache,options={}){
  const failures=new Set(),held=new Set(),pending=new Map(),images=[];let cache;
  cache=new Type({url:path=>path,timeout:1000,...options,createImage:()=>{
    const image={decode:async()=>{}};images.push(image);
    Object.defineProperty(image,'src',{set(path){const frame=cache.entries.get(path).frame;image.naturalWidth=frame.width;image.naturalHeight=frame.height;
      const finish=()=>failures.has(path)?image.onerror?.():image.onload?.();if(held.has(path))pending.set(path,finish);else queueMicrotask(finish);
    }});return image;
  }});
  return {cache,failures,held,images,release(path){pending.get(path)?.();pending.delete(path);}};
}
const context=()=>{const calls=[];return {calls,save(){},restore(){},drawImage(...args){calls.push(args);}};};
test('production bitmap stage registry starts empty and preserves procedural stages',async()=>{
  assert.deepEqual(STAGE_BITMAPS,{});assert.equal(stageBitmapFor(stage),null);
  assert.equal((await new StageBitmapCache().prepare(STAGES)).ok,true);
  assert.equal(drawStageBitmaps(context(),stage,0).kind,'unregistered');
});
test('stage declarations require exact identity/source, provenance and versioned stage paths',()=>{
  const art=artFor();assert.equal(validateStageBitmap(stage,art),art);
  for(const mutate of [a=>a.source='sh2',a=>a.stageId='alchemilla',a=>a.fidelity='verified',a=>a.layers[0].rect=[0,0,2,1],a=>a.layers[0].frames[0].path='assets/sprites/fixture.png',a=>a.layers[0].frames[0].sha256='0'.repeat(64)]){
    const broken=structuredClone(art);mutate(broken);assert.throws(()=>validateStageBitmap(stage,broken),/Stage bitmap/);
    assert.equal(drawStageBitmaps(context(),stage,0,{registry:{[stage.id]:broken}}).kind,'error');
  }
  assert.throws(()=>stageBitmapFor({...stage,reference:{blocked:true}},{[stage.id]:art}),/unresolved/);
  assert.throws(()=>stageBitmapFrames([stage,{...stage,source:'sh2'}],{[stage.id]:art}),/source/);
});
test('duplicate paths with conflicting measured metadata fail before loading',async()=>{
  const art=artFor();art.layers.push({...structuredClone(art.layers[0]),id:'fog'});art.layers[1].frames[0].bytes++;
  const h=harness(StageBitmapCache,{registry:{[stage.id]:art}}),result=await h.cache.prepare([stage]);
  assert.equal(result.ok,false);assert.deepEqual(result.failed,['stage-descriptor']);assert.equal(h.images.length,0);
});
test('joint preflight waits for every actor and stage image',async()=>{
  const art=artFor(stage,{frames:2}),h=harness(StageBitmapCache,{registry:{[stage.id]:art}}),actor=harness(SpriteCache);
  const frame=art.layers[0].frames[1];h.held.add(frame.path);let settled=false;
  const ready=prepareCombatAssets([air],[stage],{fighterCache:actor.cache,stageCache:h.cache}).then(result=>{settled=true;return result;});
  await new Promise(resolve=>setImmediate(resolve));assert.equal(settled,false);assert.equal(actor.cache.bytes>0,true);
  h.release(frame.path);assert.equal((await ready).ok,true);assert.equal(h.images.length,2);
});
test('a failed declared stage blocks diagnostics and can be retried',async()=>{
  const art=artFor(),frame=art.layers[0].frames[0],h=harness(StageBitmapCache,{registry:{[stage.id]:art}}),actor=harness(SpriteCache);
  h.failures.add(frame.path);
  const options={fighterCache:actor.cache,stageCache:h.cache,diagnostic:true};
  const missing=getFighter('sh2_lying_figure_020');assert.equal(missing.id,'sh2_lying_figure_020');
  const failed=await prepareCombatAssets([missing],[stage],options);assert.deepEqual(failed.missing,[missing.id]);
  assert.equal(failed.ok,false);assert.equal(failed.stageFailed,true);assert.ok(failed.failed.includes(frame.path));
  h.failures.clear();assert.equal((await prepareCombatAssets([],stage,options)).ok,true);assert.equal(h.images.length,2);
});
test('diagnostics permits missing actors but never unreadable declared actor files',async()=>{
  const h=harness(SpriteCache);const missing=getFighter('sh2_red_pyramid_thing_great_knife_029');
  assert.equal((await h.cache.prepare([missing],{diagnostic:true})).ok,true);
  const {spriteFor}=await import('../src/sprite-system.js');for(const frame of spriteFor(air).frames)h.failures.add(frame.path);
  const result=await h.cache.prepare([air],{diagnostic:true});assert.equal(result.ok,false);assert.equal(result.failed.length,3);
});
test('stages draw no partial layers while any declared image is pending or failed',async()=>{
  const art=artFor(stage,{frames:2}),h=harness(StageBitmapCache,{registry:{[stage.id]:art}}),c=context(),pending=art.layers[0].frames[1];
  h.held.add(pending.path);const ready=h.cache.prepare(stage);await new Promise(resolve=>setImmediate(resolve));
  assert.equal(drawStageBitmaps(c,stage,0,{cache:h.cache}).kind,'loading');assert.equal(c.calls.length,0);
  h.failures.add(pending.path);h.release(pending.path);await ready;
  assert.equal(drawStageBitmaps(c,stage,0,{cache:h.cache}).kind,'error');assert.equal(c.calls.length,0);
});
test('ready stage layers draw cached images in declared rectangles on simulation ticks',async()=>{
  const art=artFor(stage,{frames:2});art.layers[0].rect=[.25,.25,.5,.5];
  const h=harness(StageBitmapCache,{registry:{[stage.id]:art}}),c=context();await h.cache.prepare(stage);
  const result=drawStageBitmaps(c,stage,100,{cache:h.cache,width:100,height:80});
  assert.equal(result.kind,'raster');assert.deepEqual(c.calls[0],[h.cache.peek(art.layers[0].frames[1].path),25,20,50,40]);
  drawStageBitmaps(c,stage,100,{cache:h.cache,paint:false});assert.equal(c.calls.length,1,'readiness probes never double-paint overlays');
});
test('live renderer paints an overlay once and replaces procedural geometry when requested',()=>{
  const art=artFor(stage,{mode:'overlay'}),frame=art.layers[0].frames[0],image={fixture:true},previous=stageBitmapCache.entries.get(frame.path);
  STAGE_BITMAPS[stage.id]=art;stageBitmapCache.entries.set(frame.path,{status:'ready',image,used:0,frame});
  const makeContext=()=>{const calls=[],gradient={addColorStop(){}};return new Proxy({calls,createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(object,key)=>key in object?object[key]:(...args)=>calls.push([key,...args])});};
  try{
    const overlay=makeContext();drawStage(overlay,stage,0,{width:100,height:80,animationsEnabled:false});
    assert.equal(overlay.calls.filter(call=>call[0]==='drawImage').length,1);assert.ok(overlay.calls.some(call=>call[0]==='fillRect'));
    art.mode='replace';const replace=makeContext();drawStage(replace,stage,0,{width:100,height:80});
    assert.equal(replace.calls.filter(call=>call[0]==='drawImage').length,1);assert.ok(!replace.calls.some(call=>call[0]==='fillRect'));
  }finally{delete STAGE_BITMAPS[stage.id];if(previous)stageBitmapCache.entries.set(frame.path,previous);else stageBitmapCache.entries.delete(frame.path);}
});
test('both leases are validated before either cache mutates',async()=>{
  const art=artFor(),h=harness(StageBitmapCache,{registry:{[stage.id]:art},maxBytes:16}),actor=harness(SpriteCache);
  h.cache.pin(art.layers[0].frames);await h.cache.prepare(stage);const before=h.cache.peek(art.layers[0].frames[0].path);
  const other={...stage,id:'other'},registry={...h.cache.registry,other:artFor(other)};h.cache.registry=registry;
  assert.throws(()=>pinCombatAssets([air],[stage,other],{fighterCache:actor.cache,stageCache:h.cache}),/budget/);
  assert.equal(actor.cache.pins.size,0);assert.deepEqual([...h.cache.pins],[art.layers[0].frames[0].path]);assert.equal(h.cache.peek(art.layers[0].frames[0].path),before);
});
test('failed replacement cannot evict old pinned images and restoring lease keeps them ready',async()=>{
  const art=artFor(),other={...stage,id:'other'},next=artFor(other),h=harness(StageBitmapCache,{registry:{[stage.id]:art,other:next},maxBytes:16}),actor=harness(SpriteCache);
  const options={fighterCache:actor.cache,stageCache:h.cache};pinCombatAssets([],[stage],options);await h.cache.prepare(stage);
  const original=h.cache.peek(art.layers[0].frames[0].path),restore=captureCombatAssetPins(options);
  assert.equal((await h.cache.prepare(other)).ok,false);restore();
  assert.equal(h.cache.peek(art.layers[0].frames[0].path),original);assert.equal(h.cache.bytes,16);
});
