import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,STAGES,createCombatProfile} from '../src/data.js';
import {FightEngine} from '../src/fight.js';
import {combatReferencePolicy,combatReferenceRecipe,sourceContactSweep,sourceGroundHold} from '../src/combat-reference-policy.js';
import {moveBox,hasGroundContact} from '../src/combat-geometry.js';

const CLOSER='sh3_closer_036',CHURCH='sh3_closer_church_variant',TWIN='sh4_twin_victim_059';
const DOUBLE='sh3_double_head_040',ROMPER='sh1_romper_010',LURKER='homecoming_lurker_085',FERAL='homecoming_feral_086';
const NURSE='sh3_nurse_revolver_044',BOGEYMAN='homecoming_bogeyman_092';
const SEVEN=[CLOSER,CHURCH,TWIN,DOUBLE,ROMPER,LURKER,FERAL];
const HOLDS=[DOUBLE,ROMPER,FERAL,'sh3_slurper_042','sh4_sniffer_dog_male_053','sh4_sniffer_dog_female_054'];
const fighter=id=>ROSTER.find(f=>f.id===id),engines=new Set();
afterEach(()=>{for(const e of engines)e.destroy();engines.clear();});
function ticks(e,n){for(let i=0;i<n;i++)e.update();}
function engineFor(p1=CLOSER,p2=NURSE){
  globalThis.window={};globalThis.localStorage={getItem(){return null;},setItem(){},removeItem(){}};
  globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
  Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});
  globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;
  const calls=[],gradient=()=>({addColorStop(){}}),context=new Proxy({calls,createLinearGradient:gradient,createRadialGradient:gradient,
    measureText:t=>({width:String(t).length*7})},{get:(t,k)=>k in t?t[k]:(...args)=>calls.push([k,...args]),set:(t,k,v)=>{t[k]=v;return true;}});
  const e=new FightEngine({getContext:()=>context},{p1:typeof p1==='string'?fighter(p1):p1,p2:typeof p2==='string'?fighter(p2):p2,
    stage:STAGES[0],mode:'local',roundsToWin:2,timeLimit:99,seed:617,stageHazards:false,stageDirector:false,
    otherworldShift:false,fatalities:false});engines.add(e);ticks(e,e.phaseTimer);assert.equal(e.phase,'fight');
  e.actors.forEach((a,i)=>Object.assign(a,{x:i?745:600,y:594,vx:0,vy:0,facing:i?-1:1,state:'idle',grounded:true,invuln:0}));
  return e;
}
function untilHit(e,max=80){const before=e.actors[1].health;for(let n=0;n<max&&e.actors[1].health===before;n++)e.update();return before-e.actors[1].health;}

test('seven source-scoped kits remain physical and preserve explicit unmeasured versus values',()=>{
  for(const id of SEVEN){const data=fighter(id),p=createCombatProfile(data);
    assert.ok(Object.values(p.moves).every(m=>!m.projectile&&!m.trap&&!m.aura&&!m.teleport),id);
    assert.ok(Object.values(p.moves).every(m=>m.sourceTimingMeasured===false),id);
    assert.equal(p.moves.backThrow.enabled,false,id);
    for(const altered of [{...data,source:'film'},{...data,id:'another-'+id,baseId:id}])assert.deepEqual(combatReferenceRecipe(altered),{},id);
  }
});

test('two-sided contact recipes are limited to the authored Closer/Twin Victim moves and exact work',()=>{
  for(const id of [CLOSER,CHURCH,TWIN]){
    const f=fighter(id),p=createCombatProfile(f),sweep=p.referencePolicy.contactSweeps;
    assert.equal(sweep.sourceTimingMeasured,false);
    for(const key of sweep.slots)assert.equal(sourceContactSweep(f,p.moves[key]),true,id+key);
    assert.equal(sourceContactSweep(f,p.moves.neutralLight),false,id);
    const move=p.moves[sweep.slots[0]];
    for(const altered of [{...move,aura:true},{...move,projectile:true},{...move,trap:true},{...move,level:'throw'},{...move,enabled:false}])
      assert.equal(sourceContactSweep(f,altered),false,id);
    assert.equal(sourceContactSweep({...f,source:'film'},move),false);
    assert.equal(sourceContactSweep({...f,id:'other-'+id,baseId:id},move),false);
  }
  for(const id of [DOUBLE,ROMPER,LURKER,FERAL,'sh2_mandarin_026'])assert.equal(combatReferencePolicy(fighter(id)).contactSweeps,undefined,id);
});

for(const id of [CLOSER,CHURCH,TWIN])test(id+' actual arm sweep catches either side and sends rear targets outward',()=>{
  const key=id===TWIN?'neutralSpecial':'downSpecial';
  for(const side of [-1,1]){const e=engineFor(id),[a,b]=e.actors;b.x=a.x+side*145;a.facing=1;
    assert.equal(e.beginAttack(a,key),true);const damage=untilHit(e);
    assert.ok(damage>0,id+' side '+side);assert.equal(a.facing,1);assert.equal(Math.sign(b.vx),side);
    assert.equal(e.projectiles.length,0);assert.equal(a.attack?.move.aura,false);
    assert.equal(a.stats.damageDealt,damage);assert.equal(b.stats.damageTaken,damage);
  }
});

