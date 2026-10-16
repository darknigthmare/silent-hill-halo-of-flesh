import test from 'node:test';
import assert from 'node:assert/strict';
import { FightEngine } from '../src/fight.js';
import { ROSTER, STAGES } from '../src/data.js';

const pad = index => ({index,id:`pad-${index}`,mapping:'standard',connected:true,
  axes:[0,0],buttons:Array.from({length:17},()=>({pressed:false}))});
function setup(extra={}) {
  globalThis.window={};globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};
  Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});
  globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};
  const requests=new Map(),cancelled=[];let id=0;
  globalThis.requestAnimationFrame=fn=>{requests.set(++id,fn);return id;};
  globalThis.cancelAnimationFrame=id=>{cancelled.push(id);requests.delete(id);};
  const ctx=new Proxy({},{get:()=>()=>{},set:()=>true});
  const e=new FightEngine({getContext:()=>ctx},{p1:ROSTER[0],p2:ROSTER[0],stage:STAGES[0],
    mode:'local',roundsToWin:1,stageHazards:false,stageDirector:false,otherworldShift:false,seed:51,...extra});
  e.phase='fight';return {e,requests,cancelled};
}
const key=code=>({code,preventDefault(){}});

test('hitstop buffers an attack without resurrecting released guard or its perfect-guard edge',()=>{
  const {e}=setup();e.hitstop=1;e.setTouch('p1','guard','pressed');e.setTouch('p1','light','pressed');e.update();
  e.setTouch('p1','guard',false);const c=e.getControls(0);
  assert.equal(c.light,true);assert.equal(c.guard,false);assert.equal(c.guardPressed,false);assert.equal(c.guardReleased,true);e.destroy();
});
test('hitstop action uses currently held directions, not stale movement or crouching',()=>{
  const {e}=setup();e.hitstop=1;e.setTouch('p1','left',true);e.setTouch('p1','down',true);e.setTouch('p1','heavy','pressed');e.update();
  e.setTouch('p1','left',false);e.setTouch('p1','down',false);e.setTouch('p1','right',true);const c=e.getControls(0);
  assert.equal(c.heavy,true);assert.equal(c.left,false);assert.equal(c.down,false);assert.equal(c.right,true);e.destroy();
});
test('hitstop attack impulse is consumed exactly once',()=>{
  const {e}=setup();e.hitstop=1;e.setTouch('p1','light','pressed');e.update();
  assert.equal(e.getControls(0).light,true);assert.equal(e.getControls(0).light,false);e.destroy();
});
for(const phase of ['intro','roundEnd','fatality','matchEnd'])test(`${phase} consumes touch impulses without releasing a held direction`,()=>{
  const {e}=setup();e.phase=phase;e.phaseTimer=20;e.setTouch('p1','right',true);
  // matchEnd rejects setTouch already; simulate the impulse queued just before the transition.
  e.touch.p1.light='pressed';e.touch.p1.guard='pressed';e.update();e.phase='fight';
  const c=e.getControls(0);assert.equal(c.light,false);assert.equal(c.guardPressed,false);
  if(phase!=='matchEnd')assert.equal(c.right,true);e.destroy();
});
test('intro consumes gamepad attack presses but a fresh combat press remains usable',()=>{
  const {e}=setup(),p=pad(0);navigator.getGamepads=()=>[p];e.updateGamepads();
  e.phase='intro';e.phaseTimer=1;p.buttons[2].pressed=true;e.update();
  assert.equal(e.getControls(0).light,false);p.buttons[2].pressed=false;e.getControls(0);
  p.buttons[2].pressed=true;assert.equal(e.getControls(0).light,true);e.destroy();
});
test('two simultaneous Start buttons pause once instead of cancelling one another',()=>{
  const {e}=setup(),a=pad(0),b=pad(1);navigator.getGamepads=()=>[a,b];e.updateGamepads();
  a.buttons[9].pressed=b.buttons[9].pressed=true;e.updateGamepads();assert.equal(e.paused,true);
  e.updateGamepads();assert.equal(e.paused,true);e.destroy();
});
test('controller loss wins over simultaneous Start on the other controller',()=>{
  const {e}=setup(),a=pad(0),b=pad(1);let pads=[a,b];navigator.getGamepads=()=>pads;e.updateGamepads();
  pads=[null,b];b.buttons[9].pressed=true;e.updateGamepads();assert.equal(e.paused,true);e.destroy();
});
test('blocked Gamepad API cannot crash a keyboard-controlled simulation',()=>{
  const {e}=setup();navigator.getGamepads=()=>{throw new DOMException('Blocked','SecurityError');};
  const before=e.matchTime;assert.doesNotThrow(()=>e.update());assert.ok(e.matchTime<before);e.destroy();
});
test('Gamepad API loss pauses an attached controller and allows clean recovery',()=>{
  const {e}=setup(),p=pad(0);navigator.getGamepads=()=>[p];e.updateGamepads();
  navigator.getGamepads=()=>{throw new Error('unavailable');};assert.doesNotThrow(()=>e.updateGamepads());assert.equal(e.paused,true);
  p.buttons[2].pressed=true;navigator.getGamepads=()=>[p];e.updateGamepads();e.togglePause(false);
  assert.equal(e.getControls(0).light,false);e.destroy();
});
test('resume guard keeps gameplay paused while a child modal is open',()=>{
  let allowed=false;const {e}=setup({callbacks:{canResume:()=>allowed}});e.togglePause(true);
  e.togglePause(false);assert.equal(e.paused,true);assert.equal(e.input.enabled,false);
  allowed=true;e.togglePause(false);assert.equal(e.paused,false);e.destroy();
});
test('unbound keyboard keys do not accumulate in the combat input sets',()=>{
  const {e}=setup();e.input.onDown(key('F12'));assert.equal(e.input.held.size,0);assert.equal(e.input.pressed.size,0);e.destroy();
});
test('destroy cancels its scheduled frame and a retired engine cannot restart',()=>{
  const {e,requests,cancelled}=setup();e.start();assert.equal(requests.size,1);e.destroy();
  assert.equal(requests.size,0);assert.equal(cancelled.length,1);e.start();assert.equal(e.running,false);assert.equal(requests.size,0);
});
test('destroy clears held tactile controls and disables input',()=>{
  const {e}=setup();e.setTouch('p1','right',true);e.input.onDown(key('KeyJ'));e.destroy();
  assert.equal(e.input.enabled,false);assert.deepEqual(e.touch,{p1:{},p2:{}});
});
test('destruction from a state callback prevents stale rendering and scheduling',()=>{
  const {e,requests}=setup();let rendered=0;e.render=()=>rendered++;e.callbacks.onState=()=>e.destroy();
  e.running=true;e.lastTime=1000;e.loop(1020);
  assert.equal(rendered,0);assert.equal(requests.size,0);
});
test('finished round transition is idempotent for lifetime result callbacks',()=>{
  let count=0;const {e}=setup({callbacks:{onMatchEnd:()=>count++}});e.endRound(e.actors[0],'K.O.');
  e.finishRoundTransition();e.finishRoundTransition();assert.equal(count,1);e.destroy();
});
test('round reset clears previous boss overlays, AI intent and knock-out attribution',()=>{
  const {e}=setup();e.bossPhaseOverlay={timer:20};e.shake=12;e.actors[0].aiIntent={heavy:true};
  e.actors[0].aiTimer=99;e.actors[0].lastHitBy=1;e.resetRound();
  assert.equal(e.bossPhaseOverlay,null);assert.equal(e.shake,0);assert.deepEqual(e.actors[0].aiIntent,{});
  assert.equal(e.actors[0].aiTimer,0);assert.equal(e.actors[0].lastHitBy,null);e.destroy();
});

test('full match reset restores live input but preserves an explicit pause',()=>{
  const {e}=setup();e.phase='matchEnd';e.input.enabled=false;e.resetMatch();
  assert.equal(e.phase,'intro');assert.equal(e.input.enabled,true);
  e.togglePause(true);e.resetMatch();assert.equal(e.paused,true);assert.equal(e.input.enabled,false);e.destroy();
});
test('a retired engine cannot mutate its actors through resetMatch',()=>{
  const {e}=setup();e.actors[0].health=4;e.destroy();e.resetMatch();assert.equal(e.actors[0].health,4);
});
