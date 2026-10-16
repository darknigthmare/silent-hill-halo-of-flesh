import test from 'node:test';import assert from 'node:assert/strict';
import {bindTouchButton} from '../src/touch-controls.js';
function setup(){const listeners=new Map(),calls=[];const engine=()=>({input:{enabled:true},inputEpoch:0,paused:false,phase:'fight',setTouch(...args){calls.push(args);}});
 let current=engine();const button={style:{},addEventListener:(n,f)=>listeners.set(n,f),removeEventListener:n=>listeners.delete(n),setPointerCapture(){}};
 const dispose=bindTouchButton(button,()=>current,'p1','light');
 return {calls,engine:()=>current,replace(){current=engine();},dispose,send(type,id){listeners.get(type)?.({pointerId:id,preventDefault(){}});}};
}
test('two fingers on one action emit only one press and a final release',()=>{const t=setup();t.send('pointerdown',1);t.send('pointerdown',2);assert.equal(t.calls.length,1);t.send('pointerup',1);assert.equal(t.calls.length,1);t.send('pointerup',2);assert.equal(t.calls[1][2],false);});
test('lost capture after pointerup is not a second release',()=>{const t=setup();t.send('pointerdown',1);t.send('pointerup',1);t.send('lostpointercapture',1);assert.equal(t.calls.length,2);});
test('pointercancel releases the final owned pointer',()=>{const t=setup();t.send('pointerdown',1);t.send('pointercancel',1);assert.equal(t.calls[1][2],false);});
test('old pointer release cannot clear a newly started match',()=>{const t=setup();t.send('pointerdown',1);t.replace();t.send('pointerup',1);assert.equal(t.calls.length,1);t.send('pointerdown',2);assert.equal(t.calls.length,2);});
test('pause epoch invalidates old fingers and permits a fresh press',()=>{const t=setup();t.send('pointerdown',1);t.engine().inputEpoch++;t.send('pointerdown',2);assert.equal(t.calls.length,2);t.send('pointerup',1);assert.equal(t.calls.length,2);t.send('pointerup',2);assert.equal(t.calls.length,3);});
test('paused input cannot be injected from a touch element',()=>{const t=setup();t.engine().paused=true;t.send('pointerdown',1);assert.equal(t.calls.length,0);});
test('disposal releases owned input and removes listeners',()=>{const t=setup();t.send('pointerdown',1);t.dispose();assert.equal(t.calls.at(-1)[2],false);t.send('pointerdown',2);assert.equal(t.calls.length,2);});
