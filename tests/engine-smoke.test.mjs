import test from 'node:test';
import assert from 'node:assert/strict';
import { ROSTER, STAGES } from '../src/data.js';
import { FightEngine } from '../src/fight.js';

function installBrowserStubs(){
  globalThis.window=globalThis.window||{};
  globalThis.localStorage={getItem(){return null;},setItem(){},removeItem(){}};
  Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});
  globalThis.addEventListener=()=>{};
  globalThis.removeEventListener=()=>{};
  globalThis.requestAnimationFrame=()=>0;
}
function fakeGradient(){return {addColorStop(){}};}
function fakeContext(){
  const base={
    createLinearGradient:fakeGradient,createRadialGradient:fakeGradient,createPattern:()=>null,
    measureText:(text)=>({width:String(text).length*7}),
    save(){},restore(){},setTransform(){},translate(){},scale(){},rotate(){},beginPath(){},closePath(){},moveTo(){},lineTo(){},quadraticCurveTo(){},bezierCurveTo(){},arc(){},ellipse(){},rect(){},fill(){},stroke(){},fillRect(){},strokeRect(){},clearRect(){},fillText(){},strokeText(){},setLineDash(){},clip(){},drawImage(){},
  };
  return new Proxy(base,{get(target,key){if(key in target)return target[key];return typeof key==='string'?()=>{}:undefined;},set(target,key,value){target[key]=value;return true;}});
}
function makeEngine(extra={}){
  installBrowserStubs();
  const ctx=fakeContext();
  const canvas={width:1280,height:720,getContext:()=>ctx};
  return new FightEngine(canvas,{p1:ROSTER[0],p2:ROSTER.find(f=>f.boss)||ROSTER[1],stage:STAGES[0],mode:'local',roundsToWin:1,timeLimit:60,seed:1234,...extra});
}

test('fight engine advances and renders with a headless canvas contract',()=>{
  const engine=makeEngine();
  engine.phase='fight';engine.phaseTimer=0;
  for(let i=0;i<240;i++)engine.update();
  engine.render(4000);
  const state=engine.snapshot();
  assert.equal(state.phase,'fight');
  assert.ok(state.time<60);
  assert.ok(state.p1.health>0&&state.p2.health>0);
  engine.destroy();
});

test('forced Otherworld shift reaches a renderable transformed state',()=>{
  const engine=makeEngine({stageHazards:true,otherworldShift:true,radioWarning:true});
  engine.phase='fight';engine.forceOtherworldShift();
  for(let i=0;i<180;i++)engine.update();
  engine.render(8000);
  const state=engine.snapshot();
  assert.equal(state.world.triggered,true);
  assert.equal(state.world.phase,'otherworld');
  assert.equal(state.world.amount,1);
  engine.destroy();
});

test('training options can be changed without rebuilding the match',()=>{
  const engine=makeEngine({training:true,timeLimit:0});
  engine.setTrainingOptions({showHitboxes:true,autoHeal:true,freeMeter:true});
  const state=engine.snapshot();
  assert.equal(engine.config.showHitboxes,true);
  assert.equal(engine.config.autoHeal,true);
  assert.equal(state.p1.meter,100);
  assert.equal(state.p2.meter,100);
  engine.destroy();
});


test('boss phases can be forced in Observation and alter the combat snapshot',()=>{
  const boss=ROSTER.find(f=>f.boss);
  const engine=makeEngine({training:true,p2:boss});
  engine.phase='fight';
  assert.equal(engine.forceBossPhase(1),true);
  let state=engine.snapshot();
  assert.equal(state.p2.bossPhase,1);
  assert.ok(state.p2.bossPhaseName);
  assert.equal(engine.forceBossPhase(1),true);
  state=engine.snapshot();
  assert.equal(state.p2.bossPhase,2);
  assert.equal(engine.forceBossPhase(1),false);
  engine.render(9000);
  engine.destroy();
});

test('rituals apply initial endurance, meter and starting Otherworld state',()=>{
  const engine=makeEngine({ritualId:'redJudgment',initialHealthRatio:.42,initialMeter:47});
  const state=engine.snapshot();
  assert.ok(Math.abs(state.p1.health/state.p1.maxHealth-.42)<.01);
  assert.equal(state.p1.meter,47);
  assert.equal(state.world.phase,'otherworld');
  assert.equal(state.ritual.id,'redJudgment');
  engine.destroy();
});

test('blood debt ritual drains health at a deterministic one-second cadence',()=>{
  const engine=makeEngine({ritualId:'bloodDebt'});
  engine.phase='fight';
  const before=engine.actors[0].health;
  engine.frame=59;
  engine.update();
  assert.equal(engine.actors[0].health,before-1);
  assert.equal(engine.actors[0].stats.ritualDamage,1);
  engine.destroy();
});

test('decisive super triggers and completes a stage fatality',()=>{
  const engine=makeEngine({fatalities:true,stageFatalities:true,roundsToWin:1});
  engine.phase='fight';
  const attacker=engine.actors[0],target=engine.actors[1];
  target.health=10;
  engine.applyHit(attacker,target,attacker.profile.moves.super,1);
  engine.resolveKnockouts();
  assert.equal(engine.phase,'fatality');
  assert.equal(engine.fatality.stageBased,true);
  for(let frame=0;frame<400&&engine.phase==='fatality';frame++)engine.update();
  assert.equal(engine.phase,'roundEnd');
  assert.equal(engine.lastFatality.stageBased,true);
  assert.equal(attacker.stats.fatalities,1);
  assert.equal(attacker.stats.stageFatalities,1);
  engine.destroy();
});

test('signature fatality can be forced away from the stage trigger zone',()=>{
  const engine=makeEngine({fatalities:true,stageFatalities:true,roundsToWin:1});
  engine.phase='fight';
  const attacker=engine.actors[0],target=engine.actors[1];
  target.x=640;attacker.x=500;target.health=5;
  engine.applyHit(attacker,target,attacker.profile.moves.light,1);
  engine.resolveKnockouts();
  assert.equal(engine.phase,'fatality');
  assert.equal(engine.fatality.stageBased,false);
  assert.equal(engine.fatality.definition.type,'signature');
  for(let frame=0;frame<400&&engine.phase==='fatality';frame++)engine.update();
  assert.equal(engine.lastFatality.stageBased,false);
  assert.equal(attacker.stats.fatalities,1);
  assert.equal(attacker.stats.stageFatalities,0);
  engine.destroy();
});

test('fatality systems can be disabled for classic knockout behavior',()=>{
  const engine=makeEngine({fatalities:false,stageFatalities:false,roundsToWin:1});
  engine.phase='fight';
  const attacker=engine.actors[0],target=engine.actors[1];
  target.health=1;
  engine.applyHit(attacker,target,attacker.profile.moves.light,1);
  engine.resolveKnockouts();
  assert.equal(engine.phase,'roundEnd');
  assert.equal(engine.lastFatality,null);
  assert.equal(target.ko,true);
  engine.destroy();
});
