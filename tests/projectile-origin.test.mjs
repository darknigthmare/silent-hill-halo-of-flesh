import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,STAGES} from '../src/data.js';
import {FightEngine} from '../src/fight.js';
import {SPRITES} from '../src/sprite-manifest.js';
import {actorSpriteState} from '../src/sprite-animation.js';
import {rasterPlacement} from '../src/sprite-system.js';
import {bodyBox} from '../src/combat-geometry.js';
import {sweptProjectileContact} from '../src/combat-resolution.js';
import {spriteProjectileOrigin,PROJECTILE_ORIGIN_REFERENCES} from '../src/projectile-origin.js';

const WALTER='sh4_man_with_the_coat_067',EDDIE='sh2_eddie_dombrowski_032';
const fighter=id=>ROSTER.find(f=>f.id===id),engines=new Set();
afterEach(()=>{for(const e of engines)e.destroy();engines.clear();});
const approx=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} differs from ${b}`);
function ticks(e,n){for(let i=0;i<n;i++)e.update();}
function make(id,side=0){
  globalThis.window={};globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};
  globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
  Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});
  globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;
  const context=new Proxy({measureText:t=>({width:String(t).length*7})},{get:(o,k)=>o[k]||(()=>{})});
  const opponent=fighter('bom_butcher_123');
  const e=new FightEngine({getContext:()=>context},{p1:side?opponent:fighter(id),p2:side?fighter(id):opponent,
    stage:STAGES.find(s=>s.id==='midwich_nightmare'),mode:'local',timeLimit:0,seed:732,
    stageHazards:false,stageDirector:false,otherworldShift:false,fatalities:false,stageTerrain:false});
  engines.add(e);for(let i=0;i<1000&&(e.phase!=='fight'||e.actors.some(a=>a.presentation));i++)e.update();
  assert.equal(e.phase,'fight');assert.ok(e.actors.every(a=>!a.presentation));return e;
}
function fire(e,index=0){
  const emissions=[],spawn=e.spawnProjectile;
  e.spawnProjectile=function(...args){const before=this.projectiles.length,result=spawn.apply(this,args);
    for(const shot of this.projectiles.slice(before))emissions.push({shot,spawn:{x:shot.x,y:shot.y,
      vx:shot.vx,vy:shot.vy,radius:shot.radius,life:shot.life,maxLife:shot.maxLife,damageScale:shot.damageScale,
      gravity:shot.gravity,homing:shot.homing,color:shot.color},origin:spriteProjectileOrigin(args[0],args[1])});
    return result;
  };
  e.setTouch(index?'p2':'p1','special','pressed');e.update();e.setTouch(index?'p2':'p1','special',false);
  for(let i=0;i<120&&!emissions.length;i++)e.update();
  assert.equal(emissions.length,1);return emissions[0];
}

for(const id of [WALTER,EDDIE])for(const side of [0,1])test(id+' emits at its exact raster muzzle in orientation '+(side?-1:1),()=>{
  const e=make(id,side),a=e.actors[side],before=structuredClone(a.profile.moves.neutralSpecial),emission=fire(e,side);
  const {shot,spawn,origin}=emission,reference=PROJECTILE_ORIGIN_REFERENCES[id],frame=SPRITES[id].frames[reference.frameIndex];
  assert.ok(origin);assert.equal(shot.launchOrigin.frameSHA256,reference.sha256);
  const p=rasterPlacement(a.data,frame,a.x,a.y,a.facing,actorSpriteState(a));
  approx(spawn.x,a.x+p.flip*(p.localX+reference.muzzlePixels[0]*p.scale));
  approx(spawn.y,a.y+p.localY+reference.muzzlePixels[1]*p.scale);
  approx(shot.x,spawn.x+spawn.vx);approx(shot.y,spawn.y+spawn.vy);
  assert.equal(Object.hasOwn(shot,'emissionSweepFrom'),false,'initial sweep is consumed once');
  assert.deepEqual({vx:spawn.vx,vy:spawn.vy,radius:spawn.radius,life:spawn.life,maxLife:spawn.maxLife,
    damageScale:spawn.damageScale,gravity:spawn.gravity,homing:spawn.homing},
    {vx:(side?-1:1)*12,vy:0,radius:14.16,life:60,maxLife:60,damageScale:1,gravity:0,homing:0});
  assert.deepEqual(a.profile.moves.neutralSpecial,before,'combat recipe is unchanged');
  const gradients=[],ctx=new Proxy({createRadialGradient:(...args)=>{gradients.push(args);return {addColorStop(){}};}},
    {get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>{o[k]=v;return true;}});
  e.renderProjectiles(ctx);assert.equal(gradients.length,1);approx(gradients[0][0],shot.x);approx(gradients[0][1],shot.y);
  ticks(e,100);assert.equal(a.attack,null);assert.equal(a.state,'idle');
  assert.equal(spriteProjectileOrigin(a,a.profile.moves.neutralSpecial),null,'recovery cannot reuse an old muzzle');
});

test('strict origin binding refuses other identities, sources, moves, states and stale art',()=>{
  const e=make(WALTER),a=e.actors[0];fire(e);const move=a.profile.moves.neutralSpecial;
  assert.ok(spriteProjectileOrigin(a,move));
  for(const change of [
    {data:{...a.data,id:'sh4_walter_sullivan_072'}},{data:{...a.data,source:'sh2'}},
    {grounded:false},{crouching:true},{facing:0},{x:NaN},{y:Infinity},{attack:null},
    {attack:{...a.attack,frame:move.startup-1}},{attack:{...a.attack,frame:move.startup+move.active}},
    {attack:{...a.attack,key:'super'}},{hurtFrames:1},{ko:true},{phaseLock:1},{knockdownTimer:1}
  ])assert.equal(spriteProjectileOrigin({...a,...change},move),null,JSON.stringify(change));
  assert.equal(spriteProjectileOrigin(a,{...move}),null,'a copied move is not the active owned recipe');
  assert.equal(spriteProjectileOrigin(a,a.profile.moves.super),null);
  assert.equal(spriteProjectileOrigin(a,a.profile.moves.desperation),null);
  for(const modify of [
    art=>{art.source='sh2';},art=>{art.fighterId='sh4_walter_sullivan_072';},
    art=>{art.frames[1].sha256='0'.repeat(64);},art=>{art.frames[1].path='assets/sprites/other.png';},
    art=>{art.frames[1].width++;},art=>{art.frames[1].facing=-1;},
    art=>{art.frames[1].anchor=[NaN,.5];},art=>{art.frames[1].bodyHeight=0;},
    art=>{delete art.clips.neutralSpecial;},art=>{art.clips.neutralSpecial.frames=[0];},
    art=>{art.clips.neutralSpecial.loop=true;},art=>{art.clips.neutralSpecial.frames=[1,0];}
  ]){const art=structuredClone(SPRITES[WALTER]);modify(art);assert.equal(spriteProjectileOrigin(a,move,{registry:{[WALTER]:art}}),null);}
});

test('muzzle projection follows actor translation and renderer calibration without image loading',()=>{
  const e=make(EDDIE),a=e.actors[0];fire(e);const move=a.profile.moves.neutralSpecial,first=spriteProjectileOrigin(a,move);
  const shifted=spriteProjectileOrigin({...a,x:a.x+173,y:a.y-23},move);
  approx(shifted.x-first.x,173);approx(shifted.y-first.y,-23);
  const mirrored=spriteProjectileOrigin({...a,facing:-1},move);approx(first.x+mirrored.x,2*a.x);approx(first.y,mirrored.y);
  const art=structuredClone(SPRITES[EDDIE]);art.frames[1].anchor=[.45,.98];art.frames[1].bodyHeight=.95;
  const calibrated=spriteProjectileOrigin(a,move,{registry:{[EDDIE]:art}});
  const p=rasterPlacement(a.data,art.frames[1],a.x,a.y,a.facing,actorSpriteState(a));
  approx(calibrated.x,a.x+p.flip*(p.localX+997*p.scale));approx(calibrated.y,a.y+p.localY+261*p.scale);
});

for(const id of [WALTER,EDDIE])for(const side of [0,1])test(id+' preserves real hit, guard and recovery in orientation '+(side?-1:1),()=>{
  for(const guard of [false,true]){
    const e=make(id,side),target=e.actors[1-side];
    if(guard){e.setTouch(side?'p1':'p2','guard',true);ticks(e,12);}
    const health=target.health,guardBefore=target.guard,{shot}=fire(e,side);
    for(let i=0;i<100&&e.projectiles.includes(shot);i++)e.update();
    assert.equal(shot.hit,true,'moving projectile contacts the ordinary standing target');
    assert.ok(target.health<health,'damage or normal-guard chip resolves');
    if(guard){assert.ok(target.guard<guardBefore);assert.equal(target.lastHit.moveKey,'neutralSpecial-guard-chip');}
    else assert.ok(target.stats.damageTaken>0);
    assert.equal(e.projectiles.includes(shot),false,'one projectile cannot hit again');
    const once=target.health;ticks(e,20);assert.equal(target.health,once);
  }
});

for(const id of [WALTER,EDDIE])for(const side of [0,1])test(id+' resolves one emission overlap before a near target can be skipped, orientation '+(side?-1:1),()=>{
  const e=make(id,side),a=e.actors[side],target=e.actors[1-side];fire(e,side);
  // Controlled collision fixture: overlap the target behind the muzzle after
  // input-driven setup; this is not presented as a naturally played match.
  e.projectiles.length=0;target.x=a.x+a.facing*16;target.invuln=0;const hp=target.health;
  e.spawnProjectile(a,a.profile.moves.neutralSpecial,a.attack.id);const shot=e.projectiles[0];
  const bounds=bodyBox(target);assert.ok(a.facing>0?shot.x-shot.radius>bounds.x+bounds.w:shot.x+shot.radius<bounds.x);
  assert.ok(sweptProjectileContact(shot.emissionSweepFrom,shot,shot.radius,bounds));
  e.updateProjectiles();assert.equal(shot.hit,true);assert.ok(target.health<hp);assert.equal(e.projectiles.length,0);
});

test('an invulnerable near target is not struck later by an already consumed emission segment',()=>{
  const e=make(EDDIE),a=e.actors[0],target=e.actors[1];fire(e);e.projectiles.length=0;
  target.x=a.x+16;target.invuln=1;const hp=target.health;e.spawnProjectile(a,a.profile.moves.neutralSpecial,a.attack.id);
  const shot=e.projectiles[0];e.updateProjectiles();assert.equal(shot.hit,false);assert.equal(target.health,hp);
  assert.equal(Object.hasOwn(shot,'emissionSweepFrom'),false);target.invuln=0;e.updateProjectiles();
  assert.equal(shot.hit,false);assert.equal(target.health,hp);
});

test('the corrected high revolver shot can pass above the actual crouching hurtbox',()=>{
  const e=make(EDDIE),target=e.actors[1];e.setTouch('p2','down',true);ticks(e,2);assert.equal(target.crouching,true);
  const health=target.health,{shot}=fire(e);assert.ok(shot.y+shot.radius<bodyBox(target).y);
  ticks(e,80);assert.equal(shot.hit,false);assert.equal(target.health,health);assert.equal(e.projectiles.includes(shot),false);
});

test('supers and the other Walter form keep the old generic origin and projectile parameters',()=>{
  for(const [id,key] of [[WALTER,'super'],[EDDIE,'desperation'],['sh4_walter_sullivan_072','neutralSpecial']]){
    const e=make(id),a=e.actors[0],move=a.profile.moves[key],b=bodyBox(a);e.spawnProjectile(a,move,91);
    assert.ok(e.projectiles.length>0);const count=e.projectiles.length;
    for(const [index,shot] of e.projectiles.entries()){
      const spread=index-(count-1)/2;
      approx(shot.x,a.x+a.facing*(b.w*.45+Math.abs(spread)*18));approx(shot.y,b.y+b.h*.45-Math.abs(spread)*16);
      assert.equal(shot.launchOrigin,undefined);assert.equal(shot.emissionSweepFrom,undefined);
    }
  }
});
