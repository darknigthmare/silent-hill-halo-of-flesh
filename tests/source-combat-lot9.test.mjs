import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,STAGES,createCombatProfile} from '../src/data.js';
import {FightEngine} from '../src/fight.js';
import {combatReferenceRecipe,combatReferencePolicy,sourceGroundProjectile,sourceSuspendedStruggle,
  sourceSensoryParalysis,sourceContactBand,sourceHitResponse} from '../src/combat-reference-policy.js';

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


const DOGS=['sh1_groaner_003','sh1_wormhead_004'];
const LIP='sh2_flesh_lip_027',GOD='sh3_god_050',ANDREW='sh4_andrew_desalvo_victim_18',SCREAM='downpour_screamer_104';
const PASSES=['neutralSpecial','forwardSpecial','airSpecial','super','desperation'];
const GRIPS=['neutralSpecial','throw','super','desperation'];
const FLAMES=['neutralSpecial','downSpecial','super','desperation'];
const CRIES=['neutralSpecial','downSpecial','super','desperation'];
function setupMove(e,key){const a=e.actors[0];a.meter=100;if(key==='desperation'){
 a.health=Math.floor(a.maxHealth*.3);
 // Let existing authored boss buffs finish naturally; they cancel an attack
 // started in the same tick as a newly due threshold. No phase data is forged.
 if(a.data.boss)for(let n=0;n<220;n++){
  const next=a.bossPhases[a.bossPhaseIndex+1];
  if(!a.phaseLock&&(!next||a.health/a.maxHealth>next.threshold))break;
  e.update();
 }
 }
 if(key==='airSpecial'){e.setTouch('p1','jump','pressed');e.setTouch('p2','jump','pressed');ticks(e,1);}
 assert.equal(e.beginAttack(a,key),true,key);return a;}
function moveResult(id,key){const e=engineFor(id),[a,b]=e.actors;a.x=500;b.x=id===GOD?680:650;const health=b.health;
 setupMove(e,key);let highest=a.y,mostHits=0,projectiles=0;
 for(let n=0;n<125;n++){e.update();highest=Math.min(highest,a.y);mostHits=Math.max(mostHits,a.attack?.hitCount||0);projectiles+=e.projectiles.length;}
 return {e,a,b,health,highest,mostHits,projectiles};}
function captured(key='neutralSpecial'){
 const e=engineFor(LIP),[source,victim]=e.actors;source.x=500;victim.x=610;setupMove(e,key);
 for(let n=0;n<90&&!victim.status?.struggleOrigin;n++)e.update();while(e.hitstop>0)e.update();
 assert.equal(victim.status?.struggleOrigin?.posture,'suspended',key);return {e,source,victim};}
function arrow(e,left){e.setTouch('p2','left',left);e.setTouch('p2','right',!left);ticks(e,1);
 e.setTouch('p2','left',false);e.setTouch('p2','right',false);}
function paralyzed(key='neutralSpecial'){
 const e=engineFor(SCREAM),[source,victim]=e.actors;source.x=500;victim.x=690;setupMove(e,key);
 for(let n=0;n<90&&!victim.status?.paralysisOrigin;n++)e.update();while(e.hitstop>0)e.update();
 assert.equal(victim.status?.paralysisOrigin?.id,SCREAM,key);return {e,source,victim};}

for(const id of [...DOGS,ANDREW])for(const key of PASSES)test(id+':'+key+' is a real single-contact airborne pass rather than a stationary generated attack',()=>{
 const {e,a,b,health,highest,mostHits,projectiles}=moveResult(id,key);
 assert.ok(highest<594,id+key);assert.ok(a.x>500,id+key);assert.ok(b.health<health,id+key);
 assert.equal(mostHits,1);assert.equal(projectiles,0);assert.equal(a.profile.moves[key].hits,1);
 assert.equal(a.profile.moves[key].projectile,false);assert.equal(a.profile.moves[key].teleport,null);
 assert.equal(a.profile.moves[key].sourceTimingMeasured,false);
});

