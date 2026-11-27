import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {deflateSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {getFighter,createCombatProfile} from '../src/data.js';
import {FightEngine} from '../src/fight.js';
import {SpriteCache} from '../src/sprite-system.js';
import {PROJECTILE_BITMAPS} from '../src/projectile-bitmap-manifest.js';
import {PROJECTILE_BITMAP_BUDGET,validateProjectileBitmap,validateProjectileRegistry,projectileBitmapFor,
  projectileBitmapPlacement,projectileBitmapCache,prepareProjectileBitmaps,drawProjectileBitmap} from '../src/projectile-bitmaps.js';
import {auditProjectileBitmaps,buildProjectileBitmaps} from '../scripts/build-projectile-bitmaps.mjs';
import {bitmapRevision} from '../scripts/build-stage-bitmaps.mjs';
import {crc32} from '../scripts/raster-validation.mjs';

const incubator=getFighter('sh1_incubator_018'),god=getFighter('sh3_god_050');
function artFor(fighter=incubator,{id=fighter.id+'.fixture',slot='neutralSpecial',sha='a'.repeat(64),ground=false}={}){
  return {id,fighterId:fighter.id,source:fighter.source,slots:[slot],status:'integrated-candidate',fidelity:'unverified',
    referenceIds:[fighter===god?'CL_SH3_BOSSES':'CL_SH1_BOSSES'],
    frame:{path:`assets/projectiles/${id}.${sha.slice(0,12)}.png`,sha256:sha,bytes:1,width:256,height:128},
    presentation:{heightInRadii:4,anchor:ground?'ground':'center',facing:1,composite:'source-over'}};
}
const registryFor=art=>({[art.id]:art});
const shot=(fighter=incubator)=>({owner:{data:fighter,facing:1},move:createCombatProfile(fighter).moves.neutralSpecial,
  x:480,y:330,radius:12,vx:8,vy:0,life:40,maxLife:60,gravity:0});
function context(){
  const calls=[];
  return new Proxy({calls,createRadialGradient(){return {addColorStop(){}};}},
    {get:(object,key)=>key in object?object[key]:(...args)=>calls.push([key,...args])});
}
function harness({maxBytes=PROJECTILE_BITMAP_BUDGET}={}){
  const failures=new Set(),held=new Set(),pending=new Map();let cache,created=0,peakBytes=0;
  cache=new SpriteCache({url:path=>path,maxBytes,concurrency:2,timeout:1000,createImage:()=>{
    created++;peakBytes=Math.max(peakBytes,cache.bytes+cache.reservedBytes);
    const image={decode:async()=>{}};
    Object.defineProperty(image,'src',{set(path){
      const frame=cache.entries.get(path).frame;image.naturalWidth=frame.width;image.naturalHeight=frame.height;
      const finish=()=>failures.has(path)?image.onerror?.():image.onload?.();
      if(held.has(path))pending.set(path,finish);else queueMicrotask(finish);
    }});return image;
  }});
  return {cache,failures,held,get created(){return created;},get peakBytes(){return peakBytes;},release:path=>pending.get(path)?.()};
}

test('projectile art resolves only its explicit owner, edition and active projectile slot',()=>{
  const art=artFor(),registry=registryFor(art),move=shot().move;
  assert.equal(projectileBitmapFor(incubator,move,registry),art);
  for(const fighter of [{...incubator,source:'sh2'},getFighter('sh1_incubus_019')])assert.equal(projectileBitmapFor(fighter,move,registry),null);
  for(const changed of [{...move,key:'airSpecial'},{...move,enabled:false},{...move,projectile:false},{...move,trap:true}])
    assert.equal(projectileBitmapFor(incubator,changed,registry),null);
  const duplicate={...structuredClone(art),id:incubator.id+'.duplicate'};
  duplicate.frame.path=duplicate.frame.path.replace(art.id,duplicate.id);
  assert.throws(()=>validateProjectileRegistry({...registry,[duplicate.id]:duplicate}),/ambiguous/);
  assert.throws(()=>projectileBitmapFor(incubator,move,{...registry,[duplicate.id]:duplicate}),/ambiguous/);
});

test('unversioned, oversized and invalid artwork metadata cannot become a runtime effect',()=>{
  const original=artFor();assert.equal(validateProjectileBitmap(original),original);
  for(const mutate of [art=>delete art.fighterId,art=>art.fidelity='verified',art=>art.slots.push(art.slots[0]),
    art=>art.frame.path='../sprite.png',art=>art.frame.sha256='b'.repeat(64),art=>art.frame.width=4097,
    art=>{art.frame.width=4096;art.frame.height=4096;},art=>art.presentation.heightInRadii=Infinity,
    art=>art.presentation.composite='destination-out',art=>art.frame.framingBounds=[0,0,300,128],
    art=>art.presentation.groundBaseline=.75]){
    const art=structuredClone(original);mutate(art);assert.throws(()=>validateProjectileBitmap(art),/Projectile bitmap/);
  }
});

test('raster placement preserves aspect, emitted direction and exact floor contact without mutating flight',()=>{
  const art=artFor(),p=shot(),before=structuredClone(p),placed=projectileBitmapPlacement(p,art);
  assert.equal(placed.width/placed.height,2);assert.equal(placed.flip,1);
  assert.deepEqual(p,before);
  p.owner.facing=-1;assert.equal(projectileBitmapPlacement(p,art).flip,1,'caster turning after emission cannot flip the travelling effect');
  p.vx=-8;assert.equal(projectileBitmapPlacement(p,art).flip,-1);
  const flame=artFor(god,{ground:true}),ground={...shot(god),y:582,groundY:582};
  const placement=projectileBitmapPlacement(ground,flame);
  assert.equal(placement.y+placement.localY+placement.height,594);
  flame.presentation.groundBaseline=.75;
  const glow=projectileBitmapPlacement(ground,flame);
  assert.equal(glow.y+glow.localY+glow.height*.75,594,'native bright baseline, not lower glow, touches the floor');
  assert.ok(glow.y+glow.localY+glow.height>594,'original translucent glow can extend below contact line');
  assert.equal(projectileBitmapPlacement({...ground,groundY:undefined},flame),null);
  assert.equal(projectileBitmapPlacement({...ground,radius:NaN},flame),null);
  const wide=structuredClone(art);wide.frame.width=4096;
  assert.ok(projectileBitmapPlacement(p,wide).width<=p.radius*12);
});

test('failed optional image keeps fallback and is not requested each render; match prewarm can retry',async()=>{
  const art=artFor(),registry=registryFor(art),h=harness(),p=shot(),ctx=context();
  h.held.add(art.frame.path);h.failures.add(art.frame.path);
  assert.equal(drawProjectileBitmap(ctx,p,{cache:h.cache,registry}).kind,'loading');
  assert.equal(h.created,1);assert.equal(drawProjectileBitmap(ctx,p,{cache:h.cache,registry}).kind,'loading');
  const pending=h.cache.load(art.frame);h.release(art.frame.path);await pending;
  assert.equal(drawProjectileBitmap(ctx,p,{cache:h.cache,registry}).kind,'error');
  assert.equal(drawProjectileBitmap(ctx,p,{cache:h.cache,registry}).kind,'error');
  assert.equal(h.created,1);assert.equal(ctx.calls.length,0);
  h.failures.clear();h.held.clear();
  assert.equal((await prepareProjectileBitmaps([incubator],{cache:h.cache,registry})).ok,true);
  assert.equal(h.created,2);assert.equal(drawProjectileBitmap(ctx,p,{cache:h.cache,registry}).kind,'raster');
  assert.equal(ctx.calls.filter(call=>call[0]==='drawImage').length,1);
  const lost=context();lost.drawImage=()=>{throw new Error('surface unavailable');};
  assert.equal(drawProjectileBitmap(lost,p,{cache:h.cache,registry}).kind,'error');
  assert.equal(lost.calls.at(-1)[0],'restore','failed draw restores canvas before the engine fallback');
});

test('dedicated projectile LRU stays within its byte budget when more effects are warmed than fit',async()=>{
  const registry={};
  for(const [index,slot] of ['neutralSpecial','super','desperation'].entries()){
    const art=artFor(incubator,{id:incubator.id+'.fixture'+index,slot,sha:String(index+1).repeat(64)});registry[art.id]=art;
  }
  const maxBytes=256*128*4*2,h=harness({maxBytes});
  const result=await prepareProjectileBitmaps([incubator],{cache:h.cache,registry});
  assert.equal(result.ok,true);assert.equal(h.created,3);assert.ok(h.peakBytes<=maxBytes);
  assert.ok(h.cache.bytes+h.cache.reservedBytes<=maxBytes);assert.equal(h.cache.pins.size,0);
});

test('FightEngine paints one ready bitmap and retains its original visible fallback on failure',()=>{
  const art=artFor(),p=shot(),before=structuredClone(p),ctx=context(),path=art.frame.path;
  const previousArt=PROJECTILE_BITMAPS[art.id],previous=projectileBitmapCache.entries.get(path);
  // Existing production routes are temporarily removed only inside this isolated renderer fixture.
  const displaced=Object.entries(PROJECTILE_BITMAPS).filter(([,entry])=>entry.fighterId===art.fighterId&&entry.source===art.source);
  for(const [id] of displaced)delete PROJECTILE_BITMAPS[id];
  PROJECTILE_BITMAPS[art.id]=art;
  try{
    projectileBitmapCache.entries.set(path,{status:'ready',image:{fixture:true},frame:art.frame,used:0});
    FightEngine.prototype.renderProjectiles.call({projectiles:[p]},ctx);
    assert.equal(ctx.calls.filter(call=>call[0]==='drawImage').length,1);
    assert.equal(ctx.calls.filter(call=>call[0]==='arc').length,0);
    assert.deepEqual(p,before);
    projectileBitmapCache.entries.set(path,{status:'error',frame:art.frame,used:0});
    const failed=context();FightEngine.prototype.renderProjectiles.call({projectiles:[p]},failed);
    assert.equal(failed.calls.filter(call=>call[0]==='drawImage').length,0);
    assert.equal(failed.calls.filter(call=>call[0]==='arc').length,4);
    assert.deepEqual(p,before);
  }finally{
    if(previousArt)PROJECTILE_BITMAPS[art.id]=previousArt;else delete PROJECTILE_BITMAPS[art.id];
    for(const [id,entry] of displaced)PROJECTILE_BITMAPS[id]=entry;
    if(previous)projectileBitmapCache.entries.set(path,previous);else projectileBitmapCache.entries.delete(path);
  }
});

function transparentPng(){
  const w=256,h=128,header=Buffer.alloc(13),rows=Buffer.alloc(h*(1+w*4));
  header.writeUInt32BE(w);header.writeUInt32BE(h,4);header[8]=8;header[9]=6;
  for(let y=24;y<h-24;y++)for(let x=24;x<w-24;x++){
    const at=y*(1+w*4)+1+x*4;rows[at]=120;rows[at+1]=180;rows[at+2]=240;rows[at+3]=255;
  }
  const chunk=(type,data)=>{const name=Buffer.from(type),length=Buffer.alloc(4),crc=Buffer.alloc(4);
    length.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([name,data])));return Buffer.concat([length,name,data,crc]);};
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]);
}

