import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,STAGES,createCombatProfile} from '../src/data.js';
import {FightEngine} from '../src/fight.js';
import {bodyBox} from '../src/combat-geometry.js';
import {combatReferenceRecipe,combatReferencePolicy,sourceGroundContact,sourceDistanceWeapon,sourceContactBand,
  sourceStandingStruggle,sourceSuspendedStruggle,isFirearmProjectile} from '../src/combat-reference-policy.js';

const NURSE='sh3_nurse_revolver_044';
const fighter=id=>ROSTER.find(f=>f.id===id),engines=new Set();
afterEach(()=>{for(const e of engines)e.destroy();engines.clear();});
function ticks(e,n){for(let i=0;i<n;i++)e.update();}
function engineFor(p1='sh1_groaner_003',p2=NURSE){
  globalThis.window={};globalThis.localStorage={getItem(){return null;},setItem(){},removeItem(){}};
  globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
  Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});
  globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;
  const gradient=()=>({addColorStop(){}}),context=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient,
    measureText:t=>({width:String(t).length*7})},{get:(t,k)=>k in t?t[k]:()=>{},set:(t,k,v)=>{t[k]=v;return true;}});
  const e=new FightEngine({getContext:()=>context},{p1:typeof p1==='string'?fighter(p1):p1,p2:typeof p2==='string'?fighter(p2):p2,
    stage:STAGES[0],mode:'local',roundsToWin:2,timeLimit:99,seed:717,stageHazards:false,stageDirector:false,
    otherworldShift:false,fatalities:false});engines.add(e);ticks(e,e.phaseTimer);assert.equal(e.phase,'fight');
  e.actors.forEach((a,i)=>Object.assign(a,{x:i?650:500,y:594,vx:0,vy:0,facing:i?-1:1,state:'idle',grounded:true,invuln:0}));return e;
}


const CARRION='origins_carrion_076',CALIBAN='origins_caliban_079',MANDARIN='sh2_mandarin_026';
const PYRAMID='sh2_red_pyramid_thing_great_knife_029',JACKET='origins_straight_jacket_074',EDDIE='sh2_eddie_dombrowski_032';
const LOW=['neutralSpecial','forwardSpecial','downSpecial','super','desperation'];
const NURSE_KEYS=['neutralSpecial','forwardSpecial','backSpecial','super','desperation'];
const PYRAMID_KEYS=['forwardHeavy','neutralSpecial','throw','super','desperation'];
const JACKET_KEYS=['neutralSpecial','forwardSpecial','throw','super','desperation'];
const SIX=[CARRION,CALIBAN,MANDARIN,PYRAMID,JACKET,NURSE];
function prepare(e,key,index=0){const a=e.actors[index];a.meter=100;
 if(key==='desperation'){
  a.health=Math.floor(a.maxHealth*.3);
  for(let n=0;n<220;n++){
   const next=a.bossPhases[a.bossPhaseIndex+1];
   if(!a.phaseLock&&(!a.data.boss||!next||a.health/a.maxHealth>next.threshold))break;e.update();
  }
 }
 assert.equal(e.beginAttack(a,key),true,key);return a;
}
function observeEmissions(e){let emitted=0;const original=e.spawnProjectile;
 e.spawnProjectile=function(...args){const before=this.projectiles.length;const result=original.apply(this,args);emitted+=this.projectiles.length-before;return result;};
 return ()=>emitted;
}
function physical(id,key){const e=engineFor(id),[a,b]=e.actors;a.x=500;b.x=id===MANDARIN||id===PYRAMID?640:690;
 const health=b.health,emitted=observeEmissions(e);prepare(e,key);let highest=a.y,hits=0,down=false;
 for(let n=0;n<130;n++){e.update();highest=Math.min(highest,a.y);hits=Math.max(hits,a.attack?.hitCount||0);down ||= b.knockdownTimer>0;}
 return {e,a,b,health,highest,hits,down,emitted:emitted()};
}
function handGrip(index=0,key='neutralSpecial',victimId=NURSE){
 const e=index?engineFor(victimId,PYRAMID):engineFor(PYRAMID,victimId),source=e.actors[index],victim=e.actors[1-index];
 source.x=500;source.facing=1;victim.x=610;victim.facing=-1;
 assert.equal(e.beginAttack(source,key),true);for(let n=0;n<100&&!victim.status?.struggleOrigin;n++)e.update();
 while(e.hitstop>0)e.update();assert.equal(victim.status?.struggleOrigin?.id,PYRAMID);return {e,source,victim};
}
function arrows(e,index){const p=index?'p2':'p1';for(let n=0;n<6;n++){
 e.setTouch(p,'left',n%2===0);e.setTouch(p,'right',n%2!==0);ticks(e,1);
 e.setTouch(p,'left',false);e.setTouch(p,'right',false);
}}

