import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,STAGES,createCombatProfile} from '../src/data.js';
import {FightEngine} from '../src/fight.js';
import {bodyBox} from '../src/combat-geometry.js';
import {combatReferenceRecipe,sourceContactBand,sourceWhiffExposure} from '../src/combat-reference-policy.js';

const SYRINGE='origins_faceless_nurse',SCALPEL='homecoming_nurse',NEEDLER='homecoming_needler_088';
const LURKER='homecoming_lurker_085',SCARLET='homecoming_scarlet_spider_form_095',FERAL='homecoming_feral_086';
const SUBJECTS=[SYRINGE,SCALPEL,NEEDLER,LURKER,SCARLET,FERAL];
const SPECIALS=['neutralSpecial','forwardSpecial','downSpecial','super','desperation'];
const KEYS=Object.fromEntries(SUBJECTS.map(id=>[id,id===FERAL?['neutralLight','forwardLight','crouchLight','neutralHeavy','forwardHeavy']:SPECIALS]));
const fighter=id=>ROSTER.find(f=>f.id===id),engines=new Set();
afterEach(()=>{for(const e of engines)e.destroy();engines.clear();});
function ticks(e,n){for(let i=0;i<n;i++)e.update();}
function engineFor(id,index=0,target='sh3_nurse_revolver_044'){
 globalThis.window={};globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};
 globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
 Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});
 globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;
 const gradient=()=>({addColorStop(){}}),ctx=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient,measureText:t=>({width:String(t).length*7})},{get:(t,k)=>k in t?t[k]:()=>{}});
 const e=new FightEngine({getContext:()=>ctx},{p1:fighter(index?target:id),p2:fighter(index?id:target),stage:STAGES[0],mode:'local',roundsToWin:2,timeLimit:99,seed:121101,stageHazards:false,stageDirector:false,otherworldShift:false,fatalities:false});
 engines.add(e);ticks(e,e.phaseTimer);e.actors.forEach((a,i)=>Object.assign(a,{x:i?620:500,y:594,vx:0,vy:0,facing:i?-1:1,state:'idle',grounded:true,invuln:0}));
 return e;
}
function prepare(e,a,key){
 a.meter=100;
 if(key==='desperation'){
  a.health=Math.floor(a.maxHealth*.3);
  for(let n=0;n<220;n++){const next=a.bossPhases[a.bossPhaseIndex+1];if(!a.phaseLock&&(!a.data.boss||!next||a.health/a.maxHealth>next.threshold))break;e.update();}
 }
 assert.equal(e.beginAttack(a,key),true,a.data.id+':'+key);
}
function exercise(id,key,index=0,{target='sh3_nurse_revolver_044',behind=false,high=false,far=false}={}){
 const e=engineFor(id,index,target),a=e.actors[index],b=e.actors[1-index];
 a.x=500;a.facing=1;b.x=behind?320:far?1190:610;b.facing=-1;
 if(high){b.y=80;b.grounded=false;b.vy=-20;}
 const startX=a.x,health=b.health;let emitted=0,hits=0,highest=a.y,knockdown=false;
 const spawn=e.spawnProjectile;e.spawnProjectile=function(...args){const count=this.projectiles.length,result=spawn.apply(this,args);emitted+=this.projectiles.length-count;return result;};
 prepare(e,a,key);
 for(let n=0;n<100;n++){
  if(high){b.y=80;b.vy=-20;b.grounded=false;}
  e.update();highest=Math.min(highest,a.y);hits=Math.max(hits,a.attack?.hitCount||0);knockdown ||=b.knockdownTimer>0;
 }
 return {e,a,b,startX,health,emitted,hits,highest,knockdown};
}

test('thirty new lot12 commands bind exact editions to short physical weapon, limb and mouth contacts',()=>{
 const rowIds=[];
 for(const id of SUBJECTS){const f=fighter(id),p=createCombatProfile(f);
  for(const key of KEYS[id]){rowIds.push(id+':'+key);const m=p.moves[key];
   assert.equal(m.enabled,true);assert.equal(m.sourceTimingMeasured,false);
   const band=sourceContactBand(f,m);assert.ok(band);assert.equal(band.sourceTimingMeasured,false);
   assert.ok(band.height<=100);assert.ok(m.reach<=245);assert.equal(m.effect,null);
   assert.equal(m.projectile,false);assert.equal(m.trap,false);assert.equal(m.aura,false);assert.equal(m.teleport,null);
   assert.equal(m.unblockable,false);assert.equal(m.armorFrames,0);assert.equal(m.invulnFrames,0);
   assert.equal(m.launch,0);assert.equal(m.groundBounce,false);assert.equal(m.hardKnockdown,false);
  }
  for(const wrong of [{...f,source:'film'},{...f,id:'borrowed-'+id,baseId:id}]){
   assert.deepEqual(combatReferenceRecipe(wrong),{});assert.equal(sourceContactBand(wrong,p.moves[KEYS[id][0]]),null);
  }
 }
 assert.equal(rowIds.length,30);assert.equal(new Set(rowIds).size,30);
});

for(const id of SUBJECTS)for(const key of KEYS[id])test(id+':'+key+' connects locally from either player without ranged or status damage',()=>{
 for(const index of [0,1]){const r=exercise(id,key,index);
  assert.ok(r.b.health<r.health,id+':'+key+' player '+index+' must connect');assert.ok(r.hits>0);
  assert.ok(r.hits<=r.a.profile.moves[key].hits);assert.equal(r.emitted,0);assert.equal(r.b.status,null);
  if(id===SCALPEL&&['super','desperation'].includes(key))assert.equal(r.hits,2,'both authored close knife contacts must actually resolve');
  assert.equal(r.a.stats.damageDealt,r.health-r.b.health);assert.equal(r.b.stats.damageTaken,r.health-r.b.health);
  assert.equal(r.knockdown,id===NEEDLER||id===LURKER&&['forwardSpecial','super','desperation'].includes(key));
  if([LURKER,SCARLET].includes(id)&&['forwardSpecial','super','desperation'].includes(key)){
   assert.ok(r.highest<594,'the authored leap physically leaves the floor');assert.ok(r.a.x>r.startX);
  }else assert.equal(r.highest,594);
 }
});

