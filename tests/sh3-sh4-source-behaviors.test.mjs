import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,STAGES,createCombatProfile} from '../src/data.js';
import {FightEngine,resolveMoveKey} from '../src/fight.js';
import {combatReferencePolicy,combatReferenceRecipe,isHandgunProjectile,passiveProximityField} from '../src/combat-reference-policy.js';

const PENDULUM='sh3_pendulum_039',CANCER='sh3_insane_cancer_041',SLURPER='sh3_slurper_042';
const NURSE='sh3_nurse_revolver_044',ALESSA='sh3_memory_of_alessa_049',JASPER='sh4_jasper_gein_victim_17';
const GHOSTS=['sh4_ghost_victim_066','sh4_jimmy_stone_victim_1','sh4_steve_garland_victim_4',
  'sh4_eric_walsh_victim_10','sh4_peter_walls_victim_12','sh4_sharon_blake_victim_13',
  'sh4_toby_archbolt_victim_14','sh4_cynthia_velasquez_victim_16',JASPER,
  'sh4_andrew_desalvo_victim_18','sh4_richard_braintree_victim_19'];
const fighter=id=>ROSTER.find(f=>f.id===id),engines=new Set();
afterEach(()=>{for(const engine of engines)engine.destroy();engines.clear();});
function ticks(engine,count){for(let n=0;n<count;n++)engine.update();}
function engineFor(p1=NURSE,p2=PENDULUM){
  globalThis.window={};
  globalThis.localStorage={getItem(){return null;},setItem(){},removeItem(){}};
  globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
  Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});
  globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;
  const gradient=()=>({addColorStop(){}});
  const context=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient,
    measureText:t=>({width:String(t).length*7})},{get:(t,k)=>k in t?t[k]:()=>{},set:(t,k,v)=>{t[k]=v;return true;}});
  const engine=new FightEngine({getContext:()=>context},{p1:fighter(p1),p2:fighter(p2),stage:STAGES[0],
    mode:'local',roundsToWin:2,timeLimit:99,seed:484,stageHazards:false,stageDirector:false,
    otherworldShift:false,fatalities:false});
  engines.add(engine);ticks(engine,engine.phaseTimer);assert.equal(engine.phase,'fight');
  engine.actors.forEach((actor,index)=>Object.assign(actor,{x:index?650:300,y:594,vx:0,vy:0,
    facing:index?-1:1,state:'idle',grounded:true,invuln:0}));
  return engine;
}
function impact(engine,move=engine.actors[0].profile.moves.neutralSpecial){
  engine.applyHit(...engine.actors,move,84,1,{ranged:move.projectile,direction:1});
}
function close(engine,distance=100){engine.actors[0].x=500;engine.actors[1].x=500+distance;return engine.actors;}

test('SH3 recipes and the eleven SH4 passive fields are scoped to exact source identities',()=>{
  assert.equal(fighter(PENDULUM).source,'sh3');
  assert.equal(fighter(PENDULUM).visual.kind,'flyer');
  assert.equal(fighter(PENDULUM).visual.limbs,4);
  assert.equal(fighter('sh4_gum_head_old_type_057').visual.weapon,null);
  assert.equal(combatReferencePolicy(fighter(PENDULUM)).defense.frontalHandgunBullets,true);
  for(const id of GHOSTS){const field=passiveProximityField(fighter(id));
    assert.equal(field.kind,'drain',id);assert.equal(field.sourceTimingMeasured,false,id);
    assert.match(field.fidelity,/versus/);assert.ok(field.radius>0&&field.cooldown>0);
  }
  for(const id of [PENDULUM,CANCER,SLURPER,...GHOSTS]){
    for(const changed of [{...fighter(id),id:`other-${id}`,baseId:id},{...fighter(id),source:'film'}]){
      assert.deepEqual(combatReferenceRecipe(changed),{},id);
      assert.equal(passiveProximityField(changed),null,id);
    }
  }
  for(const id of ['sh4_man_with_the_coat_067','sh4_walter_sullivan_072','sh1_incubus_019'])
    assert.equal(passiveProximityField(fighter(id)),null,id);
});

