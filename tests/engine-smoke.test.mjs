import test from 'node:test';
import assert from 'node:assert/strict';
import { ROSTER, STAGES } from '../src/data.js';
import { FightEngine, resolveMoveKey } from '../src/fight.js';

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
  engine.applyHit(attacker,target,attacker.profile.moves.neutralLight,1);
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
  engine.applyHit(attacker,target,attacker.profile.moves.neutralLight,1);
  engine.resolveKnockouts();
  assert.equal(engine.phase,'roundEnd');
  assert.equal(engine.lastFatality,null);
  assert.equal(target.ko,true);
  engine.destroy();
});


test('directional inputs resolve the twenty-move doctrine without collapsing to generic attacks',()=>{
  const engine=makeEngine();
  const actor=engine.actors[0];
  actor.facing=1;
  actor.grounded=true;
  assert.equal(resolveMoveKey(actor,{right:true},'light'),'forwardLight');
  assert.equal(resolveMoveKey(actor,{down:true},'light'),'crouchLight');
  assert.equal(resolveMoveKey(actor,{left:true},'special'),'backSpecial');
  assert.equal(resolveMoveKey(actor,{left:true},'throw'),'backThrow');
  assert.equal(resolveMoveKey(actor,{right:true},'throw'),'throw');
  assert.equal(resolveMoveKey(actor,{right:true},'special'),'forwardSpecial');
  assert.equal(resolveMoveKey(actor,{down:true},'special'),'downSpecial');
  actor.grounded=false;
  assert.equal(resolveMoveKey(actor,{},'light'),'airLight');
  assert.equal(resolveMoveKey(actor,{},'heavy'),'airHeavy');
  assert.equal(resolveMoveKey(actor,{},'special'),'airSpecial');
  engine.destroy();
});

test('dodge follow-up, perfect-guard counter and wake-up reversal require their combat windows',()=>{
  const engine=makeEngine();
  engine.phase='fight';
  const actor=engine.actors[0];
  assert.equal(engine.beginAttack(actor,'dodgeAttack'),false);
  assert.equal(engine.beginAttack(actor,'guardCounter'),false);
  assert.equal(engine.beginAttack(actor,'wakeupAttack'),false);

  actor.dodgeFrames=8;actor.dodgeFollowupWindow=8;
  engine.setTouch('p1','light','pressed');
  engine.updateActor(actor,0);
  assert.equal(actor.attack?.key,'dodgeAttack');
  assert.equal(actor.stats.dodgeAttacks,1);

  actor.attack=null;actor.state='idle';actor.grounded=true;actor.hurtFrames=0;
  actor.guardCounterWindow=8;
  engine.setTouch('p1','heavy','pressed');
  engine.updateActor(actor,0);
  assert.equal(actor.attack?.key,'guardCounter');
  assert.equal(actor.stats.guardCounters,1);

  actor.attack=null;actor.state='knockdown';actor.grounded=true;actor.hurtFrames=0;
  actor.knockdownTimer=12;actor.wakeupWindow=8;
  engine.setTouch('p1','special','pressed');
  engine.updateActor(actor,0);
  assert.equal(actor.attack?.key,'wakeupAttack');
  assert.equal(actor.stats.wakeupAttacks,1);
  engine.destroy();
});

test('perfect guard opens a counter window and back throw switches sides with hard knockdown',()=>{
  const engine=makeEngine();
  engine.phase='fight';
  const attacker=engine.actors[0],target=engine.actors[1];
  target.blocking=true;target.grounded=true;target.parryWindow=7;
  engine.applyHit(attacker,target,attacker.profile.moves.neutralHeavy,1);
  assert.ok(target.guardCounterWindow>0);

  target.blocking=false;target.parryWindow=0;attacker.hurtFrames=0;
  attacker.x=480;target.x=555;attacker.facing=1;target.facing=-1;
  engine.applyHit(attacker,target,attacker.profile.moves.backThrow,2);
  assert.ok(attacker.x>target.x);
  assert.equal(attacker.facing,-1);
  assert.ok(target.knockdownTimer>=50);
  engine.destroy();
});

test('nightmare input becomes the desperation move only below its documented health threshold',()=>{
  const engine=makeEngine();
  const actor=engine.actors[0];
  actor.health=actor.maxHealth;
  assert.equal(resolveMoveKey(actor,{},'super'),'super');
  actor.health=actor.maxHealth*.29;
  assert.equal(resolveMoveKey(actor,{},'super'),'desperation');
  actor.meter=100;
  assert.equal(engine.beginAttack(actor,'desperation'),true);
  const state=engine.snapshot();
  assert.equal(state.p1.currentMove.key,'desperation');
  assert.equal(state.p1.currentMove.fidelity,actor.profile.moves.desperation.fidelity);
  engine.destroy();
});