test('build validates source slots and PNG bytes before updating offline entries; new artwork invalidates the cache',async t=>{
  const root=await mkdtemp(join(tmpdir(),'halo-projectile-build-'));t.after(()=>rm(root,{recursive:true,force:true}));
  await mkdir(join(root,'assets/projectiles'),{recursive:true});await mkdir(join(root,'src'));
  const bytes=transparentPng(),sha=createHash('sha256').update(bytes).digest('hex'),art=artFor(incubator,{sha}),registry=registryFor(art);
  art.frame.bytes=bytes.length;await writeFile(join(root,art.frame.path),bytes);
  const worker="const kept = 'untouched';\nconst ASSETS = [\n  // PROJECTILE_BITMAP_ASSETS_BEGIN\n  // PROJECTILE_BITMAP_ASSETS_END\n];\n";
  await writeFile(join(root,'service-worker.js'),worker);
  await writeFile(join(root,'src/sprite-manifest.js'),'actors');await writeFile(join(root,'src/stage-bitmap-manifest.js'),'stages');
  await writeFile(join(root,'src/projectile-origin.js'),await readFile(new URL('../src/projectile-origin.js',import.meta.url)));
  const oldRevision=await bitmapRevision(root);
  await writeFile(join(root,'src/projectile-bitmap-manifest.js'),JSON.stringify(registry));
  assert.notEqual(await bitmapRevision(root),oldRevision);
  const result=await buildProjectileBitmaps({root,registry});assert.equal(result.effects,1);assert.equal(result.slots,1);
  assert.equal(result.animatedClips,0);assert.equal(result.certified,0);
  const updated=await readFile(join(root,'service-worker.js'),'utf8');assert.ok(updated.includes('/'+art.frame.path));
  assert.ok(updated.startsWith("const kept = 'untouched';"));
  await buildProjectileBitmaps({root,registry});assert.equal(await readFile(join(root,'service-worker.js'),'utf8'),updated);
  art.frame.bytes++;await assert.rejects(buildProjectileBitmaps({root,registry}),/metadata mismatch/);art.frame.bytes--;
  art.presentation.anchor='ground';await assert.rejects(buildProjectileBitmaps({root,registry}),/floor anchor/);art.presentation.anchor='center';
  art.slots=['neutralHeavy'];await assert.rejects(buildProjectileBitmaps({root,registry}),/not an enabled projectile/);
  assert.equal(await readFile(join(root,'service-worker.js'),'utf8'),updated);
});

test('every declared production effect has its own readable PNG and a documented active route',async()=>{
  const report=await auditProjectileBitmaps();
  assert.equal(report.effects,Object.keys(PROJECTILE_BITMAPS).length);
  assert.equal(report.animatedClips,0);assert.equal(report.certified,0);
});
