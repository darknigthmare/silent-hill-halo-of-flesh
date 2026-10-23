import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,STAGES,createCombatProfile} from '../src/data.js';
import {FightEngine} from '../src/fight.js';
import {ALESSA_FIGHTER_ID,weaponPhase,preserveWeaponPhaseBoundary} from '../src/weapon-phases.js';

const fighter=id=>ROSTER.find(f=>f.id===id);
const engines=new Set();
afterEach(()=>{for(const engine of engines)engine.destroy();engines.clear();});
function engineFor(extra={}){
  globalThis.window={};
  globalThis.localStorage={getItem(){return null;},setItem(){},removeItem(){}};
  globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
  Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});
  globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};
  globalThis.requestAnimationFrame=()=>0;
  const gradient=()=>({addColorStop(){}});
  const context=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient,
    measureText:t=>({width:String(t).length*7})},{get:(t,k)=>k in t?t[k]:()=>{},set:(t,k,v)=>{t[k]=v;return true;}});
  const engine=new FightEngine({getContext:()=>context},{p1:fighter(ALESSA_FIGHTER_ID),
    p2:fighter('sh2_bubble_head_nurse_024'),stage:STAGES.find(s=>s.id==='lakeside_sh3')||STAGES[0],
    mode:'local',roundsToWin:2,timeLimit:99,seed:712,stageHazards:false,
    stageDirector:false,otherworldShift:false,fatalities:false,...extra});
  engines.add(engine);
  ticks(engine,engine.phaseTimer);
  assert.equal(engine.phase,'fight');
  return engine;
}
function ticks(engine,count){for(let i=0;i<count;i++)engine.update();}
function finishTransition(engine,actor){
  for(let i=0;i<80&&actor.weaponTransition;i++)engine.update();
  assert.equal(actor.weaponTransition,null);
}
function forceNext(engine,actor){
  assert.equal(engine.forceBossPhase(actor.index),true);
  assert.equal(engine.forceBossPhase(actor.index),false,'a transition cannot skip a weapon');
  finishTransition(engine,actor);
}

test('Alessa equips source-ordered phase-specific kits; knife and pipe cannot emit bullets or mix weapons in their supers',()=>{
  const profile=createCombatProfile(fighter(ALESSA_FIGHTER_ID));
  const phases=profile.moveset.weaponPhases;
  assert.deepEqual(phases.map(p=>p.id),['knife','handgun','pipe','smg']);
  for(const phase of phases){
    assert.equal(phase.sourceTimingMeasured,false);
    assert.equal(phase.moves.super.weaponPhaseId,phase.id);
    assert.equal(phase.moves.super.enabled,true);
    assert.equal(phase.moves.super.teleport,null);
    assert.ok(Object.values(phase.moves).every(move=>move.weaponPhaseId===phase.id));
    if(['knife','pipe'].includes(phase.id))assert.ok(Object.values(phase.moves).every(move=>!move.projectile));
    else{
      assert.equal(phase.moves.neutralSpecial.projectile,true);
      assert.equal(phase.moves.neutralLight.projectile,false);
      assert.match(phase.moves.neutralLight.name,/Crosse/);
    }
  }
  assert.equal(phases[3].moves.neutralSpecial.projectileCount,1,'SMG bursts are successive bullets, not a shotgun spread');
  assert.equal(phases[3].moves.neutralSpecial.projectileBurstCount,3);
  const other={data:{...fighter(ALESSA_FIGHTER_ID),id:'another-edition'},profile,weaponPhaseIndex:0};
  assert.equal(weaponPhase(other),null);
});

test('a real overkill spends only one weapon phase budget, advances in order and reaches final KO without resurrection',()=>{
  const engine=engineFor(),actor=engine.actors[0];
  const originalMax=actor.maxHealth;
  for(const [index,id] of ['handgun','pipe','smg'].entries()){
    const before=actor.health;
    const damageBefore=actor.stats.damageTaken;
    engine.applyStatusDamage(actor,originalMax*20);
    const expected=Math.ceil(originalMax*[.75,.5,.25][index]);
    assert.equal(actor.health,expected);
    assert.equal(actor.stats.damageTaken-damageBefore,before-expected,'stats count actual phase damage');
    assert.equal(actor.weaponPhaseIndex,index);
    engine.update();
    assert.ok(actor.weaponTransition);
    assert.equal(engine.beginAttack(actor,'neutralSpecial'),false);
    finishTransition(engine,actor);
    assert.equal(weaponPhase(actor).id,id);
    assert.equal(actor.health,expected,'a phase transition does not invent healing');
    assert.equal(actor.maxHealth,originalMax);
    engine.update();
    assert.equal(actor.phaseLock,0,'a due generic buff shares recovery instead of swallowing the next input');
  }
  engine.applyStatusDamage(actor,originalMax*20);
  assert.equal(actor.health,0);
  engine.resolveKnockouts();
  assert.equal(actor.ko,true);
  assert.equal(actor.weaponPhaseIndex,3);
  assert.equal(engine.advanceWeaponPhase(actor),false);
  assert.equal(actor.health,0);
});