test('Pendulum handgun filtering excludes Alessa SMG, shotgun and non-firearm energy',()=>{
  const data=fighter(ALESSA),profile=createCombatProfile(data);
  for(const phase of profile.moveset.weaponPhases)
    assert.equal(isHandgunProjectile(data,phase.moves.neutralSpecial),phase.id==='handgun',phase.id);
  for(const id of [NURSE,'sh1_monster_cybil_017','sh2_eddie_dombrowski_032'])
    assert.equal(isHandgunProjectile(fighter(id),createCombatProfile(fighter(id)).moves.neutralSpecial),true,id);
  for(const id of ['arcade_robbie_the_rabbit_shotgun','sh1_incubus_019'])
    assert.equal(isHandgunProjectile(fighter(id),createCombatProfile(fighter(id)).moves.neutralSpecial),false,id);
  const nurse=fighter(NURSE),move=createCombatProfile(nurse).moves.neutralSpecial;
  assert.equal(isHandgunProjectile({...nurse,source:'homecoming'},move),false);
});

test('a real frontal handgun projectile is deflected by Pendulum without guard, damage or counter rewards',()=>{
  const engine=engineFor(),[attacker,target]=engine.actors,before=target.health;
  const stats={...target.stats};assert.equal(engine.beginAttack(attacker,'neutralSpecial'),true);
  let deflected=false,emitted=false;
  for(let n=0;n<80;n++){engine.update();deflected ||= engine.texts.some(t=>t.text==='TIR DÉVIÉ');emitted ||= engine.projectiles.length>0;}
  assert.equal(target.health,before);assert.equal(attacker.stats.damageDealt,0);
  assert.equal(target.meter,0);assert.equal(target.attack,null);assert.deepEqual(target.stats,stats);
  assert.ok(emitted);assert.ok(deflected);
});

test('Pendulum does not gain immunity to SMG, shotgun, energy, rear shots or its attacking posture',()=>{
  for(const id of [ALESSA,'arcade_robbie_the_rabbit_shotgun','sh1_incubus_019']){
    const engine=engineFor(id),[attacker,target]=engine.actors,before=target.health;
    if(id===ALESSA)attacker.profile.moves=attacker.profile.moveset.weaponPhases.find(p=>p.id==='smg').moves;
    impact(engine);assert.ok(target.health<before,id);
  }
  for(const prepare of [a=>{a.facing=1;},a=>{a.hurtFrames=10;a.state='hurt';},
    a=>{a.knockdownTimer=12;a.state='knockdown';},a=>{engineAttack(a);}]){
    const engine=engineFor(),target=engine.actors[1],before=target.health;prepare(target);
    impact(engine);assert.ok(target.health<before);
  }
  function engineAttack(actor){actor.attack={key:'neutralLight',move:actor.profile.moves.neutralLight,frame:1};}
});

test('Pendulum physical deflection also catches a silenced handgun but never a pipe strike',()=>{
  const engine=engineFor(),[attacker,target]=engine.actors,before=target.health;
  impact(engine,{...attacker.profile.moves.neutralSpecial,silenced:true});assert.equal(target.health,before);
  impact(engine,attacker.profile.moves.neutralLight);assert.ok(target.health<before);
});

test('Insane Cancer and Slurper actually advance, collide and knock down through their authored charges',()=>{
  for(const id of [CANCER,SLURPER]){
    const engine=engineFor(id,NURSE),[attacker,target]=close(engine,145),start=attacker.x,before=target.health;
    assert.equal(engine.beginAttack(attacker,'forwardSpecial'),true);
    let knocked=false,emitted=0;
    for(let n=0;n<65;n++){engine.update();knocked ||= target.knockdownTimer>0;emitted+=engine.projectiles.length;}
    assert.ok(attacker.x>start,id);assert.ok(target.health<before,id);assert.ok(knocked,id);assert.equal(emitted,0,id);
  }
});