test('the thirty exact-source slots are new to lot10 and keep every source timing unmeasured',()=>{
 const slots=new Map([[CARRION,LOW],[CALIBAN,LOW],[MANDARIN,LOW],[PYRAMID,PYRAMID_KEYS],[JACKET,JACKET_KEYS],[NURSE,NURSE_KEYS]]);
 const ids=[];for(const[id,keys]of slots){const data=fighter(id),p=createCombatProfile(data);
  for(const key of keys){ids.push(id+':'+key);assert.equal(p.moves[key].enabled,true);assert.equal(p.moves[key].sourceTimingMeasured,false);}
  for(const wrong of [{...data,source:'film'},{...data,id:'other-'+id,baseId:id}])assert.deepEqual(combatReferenceRecipe(wrong),{});
 }
 assert.equal(ids.length,30);assert.equal(new Set(ids).size,30);
 assert.equal(sourceSuspendedStruggle(fighter('sh2_red_pyramid_thing_spear_030'),createCombatProfile(fighter(PYRAMID)).moves.throw),null);
 assert.equal(sourceSuspendedStruggle(fighter('film_red_pyramid_film_175'),createCombatProfile(fighter(PYRAMID)).moves.throw),null);
});

for(const id of [CARRION,CALIBAN])for(const key of LOW)test(id+':'+key+' is a bounded low physical body or limb strike without a generated beam',()=>{
 const {a,b,health,highest,hits,down,emitted}=physical(id,key);
 assert.ok(b.health<health,id+key);assert.equal(highest,594);assert.ok(hits>0);assert.ok(down);assert.equal(emitted,0);
 assert.equal(a.profile.moves[key].level,'low');assert.ok(sourceContactBand(a.data,a.profile.moves[key]));
 assert.equal(a.profile.moves[key].projectile,false);assert.equal(a.profile.moves[key].aura,false);assert.equal(a.profile.moves[key].teleport,null);
 if(id===CARRION)assert.ok(a.x>500);
});

for(const key of LOW)test(MANDARIN+':'+key+' strikes only the local ground support from its fixed actor',()=>{
 const {e,a,b,health,hits,emitted}=physical(MANDARIN,key);
 assert.ok(b.health<health);assert.equal(hits,1);assert.equal(emitted,0);assert.equal(a.x,500);assert.equal(a.y,594);
 assert.equal(a.profile.referencePolicy.canMove,false);assert.equal(a.profile.referencePolicy.canJump,false);
 assert.equal(sourceGroundContact(a.data,a.profile.moves[key]),true);assert.equal(b.knockdownTimer,0);
 assert.equal(sourceGroundContact({...a.data,source:'sh2r'},a.profile.moves[key]),false);
 const jumping=engineFor(MANDARIN),[m,n]=jumping.actors;m.x=500;n.x=640;prepare(jumping,key);
 ticks(jumping,Math.max(0,m.profile.moves[key].startup-7));jumping.setTouch('p2','jump','pressed');
 ticks(jumping,m.profile.moves[key].active+35);assert.equal(n.health,n.maxHealth);assert.equal(m.stats.damageDealt,0);
});

test('Mandarin cannot turn tendrils into anti-air contact through a floating grounded flag or another source',()=>{
 const e=engineFor(MANDARIN,'sh4_hummer_055'),[a,b]=e.actors,before=b.health;
 assert.equal(b.grounded,true);assert.equal(e.applyHit(a,b,a.profile.moves.neutralSpecial,1001),false);assert.equal(b.health,before);
 for(const wrong of [{...a.data,id:'floor-form',baseId:MANDARIN},{...a.data,source:'sh2r'}])
  assert.equal(sourceGroundContact(wrong,a.profile.moves.neutralSpecial),false);
});