test('lore mechanics spawn projectiles and traps from their dedicated move slots',()=>{
  const airScreamer=ROSTER.find(f=>f.id==='sh1_air_screamer_001');
  const engine=makeEngine({p1:airScreamer});
  engine.phase='fight';
  const actor=engine.actors[0];
  assert.equal(engine.beginAttack(actor,'neutralSpecial'),true);
  for(let i=0;i<actor.profile.moves.neutralSpecial.startup+2;i++)engine.update();
  assert.ok(engine.projectiles.some(projectile=>projectile.owner===actor&&!projectile.trap));
  engine.destroy();

  const lisa=ROSTER.find(f=>f.id==='pt_lisa_149');
  const trapEngine=makeEngine({p1:lisa});
  trapEngine.phase='fight';
  const trapActor=trapEngine.actors[0];
  assert.equal(trapEngine.beginAttack(trapActor,'downSpecial'),true);
  for(let i=0;i<trapActor.profile.moves.downSpecial.startup+2;i++)trapEngine.update();
  assert.ok(trapEngine.projectiles.some(projectile=>projectile.owner===trapActor&&projectile.trap));
  trapEngine.destroy();
});

test('counter stances become active during their attested defensive technique',()=>{
  const ayakakashi=ROSTER.find(f=>f.id==='shf_ayakakashi_152');
  const engine=makeEngine({p1:ayakakashi});
  engine.phase='fight';
  const actor=engine.actors[0];
  assert.equal(actor.profile.moves.backSpecial.counterStance,true);
  assert.equal(engine.beginAttack(actor,'backSpecial'),true);
  for(let i=0;i<actor.profile.moves.backSpecial.startup+2;i++)engine.update();
  assert.ok(actor.counterStance>0);
  assert.equal(engine.snapshot().p1.lastMoveKey,'backSpecial');
  engine.destroy();
});


test('terrain profiles alter movement, dodge and friction without replacing the fighter doctrine',()=>{
  const ice=STAGES.find(stage=>stage.terrain?.id==='ice');
  const flooded=STAGES.find(stage=>stage.terrain?.id==='flooded');
  assert.ok(ice&&flooded);
  const iceEngine=makeEngine({stage:ice,stageTerrain:true,p1:ROSTER.find(f=>f.visual.kind==='nurse')});
  iceEngine.phase='fight';
  const iceActor=iceEngine.actors[0];
  iceActor.facing=1;iceActor.vx=0;
  iceEngine.setTouch('p1','right',true);
  iceEngine.updateActor(iceActor,0);
  const firstIceVelocity=iceActor.vx;
  assert.equal(iceEngine.currentTerrain().slip,true);
  assert.ok(firstIceVelocity>0);
  iceEngine.setTouch('p1','right',false);
  iceEngine.physics(iceActor);
  assert.ok(Math.abs(iceActor.vx)>0,'la glace doit conserver de l’inertie');
  iceEngine.destroy();

  const waterEngine=makeEngine({stage:flooded,stageTerrain:true,p1:ROSTER.find(f=>f.visual.kind==='nurse')});
  waterEngine.phase='fight';
  assert.equal(waterEngine.currentTerrain().id,'flooded');
  assert.ok(waterEngine.currentTerrain().moveScale<1);
  const actor=waterEngine.actors[0];
  actor.facing=1;
  waterEngine.setTouch('p1','dodge','pressed');
  waterEngine.updateActor(actor,0);
  assert.ok(Math.abs(actor.vx)<10.2,'l’eau doit réduire la portée d’esquive');
  waterEngine.destroy();
});

test('stage events can darken the scene, pulse terrain and summon their lore-linked hazard',()=>{
  const stage=STAGES.find(entry=>entry.director?.events?.includes('waterRise'));
  assert.ok(stage);
  const engine=makeEngine({stage,stageHazards:true,stageDirector:true,stageTerrain:true});
  engine.phase='fight';
  assert.equal(engine.triggerStageEvent('waterRise'),true);
  const state=engine.snapshot();
  assert.equal(state.world.director.activeEvent,'waterRise');
  assert.equal(state.world.director.terrainOverride,null);
  assert.equal(state.world.director.pendingTerrain.id,'flooded');
  assert.equal(state.world.terrain.id,stage.terrain.id);
  const warning = engine.hazards.find(h=>h.id==='waterSurge');
  for(let i=0;i<warning.maxTimer;i++)engine.updateHazards();
  assert.equal(engine.currentTerrain().id,'flooded');
  assert.ok(engine.hazards.some(hazard=>hazard.id==='waterSurge'&&hazard.sourceEvent==='waterRise'));
  for(let i=0;i<170;i++)engine.updateStageDirector();
  assert.equal(engine.currentTerrain().id,stage.terrain.id);
  engine.destroy();
});

