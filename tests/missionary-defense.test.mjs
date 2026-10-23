import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,STAGES,createCombatProfile} from '../src/data.js';
import {FightEngine} from '../src/fight.js';
import {isVisibleFirearmProjectile} from '../src/combat-reference-policy.js';

const fighter=id=>ROSTER.find(f=>f.id===id);
const engines=new Set();
afterEach(()=>{for(const engine of engines)engine.destroy();engines.clear();});
function ticks(engine,count){for(let i=0;i<count;i++)engine.update();}
function engineFor({shooter='sh3_nurse_revolver_044',defender=fighter('sh3_missionary_047')}={}){
  globalThis.window={};
  globalThis.localStorage={getItem(){return null;},setItem(){},removeItem(){}};
  globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
  Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});
  globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};
  globalThis.requestAnimationFrame=()=>0;
  const gradient=()=>({addColorStop(){}});
  const context=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient,
    measureText:t=>({width:String(t).length*7})},{get:(t,k)=>k in t?t[k]:()=>{},set:(t,k,v)=>{t[k]=v;return true;}});
  const engine=new FightEngine({getContext:()=>context},{p1:fighter(shooter),p2:defender,
    stage:STAGES.find(s=>s.id==='apartment_roof'),mode:'local',roundsToWin:1,timeLimit:99,
    seed:913,stageHazards:false,stageDirector:false,otherworldShift:false,fatalities:false});
  engines.add(engine);ticks(engine,engine.phaseTimer);
  assert.equal(engine.phase,'fight');
  engine.actors[0].x=300;engine.actors[1].x=650;
  engine.actors.forEach((actor,index)=>{actor.facing=index?-1:1;actor.state='idle';actor.invuln=0;});
  return engine;
}
function impact(engine,move=engine.actors[0].profile.moves.neutralSpecial){
  const [attacker,target]=engine.actors;
  engine.applyHit(attacker,target,move,91,1,{ranged:move.projectile,direction:1});
}

test('visible firearm classification uses the exact authored work, slot and Alessa weapon phase',()=>{
  const nurse=fighter('sh3_nurse_revolver_044');
  const shot=createCombatProfile(nurse).moves.neutralSpecial;
  assert.equal(isVisibleFirearmProjectile(nurse,shot),true);
  assert.equal(isVisibleFirearmProjectile(nurse,{...shot,silenced:true}),false);
  assert.equal(isVisibleFirearmProjectile(nurse,{...shot,trap:true}),false);
  assert.equal(isVisibleFirearmProjectile(nurse,{...shot,key:'neutralLight'}),false);
  assert.equal(isVisibleFirearmProjectile({...nurse,source:'film'},shot),false);
  const alessa=fighter('sh3_memory_of_alessa_049'),phases=createCombatProfile(alessa).moveset.weaponPhases;
  assert.equal(isVisibleFirearmProjectile(alessa,phases[1].moves.neutralSpecial),true);
  assert.equal(isVisibleFirearmProjectile(alessa,phases[3].moves.neutralSpecial),true);
  assert.equal(isVisibleFirearmProjectile(alessa,{...phases[0].moves.neutralSpecial,projectile:true}),false);
});

test('a real frontal revolver shot hits the blades without damage, chip, meter or an automatic counter',()=>{
  const engine=engineFor(),[attacker,target]=engine.actors;
  const before={health:target.health,guard:target.guard,meter:target.meter,stats:{...target.stats},attackerHealth:attacker.health};
  assert.equal(engine.beginAttack(attacker,'neutralSpecial'),true);ticks(engine,70);
  assert.equal(engine.projectiles.length,0);
  assert.ok(engine.texts.some(text=>text.text==='TIR DÉVIÉ'));
  assert.equal(target.health,before.health);assert.equal(target.guard,before.guard);assert.equal(target.meter,before.meter);
  assert.deepEqual(target.stats,before.stats);assert.equal(attacker.stats.damageDealt,0);
  assert.equal(attacker.health,before.attackerHealth);assert.equal(target.attack,null);
});

test('a real bullet already in flight can hit the back after the shooter crosses to the opposite side',()=>{
  const engine=engineFor(),[attacker,target]=engine.actors,before=target.health;
  assert.equal(engine.beginAttack(attacker,'neutralSpecial'),true);
  ticks(engine,attacker.attack.move.startup);assert.equal(engine.projectiles.length,1);
  attacker.x=1100; // Position fixture: the existing bullet keeps its original direction.
  ticks(engine,70);
  assert.equal(target.facing,1);assert.ok(target.health<before);assert.ok(attacker.stats.damageDealt>0);
});

test('silenced-shot metadata bypasses the reaction without adding a silenced weapon to the authored roster',()=>{
  const engine=engineFor(),[attacker,target]=engine.actors,before=target.health;
  const authored=attacker.profile.moves.neutralSpecial;assert.equal(authored.silenced,undefined);
  attacker.profile.moves.neutralSpecial={...authored,silenced:true};
  assert.equal(engine.beginAttack(attacker,'neutralSpecial'),true);ticks(engine,70);
  assert.ok(target.health<before);
});

test('contact, energy and acid attacks are not reclassified as firearm shots',()=>{
  for(const shooter of ['sh3_nurse_revolver_044','sh1_incubus_019','sh2_lying_figure_020']){
    const engine=engineFor({shooter}),[attacker,target]=engine.actors,before=target.health;
    const move=shooter==='sh3_nurse_revolver_044'?attacker.profile.moves.neutralLight:attacker.profile.moves.neutralSpecial;
    impact(engine,move);assert.ok(target.health<before,shooter);
  }
});

test('attack, recovery, knockdown and broken-guard states leave Missionary exposed instead of granting an invulnerability reaction',()=>{
  const states=[
    actor=>{actor.state='attack';actor.attack={move:actor.profile.moves.neutralLight,frame:1};},
    actor=>{actor.state='hurt';actor.hurtFrames=12;},
    actor=>{actor.state='knockdown';actor.knockdownTimer=40;},
    actor=>{actor.state='guardBreak';actor.guardBreak=40;},
    actor=>{actor.state='jump';actor.grounded=false;},
    actor=>{actor.state='phase';actor.phaseLock=12;},
    actor=>{actor.state='taunt';}
  ];
  for(const prepare of states){
    const engine=engineFor(),target=engine.actors[1],before=target.health;
    prepare(target);impact(engine);assert.ok(target.health<before,target.state);
  }
});

test('the defensive policy does not transfer to a different native identity or source',()=>{
  const original=fighter('sh3_missionary_047');
  for(const defender of [{...original,id:'another-missionary-edition'},{...original,source:'film'},fighter('sh3_scraper_045')]){
    const engine=engineFor({defender}),target=engine.actors[1],before=target.health;
    assert.equal(target.profile.moveset.referencePolicy.defense?.frontalVisibleBullets,undefined);
    impact(engine);assert.ok(target.health<before);
  }
});
