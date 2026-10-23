import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,STAGES,createCombatProfile} from '../src/data.js';
import {FightEngine} from '../src/fight.js';
import {isFirearmProjectile,isVisibleFirearmProjectile,firearmExposure} from '../src/combat-reference-policy.js';

const fighter=id=>ROSTER.find(f=>f.id===id),engines=new Set();
const EDDIE='sh2_eddie_dombrowski_032',NEEDLER='homecoming_needler_088',SMOG='homecoming_smog_087';
afterEach(()=>{for(const engine of engines)engine.destroy();engines.clear();});
function ticks(engine,count){for(let n=0;n<count;n++)engine.update();}
function engineFor(p1=EDDIE,p2=NEEDLER){
  globalThis.window={};
  globalThis.localStorage={getItem(){return null;},setItem(){},removeItem(){}};
  globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
  Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});
  globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};
  globalThis.requestAnimationFrame=()=>0;
  const gradient=()=>({addColorStop(){}});
  const context=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient,
    measureText:text=>({width:String(text).length*7})},{get:(object,key)=>key in object?object[key]:()=>{},set:(object,key,value)=>{object[key]=value;return true;}});
  const engine=new FightEngine({getContext:()=>context},{p1:typeof p1==='string'?fighter(p1):p1,
    p2:typeof p2==='string'?fighter(p2):p2,stage:STAGES.find(s=>s.id==='apartment_roof')||STAGES[0],
    mode:'local',roundsToWin:2,timeLimit:99,seed:821,stageHazards:false,stageDirector:false,
    otherworldShift:false,fatalities:false});
  engines.add(engine);ticks(engine,engine.phaseTimer);assert.equal(engine.phase,'fight');
  engine.actors.forEach((actor,index)=>{actor.x=index?650:300;actor.facing=index?-1:1;actor.state='idle';actor.invuln=0;});
  return engine;
}
function impact(engine,move=engine.actors[0].profile.moves.neutralSpecial){
  const [attacker,target]=engine.actors;
  engine.applyHit(attacker,target,move,81,1,{ranged:move.projectile,direction:1});
}
function expose(actor,frame=1,key='neutralSpecial'){
  actor.attack={key,move:actor.profile.moves[key],frame};actor.state='attack';
}

test('the fixed SH2 crawling form has only contact while its standing counterpart retains acid',()=>{
  const crawling=createCombatProfile(fighter('sh2_lying_figure_crawling_021'));
  const standing=createCombatProfile(fighter('sh2_lying_figure_020'));
  assert.equal(crawling.referencePolicy.capabilities.projectile,false);
  assert.equal(crawling.referencePolicy.canJump,false);
  assert.ok(Object.values(crawling.moves).every(move=>!move.projectile&&!move.trap&&!move.aura));
  assert.equal(crawling.moves.neutralSpecial.level,'low');
  assert.equal(crawling.moves.throw.enabled,false);
  assert.equal(standing.moves.neutralSpecial.projectile,true);
  assert.equal(standing.moves.super.projectile,true);
});

test('the real crawling special advances and hits locally without ever emitting acid',()=>{
  const engine=engineFor('sh2_lying_figure_crawling_021','sh2_bubble_head_nurse_024');
  const [attacker,target]=engine.actors;attacker.x=440;target.x=555;
  const before=target.health;assert.equal(engine.beginAttack(attacker,'neutralSpecial'),true);
  let emitted=0;for(let n=0;n<70;n++){engine.update();emitted+=engine.projectiles.length;}
  assert.equal(emitted,0);assert.ok(target.health<before);assert.ok(attacker.x>440);
  assert.ok(attacker.stats.damageDealt>0);
});

test('Eddie firearm classification covers every authored revolver slot and retains native identity',()=>{
  const data=fighter(EDDIE),profile=createCombatProfile(data);
  for(const key of ['neutralSpecial','downSpecial','super','desperation']){
    assert.equal(isFirearmProjectile(data,profile.moves[key]),true,key);
    assert.equal(isVisibleFirearmProjectile(data,profile.moves[key]),true,key);
  }
  assert.equal(isFirearmProjectile(data,profile.moves.neutralLight),false);
  assert.equal(isFirearmProjectile({...data,source:'homecoming'},profile.moves.neutralSpecial),false);
  assert.equal(isFirearmProjectile(data,{...profile.moves.neutralSpecial,trap:true}),false);
  assert.equal(profile.moveset.ammoProfile,null,'no unverified six-shot reload is added to original SH2');
});

