import test from 'node:test';
import assert from 'node:assert/strict';
import {STAGES,getFighter} from '../src/data.js';
import {SpriteCache,combatSpriteFor,spriteFor,retainedCombatFrames} from '../src/sprite-system.js';
import {STAGE_BITMAPS} from '../src/stage-bitmap-manifest.js';
import {StageBitmapCache,stageBitmapCache,validateStageBitmap,stageBitmapFor,stageBitmapFrames,prepareCombatAssets,pinCombatAssets,captureCombatAssetPins,drawStageBitmaps} from '../src/stage-bitmaps.js';
import {drawStage} from '../src/renderers.js';
const stage=STAGES.find(stage=>stage.id==='midwich'),air=getFighter('sh1_air_screamer_001');
function artFor(subject=stage,{mode='replace',frames=1}={}){
  return {stageId:subject.id,source:subject.source,status:'integrated-candidate',fidelity:'unverified',mode,layers:[{id:'background',rect:[0,0,1,1],ticksPerFrame:6,loop:true,
    frames:Array.from({length:frames},(_,i)=>{const sha256=String(i+1).repeat(64);return {path:`assets/stages/${subject.id}.fixture.${sha256.slice(0,12)}.png`,sha256,bytes:80,width:2,height:2};})}]};
}
function harness(Type=StageBitmapCache,options={}){
  const failures=new Set(),held=new Set(),pending=new Map(),images=[];let cache,peakBytes=0;
  cache=new Type({url:path=>path,timeout:1000,...options,createImage:()=>{
    peakBytes=Math.max(peakBytes,cache.bytes+cache.reservedBytes);
    const image={decode:async()=>{}};images.push(image);
    Object.defineProperty(image,'src',{set(path){const frame=cache.entries.get(path).frame;image.naturalWidth=frame.width;image.naturalHeight=frame.height;
      const finish=()=>failures.has(path)?image.onerror?.():image.onload?.();if(held.has(path))pending.set(path,finish);else queueMicrotask(finish);
    }});return image;
  }});
  return {cache,failures,held,images,get peakBytes(){return peakBytes;},release(path){pending.get(path)?.();pending.delete(path);}};
}
const context=()=>{const calls=[];return {calls,save(){},restore(){},drawImage(...args){calls.push(args);}};};
test('production stage candidates are exact and unregistered stages retain procedural rendering',async()=>{
  for(const [id,art] of Object.entries(STAGE_BITMAPS)){
    const subject=STAGES.find(item=>item.id===id);assert.ok(subject);assert.equal(stageBitmapFor(subject),subject.referencePolicy?.sceneId&&subject.referencePolicy.sceneId!==art.scene?null:art);
    assert.equal(art.fidelity,'unverified');
  }
  const procedural=STAGES.find(item=>!Object.hasOwn(STAGE_BITMAPS,item.id));assert.ok(procedural);
  assert.equal(stageBitmapFor(procedural),null);
  assert.equal((await new StageBitmapCache({registry:{}}).prepare(STAGES)).ok,true);
  assert.equal(drawStageBitmaps(context(),procedural,0).kind,'unregistered');
});
test('stage declarations require exact identity/source, provenance and versioned stage paths',()=>{
  const art=artFor();assert.equal(validateStageBitmap(stage,art),art);
  for(const mutate of [a=>a.source='sh2',a=>a.stageId='alchemilla',a=>a.fidelity='verified',a=>a.layers[0].fit='unknown',a=>a.layers[0].rect=[0,0,2,1],a=>a.layers[0].frames[0].path='assets/sprites/fixture.png',a=>a.layers[0].frames[0].sha256='0'.repeat(64)]){
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
test('explicit scene ceiling metadata uses booleans and rejects ambiguous geometry',()=>{
  for(const ceiling of [true,false]){
    const art={...artFor(),geometry:{ceiling}};assert.equal(validateStageBitmap(stage,art),art);
  }
  for(const geometry of [null,[],{},'interior',{ceiling:1},{ceiling:'false'},{ceiling:true,unknown:true}]){
    const art={...artFor(),geometry};assert.throws(()=>validateStageBitmap(stage,art),/scene geometry/);
  }
  assert.equal(STAGE_BITMAPS.midwich.geometry.ceiling,false);
  assert.equal(STAGE_BITMAPS.woodside.geometry.ceiling,true);
  assert.equal(STAGE_BITMAPS.alchemilla.geometry.ceiling,true);
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
  const missing=getFighter('sh2_mannequin_022');assert.equal(missing.id,'sh2_mannequin_022');
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
  const previousArt=STAGE_BITMAPS[stage.id];
  STAGE_BITMAPS[stage.id]=art;stageBitmapCache.entries.set(frame.path,{status:'ready',image,used:0,frame});
  const makeContext=()=>{const calls=[],gradient={addColorStop(){}};return new Proxy({calls,createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(object,key)=>key in object?object[key]:(...args)=>calls.push([key,...args])});};
  try{
    const overlay=makeContext();drawStage(overlay,stage,0,{width:100,height:80,animationsEnabled:false});
    assert.equal(overlay.calls.filter(call=>call[0]==='drawImage').length,1);assert.ok(overlay.calls.some(call=>call[0]==='fillRect'));
    art.mode='replace';const replace=makeContext();drawStage(replace,stage,0,{width:100,height:80});
    assert.equal(replace.calls.filter(call=>call[0]==='drawImage').length,1);assert.ok(!replace.calls.some(call=>call[0]==='fillRect'));
  }finally{if(previousArt)STAGE_BITMAPS[stage.id]=previousArt;else delete STAGE_BITMAPS[stage.id];if(previous)stageBitmapCache.entries.set(frame.path,previous);else stageBitmapCache.entries.delete(frame.path);}
});
test('cover and contain preserve native scenery proportions instead of stretching architecture',async()=>{
  const art=artFor(),layer=art.layers[0],frame=layer.frames[0];frame.width=200;frame.height=100;
  const h=harness(StageBitmapCache,{registry:{[stage.id]:art}});await h.cache.prepare(stage);const image=h.cache.peek(frame.path);
  layer.fit='cover';const cover=context();drawStageBitmaps(cover,stage,0,{cache:h.cache,width:100,height:80});
  assert.deepEqual(cover.calls[0],[image,37.5,0,125,100,0,0,100,80]);
  layer.fit='contain';const contain=context();drawStageBitmaps(contain,stage,0,{cache:h.cache,width:100,height:80});
  assert.deepEqual(contain.calls[0],[image,0,15,100,50]);
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

const settledActors=()=>[
  {data:air,grounded:false,presentation:{key:'outro',frame:89,duration:90,complete:true}},
  {data:getFighter('sh3_numb_body_small_037'),ko:true,grounded:true,presentation:{key:'loseMatch',frame:144,duration:145,complete:true}}
];
test('retired matches retain final presentations while live matches retain every combat pose',()=>{
  const actors=settledActors(),engine={phase:'matchEnd',actors};
  assert.deepEqual(retainedCombatFrames(engine).map(frame=>frame.path),[
    'assets/sprites/sh1_air_screamer_001.f208137d6414.png',
    'assets/sprites/sh3_numb_body_small_037.974da23966d7.png'
  ]);
  for(const phase of ['intro','fight','roundEnd']){
    assert.deepEqual(retainedCombatFrames({...engine,phase}),actors.flatMap(actor=>combatSpriteFor(actor.data).frames));
  }
  assert.deepEqual(retainedCombatFrames({...engine,destroyed:true}),[]);
  const anne=getFighter('downpour_anne_cunningham'),art=spriteFor(anne);
  assert.notEqual(art.portrait.path,art.frames[0].path);
  const retained=retainedCombatFrames({phase:'matchEnd',actors:[{data:anne,presentation:{key:'outro',frame:89}}]});
  assert.deepEqual(retained.map(frame=>frame.path),[art.frames[0].path]);
  assert.ok(!retained.some(frame=>frame.path===art.portrait.path),'a separated selection portrait never consumes the combat lease');
});
test('an active final presentation retains all its future clip frames',()=>{
  const art=structuredClone(combatSpriteFor(air));
  art.clips.outro={frames:[0,1,2],ticksPerFrame:6,loop:false};
  const actor={data:air,presentation:{key:'outro',frame:0,duration:90,complete:false}};
  assert.deepEqual(retainedCombatFrames({phase:'matchEnd',actors:[actor]},{[air.id]:art}),art.frames);
});
test('Numb Body to Split Head continuation stays within 64 MiB and preserves the old result on decode failure',async()=>{
  const actors=settledActors(),old=actors.map(actor=>actor.data),next=[air,getFighter('sh1_split_head_014')];
  const retired={phase:'matchEnd',actors},retainedFrames=retainedCombatFrames(retired);
  const other={...stage,id:'other'},oldStage=artFor(stage,{frames:2}),nextStage=artFor(other,{frames:2});
  const actor=harness(SpriteCache),decor=harness(StageBitmapCache,{registry:{[stage.id]:oldStage,other:nextStage}});
  const options={fighterCache:actor.cache,stageCache:decor.cache};
  assert.equal(actor.cache.maxBytes,64*1024*1024);
  assert.throws(()=>pinCombatAssets([...next,...old],[],options),/decoded-memory budget/,'the old whole-fighter overlap reproduces the failure');
  pinCombatAssets(old,[stage],options);assert.equal((await prepareCombatAssets(old,[stage],options)).ok,true);
  const images=new Map(retainedFrames.map(frame=>[frame.path,actor.cache.peek(frame.path)]));
  const stageImages=new Map(oldStage.layers[0].frames.map(frame=>[frame.path,decor.cache.peek(frame.path)]));
  pinCombatAssets([],[stage],{...options,retainedFrames});const restore=captureCombatAssetPins(options);
  pinCombatAssets(next,[stage,other],{...options,retainedFrames});
  assert.deepEqual([...decor.cache.pins],stageBitmapFrames([stage,other],decor.cache.registry).map(frame=>frame.path));
  const failing=combatSpriteFor(next[1]).frames[0];actor.held.add(failing.path);actor.failures.add(failing.path);
  const ready=prepareCombatAssets(next,[other],options);await new Promise(resolve=>setImmediate(resolve));
  for(const [path,image] of images)assert.equal(actor.cache.peek(path),image,'the previous result remains renderable during loading');
  actor.release(failing.path);assert.equal((await ready).ok,false);restore();
  for(const [path,image] of images)assert.equal(actor.cache.peek(path),image,'failed replacement retains each old presentation image');
  for(const [path,image] of stageImages)assert.equal(decor.cache.peek(path),image,'all frames of the old stage remain ready');
  assert.deepEqual([...actor.cache.pins],retainedFrames.map(frame=>frame.path));
  assert.deepEqual([...decor.cache.pins],oldStage.layers[0].frames.map(frame=>frame.path));
  actor.failures.clear();actor.held.clear();pinCombatAssets(next,[stage,other],{...options,retainedFrames});
  assert.equal((await prepareCombatAssets(next,[other],options)).ok,true,'retry decodes the complete next pair');
  for(const frame of next.flatMap(fighter=>combatSpriteFor(fighter).frames))assert.ok(actor.cache.peek(frame.path));
  for(const [path,image] of images)assert.equal(actor.cache.peek(path),image);
  pinCombatAssets(next,[other],options);
  assert.ok(actor.peakBytes<=64*1024*1024,'decoded and in-flight allocations never exceed the original budget');
  assert.ok(!actor.cache.pins.has(retainedFrames[1].path),'the retired opponent is unpinned only after successful replacement');
});

test('a different documented sub-room cannot render or lease an older raster from the same location',async()=>{
 for(const id of ['woodside','shopping_mall']){
  const s=STAGES.find(v=>v.id===id),art=STAGE_BITMAPS[id];assert.ok(s.referencePolicy.sceneId);assert.notEqual(s.referencePolicy.sceneId,art.scene);
  assert.equal(stageBitmapFor(s),null);assert.deepEqual(stageBitmapFrames([s]),[]);assert.equal(drawStageBitmaps(context(),s,100).kind,'unregistered');
  const sameRoom={...s,referencePolicy:{...s.referencePolicy,sceneId:art.scene}};assert.equal(stageBitmapFor(sameRoom),art);assert.ok(stageBitmapFrames([sameRoom]).length);
  const c=harness(StageBitmapCache);assert.equal((await c.cache.prepare([s])).ok,true);assert.equal(c.images.length,0);
 }
});
