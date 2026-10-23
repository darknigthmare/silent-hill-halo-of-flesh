import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,STAGES,createCombatProfile} from '../src/data.js';
import {FightEngine} from '../src/fight.js';
import {nonDamagingStagger} from '../src/combat-reference-policy.js';

const SPLIT_WORM='sh3_split_worm_046';
const fighter=id=>ROSTER.find(f=>f.id===id);
const engines=new Set();
afterEach(()=>{for(const engine of engines)engine.destroy();engines.clear();});
function ticks(engine,count){for(let i=0;i<count;i++)engine.update();}
function engineFor(targetId='sh3_nurse_revolver_044'){
  globalThis.window={};
  globalThis.localStorage={getItem(){return null;},setItem(){},removeItem(){}};
  globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
  Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});
  globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};
  globalThis.requestAnimationFrame=()=>0;
  const gradient=()=>({addColorStop(){}});
  const context=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient,
    measureText:t=>({width:String(t).length*7})},{get:(t,k)=>k in t?t[k]:()=>{},set:(t,k,v)=>{t[k]=v;return true;}});
  const engine=new FightEngine({getContext:()=>context},{p1:fighter(SPLIT_WORM),p2:fighter(targetId),stage:STAGES[0],
    mode:'local',roundsToWin:2,timeLimit:99,seed:712,stageHazards:false,
    stageDirector:false,otherworldShift:false,fatalities:false});
  engines.add(engine);ticks(engine,engine.phaseTimer);assert.equal(engine.phase,'fight');
  engine.actors[0].x=600;engine.actors[1].x=780;
  return engine;
}
function rewards(engine){
  return engine.actors.map(a=>({health:a.health,meter:a.meter,guard:a.guard,combo:a.combo,
    comboTimer:a.comboTimer,lastHit:a.lastHit,lastHitBy:a.lastHitBy,stats:{...a.stats}}));
}

test('only exact SH3 Split Worm down special declares zero damage and a non-damaging source stagger',()=>{
  const f=fighter(SPLIT_WORM),p=createCombatProfile(f),move=p.moves.downSpecial;
  assert.equal(move.damage,0);assert.equal(move.meter,0);assert.equal(move.meterGain,0);
  assert.equal(move.effect,null);assert.equal(move.knockdown,false);assert.equal(move.knockback,0);
  assert.equal(move.projectile,false);assert.deepEqual(move.cancelInto,[]);
  assert.equal(nonDamagingStagger(f,move).sourceTimingMeasured,false);
  for(const other of [p.moves.neutralSpecial,p.moves.neutralHeavy]){
    assert.equal(nonDamagingStagger(f,other),null);assert.ok(other.damage>0);
  }
  for(const wrong of [{...f,id:'another-split-worm',baseId:SPLIT_WORM},
    {...f,source:'arcade'},fighter('arcade_split_worm_arcade')]){
    assert.equal(nonDamagingStagger(wrong,move),null);
    assert.ok(createCombatProfile(wrong).moves.downSpecial.damage>0);
  }
});

test('real ground-pound collision staggers a target at one HP without HP, guard, meter, damage credit or combo changes',()=>{
  const engine=engineFor(),[source,target]=engine.actors;
  source.health=source.maxHealth-45;source.meter=13;target.health=1;target.meter=27;
  const before=rewards(engine);
  assert.equal(engine.beginAttack(source,'downSpecial'),true);
  ticks(engine,source.profile.moves.downSpecial.startup);
  assert.equal(source.attack.hitCount,1);
  assert.equal(target.state,'hurt');assert.ok(target.hurtFrames>0);
  assert.equal(target.knockdownTimer,0);assert.equal(target.grounded,true);
  assert.deepEqual(rewards(engine),before);
  assert.equal(engine.projectiles.length,0);
  assert.equal(engine.phase,'fight');
  ticks(engine,source.profile.moves.downSpecial.active+source.profile.moves.downSpecial.recovery+30);
  assert.equal(target.state,'idle');assert.equal(target.hurtFrames,0);assert.equal(target.health,1);
  assert.equal(source.attack,null);assert.equal(source.stats.damageDealt,0);
});

test('stagger contact interrupts an active counter without minimum retaliation, counter credit or status application',()=>{
  const engine=engineFor(),[source,target]=engine.actors;
  engine.beginAttack(target,'neutralHeavy');target.counterStance=30;
  target.lastHit={moveKey:'an-earlier-damaging-hit'};target.lastHitBy=1;
  source.profile.moves.downSpecial.effect={id:'burn',duration:120,potency:2};
  source.profile.moves.downSpecial.damage=900;
  const before=rewards(engine);
  engine.applyHit(source,target,source.profile.moves.downSpecial,7,100);
  assert.equal(target.attack,null);assert.equal(target.counterStance,0);
  assert.equal(target.status,null);assert.ok(target.hurtFrames>0);
  assert.deepEqual(rewards(engine),before,'the scoped action stays harmless even if generic damage/effect data is present');
});