for(const key of ['forwardHeavy','super','desperation'])test(PYRAMID+':'+key+' uses its own bounded Great Knife strike instead of an inherited multi-hit field',()=>{
 const {a,b,health,hits,emitted}=physical(PYRAMID,key);
 assert.ok(b.health<health);assert.equal(hits,1);assert.equal(emitted,0);
 assert.ok(sourceContactBand(a.data,a.profile.moves[key]));assert.equal(a.profile.moves[key].aura,false);assert.equal(a.profile.moves[key].projectile,false);
 if(key!=='forwardHeavy')assert.equal(a.profile.moves[key].hardKnockdown,true);
});

for(const key of ['neutralSpecial','throw'])test(PYRAMID+':'+key+' lifts with its free hand and releases through actual alternating controls',()=>{
 const {e,source,victim}=handGrip(0,key);assert.equal(victim.y,534);assert.equal(victim.grounded,false);assert.equal(victim.knockdownTimer,0);
 assert.equal(sourceSuspendedStruggle(source.data,source.profile.moves[key]).lockOwner,true);
 assert.equal(e.sourceCombatCue(source),'EMPRISE DE LA MAIN LIBRE · VERSUS');
 arrows(e,1);assert.equal(victim.status,null);ticks(e,24);assert.equal(victim.y,594);assert.equal(victim.grounded,true);
});

for(const index of [0,1])test('Great Knife owner cannot walk jump dodge taunt or relaunch while its exact hand grip is holding, player '+(index+1),()=>{
 const {e,source,victim}=handGrip(index),p=index?'p2':'p1',x=source.x;
 for(const action of ['right','guard'])e.setTouch(p,action,true);
 for(const action of ['jump','dodge','special','throw','super'])e.setTouch(p,action,'pressed');ticks(e,1);
 assert.equal(source.x,x);assert.equal(source.y,594);assert.equal(source.grounded,true);assert.equal(source.dodgeFrames,0);
 assert.equal(e.beginAttack(source,'forwardHeavy'),false);assert.equal(e.beginTaunt(source),false);
 e.clearInputs();while(source.attack||e.hitstop>0)e.update();assert.ok(victim.status);assert.equal(e.beginAttack(source,'neutralSpecial'),false);
 arrows(e,1-index);ticks(e,24);assert.equal(victim.status,null);assert.equal(e.ownedSourceGrip(source),null);
 assert.equal(e.beginAttack(source,'forwardHeavy'),true);
});

for(const index of [0,1])test('a genuinely emitted incoming revolver bullet breaks the mobile hand grip after capture, player '+(index+1),()=>{
 const e=index?engineFor(EDDIE,PYRAMID):engineFor(PYRAMID,EDDIE),source=e.actors[index],victim=e.actors[1-index];
 source.x=500;source.facing=1;victim.x=1000;victim.facing=-1;
 const emitted=observeEmissions(e);assert.equal(e.beginAttack(victim,'neutralSpecial'),true);
 for(let n=0;n<40&&!e.projectiles.length;n++)e.update();assert.equal(e.projectiles.length,1);
 victim.x=610;const health=source.health;assert.equal(e.beginAttack(source,'throw'),true);
 for(let n=0;n<25&&!victim.status?.struggleOrigin;n++)e.update();assert.equal(victim.status?.struggleOrigin?.id,PYRAMID);
 for(let n=0;n<80&&victim.status;n++)e.update();
 assert.ok(source.health<health);assert.equal(victim.status,null);assert.equal(e.ownedSourceGrip(source),null);assert.equal(emitted(),1);
 ticks(e,30);assert.equal(victim.y,594);assert.equal(victim.grounded,true);
});

