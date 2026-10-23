import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,STAGES,createCombatProfile} from '../src/data.js';
import {FightEngine} from '../src/fight.js';
import {combatReferenceRecipe} from '../src/combat-reference-policy.js';

const CYBIL='sh1_monster_cybil_017',NURSE='sh3_nurse_revolver_044';
const fighter=id=>ROSTER.find(f=>f.id===id);
const engines=new Set();
afterEach(()=>{for(const engine of engines)engine.destroy();engines.clear();});
function ticks(engine,count){for(let i=0;i<count;i++)engine.update();}
function engineFor(shooter=CYBIL){
  globalThis.window={};
  globalThis.localStorage={getItem(){return null;},setItem(){},removeItem(){}};
  globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
  Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});
  globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};
  globalThis.requestAnimationFrame=()=>0;
  const gradient=()=>({addColorStop(){}});
  const context=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient,
    measureText:t=>({width:String(t).length*7})},{get:(t,k)=>k in t?t[k]:()=>{},set:(t,k,v)=>{t[k]=v;return true;}});
  const engine=new FightEngine({getContext:()=>context},{p1:fighter(shooter),p2:fighter(NURSE),stage:STAGES[0],
    mode:'local',roundsToWin:2,timeLimit:99,seed:830,stageHazards:false,stageDirector:false,
    otherworldShift:false,fatalities:false});
  engines.add(engine);ticks(engine,engine.phaseTimer);assert.equal(engine.phase,'fight');
  engine.actors[0].x=300;engine.actors[1].x=650;
  engine.actors.forEach((actor,index)=>{actor.facing=index?-1:1;actor.invuln=0;actor.state='idle';});
  return engine;
}
function untilDamage(engine,limit=120){
  const target=engine.actors[1],before=target.health;
  while(target.health===before&&limit-->0)engine.update();
  assert.ok(limit>0,'an emitted projectile must collide through the real update loop');
  return before-target.health;
}

test('the shared SH1 bird controller maps standing bite, hover bite and gliding scratch to separate inputs',()=>{
  for(const id of ['sh1_air_screamer_001','sh1_night_flutter_002']){
    const moves=createCombatProfile(fighter(id)).moves;
    assert.match(moves.neutralLight.name,/Morsure au sol/);
    assert.match(moves.airLight.name,/Morsure en vol stationnaire/);
    assert.match(moves.airHeavy.name,/Griffure en vol plané/);
    for(const key of ['neutralSpecial','forwardSpecial','airSpecial'])assert.match(moves[key].name,/Griffure.*plan/);
    for(const key of ['neutralLight','airLight','airHeavy','neutralSpecial','forwardSpecial','airSpecial']){
      assert.equal(moves[key].projectile,false,`${id}:${key}`);
      assert.notEqual(moves[key].fidelity,'direct-canonical','source-labelled behavior does not certify animation timing');
    }
  }
});

test('Cybil real pistol collision knocks the target down after emission without changing her shot reserve contract',()=>{
  const engine=engineFor(),[actor,target]=engine.actors,before=target.health;
  assert.equal(engine.beginAttack(actor,'neutralSpecial'),true);
  assert.equal(actor.ammo,9);ticks(engine,actor.attack.move.startup-1);
  assert.equal(target.health,before);assert.equal(target.knockdownTimer,0);
  assert.ok(untilDamage(engine)>0);
  assert.equal(target.state,'knockdown');assert.ok(target.knockdownTimer>0);
  assert.equal(target.hurtFrames,0);assert.equal(engine.projectiles.length,0);
  assert.equal(actor.weaponDiscarded,false);assert.equal(actor.ammo,9);
});

test('a different native firearm does not borrow Cybil bullet knockdown',()=>{
  const engine=engineFor(NURSE),[actor,target]=engine.actors;
  assert.equal(actor.profile.moves.neutralSpecial.knockdown,false);
  assert.equal(engine.beginAttack(actor,'neutralSpecial'),true);
  assert.ok(untilDamage(engine)>0);
  assert.equal(target.knockdownTimer,0);assert.equal(target.state,'hurt');
});

test('a renamed or cross-work Cybil record cannot inherit her authored shot or its knockdown',()=>{
  const original=fighter(CYBIL);
  for(const other of [{...original,id:'different_cybil',baseId:CYBIL},{...original,source:'film'}]){
    assert.deepEqual(combatReferenceRecipe(other),{});
    const move=createCombatProfile(other).moves.neutralSpecial;
    assert.equal(move.enabled,false);assert.equal(move.projectile,false);assert.equal(move.knockdown,false);
  }
});

test('ten real missed shots still exhaust Cybil and the following contact input remains the existing unarmed grab',()=>{
  const engine=engineFor(),[actor,target]=engine.actors;
  actor.x=150;target.x=1150;
  const before=target.health;
  for(let count=0;count<10;count++){
    assert.equal(engine.beginAttack(actor,'neutralSpecial'),true);ticks(engine,70);
  }
  assert.equal(target.health,before);assert.equal(actor.ammo,0);assert.equal(actor.weaponDiscarded,true);
  actor.x=500;target.x=560;
  assert.equal(engine.beginAttack(actor,'neutralSpecial'),true);
  assert.equal(actor.attack.move,actor.profile.moves.neutralSpecial.exhaustedMove);
  assert.equal(actor.attack.move.projectile,false);assert.equal(actor.attack.move.level,'throw');
  assert.ok(untilDamage(engine)>0);assert.equal(engine.projectiles.length,0);assert.equal(actor.ammo,0);
});