test('Closer blade extension remains frontal, unlike its local circular arm sweep',()=>{
  const e=engineFor(),[a,b]=e.actors;b.x=a.x-145;a.facing=1;const before=b.health;
  assert.equal(e.beginAttack(a,'neutralSpecial'),true);ticks(e,75);
  assert.equal(b.health,before);assert.equal(a.stats.damageDealt,0);
  assert.ok(a.profile.moves.neutralSpecial.reach>a.profile.moves.downSpecial.reach);
});

test('a rear-reaching physical arm sweep still respects Needler frontal blades instead of acting as unblockable aura',()=>{
  const e=engineFor(CLOSER,'homecoming_needler_088'),[a,b]=e.actors,before=b.health;
  b.x=a.x-145;a.facing=1;b.facing=1;
  assert.equal(e.beginAttack(a,'downSpecial'),true);ticks(e,65);
  assert.equal(b.health,before);assert.equal(a.stats.damageDealt,0);
  assert.ok(e.texts.some(t=>t.text==='PARADE DES LAMES'));
});

test('arm sweeps do not acquire full-screen range or a full-height aura',()=>{
  for(const location of ['far-front','far-back','above']){
    const e=engineFor(),[a,b]=e.actors,before=b.health;
    b.x=a.x+(location==='far-front'?450:location==='far-back'?-450:-145);
    if(location==='above'){b.y=90;b.grounded=false;}
    assert.equal(e.beginAttack(a,'downSpecial'),true);ticks(e,65);
    assert.equal(b.health,before,location);assert.equal(a.stats.damageDealt,0,location);
  }
});

test('debug hitbox overlay uses the same two-sided contact width and physical strike height',()=>{
  const e=engineFor(),a=e.actors[0];assert.equal(e.beginAttack(a,'downSpecial'),true);
  a.attack.frame=a.attack.move.startup;e.config.showHitboxes=true;e.ctx.calls.length=0;
  const move=a.attack.move,physical=moveBox(a,move);e.render(0);
  assert.ok(e.ctx.calls.some(c=>c[0]==='strokeRect'&&c[1]===a.x-move.reach&&c[3]===move.reach*2&&c[4]===physical.h));
  assert.ok(physical.h<245,'this is not the generated aura height');
});

test('Church Closer is faster and stronger without claiming original frame or damage measurements',()=>{
  const base=createCombatProfile(fighter(CLOSER)),church=createCombatProfile(fighter(CHURCH));
  for(const key of ['neutralLight','forwardHeavy','neutralSpecial','downSpecial','super']){
    assert.ok(church.moves[key].startup<base.moves[key].startup,key);
    assert.ok(church.moves[key].damage>base.moves[key].damage,key);
    assert.equal(church.moves[key].sourceTimingMeasured,false,key);
  }
});

for(const id of [DOUBLE,ROMPER,LURKER,FERAL,TWIN])test(id+' actual pursuit input performs a physical leap and strikes locally',()=>{
  const e=engineFor(id),[a,b]=e.actors;a.x=400;b.x=650;const before=b.health,start=a.x;
  e.touch.p1={right:true,special:'pressed'};let highest=a.y,emitted=0;
  for(let n=0;n<85&&b.health===before;n++){e.update();e.touch.p1.right=false;highest=Math.min(highest,a.y);emitted+=e.projectiles.length;}
  assert.equal(a.lastMoveKey,'forwardSpecial');assert.ok(a.x>start);assert.ok(highest<594);
  assert.ok(b.health<before);assert.equal(emitted,0);
  if([ROMPER,LURKER,FERAL].includes(id))assert.ok(b.knockdownTimer>0);
});

test('Double Head grounded leg hold is stronger than its brief jumping bite in the authored versus kit',()=>{
  const p=createCombatProfile(fighter(DOUBLE));
  assert.ok(p.moves.neutralSpecial.damage>p.moves.forwardSpecial.damage);
  assert.equal(p.moves.neutralSpecial.level,'throw');assert.equal(p.moves.neutralSpecial.effect.id,'bind');
  assert.equal(p.moves.forwardSpecial.effect,null);
});

for(const id of [DOUBLE,ROMPER,FERAL])test(id+' actual close grab damages and binds without a ranged effect or invented rear swap',()=>{
  const e=engineFor(id),[a,b]=e.actors;a.x=500;b.x=590;const before=b.health;
  e.touch.p1={special:'pressed'};for(let n=0;n<65&&b.status?.id!=='bind';n++)e.update();
  assert.equal(a.lastMoveKey,'neutralSpecial');assert.ok(b.health<before);assert.equal(b.status?.id,'bind');
  assert.ok(b.status.timer>0);assert.equal(e.projectiles.length,0);assert.equal(e.beginAttack(a,'backThrow'),false);
});