test('mobile hand grip validates range and invalidation, while terminal cleanup and ordinary cage follow-ups remain separate',()=>{
 for(const change of ['range','phase','owner-airborne','refresh']){
  const {e,source,victim}=handGrip();
  if(change==='range')source.x-=190;
  if(change==='phase')source.phaseLock=8;
  if(change==='owner-airborne'){source.y=550;source.grounded=false;}
  if(change==='refresh')e.applyStatus(victim,{id:'bind',duration:90,potency:1},null);
  ticks(e,1);assert.equal(victim.status?.struggleOrigin,undefined,change);ticks(e,25);assert.equal(victim.y,594,change);assert.equal(victim.grounded,true,change);
 }
 const {e,victim}=handGrip();e.matchTime=.001;ticks(e,1);assert.equal(e.phase,'roundEnd');assert.equal(victim.status,null);assert.equal(victim.y,594);
 const cage=engineFor('sh2_flesh_lip_027'),[c,n]=cage.actors;c.x=500;n.x=610;
 assert.equal(cage.beginAttack(c,'neutralSpecial'),true);for(let n=0;n<100&&!n.status?.struggleOrigin;n++)cage.update();while(c.attack||cage.hitstop>0)cage.update();
 assert.equal(cage.ownedSourceGrip(c),null);assert.equal(cage.beginAttack(c,'forwardHeavy'),true,'Flesh Lip retains its intentionally permitted follow-up');
});

for(const key of ['neutralSpecial','super','desperation'])test(JACKET+':'+key+' acid is a real single projectile whose authored lifetime prevents full-arena damage',()=>{
 for(const near of [false,true]){
  const e=engineFor(JACKET),[a,b]=e.actors;a.x=near?500:300;b.x=near?650:1100;
  const emitted=observeEmissions(e),health=b.health;prepare(e,key);ticks(e,130);
  assert.equal(emitted(),1);assert.equal(e.projectiles.length,0);
  if(near)assert.ok(b.health<health);else assert.equal(b.health,health);
  assert.equal(b.status,null,'no unsupported lingering acid status');assert.equal(a.profile.moves[key].effect,null);
 }
});

for(const key of ['forwardSpecial','throw'])test(JACKET+':'+key+' clamps with the legs without a generic aerial throw or free owner walk',()=>{
 const e=engineFor(JACKET),[a,b]=e.actors;a.x=500;b.x=610;assert.equal(e.beginAttack(a,key),true);
 for(let n=0;n<100&&!b.status?.struggleOrigin;n++)e.update();while(e.hitstop>0)e.update();
 assert.equal(b.status?.struggleOrigin?.id,JACKET);assert.equal(b.status.struggleOrigin.posture,undefined);assert.equal(b.y,594);assert.equal(b.grounded,true);assert.equal(b.knockdownTimer,0);
 assert.equal(sourceStandingStruggle(a.data,a.profile.moves[key]).lockOwner,true);assert.equal(e.beginAttack(a,'neutralSpecial'),false);
 const x=a.x;e.setTouch('p1','left',true);ticks(e,1);assert.equal(a.x,x);e.setTouch('p1','left',false);
 arrows(e,1);assert.equal(b.status,null);assert.equal(b.y,594);assert.equal(b.grounded,true);
});

for(const key of NURSE_KEYS)test(NURSE+':'+key+' chooses a real gunshot at distance and a physical pistol-whip at close body range',()=>{
 for(const close of [false,true]){
  const e=engineFor(NURSE),[a,b]=e.actors;a.x=close?500:300;b.x=close?610:650;
  const emitted=observeEmissions(e),health=b.health;prepare(e,key);const attack=a.attack;
  assert.equal(attack.weaponContext,close?'close-contact':'ranged-shot');assert.equal(attack.move.key,key);
  assert.equal(isFirearmProjectile(a.data,attack.move),!close);assert.equal(Boolean(sourceDistanceWeapon(a.data,a.profile.moves[key])),true);
  ticks(e,110);assert.ok(b.health<health,key);assert.equal(emitted(),close?0:1);assert.equal(attack.move.sourceTimingMeasured,false);
 }
});

