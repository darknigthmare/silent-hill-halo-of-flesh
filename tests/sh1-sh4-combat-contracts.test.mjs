import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,STAGES,createCombatProfile} from '../src/data.js';
import {FightEngine} from '../src/fight.js';
import {combatReferencePolicy,sourceMouthPhase,sourceHitResponse,firearmExposure} from '../src/combat-reference-policy.js';
import {bodyProfile,bodyBox,hasGroundContact} from '../src/combat-geometry.js';
import {actorSpriteState} from '../src/sprite-animation.js';
import {spriteFor,rasterPlacement,drawRasterMonster} from '../src/sprite-system.js';
import {combatFraming,visibleSpriteBox,completeSpriteBox,toScreen} from '../src/sprite-framing.js';

const SPLIT='sh1_split_head_014',HUMMER='sh4_hummer_055',WALL='sh4_wall_man_056';
const NURSE='sh3_nurse_revolver_044',PIPE='sh2_bubble_head_nurse_024',SAKURA='shortmessage_sakura_head_150';
const SNIFFERS=['sh4_sniffer_dog_male_053','sh4_sniffer_dog_female_054'];
const fighter=id=>ROSTER.find(f=>f.id===id),engines=new Set();
afterEach(()=>{for(const e of engines)e.destroy();engines.clear();});
function ticks(e,count){for(let n=0;n<count;n++)e.update();}
function engineFor(p1=NURSE,p2=SPLIT){
  globalThis.window={};globalThis.localStorage={getItem(){return null;},setItem(){},removeItem(){}};
  globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
  Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});
  globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;
  const gradient=()=>({addColorStop(){}}),context=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient,
    measureText:t=>({width:String(t).length*7})},{get:(t,k)=>k in t?t[k]:()=>{},set:(t,k,v)=>{t[k]=v;return true;}});
  const e=new FightEngine({getContext:()=>context},{p1:typeof p1==='string'?fighter(p1):p1,p2:typeof p2==='string'?fighter(p2):p2,
    stage:STAGES[0],mode:'local',roundsToWin:2,timeLimit:99,seed:517,stageHazards:false,stageDirector:false,
    otherworldShift:false,fatalities:false});engines.add(e);ticks(e,e.phaseTimer);assert.equal(e.phase,'fight');
  e.actors.forEach((a,i)=>Object.assign(a,{x:i?650:300,y:594,vx:0,vy:0,facing:i?-1:1,state:'idle',grounded:true,invuln:0}));
  return e;
}
function impact(e,move=e.actors[0].profile.moves.neutralSpecial){return e.applyHit(...e.actors,move,85,1,{ranged:move.projectile,direction:1});}
function close(e,distance=90){e.actors[0].x=500;e.actors[1].x=500+distance;return e.actors;}
function openMouth(e,offset=2){const a=e.actors[1];a.health=Math.floor(a.maxHealth*.65);assert.equal(e.beginAttack(a,'neutralSpecial'),true);
  a.attack.frame=a.attack.move.startup+offset;return a;}

test('Split Head source phase and firearm opening never transfer through a name, baseId or other work',()=>{
  const phase=sourceMouthPhase(fighter(SPLIT));assert.equal(phase.healthRequirement,.7);assert.equal(phase.sourceTimingMeasured,false);
  assert.equal(combatReferencePolicy(fighter(SPLIT)).firearmExposure.damageScale,2);
  for(const f of [{...fighter(SPLIT),source:'arcade'},{...fighter(SPLIT),id:'another-split-head',baseId:SPLIT},fighter('arcade_split_head_arcade_120')]){
    assert.equal(sourceMouthPhase(f),null);assert.equal(combatReferencePolicy(f).firearmExposure,undefined);
  }
});

test('initial Split Head attacks with its head while gated jaws cannot consume meter, throw credit or attacks',()=>{
  const e=engineFor(SPLIT,NURSE),a=e.actors[0];a.meter=100;
  for(const key of sourceMouthPhase(a.data).slots){assert.equal(e.beginAttack(a,key),false,key);assert.equal(a.attack,null,key);}
  assert.equal(a.meter,100);assert.equal(a.stats.throws,0);assert.equal(a.mouthEnraged,false);
  assert.equal(e.beginAttack(a,'neutralLight'),true);assert.match(a.attack.move.name,/Heurt de tête/);
  assert.equal(a.profile.moves.backThrow.enabled,false);
});

