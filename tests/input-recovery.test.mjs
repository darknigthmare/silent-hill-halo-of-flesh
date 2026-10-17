import test from 'node:test';
import assert from 'node:assert/strict';
import {FightEngine} from '../src/fight.js';
import {ROSTER,STAGES} from '../src/data.js';
function engine(){
 globalThis.window={};globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};
 Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});
 globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;
 const ctx=new Proxy({},{get:()=>()=>{},set:()=>true});
 const e=new FightEngine({getContext:()=>ctx},{p1:ROSTER[0],p2:ROSTER[0],stage:STAGES[0],mode:'local',stageHazards:false,stageDirector:false,otherworldShift:false,seed:42});
 e.phase='fight';return e;
}
const key=(code,extra={})=>({code,preventDefault(){},...extra});
test('touch guard has one press edge, not unlimited perfect guard refresh',()=>{
 const e=engine();e.setTouch('p1','guard','pressed');
 assert.equal(e.getControls(0).guardPressed,true);
 assert.equal(e.getControls(0).guardPressed,false);e.destroy();
});
test('held touch guard expires the seven tick parry window in simulation',()=>{
 const e=engine();e.setTouch('p1','guard','pressed');for(let i=0;i<30;i++)e.update();
 assert.equal(e.actors[0].blocking,true);assert.equal(e.actors[0].parryWindow,0);e.destroy();
});
test('touch release produces one guard release edge',()=>{
 const e=engine();e.setTouch('p1','guard','pressed');e.getControls(0);e.setTouch('p1','guard',false);
 assert.equal(e.getControls(0).guardReleased,true);assert.equal(e.getControls(0).guardReleased,false);e.destroy();
});
test('secondary guard device cannot retrigger parry or release a still held guard',()=>{
 const e=engine();e.input.onDown(key('Space'));assert.equal(e.getControls(0).guardPressed,true);e.input.endFrame();
 e.setTouch('p1','guard','pressed');assert.equal(e.getControls(0).guardPressed,false);
 e.input.onUp(key('Space'));const c=e.getControls(0);assert.equal(c.guard,true);assert.equal(c.guardReleased,false);
 e.input.endFrame();e.setTouch('p1','guard',false);assert.equal(e.getControls(0).guardReleased,true);e.destroy();
});
test('unowned keyup from menus is not a gameplay release',()=>{
 const e=engine();e.input.onUp(key('Space'));assert.equal(e.getControls(0).guardReleased,false);e.destroy();
});
test('keyboard repeat after focus reset cannot inject a fresh attack',()=>{
 const e=engine();e.input.onDown(key('KeyJ'));e.clearInputs();e.input.onDown(key('KeyJ',{repeat:true}));
 assert.equal(e.getControls(0).light,false);e.input.onUp(key('KeyJ'));e.input.onDown(key('KeyJ'));assert.equal(e.getControls(0).light,true);e.destroy();
});
for(const extra of [{defaultPrevented:true},{ctrlKey:true},{metaKey:true},{altKey:true},{isComposing:true},{target:{isContentEditable:true,closest:()=>null}}])test('browser or text-entry keystroke is not an attack: '+JSON.stringify(extra),()=>{
 const e=engine();e.input.onDown(key('KeyJ',extra));assert.equal(e.getControls(0).light,false);e.destroy();
});
test('pause rejects fresh touch and keyboard actions, resume remains clean',()=>{
 const e=engine();e.togglePause(true);e.input.onDown(key('KeyJ'));e.setTouch('p1','heavy','pressed');
 assert.equal(e.input.held.size,0);assert.equal(Boolean(e.touch.p1.heavy),false);
 e.togglePause(false);assert.equal(e.getControls(0).light,false);e.input.onDown(key('KeyJ'));assert.equal(e.getControls(0).light,true);e.destroy();
});