test('distance weapon choice is latched before startup and never rewrites the native authored move or another Nurse edition',()=>{
 const e=engineFor(NURSE),[a,b]=e.actors;a.x=300;b.x=650;const native=a.profile.moves.neutralSpecial;
 const emitted=observeEmissions(e);assert.equal(e.beginAttack(a,'neutralSpecial'),true);b.x=400;
 assert.equal(a.attack.weaponContext,'ranged-shot');assert.equal(a.attack.move,native);ticks(e,60);assert.equal(emitted(),1);assert.equal(native.projectile,true);
 const close=engineFor(NURSE),[c,t]=close.actors;c.x=500;t.x=610;const p=c.profile.moves.neutralSpecial;
 assert.equal(close.beginAttack(c,'neutralSpecial'),true);assert.notEqual(c.attack.move,p);assert.equal(c.attack.move.projectile,false);assert.equal(p.projectile,true);
 for(const wrong of [{...c.data,source:'film'},{...c.data,id:'other-nurse',baseId:NURSE},fighter('sh3_nurse_pipe_043')])assert.equal(sourceDistanceWeapon(wrong,p),null);
});

test('the documented close pistol-whip can free Cynthia hair while an already emitted distant gunshot keeps its own identity',()=>{
 const e=engineFor('sh4_cynthia_velasquez_victim_16',NURSE),[source,victim]=e.actors;source.x=500;victim.x=590;
 assert.equal(e.beginAttack(source,'neutralSpecial'),true);for(let n=0;n<100&&!victim.status?.bindingOrigin;n++)e.update();
 while(e.hitstop>0||victim.hurtFrames>0)e.update();const emitted=observeEmissions(e),health=source.health;
 assert.equal(e.beginAttack(victim,'neutralSpecial'),true);assert.equal(victim.attack.weaponContext,'close-contact');
 for(let n=0;n<80&&victim.status;n++)e.update();assert.ok(source.health<health);assert.equal(victim.status,null);assert.equal(emitted(),0);
 assert.ok(e.texts.some(t=>t.text==='CHEVEUX ROMPUS'));
});

for(const index of [0,1])test('native hand-grip KO and terminal source loss release only the lifted body, source player '+(index+1),()=>{
 const e=index?engineFor(NURSE,PYRAMID):engineFor(PYRAMID,NURSE),a=e.actors[index],b=e.actors[1-index];
 a.x=500;a.facing=1;b.x=610;b.facing=-1;b.health=1;
 assert.equal(e.beginAttack(a,'throw'),true);for(let n=0;n<100&&e.phase==='fight';n++)e.update();
 assert.equal(e.phase,'roundEnd');assert.equal(b.health,0);assert.equal(b.status,null);assert.equal(b.y,594);assert.equal(b.grounded,true);
 const other=handGrip(index);other.source.health=0;ticks(other.e,1);
 assert.equal(other.victim.status,null);assert.equal(other.victim.y,594);assert.equal(other.victim.grounded,true);
 assert.equal(other.e.ownedSourceGrip(other.source),null);
});

test('the Nurse body-gap threshold includes its exact boundary and the latched close strike cannot create a shot after separation',()=>{
 for(const [gap,context]of [[45,'close-contact'],[45.01,'ranged-shot']]){
  const e=engineFor(NURSE),[a,b]=e.actors;
  a.x=500;const widthA=bodyBox(a).w,widthB=bodyBox(b).w;b.x=a.x+(widthA+widthB)/2+gap;
  assert.equal(e.beginAttack(a,'neutralSpecial'),true);assert.equal(a.attack.weaponContext,context);
 }
 const e=engineFor(NURSE),[a,b]=e.actors;a.x=500;b.x=610;const emitted=observeEmissions(e),health=b.health;
 assert.equal(e.beginAttack(a,'neutralSpecial'),true);assert.equal(a.attack.weaponContext,'close-contact');b.x=1100;
 ticks(e,90);assert.equal(emitted(),0);assert.equal(b.health,health);assert.equal(a.profile.moves.neutralSpecial.projectile,true);
});

for(const id of [CARRION,CALIBAN])test(id+' a sufficient real jump clears a physical low contact without requiring an imaginary blast radius',()=>{
 const e=engineFor(id,'sh1_groaner_003'),[a,b]=e.actors;a.x=500;b.x=690;const health=b.health;
 assert.equal(e.beginAttack(a,'neutralSpecial'),true);e.setTouch('p2','jump','pressed');ticks(e,80);
 assert.equal(b.health,health);assert.equal(a.stats.damageDealt,0);assert.equal(e.projectiles.length,0);
});