test('each stage uses its own Otherworld cue, duration and start state',()=>{
  const signalStage=STAGES.find(stage=>stage.shift?.style==='signal'&&!stage.shift.startOtherworld);
  const immediate=STAGES.find(stage=>stage.shift?.startOtherworld);
  assert.ok(signalStage&&immediate);
  const engine=makeEngine({stage:signalStage,otherworldShift:true});
  engine.phase='fight';
  engine.triggerOtherworldShift();
  assert.equal(engine.world.phase,'shifting');
  assert.equal(engine.world.siren,signalStage.shift.duration);
  for(let i=0;i<signalStage.shift.duration+5;i++)engine.updateWorld();
  assert.equal(engine.world.phase,'otherworld');
  engine.destroy();
  const other=makeEngine({stage:immediate});
  assert.equal(other.snapshot().world.phase,'otherworld');
  assert.equal(other.snapshot().world.amount,1);
  other.destroy();
});

test('hazard geometry resolves global, edge, ring, sweep and center doctrines',()=>{
  const stage=STAGES.find(entry=>entry.director?.hazardDeck?.includes('voidPull'))||STAGES[0];
  const engine=makeEngine({stage,stageHazards:true});
  engine.phase='fight';
  const ids=['sirenShock','roadCollapse','crtvPulse','chainSweep','voidPull'];
  for(const id of ids){
    const hazard=engine.spawnHazard(id);
    assert.equal(hazard.id,id);
    assert.ok(hazard.zoneMax>=hazard.zoneMin);
    engine.resolveHazard(hazard);
    hazard.active=0;hazard.timer=0;
  }
  assert.ok(engine.world.hazardsTriggered>=ids.length);
  engine.destroy();
});

test('lore interactions answer to heavy impact, Otherworld midpoint and late-round pressure',()=>{
  const stage=STAGES.find(entry=>entry.interactions?.length===3&&entry.director?.events?.length>=3);
  assert.ok(stage);
  const engine=makeEngine({stage,stageHazards:true,stageDirector:true,stageTerrain:true});
  engine.phase='fight';
  const [attacker,target]=engine.actors;
  const heavy=attacker.profile.moves.neutralHeavy;
  engine.applyHit(attacker,target,heavy,991);
  assert.equal(engine.stageRuntime.heavyImpactPending,true);
  engine.updateStageDirector();
  assert.equal(engine.stageRuntime.activeEvent?.id,stage.interactions[0].event);
  assert.equal(engine.stageRuntime.lastTrigger,'time-or-first-heavy-impact');
  assert.ok(engine.stageRuntime.interactionTriggered.includes(stage.interactions[0].id));

  engine.stageRuntime.activeEvent=null;
  engine.stageRuntime.activeTimer=0;
  engine.world.amount=.55;
  engine.updateStageDirector();
  assert.equal(engine.stageRuntime.activeEvent?.id,stage.interactions[1].event);
  assert.equal(engine.stageRuntime.lastTrigger,'otherworld-halfway');

  engine.stageRuntime.activeEvent=null;
  engine.stageRuntime.activeTimer=0;
  target.health=target.maxHealth*.2;
  engine.updateStageDirector();
  assert.equal(engine.stageRuntime.activeEvent?.id,stage.interactions[2].event);
  assert.equal(engine.stageRuntime.lastTrigger,'low-health-or-late-round');
  assert.equal(engine.snapshot().world.director.interactionTriggered.length,3);
  engine.destroy();
});

test('sprite presentation clock is frozen by hitstop and pause, not advanced by render calls',()=>{
 const engine=makeEngine();engine.phase='fight';engine.update();const actor=engine.actors[0];
 const before=structuredClone(actor.spriteClock);for(let n=0;n<8;n++)engine.render(n*133);
 assert.deepEqual(actor.spriteClock,before);engine.hitstop=4;engine.update();assert.deepEqual(actor.spriteClock,before);
 engine.paused=true;engine.update();assert.deepEqual(actor.spriteClock,before);engine.paused=false;engine.hitstop=0;engine.update();assert.equal(actor.spriteClock.tick,before.tick+1);engine.destroy();
});
