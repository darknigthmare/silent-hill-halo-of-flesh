import test from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,STAGES} from '../src/data.js';
import {FightEngine} from '../src/fight.js';
import {defaultControls,rebindControl} from '../src/player-input.js';
function engine(extra={}){
  globalThis.window={};globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};
  Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});
  globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;
  const ctx=new Proxy({},{get:()=>()=>{},set:()=>true});
  return new FightEngine({getContext:()=>ctx},{p1:ROSTER[0],p2:ROSTER[0],stage:STAGES[0],mode:'local',roundsToWin:1,seed:2,...extra});
}
const pad=(index,id='pad')=>({index,id,mapping:'standard',connected:true,axes:[0,0],buttons:Array.from({length:17},()=>({pressed:false}))});
test('mirror engine match emits slot identity independently from duplicate fighter IDs',()=>{
  let outcome;const e=engine({callbacks:{onMatchEnd:r=>outcome=r}});e.phase='fight';e.endRound(e.actors[1],'K.O.');e.finishRoundTransition();
  assert.equal(outcome.winner.id,outcome.loser.id);assert.equal(outcome.winnerIndex,1);assert.equal(outcome.loserIndex,0);e.destroy();
});
test('rebound physical key reaches engine, old default key no longer fires',()=>{
  const e=engine();e.setBindings(rebindControl(defaultControls(),0,'light','KeyB'));
  e.input.onDown({code:'KeyB',preventDefault(){}});assert.equal(e.getControls(0).light,true);e.clearInputs();
  e.input.onDown({code:'KeyJ',preventDefault(){}});assert.equal(e.getControls(0).light,false);e.destroy();
});
test('typing into a UI input cannot attack the opponent',()=>{
  const e=engine();e.input.onDown({code:'KeyJ',target:{closest:()=>({})},preventDefault(){}});assert.equal(e.getControls(0).light,false);e.destroy();
});
test('touch jump and crouch map to actual controls, with old up alias supported',()=>{
  const e=engine();e.setTouch('p1','jump','pressed');e.setTouch('p1','down',true);const c=e.getControls(0);assert.equal(c.jump,true);assert.equal(c.down,true);
  e.clearInputs();e.setTouch('p1','up','pressed');assert.equal(e.getControls(0).jump,true);e.setTouch('p1','injected',true);assert.equal(e.touch.p1.injected,undefined);e.destroy();
});
test('controller disconnect pauses before another simulation step',()=>{
  const e=engine();let pads=[pad(4)];navigator.getGamepads=()=>pads;e.updateGamepads();e.phase='fight';pads=[];const before=e.actors[0].x;e.update();
  assert.equal(e.paused,true);assert.equal(e.actors[0].x,before);e.destroy();
});
test('Start pauses and resumes, without repeating while held',()=>{
  const e=engine();const p=pad(3);navigator.getGamepads=()=>[null,null,null,p];e.updateGamepads();p.buttons[9].pressed=true;e.updateGamepads();assert.equal(e.paused,true);
  e.updateGamepads();assert.equal(e.paused,true);p.buttons[9].pressed=false;e.updateGamepads();p.buttons[9].pressed=true;e.updateGamepads();assert.equal(e.paused,false);e.destroy();
});
test('controller already held at attachment does not inject attacks',()=>{
  const e=engine(),p=pad(5);p.buttons[2].pressed=true;navigator.getGamepads=()=>[null,null,null,null,null,p];e.updateGamepads();assert.equal(e.getControls(0).light,false);e.destroy();
});
test('releasing one bumper while the other guards is not a guard release',()=>{
  const e=engine(),p=pad(0);navigator.getGamepads=()=>[p];e.updateGamepads();p.buttons[4].pressed=true;p.buttons[5].pressed=true;e.getControls(0);
  p.buttons[4].pressed=false;const held=e.getControls(0);assert.equal(held.guard,true);assert.equal(held.guardReleased,false);p.buttons[5].pressed=false;assert.equal(e.getControls(0).guardReleased,true);e.destroy();
});
test('focus loss pauses intros and fatalities as well as ordinary combat',()=>{
  for(const phase of ['intro','fight','fatality']){const e=engine();e.phase=phase;e.onFocusLoss();assert.equal(e.paused,true);e.destroy();}
});