test('Slurper leg hold lands as a local throw and applies the versus movement/dodge bind',()=>{
  const engine=engineFor(SLURPER,NURSE),[attacker,target]=close(engine,75),before=target.health;
  target.blocking=true;target.parryWindow=7;
  assert.equal(engine.beginAttack(attacker,'neutralSpecial'),true);
  for(let n=0;n<40&&!target.status;n++)engine.update();
  assert.ok(target.health<before);assert.equal(target.status?.id,'bind');assert.ok(target.status.timer>0);
  assert.ok(target.knockdownTimer>0);assert.equal(engine.projectiles.length,0);
  assert.equal(attacker.profile.moves.super.level,'throw');assert.equal(attacker.profile.moves.super.effect.id,'bind');
});

test('Slurper cannot perform an unattested rear swap, including through cached AI choices',()=>{
  const engine=engineFor(SLURPER,NURSE),[actor,target]=close(engine,75);
  assert.equal(actor.profile.moves.backThrow.enabled,false);assert.equal(engine.beginAttack(actor,'backThrow'),false);
  actor.aiTimer=100;actor.aiIntent={left:true,throw:true};
  const input=engine.computeAI(actor,target);assert.equal(input.throw,undefined);assert.equal(input.guard,true);
  assert.equal(resolveMoveKey(actor,{left:true},'throw'),'backThrow');
  assert.equal(actor.profile.moves.throw.enabled,true);
});

test('generic AI ignores disabled contextual attacks while preserving enabled ordinary commands',()=>{
  for(const prepare of [a=>{a.knockdownTimer=12;a.wakeupWindow=8;a.profile.moves.wakeupAttack.enabled=false;},
    a=>{a.guardCounterWindow=12;a.profile.moves.guardCounter.enabled=false;},
    a=>{a.dodgeFrames=12;a.dodgeFollowupWindow=8;a.profile.moves.dodgeAttack.enabled=false;}]){
    const engine=engineFor(SLURPER,NURSE),[actor,target]=close(engine);prepare(actor);
    engine.rng=()=>0;actor.aiTimer=100;actor.aiIntent={};
    assert.deepEqual(engine.computeAI(actor,target),{});
  }
});

test('every SH4 ghost drains idle proximity without canceling attacks, guard, motion or granting combat rewards',()=>{
  for(const id of GHOSTS){
    const engine=engineFor(id,NURSE),[source,target]=close(engine),before=target.health;
    source.meter=11;target.meter=27;
    assert.equal(engine.beginAttack(target,'neutralLight'),true);const attack=target.attack;
    target.blocking=true;target.parryWindow=5;target.vx=2;
    engine.updateProximityFields();const field=source.profile.referencePolicy.proximityField;
    const damage=field.damage+field.bonusDamage;
    assert.equal(target.health,before-damage,id);assert.equal(source.stats.damageDealt,damage,id);
    assert.equal(target.stats.damageTaken,damage,id);assert.equal(target.attack,attack,id);
    assert.equal(target.knockdownTimer,0,id);assert.equal(target.hurtFrames,0,id);assert.equal(target.vx,2,id);
    assert.equal(target.blocking,true,id);assert.equal(target.parryWindow,5,id);
    assert.deepEqual([source.meter,target.meter,source.combo,target.stats.perfectGuards,target.stats.counters],[11,27,0,0,0],id);
    assert.equal(source.attack,null,id);assert.equal(source.proximityCooldown,field.cooldown,id);
    assert.equal(target.lastHit.moveKey,field.id,id);assert.equal(engine.projectiles.length,0,id);
  }
});