test('an actual Eddie bullet is deflected by Needler without chip, damage credit or free retaliation',()=>{
  const engine=engineFor(),[attacker,target]=engine.actors;
  const before={health:target.health,guard:target.guard,meter:target.meter,stats:{...target.stats}};
  assert.equal(engine.beginAttack(attacker,'neutralSpecial'),true);ticks(engine,70);
  assert.equal(engine.projectiles.length,0);assert.ok(engine.texts.some(text=>text.text==='TIR DÉVIÉ'));
  assert.equal(target.health,before.health);assert.equal(target.guard,before.guard);assert.equal(target.meter,before.meter);
  assert.deepEqual(target.stats,before.stats);assert.equal(attacker.stats.damageDealt,0);assert.equal(target.attack,null);
});

test('Needler also parries a real frontal pipe swing with no perfect guard or meter reward',()=>{
  const engine=engineFor('sh2_bubble_head_nurse_024'),[attacker,target]=engine.actors;
  attacker.x=490;target.x=580;const before=target.health;
  assert.equal(engine.beginAttack(attacker,'neutralLight'),true);ticks(engine,55);
  assert.equal(target.health,before);assert.equal(target.meter,0);assert.equal(attacker.stats.damageDealt,0);
  assert.ok(engine.texts.some(text=>text.text==='PARADE DES LAMES'));
});

test('the existing bullet reaches Needler from behind after its shooter crosses the target',()=>{
  const engine=engineFor(),[attacker,target]=engine.actors,before=target.health;
  assert.equal(engine.beginAttack(attacker,'neutralSpecial'),true);
  ticks(engine,attacker.attack.move.startup);assert.equal(engine.projectiles.length,1);
  attacker.x=1100;ticks(engine,70);
  assert.equal(target.facing,1);assert.ok(target.health<before);assert.ok(attacker.stats.damageDealt>0);
});

test('silenced bullets still meet Needler physical blades while Missionary retains its visual exception',()=>{
  for(const [defender,blocked] of [[NEEDLER,true],['sh3_missionary_047',false]]){
    const engine=engineFor(EDDIE,defender),[attacker,target]=engine.actors,before=target.health;
    const shot={...attacker.profile.moves.neutralSpecial,silenced:true};
    assert.equal(isFirearmProjectile(attacker.data,shot),true);
    assert.equal(isVisibleFirearmProjectile(attacker.data,shot),false);
    impact(engine,shot);assert.equal(target.health===before,blocked,defender);
  }
});

test('Needler remains vulnerable while attacking, hurt, downed, airborne or facing the wrong direction',()=>{
  const states=[actor=>expose(actor),actor=>{actor.state='hurt';actor.hurtFrames=12;},
    actor=>{actor.state='knockdown';actor.knockdownTimer=20;},
    actor=>{actor.state='jump';actor.grounded=false;},actor=>{actor.facing=1;}];
  for(const prepare of states){const engine=engineFor(),target=engine.actors[1],before=target.health;
    prepare(target);impact(engine);assert.ok(target.health<before,target.state);}
});

test('Needler blades do not stop gas, energy, throws or versus armor-breaking contact',()=>{
  for(const [source,key] of [[SMOG,'neutralSpecial'],['sh1_incubus_019','neutralSpecial'],
    ['sh2_bubble_head_nurse_024','throw'],['sh2_bubble_head_nurse_024','guardCounter']]){
    const engine=engineFor(source),target=engine.actors[1],before=target.health;
    impact(engine,engine.actors[0].profile.moves[key]);assert.ok(target.health<before,source+':'+key);
  }
});

