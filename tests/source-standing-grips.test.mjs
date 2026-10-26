import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,STAGES,createCombatProfile} from '../src/data.js';
import {FightEngine} from '../src/fight.js';
import {combatReferenceRecipe,combatReferencePolicy,sourceStandingBind,sourceWhiffExposure,
  sourceFrontalDamageScale,sourceGroundProjectile,isFirearmProjectile,sourceStandingStruggle,sourceDownedFirearmProtection} from '../src/combat-reference-policy.js';

const PATIENT='sh4_patient_060',BOTTOM='sh4_bottom_065',CYNTHIA='sh4_cynthia_velasquez_victim_16';
const SCARLET='homecoming_scarlet_spider_form_095',HANGING='homecoming_amnion_hanging_form_097';
const EXPOSED='homecoming_amnion_exposed_form_098',ASPHYXIA='homecoming_asphyxia_096',BOGEYMAN='downpour_bogeyman_115';
const NURSE='sh3_nurse_revolver_044',EIGHT=[PATIENT,BOTTOM,CYNTHIA,SCARLET,HANGING,EXPOSED,ASPHYXIA,BOGEYMAN];
const fighter=id=>ROSTER.find(f=>f.id===id),engines=new Set();
afterEach(()=>{for(const e of engines)e.destroy();engines.clear();});
function ticks(e,n){for(let i=0;i<n;i++)e.update();}
function engineFor(p1='sh1_grey_child_005',p2=NURSE){
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

const LEG_IDS=['sh1_grey_child_005','sh1_mumbler_006','sh1_stalker_008'];
const DADDY='sh2_abstract_daddy_028',SCRATCHER='sh1_hanged_scratcher_011',SCRAPER='sh3_scraper_045';
const GRIPS=[...LEG_IDS,DADDY],SIX=[...GRIPS,SCRATCHER,SCRAPER];
function grip(id=LEG_IDS[0]){
 const e=engineFor(id),[source,victim]=e.actors;victim.x=id===DADDY?610:575;
 e.setTouch('p1','special','pressed');
 for(let n=0;n<80&&!victim.status?.struggleOrigin;n++)e.update();
 assert.equal(victim.status?.struggleOrigin?.id,id);
 while(e.hitstop>0)e.update(); // Inputs during the authored impact freeze are not simulation transitions.
 return {e,source,victim};
}
function direction(e,left,index=1){
 const p=index?'p2':'p1';e.setTouch(p,'left',left);e.setTouch(p,'right',!left);ticks(e,1);
 e.setTouch(p,'left',false);e.setTouch(p,'right',false);
}

test('six exact-source recipes retain unmeasured timing and cannot transfer to another identity or work',()=>{
 for(const id of SIX){const data=fighter(id),p=createCombatProfile(data);
  assert.ok(Object.values(p.moves).every(m=>m.sourceTimingMeasured===false),id);
  for(const changed of [{...data,source:'film'},{...data,id:'other-'+id,baseId:id}]){
   assert.deepEqual(combatReferenceRecipe(changed),{},id);
   assert.equal(sourceStandingStruggle(changed,p.moves.neutralSpecial),null,id);
   assert.equal(sourceDownedFirearmProtection(changed),false,id);
  }
 }
 assert.equal(combatReferencePolicy(fighter(SCRAPER)).defense.frontalVisibleHandgunBullets,true);
 for(const id of ['film_armless_man_170','bom_straight_jacket_131','sh4_cynthia_velasquez_victim_16'])
  assert.equal(sourceStandingStruggle(fighter(id),createCombatProfile(fighter(id)).moves.neutralSpecial),null,id);
});

for(const id of GRIPS)test(id+' real neutral grip catches a standing target and six alternating directional controls release it',()=>{
 const {e,source,victim}=grip(id),before=victim.health;
 assert.equal(victim.grounded,true);assert.equal(victim.y,594);assert.equal(victim.vy,0);assert.equal(victim.vx,0);
 assert.equal(victim.knockdownTimer,0);assert.equal(e.projectiles.length,0);
 assert.ok(source.stats.damageDealt>0);assert.equal(source.stats.damageDealt,victim.stats.damageTaken);
 assert.equal(sourceStandingStruggle(source.data,source.profile.moves.neutralSpecial).escapeTransitions,6);
 for(let n=0;n<5;n++){
  direction(e,n%2===0);assert.equal(victim.status?.struggleOrigin?.progress,n+1);
  assert.equal(victim.grounded,true);assert.equal(victim.y,594);assert.equal(victim.knockdownTimer,0);
 }
 direction(e,false);assert.equal(victim.status,null);assert.equal(victim.health,before);
 assert.ok(e.texts.some(t=>t.text==='PRISE ROMPUE'));assert.equal(e.sourceCombatCue(victim),null);
});

test('held direction, simultaneous opposites and repeated same direction cannot manufacture grip-escape progress',()=>{
 const {e,victim}=grip('sh1_mumbler_006');e.setTouch('p2','left',true);ticks(e,15);
 assert.equal(victim.status.struggleOrigin.progress,1);
 e.setTouch('p2','right',true);ticks(e,3);assert.equal(victim.status.struggleOrigin.progress,1);
 e.setTouch('p2','right',false);e.setTouch('p2','left',false);ticks(e,1);
 e.setTouch('p2','left',true);ticks(e,1);assert.equal(victim.status.struggleOrigin.progress,1);
 e.setTouch('p2','left',false);e.setTouch('p2','right',true);ticks(e,1);assert.equal(victim.status.struggleOrigin.progress,2);
});

test('held actor cannot jump, dodge or bypass the standing grip through a native throw step',()=>{
 const {e,victim}=grip(),x=victim.x;
 e.setTouch('p2','jump','pressed');e.setTouch('p2','dodge','pressed');ticks(e,1);
 assert.equal(victim.y,594);assert.equal(victim.grounded,true);assert.equal(victim.dodgeFrames,0);
 assert.equal(e.beginAttack(victim,'throw'),true);assert.equal(victim.vx,0);ticks(e,1);
 assert.equal(victim.x,x);assert.equal(victim.y,594);assert.ok(victim.status?.struggleOrigin);
});

test('escape state and duration freeze in actual pause, and the versus timeout still releases without input',()=>{
 const {e,victim}=grip('sh1_mumbler_006');direction(e,true);
 const state=structuredClone(victim.status);e.togglePause(true);ticks(e,30);assert.deepEqual(victim.status,state);
 e.togglePause(false);ticks(e,state.timer+20);assert.equal(victim.status,null);
});

test('the normal standard gamepad path releases a Stalker grip by real axis alternation',()=>{
 const {e,victim}=grip('sh1_stalker_008');
 const pads=[0,1].map(index=>({index,id:'grip-pad-'+index,mapping:'standard',connected:true,axes:[0,0],
  buttons:Array.from({length:17},()=>({pressed:false}))}));
 navigator.getGamepads=()=>pads;e.updateGamepads();
 for(let n=0;n<6;n++){pads[1].axes[0]=n%2===0?-1:1;ticks(e,1);}
 assert.equal(victim.status,null);assert.ok(e.texts.some(t=>t.text==='PRISE ROMPUE'));
});

test('CPU uses the same directional progression and cannot instantly bypass a standing hold',()=>{
 const {e,victim}=grip('sh1_mumbler_006');e.config.mode='arcade';
 ticks(e,1);assert.equal(victim.status?.struggleOrigin?.progress,1);
 for(let n=0;n<100&&victim.status;n++)e.update();
 assert.equal(victim.status,null);assert.ok(e.texts.some(t=>t.text==='PRISE ROMPUE'));
});

test('ownership refresh removes old escape privileges; a disabled or defeated grip source releases its victim',()=>{
 for(const change of ['generic','disabled','defeated']){
  const {e,source,victim}=grip();
  if(change==='generic'){
   e.applyStatus(victim,{id:'bind',duration:40,potency:1},null);
   assert.equal(victim.status.struggleOrigin,undefined);
   for(let n=0;n<6;n++)direction(e,n%2===0);
   assert.equal(victim.status?.id,'bind');
  }else{
   if(change==='disabled')source.profile.referencePolicy.combatEnabled=false;else{source.health=0;source.ko=true;}
   ticks(e,1);assert.equal(victim.status,null,change);
  }
 }
});

test('grips refuse airborne and already downed victims instead of inventing an anti-air lift or raising a fallen body',()=>{
 for(const id of GRIPS)for(const downed of [false,true]){
  const e=engineFor(id),[a,b]=e.actors,health=b.health;
  if(downed){b.knockdownTimer=30;b.state='knockdown';}else{b.y=440;b.grounded=false;}
  assert.equal(e.applyHit(a,b,a.profile.moves.neutralSpecial,810),false);
  assert.equal(b.health,health);assert.equal(b.status,null);assert.equal(a.stats.damageDealt,0);
 }
});

test('Abstract Daddy has only five native variants of its documented grip, including through combined jump and attack inputs',()=>{
 const e=engineFor(DADDY),a=e.actors[0];
 assert.deepEqual(Object.values(a.profile.moves).filter(m=>m.enabled).map(m=>m.key),['throw','neutralSpecial','forwardSpecial','super','desperation']);
 e.setTouch('p1','jump','pressed');e.setTouch('p1','light','pressed');ticks(e,1);
 assert.equal(a.y,594);assert.equal(a.grounded,true);assert.equal(a.attack,null);
 assert.equal(e.beginAttack(a,'backThrow'),false);assert.equal(e.beginAttack(a,'forwardHeavy'),false);
 e.setTouch('p1','special','pressed');ticks(e,1);assert.equal(a.attack.key,'neutralSpecial');assert.equal(a.attack.move.level,'throw');
});

test('Labyrinth Daddy downed firearm protection rejects actual projectile collision without chip, stun or rewards',()=>{
 const e=engineFor(NURSE,DADDY),[a,b]=e.actors;a.x=300;b.x=650;b.knockdownTimer=120;b.state='knockdown';
 const before={health:b.health,guard:b.guard,meter:b.meter,damage:a.stats.damageDealt,hurt:b.hurtFrames};
 e.setTouch('p1','special','pressed');let emitted=false,blocked=false;
 for(let n=0;n<80;n++){e.update();emitted ||= e.projectiles.length>0;blocked ||= e.texts.some(t=>t.text==='TIRS SANS EFFET À TERRE');}
 assert.equal(b.health,before.health);assert.equal(b.guard,before.guard);assert.equal(b.meter,before.meter);
 assert.equal(a.stats.damageDealt,before.damage);assert.equal(b.hurtFrames,before.hurt);
 assert.ok(emitted);assert.ok(blocked);assert.equal(e.projectiles.length,0);assert.equal(e.sourceCombatCue(b),'TIRS SANS EFFET À TERRE');
});

test('Daddy firearm protection is downed-only and does not grant standing, airborne, melee or energy immunity',()=>{
 for(const mode of ['standing','airborne','melee','energy','other-source']){
  const e=engineFor(mode==='energy'?'sh1_incubus_019':NURSE,DADDY),[a,b]=e.actors;
  b.knockdownTimer=30;b.state='knockdown';
  if(mode==='standing'){b.knockdownTimer=0;b.state='idle';}
  if(mode==='airborne'){b.grounded=false;b.y=440;}
  if(mode==='other-source')b.data={...b.data,source:'sh2r'};
  const before=b.health,move=a.profile.moves[mode==='melee'?'neutralLight':'neutralSpecial'];
  e.applyHit(a,b,move,811,1,{ranged:move.projectile,direction:1});assert.ok(b.health<before,mode);
 }
});

test('Hanged Scratcher actual ground claws hit without inventing a ceiling from a free jump or an offensive grab',()=>{
 const e=engineFor(SCRATCHER),[a,b]=e.actors;const before=b.health;b.x=635;
 for(const key of ['airLight','airHeavy','airSpecial','throw','backThrow'])assert.equal(a.profile.moves[key].enabled,false,key);
 e.setTouch('p1','jump','pressed');e.setTouch('p1','special','pressed');
 for(let n=0;n<70&&b.health===before;n++)e.update();
 assert.ok(b.health<before);assert.equal(a.y,594);assert.equal(a.grounded,true);assert.equal(a.lastMoveKey,'neutralSpecial');
 assert.equal(e.projectiles.length,0);assert.match(a.profile.moves.neutralSpecial.name,/griffes au sol/i);
 assert.equal(e.beginAttack(a,'throw'),false);assert.equal(e.beginAttack(a,'airSpecial'),false);
});

test('Scraper deflects an actual visible handgun shot while its blades do not inherit Missionary generic gunfire defense',()=>{
 const e=engineFor(NURSE,SCRAPER),[a,b]=e.actors;a.x=300;b.x=650;const before=b.health;
 e.setTouch('p1','special','pressed');let deflected=false;
 for(let n=0;n<80;n++){e.update();deflected ||= e.texts.some(t=>t.text==='TIR DÉVIÉ');}
 assert.ok(deflected);assert.equal(b.health,before);assert.equal(a.stats.damageDealt,0);assert.equal(b.meter,0);
 assert.equal(b.profile.referencePolicy.defense.frontalVisibleBullets,undefined);
});

test('Scraper remains vulnerable to a silenced handgun, real SMG phase, shotgun, energy, physical hits and rear shots',()=>{
 for(const mode of ['silenced','smg','shotgun','energy','physical','rear','attacking']){
  const id=mode==='smg'?'sh3_memory_of_alessa_049':mode==='shotgun'?'arcade_robbie_the_rabbit_shotgun':mode==='energy'?'sh1_incubus_019':NURSE;
  const e=engineFor(id,SCRAPER),[a,b]=e.actors;let move=a.profile.moves[mode==='physical'?'neutralLight':'neutralSpecial'];
  if(mode==='smg'){a.profile.moves=a.profile.moveset.weaponPhases.find(p=>p.id==='smg').moves;move=a.profile.moves.neutralSpecial;}
  if(mode==='silenced')move={...move,silenced:true};
  if(mode==='rear')b.facing=1;
  if(mode==='attacking')assert.equal(e.beginAttack(b,'neutralSpecial'),true);
  const before=b.health;e.applyHit(a,b,move,812,1,{ranged:move.projectile,direction:1});assert.ok(b.health<before,mode);
 }
});

test('Scraper real two-blade input chains physical contacts and rejects unsupported rear or frontal grabs',()=>{
 const e=engineFor(SCRAPER),[a,b]=e.actors;b.x=600;const before=b.health;e.setTouch('p1','special','pressed');
 for(let n=0;n<90&&a.attack?.hitCount!==2;n++)e.update();
 assert.equal(a.attack?.hitCount,2);assert.ok(b.health<before);assert.equal(e.projectiles.length,0);
 assert.equal(a.profile.moves.throw.enabled,false);assert.equal(a.profile.moves.backThrow.enabled,false);
});
