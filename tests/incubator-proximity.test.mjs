import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,STAGES,createCombatProfile} from '../src/data.js';
import {FightEngine} from '../src/fight.js';
import {combatReferencePolicy,combatReferenceRecipe} from '../src/combat-reference-policy.js';

const fighter=id=>ROSTER.find(f=>f.id===id);
const INCUBATOR='sh1_incubator_018',INCUBUS='sh1_incubus_019';
const engines=new Set();
afterEach(()=>{for(const engine of engines)engine.destroy();engines.clear();});
function ticks(engine,count){for(let i=0;i<count;i++)engine.update();}
function engineFor(p1=INCUBATOR,p2='sh3_nurse_revolver_044'){
  globalThis.window={};
  globalThis.localStorage={getItem(){return null;},setItem(){},removeItem(){}};
  globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
  Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});
  globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};
  globalThis.requestAnimationFrame=()=>0;
  const gradient=()=>({addColorStop(){}});
  const context=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient,
    measureText:t=>({width:String(t).length*7})},{get:(t,k)=>k in t?t[k]:()=>{},set:(t,k,v)=>{t[k]=v;return true;}});
  const engine=new FightEngine({getContext:()=>context},{p1:fighter(p1),p2:fighter(p2),stage:STAGES[0],
    mode:'local',roundsToWin:2,timeLimit:99,seed:712,stageHazards:false,
    stageDirector:false,otherworldShift:false,fatalities:false});
  engines.add(engine);ticks(engine,engine.phaseTimer);
  assert.equal(engine.phase,'fight');
  return engine;
}
function position(engine,distance=120){
  const [source,target]=engine.actors;
  source.x=600;target.x=600+distance;
  for(const actor of engine.actors){actor.y=594;actor.vx=0;actor.vy=0;actor.grounded=true;}
  return [source,target];
}

test('only exact SH1 Incubator receives the passive source field, with explicitly unmeasured versus tuning',()=>{
  const field=combatReferencePolicy(fighter(INCUBATOR)).proximityField;
  assert.equal(field.id,'incubator-proximity');
  assert.equal(field.sourceTimingMeasured,false);
  assert.match(field.fidelity,/versus/);
  assert.ok(field.radius>0&&field.knockdown>0&&field.cooldown>field.knockdown);
  assert.equal(combatReferencePolicy(fighter(INCUBUS)).proximityField,undefined);
  for(const f of [{...fighter(INCUBATOR),id:'another-incubator',baseId:INCUBATOR},
    {...fighter(INCUBATOR),source:'film'}]){
    assert.equal(combatReferencePolicy(f).proximityField,undefined);
    assert.deepEqual(combatReferenceRecipe(f),{});
  }
});

test('idle proximity interrupts and knocks outward without a projectile, guard reward, meter gain or combo',()=>{
  const engine=engineFor(),[source,target]=position(engine),before=target.health;
  source.meter=13;target.meter=27;target.blocking=true;target.parryWindow=4;
  assert.equal(engine.beginAttack(target,'neutralLight'),true);
  engine.updateProximityFields();
  const field=source.profile.referencePolicy.proximityField;
  assert.equal(target.health,before-field.damage);
  assert.equal(target.stats.damageTaken,field.damage);
  assert.equal(source.stats.damageDealt,field.damage);
  assert.equal(source.attack,null);
  assert.equal(target.attack,null);
  assert.equal(target.state,'knockdown');
  assert.equal(target.knockdownTimer,field.knockdown);
  assert.ok(target.vx>0&&target.vy<0);
  assert.equal(target.grounded,false);
  assert.equal(target.blocking,false);
  assert.equal(target.parryWindow,0);
  assert.deepEqual([source.meter,target.meter,source.combo,source.stats.maxCombo,target.stats.perfectGuards,target.stats.counters],[13,27,0,0,0,0]);
  assert.equal(engine.projectiles.length,0);
  assert.equal(source.proximityCooldown,field.cooldown);
  assert.equal(target.lastHit.moveKey,field.id);
});

test('proximity uses strict local center range and vertical body overlap, independently of facing',()=>{
  for(const distance of [-120,120]){
    const engine=engineFor(),[source,target]=position(engine,distance);
    source.facing=distance<0?1:-1;
    engine.updateProximityFields();
    assert.equal(Math.sign(target.vx),Math.sign(distance));
  }
  for(const outside of ['boundary','distant','above']){
    const engine=engineFor(),[source,target]=position(engine),before=target.health;
    target.x=source.x+(outside==='distant'?600:source.profile.referencePolicy.proximityField.radius);
    if(outside==='above'){target.x=source.x+120;target.y=100;target.grounded=false;}
    engine.updateProximityFields();
    assert.equal(target.health,before,outside);
    assert.equal(target.knockdownTimer,0,outside);
    assert.equal(source.proximityCooldown,0,outside);
  }
});