test('Jasper adds a larger fire chunk to the common passive ghost drain without a lingering invented burn',()=>{
  const ordinary=passiveProximityField(fighter(GHOSTS[0])),burning=passiveProximityField(fighter(JASPER));
  assert.equal(burning.damage,ordinary.damage);assert.ok(burning.bonusDamage>ordinary.bonusDamage);
  const engine=engineFor(JASPER,NURSE),[,target]=close(engine);engine.updateProximityFields();
  assert.equal(target.status,null);assert.equal(target.knockdownTimer,0);
});

test('ghost fields respect strict local range, vertical overlap, invulnerability and caster knockdown',()=>{
  for(const reason of ['boundary','above','invuln','caster-down','dead','phase','disabled']){
    const engine=engineFor(GHOSTS[0],NURSE),[source,target]=close(engine),before=target.health;
    if(reason==='boundary')target.x=source.x+source.profile.referencePolicy.proximityField.radius;
    if(reason==='above'){target.y=100;target.grounded=false;}
    if(reason==='invuln')target.invuln=2;
    if(reason==='caster-down')source.knockdownTimer=20;
    if(reason==='dead')source.health=0;
    if(reason==='phase')source.phaseLock=2;
    if(reason==='disabled')source.profile.referencePolicy.combatEnabled=false;
    engine.updateProximityFields();assert.equal(target.health,before,reason);assert.equal(source.proximityCooldown,0,reason);
  }
  const engine=engineFor(GHOSTS[0],NURSE),[source,target]=close(engine),before=target.health;
  source.facing=-1;target.knockdownTimer=12;engine.updateProximityFields();
  assert.equal(target.health,before-1);assert.equal(target.knockdownTimer,12,'passive drain neither grants nor interrupts knockdown');
});

test('a copied ghost policy cannot grant an aura to Walter, another source or a made-up victim',()=>{
  for(const reason of ['walter','renamed','other-work']){
    const engine=engineFor(reason==='walter'?'sh4_walter_sullivan_072':GHOSTS[0],NURSE);
    const [source,target]=close(engine),before=target.health;
    if(reason==='walter')source.profile.referencePolicy.proximityField=passiveProximityField(fighter(GHOSTS[0]));
    if(reason==='renamed')source.data={...source.data,id:'sh4_new_ghost',baseId:GHOSTS[0]};
    if(reason==='other-work')source.data={...source.data,source:'film'};
    engine.updateProximityFields();assert.equal(target.health,before,reason);
  }
});

test('passive ghost pulses use their cooldown and freeze under pause/hitstop, with clean round reset',()=>{
  const engine=engineFor(GHOSTS[0],NURSE),[source,target]=close(engine);
  engine.updateProximityFields();const before=target.health,cooldown=source.proximityCooldown;
  engine.updateProximityFields();assert.equal(target.health,before);
  engine.togglePause(true);ticks(engine,5);assert.equal(source.proximityCooldown,cooldown);
  engine.togglePause(false);engine.hitstop=4;ticks(engine,4);assert.equal(source.proximityCooldown,cooldown);
  target.x=1100;ticks(engine,cooldown-1);assert.equal(source.proximityCooldown,1);
  close(engine);ticks(engine,1);assert.equal(target.health,before-1);assert.equal(source.proximityCooldown,cooldown);
  engine.resetRound();assert.equal(source.proximityCooldown,0);
  const health=target.health;close(engine);engine.updateProximityFields();assert.equal(target.health,health,'no combat in intro');
});

test('ghost drain preserves phase damage floors and existing opponent projectiles',()=>{
  const engine=engineFor(JASPER,ALESSA),[source,target]=close(engine);
  target.health=Math.ceil(target.maxHealth*.75);engine.updateProximityFields();
  assert.equal(target.health,Math.ceil(target.maxHealth*.75));assert.equal(source.stats.damageDealt,0);
  const other=engineFor(GHOSTS[0],NURSE),[,shooter]=close(other);
  other.spawnProjectile(shooter,shooter.profile.moves.neutralSpecial,94);const shots=[...other.projectiles];
  other.updateProximityFields();assert.deepEqual(other.projectiles,shots);assert.equal(shooter.attack,null);
});