test('the own Wormhead variant has authored greater bite damage without borrowing a Groaner sprite or source timing',()=>{
 const groaner=createCombatProfile(fighter(DOGS[0])),wormhead=createCombatProfile(fighter(DOGS[1]));
 for(const key of PASSES){assert.ok(wormhead.moves[key].damage>groaner.moves[key].damage);assert.equal(wormhead.moves[key].sourceTimingMeasured,false);}
 assert.equal(wormhead.referencePolicy.id,DOGS[1]);assert.equal(wormhead.referencePolicy.source,'sh1');
});

for(const id of DOGS)test(id+' an actual handgun projectile knocks down its airborne lunge without forcing death',()=>{
 const e=engineFor(id),[dog,nurse]=e.actors;dog.x=450;nurse.x=760;
 assert.equal(e.beginAttack(nurse,'neutralSpecial'),true);for(let n=0;n<40&&!e.projectiles.length;n++)e.update();
 assert.equal(e.projectiles.length,1);const before=dog.health;assert.equal(e.beginAttack(dog,'forwardSpecial'),true);
 let airborneHit=false;for(let n=0;n<70&&dog.knockdownTimer===0;n++){e.update();airborneHit ||= dog.health<before&&!dog.grounded;}
 assert.ok(airborneHit);assert.ok(dog.knockdownTimer>0);assert.ok(dog.health>0);assert.ok(dog.health<before);
 assert.equal(nurse.stats.damageDealt,dog.stats.damageTaken);
});

test('airborne gun response stays exact-source and does not become ground, melee or non-firearm energy immunity/knockdown',()=>{
 const shot=createCombatProfile(fighter(NURSE)).moves.neutralSpecial;
 assert.equal(sourceHitResponse(fighter(DOGS[0]),shot,true,fighter(NURSE)).airborneOnly,true);
 for(const wrong of [{...fighter(DOGS[0]),source:'bom'},{...fighter(DOGS[0]),id:'invented-dog',baseId:DOGS[0]}])
  assert.equal(sourceHitResponse(wrong,shot,true,fighter(NURSE)),null);
 const magic=createCombatProfile(fighter('sh1_incubus_019')).moves.neutralSpecial;
 assert.equal(sourceHitResponse(fighter(DOGS[0]),magic,true,fighter('sh1_incubus_019')),null);
 const e=engineFor(NURSE,DOGS[0]),[a,b]=e.actors;e.applyHit(a,b,a.profile.moves.neutralSpecial,925,1,{ranged:true});
 assert.ok(b.health<b.maxHealth);assert.equal(b.knockdownTimer,0,'a grounded dog does not receive the airborne response');
});

for(const key of GRIPS)test(LIP+':'+key+' lifts a standing victim below the cage and actual alternating controls release into a fall',()=>{
 const {e,source,victim}=captured(key),rule=sourceSuspendedStruggle(source.data,source.profile.moves[key]);
 assert.equal(victim.y,594-rule.liftHeight);assert.equal(victim.grounded,false);assert.equal(victim.vx,0);assert.equal(victim.vy,0);
 assert.equal(victim.knockdownTimer,0);assert.equal(source.x,500);assert.equal(source.y,594);assert.equal(e.projectiles.length,0);
 for(let n=0;n<6;n++)arrow(e,n%2===0);
 assert.equal(victim.status,null);assert.ok(e.texts.some(t=>t.text==='PRISE ROMPUE'));
 ticks(e,24);assert.equal(victim.y,594);assert.equal(victim.grounded,true);assert.equal(victim.knockdownTimer,0);
});