test('real body resolution leaves an approaching opponent in the field without displacing the stationary caster',()=>{
  const engine=engineFor(),[source,target]=position(engine,30),before=target.health,start=source.x;
  ticks(engine,1);
  assert.equal(source.x,start);
  assert.equal(source.y,594);
  assert.equal(target.state,'knockdown');
  assert.ok(target.health<before);
  assert.ok(target.x>source.x);
});

test('invulnerability, existing knockdown, a dead caster, noncombat policy and copied identities prevent a field hit',()=>{
  for(const reason of ['invuln','knockdown','phase','dead','disabled','renamed','other-source']){
    const engine=engineFor(),[source,target]=position(engine),before=target.health;
    if(reason==='invuln')target.invuln=5;
    if(reason==='knockdown')target.knockdownTimer=10;
    if(reason==='phase')target.phaseLock=10;
    if(reason==='dead')source.health=0;
    if(reason==='disabled')source.profile.referencePolicy.combatEnabled=false;
    if(reason==='renamed')source.data={...source.data,id:INCUBUS};
    if(reason==='other-source')source.data={...source.data,source:'film'};
    engine.updateProximityFields();
    assert.equal(target.health,before,reason);
    assert.equal(source.proximityCooldown,0,reason);
  }
  const engine=engineFor(INCUBUS),[source,target]=position(engine),before=target.health;
  source.profile.referencePolicy.proximityField=combatReferencePolicy(fighter(INCUBATOR)).proximityField;
  engine.updateProximityFields();
  assert.equal(target.health,before,'a forged Incubus field is rejected even with matching policy identity');
});

test('cooldown prevents repeated contact and freezes during pause and hitstop; reentry works when it expires',()=>{
  const engine=engineFor(),[source,target]=position(engine);
  engine.updateProximityFields();const health=target.health,cooldown=source.proximityCooldown;
  engine.updateProximityFields();assert.equal(target.health,health);
  target.knockdownTimer=0;target.invuln=0;target.state='idle';position(engine);
  engine.updateProximityFields();assert.equal(target.health,health,'standing up does not bypass caster cooldown');
  engine.togglePause(true);ticks(engine,10);engine.updateProximityFields();
  assert.equal(source.proximityCooldown,cooldown);assert.equal(target.health,health);
  engine.togglePause(false);engine.hitstop=3;ticks(engine,3);
  assert.equal(source.proximityCooldown,cooldown);assert.equal(target.health,health);
  target.x=1100;ticks(engine,cooldown-1);assert.equal(source.proximityCooldown,1);
  position(engine);ticks(engine,1);
  assert.equal(target.health,health-1);assert.equal(source.proximityCooldown,cooldown);
});

test('field damage preserves phase budgets and never clears existing opponent projectiles',()=>{
  const engine=engineFor(INCUBATOR,'sh3_memory_of_alessa_049'),[source,target]=position(engine);
  target.health=Math.ceil(target.maxHealth*.75);
  engine.updateProximityFields();
  assert.equal(target.health,Math.ceil(target.maxHealth*.75));
  assert.equal(source.stats.damageDealt,0);
  assert.equal(target.stats.damageTaken,0);
  const other=engineFor(),[caster,shooter]=position(other);
  other.spawnProjectile(shooter,shooter.profile.moves.neutralSpecial,9);
  const projectiles=[...other.projectiles];assert.equal(projectiles.length,1);
  other.updateProximityFields();
  assert.deepEqual(other.projectiles,projectiles);
  assert.ok(shooter.knockdownTimer>0);
  assert.equal(caster.attack,null);
});

test('fixed target bodies stay anchored and round/retry boundaries clear only the field cooldown state',()=>{
  const engine=engineFor(INCUBATOR,'sh4_wall_man_056'),[source,target]=position(engine),start=target.x;
  engine.updateProximityFields();engine.physics(target);
  assert.equal(target.x,start);assert.equal(target.y,594);assert.equal(target.vx,0);assert.equal(target.grounded,true);
  assert.ok(target.knockdownTimer>0);
  engine.resetRound();assert.equal(source.proximityCooldown,0);
  position(engine);engine.updateProximityFields();assert.equal(source.proximityCooldown,0,'intro has no passive combat');
  ticks(engine,engine.phaseTimer);assert.equal(engine.phase,'fight');
  position(engine);engine.updateProximityFields();assert.ok(source.proximityCooldown>0);
  engine.resetMatch();assert.equal(source.proximityCooldown,0);
});

test('only the two documented SH1 lightning forms supply blue/red projectile hues',()=>{
  for(const [id,color] of [[INCUBATOR,'#80baff'],[INCUBUS,'#ff6868']]){
    const engine=engineFor(id),source=engine.actors[0];
    for(const key of ['neutralSpecial','super','desperation']){
      const move=source.profile.moves[key];assert.equal(move.projectileColor,color);
      engine.spawnProjectile(source,move,100);
      assert.equal(engine.projectiles.at(-1).color,color);
    }
    assert.equal(source.profile.moves.neutralLight.projectileColor,undefined);
  }
  const f={...fighter(INCUBATOR),source:'film'};
  assert.equal(createCombatProfile(f).moves.neutralSpecial.projectileColor,undefined);
});
