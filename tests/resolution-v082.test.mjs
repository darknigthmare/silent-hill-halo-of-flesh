import test from 'node:test';
import assert from 'node:assert/strict';
import { FightEngine } from '../src/fight.js';
import { ROSTER, STAGES, STAGE_HAZARDS } from '../src/data.js';
import { bodyBox } from '../src/combat-geometry.js';
import { takeDamage, timeoutWinner, sweptProjectileContact } from '../src/combat-resolution.js';
import { AMBIENT_ONLY_HAZARDS, constrainStageDeck } from '../src/stage-lore-policy.js';
import { stageHazardDeck } from '../src/stage-director.js';

function engine(extra = {}) {
  globalThis.window ||= {};
  globalThis.localStorage = { getItem: () => null, setItem() {} };
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { getGamepads: () => [], vibrate: () => false } });
  globalThis.addEventListener = () => {}; globalThis.removeEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  const context = new Proxy({ canvas: { width: 1280, height: 720 }, measureText: t => ({ width: String(t).length * 7 }) }, { get: (o, k) => o[k] || (() => {}) });
  const f = ROSTER.find(f => f.visual.kind === 'nurse');
  const e = new FightEngine({ getContext: () => context }, { p1: f, p2: f, stage: STAGES.find(s => s.id === 'brookhaven_sh2'), mode: 'local', seed: 8201, fatalities: false, ...extra });
  e.phase = 'fight';
  for (const a of e.actors) { a.state = 'idle'; a.profile = { ...a.profile, armor: 0, trait: { id: 'none' } }; }
  return e;
}
const hit = (a, fields = {}) => ({ ...a.profile.moves.neutralLight, effect: null, projectile: false, trap: false, aura: false, damage: 80, armorBreak: false, launch: 0, knockdown: false, ...fields });

 test('ordinary hit discards the victim swing and all stale reversal windows', () => {
  const e = engine(), [a,b] = e.actors;
  e.beginAttack(b, 'neutralHeavy'); b.dodgeFollowupWindow = 8; b.guardCounterWindow = 8;
  e.applyHit(a,b,hit(a),1);
  assert.equal(b.attack,null); assert.equal(b.dodgeFollowupWindow,0); assert.equal(b.guardCounterWindow,0);
  for(let i=0;i<80;i++)e.updateActor(b,1);
  assert.equal(b.attack,null); assert.equal(a.health,a.maxHealth); e.destroy();
});
test('super armor retains the swing without pausing its active frames, unless broken', () => {
  const e=engine(),[a,b]=e.actors; b.profile.trait={id:'rustArmor'};
  e.beginAttack(b,'neutralHeavy'); const old=b.attack;
  e.applyHit(a,b,hit(a),1); assert.equal(b.attack,old); assert.equal(b.hurtFrames,0);
  b.invuln=0; b.armorCooldown=0;
  e.applyHit(a,b,hit(a,{armorBreak:true}),2); assert.equal(b.attack,null); assert.ok(b.hurtFrames>0); e.destroy();
});
test('melee perfect guard interrupts the attacker, not merely pauses it', () => {
  const e=engine(),[a,b]=e.actors; e.beginAttack(a,'neutralHeavy'); b.blocking=true; b.parryWindow=7;
  e.applyHit(a,b,hit(a),1); assert.equal(a.attack,null); assert.ok(a.hurtFrames>0); assert.equal(b.health,b.maxHealth); e.destroy();
});
test('ranged perfect guard cannot stun an unrelated current swing at the distant origin', () => {
  const e=engine(),[a,b]=e.actors; e.beginAttack(a,'neutralHeavy'); const old=a.attack;
  b.blocking=true; b.parryWindow=7;
  e.applyHit(a,b,hit(a,{projectile:true}),1,1,{ranged:true,direction:1});
  assert.equal(a.attack,old); assert.equal(a.hurtFrames,0); assert.equal(b.health,b.maxHealth); e.destroy();
});
test('contact counter does not magically damage a projectile owner at range', () => {
  const e=engine(),[a,b]=e.actors; b.counterStance=20;
  e.applyHit(a,b,hit(a,{projectile:true}),1,1,{ranged:true,direction:1});
  assert.equal(a.health,a.maxHealth); assert.ok(b.health<b.maxHealth); e.destroy();
});
test('a successful contact counter abandons the original attacking action', () => {
  const e=engine(),[a,b]=e.actors; e.beginAttack(a,'neutralHeavy'); b.counterStance=20;
  e.applyHit(a,b,hit(a),1); assert.equal(a.attack,null); assert.equal(b.health,b.maxHealth); assert.ok(a.health<a.maxHealth); e.destroy();
});
test('invulnerable contact does not consume hit count or grant a hit-confirm cancellation', () => {
  const e=engine(),[a,b]=e.actors; a.x=500; b.x=555; b.invuln=20;
  e.beginAttack(a,'neutralLight'); const swing=a.attack;
  swing.move={...hit(a),startup:1,active:12,recovery:8,hits:1,reach:180};
  e.updateAttack(a,b,{}); assert.equal(swing.hit,false); assert.equal(swing.hitCount,0);
  b.invuln=0; e.updateAttack(a,b,{}); assert.equal(swing.hit,true); assert.equal(swing.hitCount,1); e.destroy();
});
test('health and damage statistics stop at zero on overkill', () => {
  const e=engine(),[a,b]=e.actors; b.health=3; e.applyHit(a,b,hit(a,{damage:9000}),1);
  assert.equal(b.health,0); assert.equal(b.stats.damageTaken,3); assert.equal(a.stats.damageDealt,3); e.destroy();
});
test('damage helper rejects negative, nonfinite and excessive values', () => {
  const a={health:50}; assert.equal(takeDamage(a,-1),0); assert.equal(takeDamage(a,NaN),0);
  assert.equal(takeDamage(a,Infinity),0); assert.equal(takeDamage(a,500),50); assert.equal(a.health,0);
});
test('damage over time is credited to the actual source, using effective damage', () => {
  const e=engine(),[a,b]=e.actors; b.health=2; e.applyStatus(b,{id:'bleed'},a); b.status.tick=29;
  e.updateStatus(b); assert.equal(b.health,0); assert.equal(a.stats.damageDealt,2); assert.equal(b.lastHit.attackerIndex,0); e.destroy();
});
test('an environmental refresh clears the previous fighter attribution', () => {
  const e=engine(),[a,b]=e.actors; e.applyStatus(b,{id:'burn'},a); e.applyStatus(b,{id:'burn'});
  b.status.tick=23; e.updateStatus(b); assert.equal(b.lastHit.attackerIndex,null); assert.equal(b.lastHit.environmental,true); assert.equal(a.stats.damageDealt,0); e.destroy();
});
test('a lethal periodic tick ends the round before the victim can retaliate or transform', () => {
  const boss=ROSTER.find(f=>f.boss),e=engine({p2:boss}),[a,b]=e.actors;
  b.health=1; e.beginAttack(b,'neutralHeavy'); e.applyStatus(b,{id:'burn'},a); b.status.tick=23;
  const before=a.health; e.update(); assert.notEqual(e.phase,'fight'); assert.equal(a.health,before); assert.equal(b.stats.bossPhasesTriggered,0); e.destroy();
});
test('automatic boss transitions serialize instead of skipping two phases in adjacent ticks', () => {
  const e=engine({p2:ROSTER.find(f=>f.boss)}),boss=e.actors[1]; boss.health=boss.maxHealth*.1;
  e.beginAttack(boss,'neutralHeavy'); e.checkBossPhases(); assert.equal(boss.attack,null);
  for(let i=0;i<12;i++)e.checkBossPhases(); assert.equal(boss.bossPhaseIndex,0);
  boss.phaseLock=0; e.checkBossPhases(); assert.equal(boss.bossPhaseIndex,1); e.destroy();
});
test('Observation can explicitly skip a boss phase, but cannot resurrect a dead boss', () => {
  const e=engine({p2:ROSTER.find(f=>f.boss)}),boss=e.actors[1];
  assert.equal(e.forceBossPhase(1),true); assert.equal(e.forceBossPhase(1),true);
  boss.health=0; boss.bossPhaseIndex=-1; assert.equal(e.forceBossPhase(1),false); assert.equal(e.beginAttack(boss,'neutralHeavy'),false); e.destroy();
});
test('time-out compares remaining health percentages, including exact ties', () => {
  const a={health:600,maxHealth:800},b={health:850,maxHealth:1700};
  assert.equal(timeoutWinner(a,b),a); a.health=400; assert.equal(timeoutWinner(a,b),null);
  a.health=300; assert.equal(timeoutWinner(a,b),b);
});
test('no direct hit, projectile or hazard can alter a finished round', () => {
  const e=engine(),[a,b]=e.actors,h=e.spawnHazard('sirenShock'); e.phase='roundEnd';
  e.applyHit(a,b,hit(a),1); e.resolveHazard(h); e.applyStatusDamage(b,900);
  assert.equal(b.health,b.maxHealth); assert.equal(h.resolved,false); e.destroy();
});
test('swept projectile geometry detects crossing a narrow body in either direction', () => {
  const box={x:480,y:420,w:20,h:80};
  for(const [start,end] of [[350,650],[650,350]]) {
    const c=sweptProjectileContact({x:start,y:450},{x:end,y:450},8,box);
    assert.ok(c && c.t>0 && c.t<1); assert.ok(c.x>=472 && c.x<=508);
  }
  assert.equal(sweptProjectileContact({x:350,y:390},{x:650,y:390},8,box),null);
});
test('swept geometry handles a stationary trap and invalid inputs without false hits', () => {
  const b={x:100,y:100,w:20,h:30}; assert.ok(sweptProjectileContact({x:110,y:110},{x:110,y:110},4,b));
  assert.equal(sweptProjectileContact({x:90,y:30},{x:90,y:30},4,b),null);
  assert.equal(sweptProjectileContact({x:NaN,y:30},{x:90,y:30},4,b),null);
});
test('the live projectile resolver catches a high-speed crossing once, not just at endpoint', () => {
  const e=engine(),[a,b]=e.actors; a.x=220;b.x=650;
  e.spawnProjectile(a,hit(a,{projectile:true,projectileCount:1,projectileSpeed:1000}),1);
  const shot=e.projectiles[0]; shot.x=350; shot.y=bodyBox(b).y+40;shot.vy=0;
  e.updateProjectiles(); assert.ok(b.health<b.maxHealth); const hp=b.health;
  e.updateProjectiles(); assert.equal(b.health,hp); assert.equal(e.projectiles.length,0); e.destroy();
});
test('projectile knockback uses its travel direction after the shooter has turned away', () => {
  const e=engine(),[a,b]=e.actors; a.facing=-1;
  e.applyHit(a,b,hit(a,{projectile:true}),1,1,{ranged:true,direction:1}); assert.ok(b.vx>0); e.destroy();
});
test('visual impact and dust quantity cannot alter later combat random decisions', () => {
  const a=engine(),b=engine(); for(let i=0;i<20;i++){a.spawnImpact(400,400,'#fff',false,15);a.spawnDust(500,594);}
  assert.deepEqual(Array.from({length:12},()=>a.rng()),Array.from({length:12},()=>b.rng())); a.destroy();b.destroy();
});
test('ambient signal hazards are absent from all 123 automatic decks', () => {
  for(const stage of STAGES) for(const id of stage.director.hazardDeck) assert.ok(!AMBIENT_ONLY_HAZARDS.includes(id),`${stage.id}/${id}`);
});
test('a calm deck is intentionally empty, without the old staticBurst fallback', () => {
  const stage=STAGES.find(s=>s.id==='lakeview'),e=engine({stage});
  assert.deepEqual(stage.director.hazardDeck,[]); assert.equal(e.spawnHazard(),null);
  e.triggerStageEvent('portraitWatch'); assert.equal(e.hazards.length,0); assert.equal(e.snapshot().world.director.ambienceOnly,true); e.destroy();
});
test('CRTV and siren events retain their visual event but spawn no attack', () => {
  const stage=STAGES.find(s=>s.id==='st_amelia_marina'),e=engine({stage});
  for(const id of ['crtvLock','sirenCall','bellToll','spotlightHunt','portraitWatch']){
    e.triggerStageEvent(id); assert.equal(e.stageRuntime.activeEvent.id,id); assert.equal(e.hazards.length,0);
  } e.destroy();
});
test('an empty fog phase does not fall back to restricted Otherworld dangers', () => {
  const stage={director:{hazardDeck:['ritualSeal','voidPull']}};
  assert.deepEqual(stageHazardDeck(stage,'fog'),[]); assert.equal(stageHazardDeck(stage,'otherworld').length,2);
});
test('at most two automatic hazard warnings overlap; deferred warnings do not change terrain', () => {
  const e=engine(),r=e.stageRuntime;
  for(let i=0;i<8;i++)e.triggerStageEvent('gurneyRush');
  assert.equal(e.hazards.length,2); assert.equal(r.suppressedHazards,6); assert.equal(r.terrainOverride,null); e.destroy();
});
test('terrain changes only after every telegraph frame, then returns to the base floor', () => {
  const e=engine({stage:STAGES.find(s=>s.id==='st_amelia_marina')}),base=e.currentTerrain().id;
  e.triggerStageEvent('waterRise');const h=e.hazards[0];assert.equal(e.currentTerrain().id,base);
  for(let i=0;i<h.maxTimer-1;i++){e.updateHazards();assert.equal(e.currentTerrain().id,base);}
  assert.equal(e.snapshot().world.director.pendingTerrain.frames,1);e.updateHazards();assert.equal(e.currentTerrain().id,'flooded');
  assert.equal(e.stageRuntime.pendingTerrain,null);
  e.stageRuntime.eventTimer=10000;for(let i=0;i<h.terrainDuration;i++)e.updateStageDirector();assert.equal(e.currentTerrain().id,base); e.destroy();
});
test('disabling environmental damage preserves ambient events without hidden traction pulses', () => {
  const e=engine({stageHazards:false}),base=e.currentTerrain().id;
  e.triggerStageEvent('waterRise');assert.equal(e.stageRuntime.activeEvent.id,'waterRise');assert.equal(e.hazards.length,0);
  assert.equal(e.currentTerrain().id,base);assert.equal(e.stageRuntime.pendingTerrain,null); e.destroy();
});
test('turning hazards off clears live damage and pending floor changes immediately', () => {
  const e=engine();e.triggerStageEvent('waterRise');assert.ok(e.hazards.length);
  e.setTrainingOptions({stageHazards:false});assert.equal(e.hazards.length,0);assert.equal(e.stageRuntime.pendingTerrain,null);assert.equal(e.stageRuntime.terrainOverride,null);e.destroy();
});
test('safe local policy retains empty hazards instead of inventing a physical prop', () => {
  const p=constrainStageDeck({props:[],family:'room',source:'sh2'},['powerFailure'],['staticBurst','gurneyRush']);
  assert.deepEqual(p.hazards,[]);assert.equal(p.ambienceOnly,true);assert.deepEqual(p.events,['powerFailure']);
});