for(const id of SUBJECTS)test(id+' thirty source-owned contacts cannot hit behind, far across the arena, or high above',()=>{
 for(const key of KEYS[id])for(const options of [{behind:true},{high:true},{far:true}]){
  const r=exercise(id,key,0,options);assert.equal(r.b.health,r.health,key+JSON.stringify(options));assert.equal(r.hits,0);assert.equal(r.emitted,0);
 }
});

test('Origins syringe and Homecoming scalpel remain separate close tools with no poison or projectile syringe',()=>{
 for(const id of [SYRINGE,SCALPEL]){const p=createCombatProfile(fighter(id));
  for(const key of KEYS[id]){assert.match(p.moves[key].name,id===SYRINGE?/Seringue/:/Scalpel/);
   assert.doesNotMatch(p.moves[key].name,id===SYRINGE?/Scalpel|Tuyau/:/Seringue|Tuyau/);}
 }
 assert.equal(createCombatProfile(fighter(SYRINGE)).moves.super.hits,1);
 assert.equal(createCombatProfile(fighter(SCALPEL)).moves.super.hits,2);
});

test('Feral ordinary bites remain inside the low canine body and can physically reach a floor insect',()=>{
 for(const key of KEYS[FERAL]){const r=exercise(FERAL,key,0,{target:'sh1_creeper_009'});
  const band=sourceContactBand(r.a.data,r.a.profile.moves[key]),body=bodyBox(r.a);
  assert.ok(r.a.y-band.footOffset-band.height/2>=body.y,'mouth contact cannot float above the whole canine body');
  assert.ok(r.a.y-band.footOffset+band.height/2<=body.y+body.h);
  assert.ok(r.b.health<r.health,key);assert.equal(r.hits,1);assert.equal(r.knockdown,false);
 }
});

test('Needler offensive bands do not change its source frontal defense or permit borrowed backward sweeps',()=>{
 const p=createCombatProfile(fighter(NEEDLER));assert.deepEqual(p.referencePolicy.defense,{frontalVisibleBullets:true,frontalMelee:true,silencedBullets:true});
 for(const key of KEYS[NEEDLER]){assert.equal(p.moves[key].hits,1);assert.equal(p.moves[key].knockdown,true);}
 assert.equal(p.moves.backSpecial.enabled,false);assert.equal(p.moves.backThrow.enabled,false);
});

test('an explicit source recipe can refuse desperation armor while the unspecified versus fallback remains available',()=>{
 for(const id of [SYRINGE,SCALPEL,NEEDLER,LURKER,SCARLET])assert.equal(createCombatProfile(fighter(id)).moves.desperation.armorFrames,0,id);
 assert.equal(createCombatProfile(fighter('sh1_air_screamer_001')).moves.desperation.armorFrames,16);
 assert.equal(createCombatProfile(fighter('sh3_god_050')).moves.desperation.armorFrames,28);
});

for(const key of ['forwardSpecial','super','desperation'])test('Scarlet '+key+' missed physical leap exposes the real recovery and freezes in pause',()=>{
 const e=engineFor(SCARLET),[a,b]=e.actors;a.x=300;b.x=1190;prepare(e,a,key);
 for(let n=0;n<130&&a.attack?.frame<a.attack.move.startup+a.attack.move.active;n++)e.update();
 assert.ok(a.attack);assert.equal(a.attack.hitCount,0);assert.equal(a.attack.hit,false);
 const exposure=sourceWhiffExposure(a.data,a.attack);assert.equal(exposure?.rearOnly,true);assert.equal(exposure?.damageScale,2);
 assert.equal(e.sourceCombatCue(a),'DOS EXPOSÉ · VERSUS');
 const frame=a.attack.frame;e.togglePause(true);ticks(e,20);assert.equal(a.attack.frame,frame);assert.ok(sourceWhiffExposure(a.data,a.attack));
 e.togglePause(false);ticks(e,a.attack.move.recovery+2);assert.equal(a.attack,null);assert.equal(sourceWhiffExposure(a.data,a.attack),null);
});

test('Scarlet new leap recovery amplifies native rear firearm damage after an actual miss, never front or landed-leap damage',()=>{
 function damage(key,rear,miss){const e=engineFor(SCARLET),[a,b]=e.actors;a.x=300;b.x=miss?1190:410;prepare(e,a,key);
  for(let n=0;n<130&&a.attack?.frame<a.attack.move.startup+a.attack.move.active;n++)e.update();
  assert.ok(a.attack);assert.equal(a.attack.hitCount===0,miss);assert.equal(!!sourceWhiffExposure(a.data,a.attack),miss);
  a.facing=rear?1:-1;const health=a.health;e.applyHit(b,a,b.profile.moves.neutralSpecial,12043,1,{ranged:true,direction:1});
  assert.ok(a.health<health);
  return health-a.health;
 }
 for(const key of ['super','desperation']){const base=damage(key,false,true),rear=damage(key,true,true),landed=damage(key,true,false);
  assert.ok(Math.abs(rear-base*2)<=1,key);assert.equal(landed,base,key);
 }
});