test('suspended foot grip persists without gravity drift, blocks attack/jump/guard bypass and freezes under real pause',()=>{
 const {e,source,victim}=captured(),height=victim.y;
 ticks(e,14);assert.equal(victim.y,height);assert.equal(victim.grounded,false);
 assert.equal(e.beginAttack(victim,'airSpecial'),false);assert.equal(e.beginTaunt(victim),false);
 e.setTouch('p2','guard',true);e.setTouch('p2','jump','pressed');e.setTouch('p2','special','pressed');ticks(e,1);
 assert.equal(victim.attack,null);assert.equal(victim.blocking,false);assert.equal(victim.vy,0);assert.equal(victim.y,height);
 const state=structuredClone(victim.status);e.togglePause(true);ticks(e,20);assert.deepEqual(victim.status,state);assert.equal(victim.y,height);
 assert.equal(source.profile.referencePolicy.canMove,false);assert.equal(source.profile.referencePolicy.canJump,false);
});

test('suspension refuses already airborne, downed or fixed bodies and is not inherited by the remake',()=>{
 for(const mode of ['airborne','downed','fixed']){const e=engineFor(LIP,mode==='fixed'?'sh4_wall_man_056':NURSE),[a,b]=e.actors;
  if(mode==='airborne'){b.y=400;b.grounded=false;}if(mode==='downed'){b.knockdownTimer=30;b.state='knockdown';}
  const health=b.health;assert.equal(e.applyHit(a,b,a.profile.moves.neutralSpecial,926),false);assert.equal(b.health,health);assert.equal(b.status,null);
 }
 const data=fighter(LIP),move=createCombatProfile(data).moves.neutralSpecial;
 assert.equal(sourceSuspendedStruggle({...data,source:'sh2r'},move),null);
 assert.equal(sourceSuspendedStruggle({...data,id:'remake-cage',baseId:LIP},move),null);
});

test('terminal source defeat clears the temporary foot lift before result presentations can strand the winner aloft',()=>{
 const {e,source,victim}=captured();source.health=0;source.ko=false;ticks(e,1);
 assert.equal(victim.status,null);assert.equal(victim.y,594);assert.equal(victim.grounded,true);assert.equal(victim.vx,0);assert.equal(victim.vy,0);
 assert.notEqual(e.phase,'fight');
});

test('Flesh Lip forwardHeavy uses the foot-contact band and actually kicks without a free walk or grab',()=>{
 const {e,a,b,health}=moveResult(LIP,'forwardHeavy');assert.ok(b.health<health);assert.equal(a.x,500);
 const band=sourceContactBand(a.data,a.profile.moves.forwardHeavy);assert.equal(band.footOffset,80);assert.equal(band.height,90);
 assert.equal(b.status,null);assert.equal(sourceContactBand(a.data,a.profile.moves.neutralHeavy),null);
 assert.equal(sourceContactBand({...a.data,source:'sh2r'},a.profile.moves.forwardHeavy),null);
});

for(const key of FLAMES)test(GOD+':'+key+' emits its native fire fixed to the floor throughout actual travel',()=>{
 const e=engineFor(GOD),[source,target]=e.actors;source.x=300;target.x=1100;setupMove(e,key);
 for(let n=0;n<90&&!e.projectiles.length;n++)e.update();assert.equal(e.projectiles.length,1,key);
 const p=e.projectiles[0],y=p.y;assert.equal(p.y+p.radius,594);assert.equal(p.y,p.groundY);
 assert.equal(p.vy,0);assert.equal(p.gravity,0);assert.equal(p.move.effect.id,'burn');assert.equal(p.move.sourceTimingMeasured,false);
 ticks(e,12);if(e.projectiles.length){assert.equal(p.y,y);assert.equal(p.vy,0);}
 assert.equal(sourceGroundProjectile({...source.data,source:'sh1'},p.move),false);
});

test('God close forwardHeavy uses the bounded lower arm band and hits without a projectile or invented free movement',()=>{
 const {a,b,health,projectiles}=moveResult(GOD,'forwardHeavy');assert.ok(b.health<health);assert.equal(a.x,500);assert.equal(projectiles,0);
 assert.equal(a.profile.referencePolicy.canMove,false);assert.equal(a.profile.referencePolicy.canJump,false);
 assert.equal(sourceContactBand(a.data,a.profile.moves.forwardHeavy).footOffset,120);
});

