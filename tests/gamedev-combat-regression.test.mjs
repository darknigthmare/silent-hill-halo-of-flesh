import test from 'node:test';
import assert from 'node:assert/strict';
import {takeDamage,interruptAction,timeoutWinner,sweptProjectileContact} from '../src/combat-resolution.js';

test('damage is finite, rounded, clamped and cannot heal through invalid inputs',()=>{
 const actor={health:17};
 assert.equal(takeDamage(actor,2.6),3);
 assert.equal(actor.health,14);
 for(const value of [-10,NaN,Infinity,-Infinity,'9',undefined]){
  assert.equal(takeDamage(actor,value),0);
  assert.equal(actor.health,14);
 }
 assert.equal(takeDamage(actor,100),14);
 assert.equal(actor.health,0);
 assert.equal(takeDamage(actor,1),0);
});

test('interruptions clear active combat windows and prevent stale attacks',()=>{
 const actor={attack:{id:'old'},counterStance:3,dodgeFrames:2,dodgeFollowupWindow:4,guardCounterWindow:5,parryWindow:6,blocking:true,state:'attack'};
 interruptAction(actor);
 for(const key of ['counterStance','dodgeFrames','dodgeFollowupWindow','guardCounterWindow','parryWindow'])assert.equal(actor[key],0,key);
 assert.equal(actor.attack,null);
 assert.equal(actor.blocking,false);
 assert.equal(actor.state,'hurt');
});

test('time-out compares relative health rather than raw boss health',()=>{
 const a={health:400,maxHealth:800},b={health:600,maxHealth:1500};
 assert.equal(timeoutWinner(a,b),a);
 assert.equal(timeoutWinner({health:400,maxHealth:800},{health:750,maxHealth:1500}),null);
});

test('swept projectiles catch fast crossings without hits behind or outside the body',()=>{
 const body={x:10,y:10,w:10,h:10};
 const hit=sweptProjectileContact({x:0,y:15},{x:30,y:15},1,body);
 assert.ok(hit);
 assert.ok(Math.abs(hit.x-9)<1e-9);
 assert.equal(sweptProjectileContact({x:0,y:30},{x:30,y:30},1,body),null);
 assert.equal(sweptProjectileContact({x:30,y:15},{x:40,y:15},1,body),null);
 assert.equal(sweptProjectileContact({x:0,y:15},{x:30,y:15},-1,body),null);
 assert.equal(sweptProjectileContact({x:NaN,y:15},{x:30,y:15},1,body),null);
});

test('timeout handles huge values and invalid health without overflow',()=>{
 const a={health:9e307,maxHealth:1e308};
 const b={health:8e307,maxHealth:1e308};
 assert.equal(timeoutWinner(a,b),a);
 assert.equal(timeoutWinner({health:5e307,maxHealth:1e308},{health:5e307,maxHealth:1e308}),null);
 const valid={health:1,maxHealth:100};
 assert.equal(timeoutWinner({health:NaN,maxHealth:100},valid),valid);
 assert.equal(timeoutWinner({health:0,maxHealth:100},{health:0,maxHealth:100}),null);
});