test('Needler blade knockdown is attached to the actual attack and its non-attacking wait cannot deal damage',()=>{
  const engine=engineFor(NEEDLER,'sh2_bubble_head_nurse_024'),[attacker,target]=engine.actors;
  assert.equal(attacker.profile.moves.backSpecial.enabled,false);
  assert.equal(attacker.profile.moves.backThrow.enabled,false);
  assert.equal(engine.beginAttack(attacker,'backSpecial'),false);
  impact(engine,attacker.profile.moves.neutralHeavy);
  assert.ok(target.knockdownTimer>0);assert.ok(target.health<target.maxHealth);
  for(const data of [{...fighter(NEEDLER),id:'needler-other-version'},{...fighter(NEEDLER),source:'sh2'}])
    assert.equal(createCombatProfile(data).referencePolicy.defense,undefined);
});

test('Smog executes only its documented exhalation and derived versus supers',()=>{
  const engine=engineFor(SMOG,'sh2_bubble_head_nurse_024'),actor=engine.actors[0];
  const active=Object.values(actor.profile.moves).filter(move=>move.enabled);
  assert.deepEqual(active.map(move=>move.key),['neutralSpecial','super','desperation']);
  assert.ok(active.every(move=>move.aura&&!move.projectile));
  for(const key of ['throw','neutralLight','forwardSpecial','downSpecial'])
    assert.equal(engine.beginAttack(actor,key),false,key);
});

test('Smog opening is the exact native exhalation startup/active window and not its recovery or another identity',()=>{
  const data=fighter(SMOG),move=createCombatProfile(data).moves.neutralSpecial;
  const attack={key:'neutralSpecial',move,frame:0};
  assert.equal(firearmExposure(data,attack),null);
  for(const frame of [1,move.startup,move.startup+move.active-1]){
    attack.frame=frame;assert.equal(firearmExposure(data,attack)?.damageScale,2);
  }
  attack.frame=move.startup+move.active;assert.equal(firearmExposure(data,attack),null);
  attack.frame=1;
  assert.equal(firearmExposure({...data,source:'sh2'},attack),null);
  assert.equal(firearmExposure(data,{...attack,move:{...move,aura:false}}),null);
  assert.equal(firearmExposure(data,{...attack,key:'neutralLight'}),null);
});

test('Smog AI approaches to smoke range and selects its enabled exhalation instead of disabled punches or charges',()=>{
  const engine=engineFor(SMOG,'sh2_bubble_head_nurse_024'),[actor,target]=engine.actors;
  engine.rng=()=>.3;actor.aiTimer=0;
  const far=engine.computeAI(actor,target);assert.equal(far.right,true);
  assert.ok(!far.special&&!far.light&&!far.heavy&&!far.throw);
  actor.x=550;actor.aiTimer=0;
  const near=engine.computeAI(actor,target);assert.equal(near.special,true);
  assert.ok(!near.left&&!near.right&&!near.down&&!near.light&&!near.heavy&&!near.throw);
  assert.equal(createCombatProfile(fighter('sh2_lying_figure_020')).referencePolicy.aiSignatureOnly,undefined);
});

test('Smog adaptive heavy reads and stale generic intent cannot bypass its source-only attack controller',()=>{
  const engine=engineFor(SMOG,'sh2_bubble_head_nurse_024'),[actor,target]=engine.actors;
  engine.config.adaptiveAI=true;engine.dominantPlayerAction=()=>({key:'heavy',count:3});engine.rng=()=>.1;
  actor.x=300;target.x=400;actor.aiTimer=0;
  actor.aiIntent={light:true,heavy:true,throw:true,special:true,right:true,down:true};actor.aiRead='heavy';
  assert.deepEqual(engine.computeAI(actor,target),{special:true});
  assert.deepEqual(actor.aiIntent,{});assert.equal(actor.aiRead,null);
  actor.aiTimer=5;actor.aiIntent={light:true};
  assert.deepEqual(engine.computeAI(actor,target),{guard:true});
  assert.equal(actor.profile.moves.neutralLight.enabled,false);
});