test('Andrew retains its separately documented passive proximity drain and never transfers its roll to another ghost',()=>{
 const p=createCombatProfile(fighter(ANDREW));assert.equal(p.referencePolicy.proximityField.kind,'drain');assert.equal(p.moves.downSpecial.aura,true);
 for(const id of ['sh4_jasper_gein_victim_17','sh4_richard_braintree_victim_19']){
  const f=fighter(id),policy=combatReferencePolicy(f);assert.equal(policy.id,id);
  assert.equal(combatReferenceRecipe({...f,id:'fake-andrew',baseId:ANDREW}).moves,undefined);
 }
});

for(const key of CRIES)test(SCREAM+':'+key+' causes real temporary paralysis of commands without an invented beam or forced warp',()=>{
 const {e,source,victim}=paralyzed(key),position=victim.x;
 assert.equal(sourceSensoryParalysis(source.data,source.profile.moves[key]),true);assert.equal(e.projectiles.length,0);
 assert.ok(victim.health<victim.maxHealth);assert.equal(victim.status.paralysisOrigin.id,SCREAM);
 for(let n=0;n<60&&victim.hurtFrames>0;n++)e.update();
 e.setTouch('p2','right',true);e.setTouch('p2','jump','pressed');e.setTouch('p2','special','pressed');e.setTouch('p2','guard',true);ticks(e,1);
 assert.equal(victim.x,position);assert.equal(victim.attack,null);assert.equal(victim.grounded,true);assert.equal(victim.dodgeFrames,0);assert.equal(victim.blocking,false);
 assert.equal(e.beginAttack(victim,'neutralSpecial'),false);assert.equal(e.beginTaunt(victim),false);
 assert.equal(e.sourceCombatCue(victim),'PARALYSIE DU CRI · VERSUS');
});

test('paralysis is bounded, freezes under pause, expires normally and is cleared by an unrelated status refresh',()=>{
 const {e,victim}=paralyzed(),status=structuredClone(victim.status);e.togglePause(true);ticks(e,20);assert.deepEqual(victim.status,status);
 e.togglePause(false);ticks(e,status.timer+5);assert.equal(victim.status,null);assert.equal(e.beginAttack(victim,'neutralSpecial'),true);
 const other=paralyzed();other.e.applyStatus(other.victim,{id:'bind',duration:90,potency:1},null);
 assert.equal(other.victim.status.paralysisOrigin,undefined);assert.equal(other.e.beginAttack(other.victim,'neutralSpecial'),true);
 const far=engineFor(SCREAM),[source,target]=far.actors;source.x=300;target.x=1000;setupMove(far,'neutralSpecial');ticks(far,70);
 assert.equal(target.health,target.maxHealth);assert.equal(target.status,null);assert.equal(far.projectiles.length,0);
});

test('the Screamer physical pounce actually leaves the floor and does not confer paralysis from an ordinary touch',()=>{
 const {a,b,health,highest,projectiles}=moveResult(SCREAM,'forwardSpecial');assert.ok(highest<594);assert.ok(a.x>500);assert.ok(b.health<health);
 assert.equal(projectiles,0);assert.equal(b.status,null);assert.equal(sourceSensoryParalysis(a.data,a.profile.moves.forwardSpecial),false);
 for(const wrong of [{...a.data,source:'sh1'},{...a.data,id:'other-screamer',baseId:SCREAM}])
  assert.equal(sourceSensoryParalysis(wrong,a.profile.moves.neutralSpecial),false);
});

for(const id of [LIP,GOD])test(id+' fixed support preserves actual directional heavy inputs without allowing locomotion or walk rewards',()=>{
 const e=engineFor(id),a=e.actors[0];a.x=500;e.actors[1].x=800;
 const meter=a.meter;e.setTouch('p1','right',true);ticks(e,10);
 assert.equal(a.x,500);assert.equal(a.vx,0);assert.equal(a.state,'idle');assert.equal(a.meter,meter);
 e.setTouch('p1','heavy','pressed');ticks(e,1);
 assert.equal(a.attack?.key,'forwardHeavy');assert.equal(a.x,500);assert.equal(a.vx,0);
});