test('disabled grabs and rear swaps cannot be selected through stale generic AI intent',()=>{
  for(const id of SEVEN){const e=engineFor(id),[a,b]=e.actors;
    a.aiTimer=100;a.aiIntent={left:true,throw:true};const input=e.computeAI(a,b);
    assert.equal(input.throw,undefined,id);assert.equal(input.guard,true,id);
    if([CLOSER,CHURCH,TWIN,LURKER].includes(id))assert.equal(e.beginAttack(a,'throw'),false,id);
  }
});

test('Homecoming Bogeyman remains a scripted appearance rather than gaining a duel from another work',()=>{
  const e=engineFor(BOGEYMAN),[a,b]=e.actors,before=b.health;
  assert.equal(a.profile.referencePolicy.combatEnabled,false);assert.equal(a.profile.referencePolicy.role,'scripted-encounter');
  assert.equal(Object.keys(a.profile.moves).length,20);
  for(const [key,move] of Object.entries(a.profile.moves)){assert.equal(move.enabled,false,key);assert.equal(e.beginAttack(a,key),false,key);}
  assert.deepEqual(e.computeAI(a,b),{});e.touch.p1={right:true,special:'pressed',heavy:'pressed'};ticks(e,5);
  assert.equal(a.x,600);assert.equal(a.attack,null);assert.equal(b.health,before);assert.equal(e.projectiles.length,0);
  for(const id of ['bom_bogeyman_122','downpour_bogeyman_115'])assert.equal(createCombatProfile(fighter(id)).referencePolicy.combatEnabled,true,id);
});

function pressHold(e,device){
  if(device==='touch')e.setTouch('p1','special','pressed');
  else{
    const pad={index:0,id:'source-ground-hold-pad',mapping:'standard',connected:true,axes:[0,0],
      buttons:Array.from({length:17},()=>({pressed:false}))};
    navigator.getGamepads=()=>[pad];e.updateGamepads();pad.buttons[1].pressed=true;
  }
}

test('six source leg/bite holds keep the victim on the floor under actual touch and gamepad inputs',()=>{
  for(const id of HOLDS)for(const device of ['touch','gamepad']){
    const e=engineFor(id),[a,b]=e.actors;a.x=500;b.x=590;const before=b.health;pressHold(e,device);
    const lost=untilHit(e);assert.ok(lost>0,id+device);assert.equal(b.status?.id,'bind',id+device);
    assert.equal(b.y,594,id+device);assert.equal(b.grounded,true,id+device);assert.equal(b.vy,0,id+device);assert.equal(b.vx,0,id+device);
    assert.equal(a.stats.damageDealt,before-b.health,id+device);assert.equal(b.stats.damageTaken,before-b.health,id+device);
    let highest=b.y;for(let n=0;n<35;n++){e.update();highest=Math.min(highest,b.y);}
    assert.equal(highest,594,id+device);assert.equal(e.projectiles.length,0,id+device);
  }
});

test('touch and gamepad cannot make a source ground hold catch a jumping or nominally hovering body',()=>{
  for(const id of HOLDS)for(const device of ['touch','gamepad'])for(const airborne of ['jump','hover']){
    const e=engineFor(id,airborne==='hover'?'sh4_hummer_055':NURSE),[a,b]=e.actors;
    a.x=500;b.x=590;const before=b.health;
    if(airborne==='jump'){b.y=500;b.vy=-5;b.grounded=false;}
    const apply=e.applyHit.bind(e);let attemptedAirHold=false;
    e.applyHit=(caster,target,move,...rest)=>{
      if(sourceGroundHold(caster.data,move)&&!hasGroundContact(target))attemptedAirHold=true;
      return apply(caster,target,move,...rest);
    };
    pressHold(e,device);ticks(e,65);
    assert.equal(a.lastMoveKey,'neutralSpecial',id+device+airborne);
    assert.equal(b.health,before,id+device+airborne);assert.equal(b.status,null,id+device+airborne);
    assert.equal(a.stats.damageDealt,0,id+device+airborne);assert.equal(b.stats.damageTaken,0,id+device+airborne);
    assert.equal(attemptedAirHold,true,'the real active hitbox overlaps the airborne target: '+id+device+airborne);
  }
});

test('ground-hold scope preserves native throws elsewhere and rejects projectile, aura and copied-work promotion',()=>{
  for(const id of HOLDS){const f=fighter(id),p=createCombatProfile(f),hold=p.referencePolicy.groundHolds;
    assert.equal(hold.sourceTimingMeasured,false);
    for(const key of hold.slots)assert.equal(sourceGroundHold(f,p.moves[key]),true,id+key);
    const move=p.moves.neutralSpecial;
    for(const altered of [{...move,aura:true},{...move,projectile:true},{...move,trap:true}])assert.equal(sourceGroundHold(f,altered),false);
    assert.equal(sourceGroundHold({...f,source:'film'},move),false);
    assert.equal(sourceGroundHold({...f,id:'other-'+id,baseId:id},move),false);
  }
  const e=engineFor(NURSE),[a,b]=e.actors,move=a.profile.moves.throw;
  assert.equal(sourceGroundHold(a.data,move),false);e.applyHit(a,b,move,717);
  assert.ok(b.vy<0);assert.equal(b.grounded,false);
});