test('Smog wakeup, guard-counter and dodge-followup windows never request disabled contextual attacks',()=>{
  const cases=[
    {name:'wakeup',prepare:actor=>{actor.knockdownTimer=12;actor.wakeupWindow=8;actor.grounded=true;},expected:{}},
    {name:'guard counter',prepare:actor=>{actor.guardCounterWindow=12;},expected:{special:true}},
    {name:'dodge follow-up',prepare:actor=>{actor.dodgeFrames=12;actor.dodgeFollowupWindow=8;},expected:{}}
  ];
  for(const {name,prepare,expected} of cases){
    const engine=engineFor(SMOG,'sh2_bubble_head_nurse_024'),[actor,target]=engine.actors;
    actor.x=300;target.x=400;actor.aiTimer=0;engine.rng=()=>.1;prepare(actor);
    assert.deepEqual(engine.computeAI(actor,target),expected,name);
  }
});

test('Smog waits through unavailable combat states and does not replace a telegraphed hazard escape',()=>{
  for(const prepare of [actor=>expose(actor),actor=>{actor.hurtFrames=8;},actor=>{actor.grounded=false;},
    actor=>{actor.guardBreak=8;},actor=>{actor.phaseLock=8;},
    actor=>{actor.profile.moves.neutralSpecial.enabled=false;}]){
    const engine=engineFor(SMOG,'sh2_bubble_head_nurse_024'),[actor,target]=engine.actors;
    actor.aiTimer=0;engine.rng=()=>.1;prepare(actor);
    assert.deepEqual(engine.computeAI(actor,target),{});
  }
  const engine=engineFor(SMOG,'sh2_bubble_head_nurse_024');
  engine.readTelegraphedHazard=()=>({left:true,dodge:true});
  assert.deepEqual(engine.computeAI(...engine.actors),{left:true,dodge:true});
});

test('real revolver damage increases only while Smog prepares or exhales, retaining actual health/stat accounting',()=>{
  const damageAt=frame=>{
    const engine=engineFor(EDDIE,SMOG),[attacker,target]=engine.actors;
    expose(target,frame);const before=target.health;
    impact(engine);const lost=before-target.health;
    assert.equal(attacker.stats.damageDealt,lost);assert.equal(target.stats.damageTaken,lost);
    return lost;
  };
  const closed=damageAt(0),open=damageAt(1);
  assert.ok(closed>0);assert.ok(Math.abs(open-closed*2)<=1,`${closed} closed vs ${open} open`);
});

test('Smog exposure does not amplify acid or an energy projectile and cannot be copied to another attack',()=>{
  for(const source of ['sh2_lying_figure_020','sh1_incubus_019']){
    const damageAt=frame=>{const engine=engineFor(source,SMOG),target=engine.actors[1];
      expose(target,frame);const before=target.health;impact(engine);return before-target.health;};
    assert.equal(damageAt(1),damageAt(0),source);
  }
  const engine=engineFor(EDDIE,SMOG),target=engine.actors[1];
  expose(target);target.attack.move={...target.attack.move};const before=target.health;
  impact(engine);const baseline=engineFor(EDDIE,SMOG);expose(baseline.actors[1],0);
  const baselineBefore=baseline.actors[1].health;impact(baseline);
  assert.equal(before-target.health,baselineBefore-baseline.actors[1].health);
});

test('Mary and Maria original moth hits apply the authored bind restriction without pretending to recreate a struggle animation',()=>{
  for(const id of ['sh2_maria_final_manifestation_033','sh2_mary_final_manifestation_034']){
    const engine=engineFor(id,'sh2_bubble_head_nurse_024'),[attacker,target]=engine.actors;
    assert.ok(['neutralSpecial','super','desperation'].every(key=>attacker.profile.moves[key].effect?.id==='bind'));
    impact(engine);assert.equal(target.status?.id,'bind');assert.equal(target.status.source,attacker.index);
    assert.equal(attacker.profile.moves.neutralSpecial.sourceTimingMeasured,false);
    target.hurtFrames=0;target.invuln=0;target.knockdownTimer=0;target.grounded=true;target.phaseLock=0;
    engine.getControls=index=>index===1?{dodge:true,right:true}:{};
    engine.updateActor(target,1);assert.equal(target.dodgeFrames,0,'caught target cannot freely dodge the swarm');
    assert.ok(target.status.timer>0);
  }
});