test('a real timeout during a native foot grip clears only the temporary suspension before round-result presentation',()=>{
 const {e,victim}=captured();assert.equal(victim.y,522);e.matchTime=.001;ticks(e,1);
 assert.equal(e.phase,'roundEnd');assert.equal(victim.status,null);assert.equal(victim.y,594);
 assert.equal(victim.grounded,true);assert.equal(victim.vx,0);assert.equal(victim.vy,0);
 assert.ok(victim.presentation);assert.equal(e.projectiles.length,0);
});

test('a lethal native Flesh Lip grip at one HP cannot strand the losing body in an airborne round result',()=>{
 const e=engineFor(LIP),[source,victim]=e.actors;source.x=500;victim.x=610;victim.health=1;
 e.setTouch('p1','special','pressed');for(let n=0;n<100&&e.phase==='fight';n++)e.update();
 assert.equal(source.lastMoveKey,'neutralSpecial');assert.equal(e.phase,'roundEnd');assert.equal(victim.ko,true);
 assert.equal(victim.health,0);assert.equal(victim.status,null);assert.equal(victim.y,594);assert.equal(victim.grounded,true);
 assert.equal(victim.vx,0);assert.equal(victim.vy,0);
});

test('an ordinary actual airborne projectile KO retains its own height instead of receiving cage cleanup',()=>{
 const e=engineFor(NURSE,NURSE),[source,victim]=e.actors;source.x=500;victim.x=650;
 victim.y=350;victim.grounded=false;victim.vy=-2;victim.health=1;
 e.setTouch('p1','special','pressed');for(let n=0;n<100&&e.phase==='fight';n++)e.update();
 assert.equal(source.lastMoveKey,'neutralSpecial');assert.equal(e.phase,'roundEnd');assert.equal(victim.ko,true);
 assert.ok(victim.y<594);assert.equal(victim.grounded,false);assert.equal(victim.status,null);
});

for(const sourceIndex of [0,1])test('native foot grip then late kick retains airborne suspension until natural expiry, source player '+(sourceIndex+1),()=>{
 const e=sourceIndex===0?engineFor(LIP,NURSE):engineFor(NURSE,LIP);
 const source=e.actors[sourceIndex],victim=e.actors[1-sourceIndex];source.x=500;source.facing=1;victim.x=610;victim.facing=-1;
 e.setTouch(sourceIndex?'p2':'p1','special','pressed');
 for(let n=0;n<100&&!victim.status?.struggleOrigin;n++)e.update();
 assert.equal(victim.status?.struggleOrigin?.posture,'suspended');
 for(let n=0;n<100&&(source.attack||e.hitstop>0);n++)e.update();
 const kick=source.profile.moves.forwardHeavy;
 while(victim.status&&victim.status.timer>kick.startup+1)e.update();
 assert.equal(victim.status?.timer,kick.startup+1);const health=victim.health;
 assert.equal(e.beginAttack(source,'forwardHeavy'),true);
 let hit=false;
 for(let n=0;n<140;n++){
  e.update();hit ||= victim.health<health;
  if(victim.status?.struggleOrigin){assert.equal(victim.grounded,false);assert.equal(victim.y,522);}
 }
 assert.ok(hit);assert.equal(victim.status,null);assert.equal(victim.grounded,true);assert.equal(victim.y,594);
 assert.equal(victim.knockdownTimer,0);assert.equal(e.phase,'fight');
});

test('a generic status refresh cannot leave the former suspended victim flagged grounded above the floor',()=>{
 const {e,victim}=captured();e.applyStatus(victim,{id:'bind',duration:90,potency:1},null);
 assert.equal(victim.status.struggleOrigin,undefined);assert.equal(victim.grounded,false);
 ticks(e,24);assert.equal(victim.y,594);assert.equal(victim.grounded,true);
 assert.equal(victim.status?.id,'bind','the new generic status retains its own timer without keeping the lift');
});