test('real health loss enters the local jaw phase permanently through healing, and round reset clears it',()=>{
  const e=engineFor(),a=e.actors[1];a.health=Math.ceil(a.maxHealth*.7)+1;
  impact(e);assert.equal(a.mouthEnraged,true);assert.ok(a.health<a.maxHealth*.7);
  a.health=a.maxHealth;a.hurtFrames=0;a.invuln=0;a.knockdownTimer=0;
  assert.equal(e.beginAttack(a,'neutralSpecial'),true);assert.equal(a.mouthEnraged,true);
  e.resetRound();assert.equal(a.mouthEnraged,false);assert.equal(a.attack,null);
});

test('mouth exposure and visible versus cue follow only the exact native active jaw window',()=>{
  const e=engineFor(),a=openMouth(e),move=a.attack.move;
  for(const [frame,exposed] of [[0,false],[move.startup-1,false],[move.startup,true],
    [move.startup+move.active-1,true],[move.startup+move.active,false]]){
    a.attack.frame=frame;assert.equal(Boolean(firearmExposure(a.data,a.attack)),exposed,String(frame));
    assert.equal(e.sourceCombatCue(a),exposed?'GUEULE OUVERTE · VERSUS':null,String(frame));
  }
  a.attack.frame=move.startup;
  assert.equal(firearmExposure({...a.data,source:'film'},a.attack),null);
  assert.equal(firearmExposure(a.data,{...a.attack,move:{...move,aura:true}}),null);
  a.attack={...a.attack,move:{...move}};assert.equal(e.sourceCombatCue(a),null,'a copied move cannot expose the native actor');
});

test('only frontal real firearm damage doubles while the mouth is active, with actual health/stat accounting',()=>{
  const result=(state,source=NURSE)=>{const e=engineFor(source),a=openMouth(e),before=a.health;
    if(state==='recovery')a.attack.frame=a.attack.move.startup+a.attack.move.active;
    if(state==='rear')a.facing=1;
    if(state==='idle')a.attack=null;
    impact(e);return {lost:before-a.health,dealt:e.actors[0].stats.damageDealt,received:a.stats.damageTaken};};
  const base=result('recovery'),front=result('active'),rear=result('rear'),idle=result('idle');
  assert.ok(Math.abs(front.lost-base.lost*2)<=1);assert.equal(rear.lost,base.lost);assert.equal(idle.lost,base.lost);
  assert.equal(front.dealt,front.lost);assert.equal(front.received,front.lost);
  for(const source of ['sh1_incubus_019','sh2_lying_figure_020'])
    assert.equal(result('active',source).lost,result('recovery',source).lost,source);
});

test('Split Head AI rejects locked jaws and accepts them after the real phase transition',()=>{
  const e=engineFor(SPLIT,NURSE),[a,b]=e.actors;
  a.aiTimer=100;a.aiIntent={special:true};assert.deepEqual(e.computeAI(a,b),{guard:true});
  a.health=Math.floor(a.maxHealth*.7);a.aiTimer=100;a.aiIntent={special:true};
  assert.deepEqual(e.computeAI(a,b),{special:true});assert.equal(a.mouthEnraged,true);
  a.health=a.maxHealth;a.aiTimer=100;a.aiIntent={super:true};a.meter=100;
  assert.deepEqual(e.computeAI(a,b),{super:true},'healing does not re-lock the latched jaw phase');
});

test('an ordinary real melee hit knocks Hummer down without forcing its death or mutating the attacker move',()=>{
  const e=engineFor(PIPE,HUMMER),[a,b]=close(e,80),move=a.profile.moves.neutralLight,before=b.health;
  assert.equal(move.knockdown,false);assert.equal(e.beginAttack(a,'neutralLight'),true);
  for(let n=0;n<50&&b.health===before;n++)e.update();
  assert.ok(b.health<before&&b.health>0);assert.equal(b.state,'knockdown');assert.ok(b.knockdownTimer>0);
  assert.equal(move.knockdown,false);assert.equal(a.stats.damageDealt,before-b.health);
});

test('Hummer drops from an airborne melee hit while its armor cannot cancel the source knockdown',()=>{
  const e=engineFor(PIPE,HUMMER),[a,b]=e.actors;b.y=450;b.grounded=false;b.vy=-3;
  b.profile.armor=.4;b.phaseArmor=.1;impact(e,a.profile.moves.neutralLight);
  assert.ok(b.knockdownTimer>0);assert.equal(b.grounded,false);assert.ok(b.vy>=0);
  for(let n=0;n<40&&!b.grounded;n++)e.physics(b);
  assert.equal(b.grounded,true);assert.equal(b.y,594);
});

