import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,STAGES,createCombatProfile} from '../src/data.js';
import {FightEngine} from '../src/fight.js';
import {combatReferenceRecipe,sourceContactBand} from '../src/combat-reference-policy.js';

const NUMBS=['sh3_numb_body_small_037','sh3_numb_body_medium','sh3_numb_body_large_038'];
const HUMMER='sh4_hummer_055',WALL='sh4_wall_man_056',TRUTH='sh4_one_truth_070';
const SUBJECTS=[...NUMBS,HUMMER,WALL,TRUTH],KEYS=['neutralSpecial','forwardSpecial','downSpecial','super','desperation'];
const fighter=id=>ROSTER.find(f=>f.id===id),engines=new Set();
afterEach(()=>{for(const e of engines)e.destroy();engines.clear();});
function ticks(e,n){for(let i=0;i<n;i++)e.update();}
function engineFor(id,index=0,target='sh3_nurse_revolver_044'){
 globalThis.window={};globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};
 globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
 Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});
 globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;
 const gradient=()=>({addColorStop(){}}),ctx=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient,measureText:t=>({width:String(t).length*7})},{get:(t,k)=>k in t?t[k]:()=>{}});
 const e=new FightEngine({getContext:()=>ctx},{p1:fighter(index?target:id),p2:fighter(index?id:target),stage:STAGES[0],mode:'local',roundsToWin:2,timeLimit:99,seed:11028,stageHazards:false,stageDirector:false,otherworldShift:false,fatalities:false});
 engines.add(e);ticks(e,e.phaseTimer);e.actors.forEach((a,i)=>Object.assign(a,{x:i?620:500,y:594,vx:0,vy:0,facing:i?-1:1,state:'idle',grounded:true,invuln:0}));
 return e;
}
function prepare(e,a,key){
 a.meter=100;
 if(key==='desperation'){
  a.health=Math.floor(a.maxHealth*.3);
  for(let n=0;n<220;n++){const next=a.bossPhases[a.bossPhaseIndex+1];if(!a.phaseLock&&(!a.data.boss||!next||a.health/a.maxHealth>next.threshold))break;e.update();}
 }
 assert.equal(e.beginAttack(a,key),true,a.data.id+':'+key);
}
function exercise(id,key,index=0,{target='sh3_nurse_revolver_044',behind=false,high=false,far=false}={}){
 const e=engineFor(id,index,target),a=e.actors[index],b=e.actors[1-index];
 a.x=500;a.facing=1;b.x=behind?350:far?1150:HUMMER===id?605:NUMBS.includes(id)?650:660;b.facing=-1;
 if(high){b.y=80;b.grounded=false;b.vy=-20;}
 const startX=a.x,health=b.health;let emitted=0,hits=0,highest=a.y,knockdown=false;
 const spawn=e.spawnProjectile;e.spawnProjectile=function(...args){const count=this.projectiles.length,result=spawn.apply(this,args);emitted+=this.projectiles.length-count;return result;};
 prepare(e,a,key);
 for(let n=0;n<100;n++){
  if(high){b.y=80;b.vy=-20;b.grounded=false;}
  e.update();highest=Math.min(highest,a.y);hits=Math.max(hits,a.attack?.hitCount||0);knockdown ||=b.knockdownTimer>0;
 }
 return {e,a,b,startX,health,emitted,hits,highest,knockdown};
}

test('thirty lot11 rows are exact-source gestures without borrowing an Arcade or remake kit',()=>{
 for(const id of SUBJECTS){const f=fighter(id),p=createCombatProfile(f);
  for(const key of KEYS){const m=p.moves[key];assert.equal(m.enabled,true);assert.equal(m.sourceTimingMeasured,false);assert.ok(sourceContactBand(f,m));}
  for(const wrong of [{...f,source:'bom'},{...f,id:'borrowed-'+id,baseId:id}]){
   assert.deepEqual(combatReferenceRecipe(wrong),{});
   assert.equal(sourceContactBand(wrong,p.moves.neutralSpecial),null);
  }
 }
 assert.equal(SUBJECTS.length*KEYS.length,30);
 for(const id of ['arcade_numb_body_arcade','arcade_hummer_arcade'])assert.equal(sourceContactBand(fighter(id),createCombatProfile(fighter(id)).moves.neutralSpecial),null);
});

for(const id of SUBJECTS)for(const key of KEYS)test(id+':'+key+' actually lands one bounded local physical impact',()=>{
 const r=exercise(id,key);assert.ok(r.b.health<r.health,id+':'+key+' must reach a real target');
 assert.equal(r.hits,1);assert.equal(r.emitted,0);assert.equal(r.b.status,null);
 const move=r.a.profile.moves[key];assert.equal(move.projectile,false);assert.equal(move.aura,false);assert.equal(move.trap,false);assert.equal(move.teleport,null);assert.equal(move.unblockable,false);assert.equal(move.invulnFrames,0);
 if(NUMBS.includes(id)){assert.ok(r.highest<594,'the source lunge is a physical jump');assert.ok(r.a.x>r.startX,'the body advances');assert.equal(r.knockdown,false);}
 if(id===WALL||id===TRUTH){assert.equal(r.a.x,r.startX);assert.equal(r.highest,594);assert.equal(r.a.profile.referencePolicy.canMove,false);assert.equal(r.knockdown,id===WALL||key!=='forwardSpecial');}
 if(id===HUMMER){assert.equal(r.knockdown,false);assert.equal(r.highest,594);assert.ok(r.health-r.b.health<100,'small flyer bite stays lighter than the other authored specials');}
});

for(const id of SUBJECTS)test(id+' contacts cannot become a full-height, rear or full-arena attack',()=>{
 for(const options of [{behind:true},{high:true},{far:true}]){
  const r=exercise(id,'neutralSpecial',0,options);assert.equal(r.b.health,r.health,JSON.stringify(options));assert.equal(r.hits,0);
 }
});

for(const id of SUBJECTS)test(id+' also resolves its authored special from player two',()=>{
 const r=exercise(id,'forwardSpecial',1);assert.ok(r.b.health<r.health);assert.equal(r.hits,1);assert.equal(r.emitted,0);
});

test('small Hummer mouth contact misses a floor insect instead of using its broad wing envelope',()=>{
 const r=exercise(HUMMER,'neutralSpecial',0,{target:'sh1_creeper_009'});assert.equal(r.b.health,r.health);assert.equal(r.hits,0);
});

test('all three Numb Bodies have no hands, grabs, low kicks or multiple-contact signature',()=>{
 for(const id of NUMBS){const p=createCombatProfile(fighter(id));assert.equal(p.moves.throw.enabled,false);assert.equal(p.moves.backThrow.enabled,false);
  for(const key of KEYS){assert.equal(p.moves[key].level,'mid');assert.equal(p.moves[key].hits,1);assert.ok(p.moves[key].verticalTravel>0);assert.equal(p.moves[key].effect,null);assert.ok(p.moves[key].knockback<=6);}
 }
});

test('a real versus crouch clears the separate One Truth head contact but not its lower arm swing',()=>{
 // This is an authored versus escape, not a claim that Henry can crouch or
 // that the SH4 boss has these measured hitbox heights in the original game.
 for(const [key,connects] of [['forwardSpecial',false],['neutralSpecial',true]]){
  const e=engineFor(TRUTH),[a,b]=e.actors;a.x=500;b.x=660;
  e.setTouch('p2','down',true);ticks(e,1);assert.equal(b.crouching,true);
  const health=b.health;prepare(e,a,key);ticks(e,100);
  assert.equal(b.health<health,connects,key);
 }
});