test('a refused physical event does not draw an orphaned duplicate object', () => {
  const e=engine();e.spawnHazard('gurneyRush');e.spawnHazard('gurneyRush');
  assert.equal(e.triggerStageEvent('gurneyRush'),false);assert.equal(e.stageRuntime.activeEvent,null);
  assert.equal(e.stageRuntime.eventsTriggered,0);e.destroy();
});
test('a blocked interaction is not marked as consumed and retries once room is free', () => {
  const stage=STAGES.find(s=>s.interactions[0]?.event==='gurneyRush'),e=engine({stage});
  e.spawnHazard('gurneyRush');e.spawnHazard('gurneyRush');e.stageRuntime.heavyImpactPending=true;
  assert.equal(e.tryStageInteraction(),false);assert.equal(e.stageRuntime.interactionTriggered.length,0);
  e.hazards.length=0;assert.equal(e.tryStageInteraction(),true);assert.equal(e.stageRuntime.interactionTriggered.length,1);e.destroy();
});
test('a command pressed during short hitstop is executed once on return to simulation', () => {
  const e=engine();e.hitstop=3;e.setTouch('p1','heavy','pressed');
  for(let i=0;i<3;i++)e.update();assert.equal(e.actors[0].attack,null);
  e.update();assert.equal(e.actors[0].attack.key,'neutralHeavy');assert.equal(e.inputBuffer[0],null);e.destroy();
});
test('stale buffered attacks expire after eight frozen frames', () => {
  const e=engine();e.hitstop=12;e.setTouch('p1','heavy','pressed');
  for(let i=0;i<13;i++)e.update();assert.equal(e.actors[0].attack,null);e.destroy();
});
test('a newly pressed action has priority over an older buffered command', () => {
  const e=engine();e.hitstop=1;e.setTouch('p1','heavy','pressed');e.update();
  e.setTouch('p1','light','pressed');e.update();assert.equal(e.actors[0].attack.key,'neutralLight');e.destroy();
});
test('focus loss pauses gameplay and clears touch, held keys and pending commands', () => {
  const e=engine();e.input.held.add('ArrowRight');e.setTouch('p1','right',true);e.inputBuffer[0]={controls:{heavy:true},expires:99};
  e.onFocusLoss();assert.equal(e.paused,true);assert.equal(e.input.held.size,0);assert.deepEqual(e.touch.p1,{});assert.equal(e.inputBuffer[0],null);
  const before=e.snapshot();e.update();assert.deepEqual(e.snapshot(),before);e.destroy();
});
test('a new round cannot inherit a held direction or frozen-frame attack', () => {
  const e=engine();e.input.held.add('ArrowRight');e.setTouch('p1','heavy','pressed');e.inputBuffer[0]={controls:{heavy:true},expires:99};
  e.resetRound();assert.equal(e.input.held.size,0);assert.deepEqual(e.touch.p1,{});assert.equal(e.inputBuffer[0],null);e.destroy();
});