test('Hummer source knockdown is not granted by bullets, gas, traps or other-source identity',()=>{
  const e=engineFor(NURSE,HUMMER),[a,b]=e.actors,before=b.health;
  impact(e);assert.ok(b.health<before);assert.equal(b.knockdownTimer,0);
  const light=a.profile.moves.neutralLight;
  for(const move of [{...light,aura:true},{...light,projectile:true},{...light,trap:true}])
    assert.equal(sourceHitResponse(b.data,move),null);
  assert.equal(sourceHitResponse({...b.data,source:'sh1'},light),null);
  assert.equal(sourceHitResponse({...b.data,id:'other-hummer',baseId:HUMMER},light),null);
});

test('Hummer cannot invent an aerial abduction, including through the generic AI intent cache',()=>{
  const e=engineFor(HUMMER,NURSE),[a,b]=e.actors;
  for(const key of ['throw','backThrow']){assert.equal(a.profile.moves[key].enabled,false);assert.equal(e.beginAttack(a,key),false);}
  a.aiTimer=100;a.aiIntent={throw:true};assert.deepEqual(e.computeAI(a,b),{guard:true});
});

test('Wall Man actual claw special knocks down while its supported body stays fixed',()=>{
  const e=engineFor(WALL,NURSE),[a,b]=close(e,120),before=b.health,start=a.x;
  assert.equal(e.beginAttack(a,'neutralSpecial'),true);
  for(let n=0;n<60&&b.health===before;n++)e.update();
  assert.ok(b.health<before);assert.ok(b.knockdownTimer>0);assert.equal(a.x,start);assert.equal(a.y,594);
  const other=createCombatProfile(fighter('sh4_one_truth_070'));
  assert.equal(other.moves.neutralSpecial.knockdown,true,'One Truth now has its own separately documented knocking arm swing');
  assert.equal(other.moves.forwardSpecial.knockdown,false,'its distinct close headbutt does not borrow the Wall Man claw knockdown');
});

test('both Sniffer variants actually hold through contact and apply the limited versus bind',()=>{
  for(const id of SNIFFERS){const e=engineFor(id,NURSE),[a,b]=close(e,80),before=b.health;
    assert.equal(e.beginAttack(a,'neutralSpecial'),true);
    for(let n=0;n<60&&b.status?.id!=='bind';n++)e.update();
    assert.ok(b.health<before,id);assert.equal(b.status?.id,'bind',id);assert.ok(b.status.timer>0,id);
    assert.equal(e.projectiles.length,0,id);assert.equal(a.profile.moves.super.effect.id,'bind',id);
  }
});

test('both Sniffer real directional lunges close distance and strike without ranged or magical powers',()=>{
  for(const id of SNIFFERS){const e=engineFor(id,NURSE),[a,b]=close(e,180),before=b.health,start=a.x;
    assert.equal(e.beginAttack(a,'forwardSpecial'),true);
    for(let n=0;n<65&&b.health===before;n++)e.update();
    assert.ok(a.x>start,id);assert.ok(b.health<before,id);assert.ok(b.hurtFrames>0,id);
    assert.equal(e.projectiles.length,0,id);
    assert.ok(Object.values(a.profile.moves).every(m=>!m.projectile&&!m.aura&&!m.trap&&!m.teleport),id);
  }
});

test('Sakura Head and five Raw Shock pursuits block all twenty duel commands and runtime offense',()=>{
 for(const id of [SAKURA,'shattered_raw_shock_base_099','shattered_raw_shock_feminine_100',
  'shattered_raw_shock_diseased_101','shattered_raw_shock_abstract_102','shattered_raw_shock_atrophied_103']){
  const e=engineFor(id,NURSE),[a,b]=e.actors,before=b.health,policy=a.profile.referencePolicy;
  assert.equal(policy.role,'scripted-encounter');assert.equal(policy.combatEnabled,false);
  assert.equal(policy.canMove,false);assert.equal(policy.canJump,false);assert.equal(policy.canDodge,false);
  assert.equal(Object.keys(a.profile.moves).length,20);
  for(const [key,move] of Object.entries(a.profile.moves)){assert.equal(move.enabled,false,key);assert.equal(e.beginAttack(a,key),false,key);}
  a.aiIntent={light:true,heavy:true,throw:true,special:true,right:true};assert.deepEqual(e.computeAI(a,b),{});
  const forged={...a.profile.moves.neutralSpecial,enabled:true,projectile:true};
  assert.equal(e.spawnProjectile(a,forged,8),false);impact(e,forged);
  assert.equal(b.health,before);assert.equal(a.stats.damageDealt,0);assert.equal(e.projectiles.length,0);
  const x=a.x;e.touch.p1={right:true,jump:'pressed',special:'pressed'};
  const inputReader=e.getControls.bind(e);let readSpecial=false;
  e.getControls=(index,raw)=>{const controls=inputReader(index,raw);if(index===0)readSpecial ||= controls.special;return controls;};
  ticks(e,5);assert.equal(readSpecial,true,'the real touch edge reaches the running input reader');
  assert.equal(a.x,x);assert.equal(a.attack,null);
 }
});

