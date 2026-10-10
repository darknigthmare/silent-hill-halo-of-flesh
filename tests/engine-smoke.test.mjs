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