test('weapon recovery freezes during pause, leaves existing enemy bullets intact and commits only after the recovery clock',()=>{
  const engine=engineFor(),[actor,enemy]=engine.actors;
  engine.spawnProjectile(enemy,{...enemy.profile.moves.neutralSpecial,projectile:true,enabled:true,projectileCount:1},91);
  const bullet=engine.projectiles[0];assert.ok(bullet);
  engine.applyStatusDamage(actor,actor.maxHealth);
  engine.update();
  assert.equal(weaponPhase(actor).id,'knife');
  const pending=structuredClone(engine.snapshot().p1.weaponPhase.transition);
  assert.equal(pending.to,'handgun');
  assert.equal(engine.completeWeaponPhase(actor),false,'the next weapon cannot commit before recovery');
  engine.togglePause(true);ticks(engine,90);
  assert.equal(engine.forceBossPhase(0),false);
  assert.deepEqual(engine.snapshot().p1.weaponPhase.transition,pending);
  assert.ok(engine.projectiles.includes(bullet));
  engine.togglePause(false);
  finishTransition(engine,actor);
  assert.equal(engine.snapshot().p1.weaponPhase.id,'handgun');
  assert.equal(actor.profile.moves.neutralSpecial.projectile,true);
  engine.render(1000);
});

test('handgun emits one bullet and the SMG emits a timed three-bullet burst with one equipped weapon',()=>{
  const engine=engineFor(),actor=engine.actors[0];
  actor.x=110;engine.actors[1].x=1150;
  assert.equal(engine.spawnProjectile(actor,actor.profile.moveset.weaponPhases[1].moves.neutralSpecial,90),false,
    'a copied future-phase pistol recipe cannot fire while the knife is equipped');
  forceNext(engine,actor);
  let emitted=0;
  const spawn=engine.spawnProjectile;
  engine.spawnProjectile=function(...args){const before=this.projectiles.length;spawn.apply(this,args);emitted+=this.projectiles.length-before;};
  assert.equal(engine.beginAttack(actor,'neutralSpecial'),true);
  ticks(engine,60);
  assert.equal(emitted,1);
  forceNext(engine,actor);
  assert.equal(actor.profile.moves.neutralSpecial.projectile,false);
  forceNext(engine,actor);
  emitted=0;
  assert.equal(engine.beginAttack(actor,'neutralSpecial'),true);
  const move=actor.attack.move;
  ticks(engine,move.startup);
  assert.equal(emitted,1);
  ticks(engine,move.projectileBurstInterval);
  assert.equal(emitted,2);
  ticks(engine,move.projectileBurstInterval);
  assert.equal(emitted,3);
  ticks(engine,60);
  assert.equal(emitted,3);
  assert.equal(weaponPhase(actor).id,'smg');
});

test('healing cannot reverse an accepted weapon transition; new rounds and a full retry restore the initial knife phase',()=>{
  const engine=engineFor(),actor=engine.actors[0];
  engine.applyStatusDamage(actor,actor.maxHealth);
  engine.update();
  actor.health=actor.maxHealth;
  finishTransition(engine,actor);
  assert.equal(weaponPhase(actor).id,'handgun');
  engine.resetRound();ticks(engine,engine.phaseTimer);
  assert.equal(weaponPhase(actor).id,'knife');
  assert.equal(actor.profile.moves.neutralSpecial.projectile,false);
  assert.equal(actor.weaponTransition,null);
  forceNext(engine,actor);forceNext(engine,actor);
  engine.resetMatch();ticks(engine,engine.phaseTimer);
  assert.equal(weaponPhase(actor).id,'knife');
  assert.equal(actor.health,actor.maxHealth);
  assert.equal(actor.profile.moves.neutralSpecial.projectile,false);
});

test('generic versus boss buffs do not silently change the weapon and unrelated fighters retain normal damage',()=>{
  const engine=engineFor(),[actor,other]=engine.actors;
  engine.advanceBossPhase(actor,actor.bossPhases[0],true);
  ticks(engine,28);
  assert.equal(weaponPhase(actor).id,'knife');
  assert.equal(actor.weaponTransition,null);
  engine.applyStatusDamage(other,other.maxHealth*10);
  assert.equal(other.health,0);
  const scene={data:actor.data,profile:actor.profile,weaponPhaseIndex:0,maxHealth:actor.maxHealth,health:0};
  assert.equal(preserveWeaponPhaseBoundary(scene,0),0,'a pre-existing KO scene is never resurrected');
  assert.equal(scene.health,0);
});