test('Split Head contextual counter uses the same source jaw gate, including actual touch and AI inputs',()=>{
  const e=engineFor(SPLIT,NURSE),[a,b]=e.actors;a.guardCounterWindow=8;
  assert.equal(e.beginAttack(a,'guardCounter',{context:true}),false);
  e.touch.p1={heavy:'pressed'};ticks(e,1);
  assert.equal(a.attack?.key,'neutralHeavy');assert.match(a.attack.move.name,/Heurt de tête/);
  a.attack=null;a.guardCounterWindow=8;a.aiTimer=100;a.aiIntent={};e.rng=()=>0;
  assert.deepEqual(e.computeAI(a,b),{});
  a.health=Math.floor(a.maxHealth*.7);a.aiTimer=100;
  assert.deepEqual(e.computeAI(a,b),{heavy:true});
  e.touch.p1={heavy:'pressed'};ticks(e,1);assert.equal(a.attack?.key,'guardCounter');
  a.attack.frame=a.attack.move.startup;assert.equal(e.sourceCombatCue(a),'GUEULE OUVERTE · VERSUS');
  a.attack.frame=a.attack.move.startup+a.attack.move.active;assert.equal(e.sourceCombatCue(a),null);
  assert.match(createCombatProfile(fighter(HUMMER)).moves.guardCounter.name,/Morsure/);
});

test('downed exact SH4 Hummer body reaches the floor and regains ground contact, then returns to hover',()=>{
  const e=engineFor(PIPE,HUMMER),[a,b]=close(e,80),idle=bodyBox(b),offset=bodyProfile(b).bottom*bodyProfile(b).scale;
  assert.ok(offset>0);assert.equal(hasGroundContact(b),false);
  assert.equal(e.beginAttack(a,'neutralLight'),true);
  for(let n=0;n<50&&!b.knockdownTimer;n++)e.update();
  const down=bodyBox(b);assert.equal(down.y+down.h,594);assert.equal(bodyProfile(b).bottom,0);
  assert.equal(hasGroundContact(b),true);assert.ok(Math.abs(down.y-idle.y-offset)<1e-9);
  const damage=a.stats.damageDealt,health=b.health;
  a.x=200;b.x=900;for(let n=0;n<80&&b.knockdownTimer;n++)e.update();
  assert.equal(b.knockdownTimer,0);assert.equal(bodyProfile(b).bottom,34);assert.equal(hasGroundContact(b),false);
  assert.ok(Math.abs(bodyBox(b).y+bodyBox(b).h-(594-offset))<1e-9);
  assert.equal(a.stats.damageDealt,damage);assert.equal(b.health,health);
});