test('crouch guard and a perfect-guard window cannot introduce chip, guard damage or rewards',()=>{
  const engine=engineFor(),[source,target]=engine.actors;
  target.blocking=true;target.crouching=true;target.parryWindow=6;
  const before=rewards(engine);
  engine.applyHit(source,target,source.profile.moves.downSpecial,8);
  assert.deepEqual(rewards(engine),before);
  assert.equal(target.hurtFrames,0);assert.equal(target.parryWindow,6);
  assert.equal(target.guardCounterWindow,0);assert.equal(source.hurtFrames,0);
});

test('local collision does not reach a distant target or an airborne target',()=>{
  for(const mode of ['distant','airborne']){
    const engine=engineFor(),[source,target]=engine.actors;
    if(mode==='distant')target.x=1100;
    else{target.y=300;target.grounded=false;target.vy=-1;}
    const before=rewards(engine);
    engine.beginAttack(source,'downSpecial');ticks(engine,source.profile.moves.downSpecial.startup+2);
    assert.deepEqual(rewards(engine),before,mode);
    assert.equal(target.hurtFrames,0,mode);assert.equal(source.attack.hitCount,0,mode);
  }
});

test('floating bodies do not receive a ground-contact stagger even when their grounded flag is true',()=>{
  const engine=engineFor('sh1_air_screamer_001'),[source,target]=engine.actors;
  assert.equal(target.grounded,true);assert.equal(engine.snapshot().p2.groundContact,false);
  const before=rewards(engine);
  engine.beginAttack(source,'downSpecial');ticks(engine,source.profile.moves.downSpecial.startup+1);
  assert.equal(target.hurtFrames,0);assert.equal(source.attack.hitCount,0);
  assert.deepEqual(rewards(engine),before);
});

test('pause freezes the real action and reset clears a pending ground pound without changing its zero-damage recipe',()=>{
  const engine=engineFor(),[source,target]=engine.actors;
  engine.beginAttack(source,'downSpecial');ticks(engine,5);
  const frame=source.attack.frame,before=rewards(engine);
  engine.togglePause(true);ticks(engine,60);
  assert.equal(source.attack.frame,frame);assert.deepEqual(rewards(engine),before);
  engine.togglePause(false);ticks(engine,source.attack.move.startup-frame);
  assert.ok(target.hurtFrames>0);assert.equal(target.health,target.maxHealth);
  engine.resetRound();assert.equal(source.attack,null);assert.equal(target.hurtFrames,0);
  assert.equal(source.profile.moves.downSpecial.damage,0);
});

test('copying stagger metadata cannot turn another fighter firearm or another Split Worm slot into that action',()=>{
  const engine=engineFor(),[source,shooter]=engine.actors;
  const metadata={nonDamagingStaggers:{downSpecial:{frames:999}},staggerOnly:true};
  const shot=Object.assign(shooter.profile.moves.neutralSpecial,metadata);
  assert.equal(nonDamagingStagger(shooter.data,shot),null);
  const before=source.health;
  engine.applyHit(shooter,source,shot,9,1,{ranged:true,direction:-1});
  assert.ok(source.health<before);assert.ok(shooter.stats.damageDealt>0);
  source.invuln=0;shooter.invuln=0;
  Object.assign(source.profile.moves.neutralSpecial,metadata);
  const health=shooter.health;
  engine.applyHit(source,shooter,source.profile.moves.neutralSpecial,10);
  assert.ok(shooter.health<health,'the bite retains normal damage');
});

test('a ground pound never erases previously fired enemy bullets or stands up a downed target',()=>{
  const engine=engineFor(),[source,target]=engine.actors;
  engine.spawnProjectile(target,target.profile.moves.neutralSpecial,11);
  const projectiles=[...engine.projectiles];assert.equal(projectiles.length,1);
  engine.applyHit(source,target,source.profile.moves.downSpecial,12);
  assert.deepEqual(engine.projectiles,projectiles);
  target.invuln=0;target.hurtFrames=0;target.knockdownTimer=22;target.state='knockdown';
  const before=rewards(engine);
  assert.equal(engine.applyHit(source,target,source.profile.moves.downSpecial,13),false);
  assert.equal(target.knockdownTimer,22);assert.equal(target.state,'knockdown');assert.deepEqual(rewards(engine),before);
});