test('Hummer state-aware raster lowers the identical bitmap without rotation, scaling changes or fake pose',()=>{
  const data=fighter(HUMMER),art=spriteFor(data);assert.ok(art?.frames.length);
  const frame=art.frames[0],bitmap={path:frame.path},cache={peek:()=>bitmap,status:()=> 'ready'};
  for(const facing of [-1,1]){
    const actor={data,x:640,y:594,facing,grounded:true,knockdownTimer:0},idle=rasterPlacement(data,frame,640,594,facing,actorSpriteState(actor));
    actor.knockdownTimer=20;const state=actorSpriteState(actor),calls=[];
    const ctx=new Proxy({},{get:(_t,k)=>(...args)=>calls.push([k,...args])});
    const draw=drawRasterMonster(ctx,data,640,594,{facing,state,cache,shadow:false,diagnostic:true});
    assert.equal(draw.kind,'raster');assert.equal(draw.path,frame.path);assert.equal(draw.pose,'idle');
    assert.equal(draw.requestedClipKey,'knockdown');assert.equal(draw.fallback,true);
    assert.equal(draw.width,idle.width);assert.equal(draw.height,idle.height);assert.equal(draw.flip,idle.flip);
    assert.ok(Math.abs(draw.localY-idle.localY-34*data.visual.scale)<1e-9);
    assert.ok(Math.abs(draw.y+frame.anchor[1]*draw.height-594)<1e-9);
    assert.deepEqual(calls.find(c=>c[0]==='translate'),['translate',640,594]);
    assert.deepEqual(calls.find(c=>c[0]==='scale'),['scale',draw.flip,1]);
    assert.deepEqual(calls.find(c=>c[0]==='drawImage'),['drawImage',bitmap,draw.localX,draw.localY,draw.width,draw.height]);
    assert.ok(!calls.some(c=>c[0]==='rotate'));
    assert.ok(calls.some(c=>c[0]==='fillText'&&c[1]==='POSE KNOCKDOWN À PRODUIRE'));
    actor.knockdownTimer=0;assert.deepEqual(rasterPlacement(data,frame,640,594,facing,actorSpriteState(actor)),idle);
  }
});

test('Hummer KO uses its dedicated fixed candidate at the ground anchor without manufacturing an animation',()=>{
  const data=fighter(HUMMER),art=spriteFor(data),clip=art.clips.ko,frame=art.frames[clip.frames[0]],actor={data,x:640,y:594,grounded:true,ko:true};
  assert.equal(clip.frames.length,1);assert.equal(clip.loop,false);assert.equal(art.fidelity,'unverified');
  assert.equal(bodyBox(actor).y+bodyBox(actor).h,594);assert.equal(hasGroundContact(actor),true);
  const calls=[],ctx=new Proxy({},{get:(_t,k)=>(...args)=>calls.push([k,...args])});
  const draw=drawRasterMonster(ctx,data,640,594,{state:actorSpriteState(actor),cache:{peek:()=>({}),status:()=> 'ready'},diagnostic:true,shadow:false});
  assert.equal(draw.path,frame.path);assert.equal(draw.pose,'ko');assert.equal(draw.requestedClipKey,'ko');assert.equal(draw.fallback,false);
  assert.ok(Math.abs(draw.y+frame.anchor[1]*draw.height-594)<1e-9);
  assert.ok(!calls.some(c=>c[0]==='fillText'&&c[1]==='POSE KO À PRODUIRE'));assert.ok(!calls.some(c=>c[0]==='rotate'));
});

test('state-aware Hummer clip bounds and camera frame the same lowered raster in both directions',()=>{
  const data=fighter(HUMMER),art=spriteFor(data);
  for(const facing of [-1,1])for(const x of [80,1200]){
    const a={data,x,y:594,facing,grounded:true,knockdownTimer:20},before=structuredClone(a),state=actorSpriteState(a);
    const camera=combatFraming([a]);let lower=594;
    for(const frame of art.frames){
      const ground=visibleSpriteBox(data,frame,x,594,facing,state),hover=visibleSpriteBox(data,frame,x,594,facing,{});
      assert.ok(Math.abs(ground.y-hover.y-34*data.visual.scale)<1e-9);
      const full=completeSpriteBox(data,frame,x,594,facing,state);
      lower=Math.max(lower,full.y+full.h+18);
      const screen=toScreen(ground,camera);assert.ok(screen.x>=-1e-8&&screen.x+screen.w<=1280+1e-8);
      assert.ok(screen.y>=132-1e-8&&screen.y+screen.h<=694+1e-8);
    }
    assert.equal(camera.bounds.lower,lower);assert.deepEqual(a,before);
  }
});

test('a forged Hummer source and every other flyer preserve their own posture offsets when downed',()=>{
  const data=fighter(HUMMER),frame=spriteFor(data).frames[0];
  const others=[{...data,source:'sh1'},{...data,id:'another-hummer',baseId:HUMMER},
    ...ROSTER.filter(f=>f.visual.kind==='flyer'&&f.id!==HUMMER)];
  for(const other of others){const idle={data:other,x:640,y:594,grounded:true,knockdownTimer:0},a={...idle,knockdownTimer:20};
    assert.equal(bodyProfile(a).bottom,bodyProfile(idle).bottom,other.id);
    assert.equal(hasGroundContact(a),hasGroundContact(idle),other.id);
    assert.deepEqual(rasterPlacement(other,frame,640,594,1,{knockdown:true}),rasterPlacement(other,frame,640,594),other.id);
  }
});
