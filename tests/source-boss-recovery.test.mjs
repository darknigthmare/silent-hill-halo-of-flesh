import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,STAGES,createCombatProfile} from '../src/data.js';
import {FightEngine} from '../src/fight.js';
import {combatReferenceRecipe,combatReferencePolicy,sourceStandingBind,sourceWhiffExposure,
  sourceFrontalDamageScale,sourceGroundProjectile,isFirearmProjectile} from '../src/combat-reference-policy.js';

const PATIENT='sh4_patient_060',BOTTOM='sh4_bottom_065',CYNTHIA='sh4_cynthia_velasquez_victim_16';
const SCARLET='homecoming_scarlet_spider_form_095',HANGING='homecoming_amnion_hanging_form_097';
const EXPOSED='homecoming_amnion_exposed_form_098',ASPHYXIA='homecoming_asphyxia_096',BOGEYMAN='downpour_bogeyman_115';
const NURSE='sh3_nurse_revolver_044',EIGHT=[PATIENT,BOTTOM,CYNTHIA,SCARLET,HANGING,EXPOSED,ASPHYXIA,BOGEYMAN];
const fighter=id=>ROSTER.find(f=>f.id===id),engines=new Set();
afterEach(()=>{for(const e of engines)e.destroy();engines.clear();});
function ticks(e,n){for(let i=0;i<n;i++)e.update();}
function engineFor(p1=PATIENT,p2=NURSE){
  globalThis.window={};globalThis.localStorage={getItem(){return null;},setItem(){},removeItem(){}};
  globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
  Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});
  globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;
  const gradient=()=>({addColorStop(){}}),context=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient,
    measureText:t=>({width:String(t).length*7})},{get:(t,k)=>k in t?t[k]:()=>{},set:(t,k,v)=>{t[k]=v;return true;}});
  const e=new FightEngine({getContext:()=>context},{p1:typeof p1==='string'?fighter(p1):p1,p2:typeof p2==='string'?fighter(p2):p2,
    stage:STAGES[0],mode:'local',roundsToWin:2,timeLimit:99,seed:717,stageHazards:false,stageDirector:false,
    otherworldShift:false,fatalities:false});engines.add(e);ticks(e,e.phaseTimer);assert.equal(e.phase,'fight');
  e.actors.forEach((a,i)=>Object.assign(a,{x:i?650:500,y:594,vx:0,vy:0,facing:i?-1:1,state:'idle',grounded:true,invuln:0}));return e;
}
function whiff(e,index=0){const a=e.actors[index],b=e.actors[1-index];a.x=index?800:300;b.x=index?200:1100;a.facing=1;
  assert.equal(e.beginAttack(a,'forwardSpecial'),true);
  for(let n=0;n<100&&a.attack?.frame<a.attack.move.startup+a.attack.move.active;n++)e.update();
  assert.ok(a.attack);assert.equal(a.attack.hitCount,0);return a;
}
function caught(){const e=engineFor(CYNTHIA),[source,victim]=e.actors;victim.x=590;
  e.setTouch('p1','special','pressed');for(let n=0;n<80&&victim.status?.bindingOrigin?.id!==CYNTHIA;n++)e.update();
  assert.equal(victim.status?.bindingOrigin?.id,CYNTHIA);return {e,source,victim};}

test('eight exact-source recipes keep source timings unmeasured and refuse inherited or wrong-work powers',()=>{
  for(const id of EIGHT){const f=fighter(id),p=createCombatProfile(f);
    assert.ok(Object.values(p.moves).every(m=>m.sourceTimingMeasured===false),id);
    for(const changed of [{...f,source:'film'},{...f,id:'other-'+id,baseId:id}])assert.deepEqual(combatReferenceRecipe(changed),{},id);
  }
  for(const id of [SCARLET,EXPOSED])assert.equal(combatReferencePolicy(fighter(id)).whiffExposure.sourceTimingMeasured,false);
  assert.equal(combatReferencePolicy(fighter(ASPHYXIA)).defense.frontDamageScale,.45);
});

test('Patient real hammer input chains several contacts and its rear pivot stays physical',()=>{
  const e=engineFor(),[a,b]=e.actors;b.x=600;const before=b.health;e.setTouch('p1','special','pressed');
  for(let n=0;n<90&&a.attack?.hitCount!==3;n++)e.update();
  assert.equal(a.lastMoveKey,'neutralSpecial');assert.equal(a.attack?.hitCount,3);assert.equal(a.combo,3);
  assert.equal(a.stats.damageDealt,before-b.health);assert.equal(e.projectiles.length,0);
  const other=engineFor(),[p,n]=other.actors;n.x=355;p.facing=1;const health=n.health;
  other.setTouch('p1','left',true);other.setTouch('p1','special','pressed');
  for(let i=0;i<65&&n.health===health;i++)other.update();
  assert.equal(p.lastMoveKey,'backSpecial');assert.equal(p.facing,1);assert.ok(n.health<health);assert.ok(n.vx<0);
  assert.equal(p.profile.moves.backSpecial.invulnFrames,0);assert.equal(p.profile.moves.backSpecial.aura,false);
});

test('Bottom has its documented arm rotation and physical pursuit dive with a stronger versus kit',()=>{
  const e=engineFor(BOTTOM),[a,b]=e.actors;b.x=355;a.facing=1;const before=b.health;e.setTouch('p1','special','pressed');
  for(let n=0;n<65&&b.health===before;n++)e.update();assert.ok(b.health<before);assert.ok(b.vx<0);
  assert.ok(a.profile.moves.neutralSpecial.damage>createCombatProfile(fighter('sh4_twin_victim_059')).moves.neutralSpecial.damage);
  const other=engineFor(BOTTOM),[p,t]=other.actors;p.x=400;t.x=650;const health=t.health;
  other.setTouch('p1','right',true);other.setTouch('p1','special','pressed');let highest=594;
  for(let n=0;n<80&&t.health===health;n++){other.update();other.setTouch('p1','right',false);highest=Math.min(highest,p.y);}
  assert.ok(p.x>400);assert.ok(highest<594);assert.ok(t.health<health);assert.equal(other.projectiles.length,0);
});

test('Asphyxia front resistance reduces real physical/firearm health loss without becoming immunity',()=>{
  const damage=(rear,key='neutralSpecial')=>{const e=engineFor(NURSE,ASPHYXIA),[a,b]=e.actors,before=b.health;
    b.facing=rear?1:-1;e.applyHit(a,b,a.profile.moves[key],731,1,{direction:1,ranged:a.profile.moves[key].projectile});
    assert.equal(a.stats.damageDealt,before-b.health);assert.equal(b.stats.damageTaken,before-b.health);return before-b.health;};
  for(const key of ['neutralLight','neutralSpecial']){const front=damage(false,key),rear=damage(true,key);assert.ok(front>0);assert.ok(front<rear*.6);}
  const data=fighter(ASPHYXIA),move=createCombatProfile(fighter(NURSE)).moves.neutralSpecial;
  assert.equal(sourceFrontalDamageScale({...data,source:'film'},move,1,-1),1);
  assert.equal(sourceFrontalDamageScale(data,{...move,aura:true},1,-1),1);
  assert.equal(createCombatProfile(data).moves.neutralSpecial.projectile,true,'the earlier recorded toxic jet is not refuted by guide silence');
});

test('Asphyxia rush advances and its actual tail command reaches behind without magic',()=>{
  const e=engineFor(ASPHYXIA),[a,b]=e.actors;a.x=400;b.x=650;const before=b.health;
  e.setTouch('p1','right',true);e.setTouch('p1','special','pressed');
  for(let n=0;n<75&&b.health===before;n++){e.update();e.setTouch('p1','right',false);}
  assert.ok(a.x>400);assert.ok(b.health<before);assert.equal(e.projectiles.length,0);
  const other=engineFor(ASPHYXIA),[p,t]=other.actors;t.x=355;p.facing=1;const health=t.health;
  other.setTouch('p1','left',true);other.setTouch('p1','special','pressed');
  for(let n=0;n<75&&t.health===health;n++)other.update();
  assert.equal(p.lastMoveKey,'backSpecial');assert.equal(p.facing,1);assert.ok(t.health<health);assert.ok(t.vx<0);
});

for(const id of [SCARLET,EXPOSED])test(id+' whiff exposure is the native attack recovery, without a detached timer',()=>{
  const e=engineFor(id),a=whiff(e),move=a.attack.move,start=move.startup+move.active,end=start+move.recovery;
  for(const [frame,open] of [[start-1,false],[start,true],[end-1,true],[end,false]]){
    a.attack.frame=frame;assert.equal(Boolean(sourceWhiffExposure(a.data,a.attack)),open);
    assert.equal(Boolean(e.sourceCombatCue(a)),open);
  }
  a.attack.frame=start;a.attack.hitCount=1;assert.equal(sourceWhiffExposure(a.data,a.attack),null);
  a.attack.hitCount=0;a.attack.hit=true;assert.equal(sourceWhiffExposure(a.data,a.attack),null);
  a.attack.hit=false;assert.equal(sourceWhiffExposure({...a.data,source:'film'},a.attack),null);
  a.attack.move={...move};assert.equal(e.sourceCombatCue(a),null,'copied moves cannot expose the native actor');
});

for(const id of [SCARLET,EXPOSED])test(id+' actual missed attack exposes recovery, freezes under pause and closes naturally',()=>{
  const e=engineFor(id),a=whiff(e);const frame=a.attack.frame,health=e.actors[1].health;
  assert.ok(e.sourceCombatCue(a));e.togglePause(true);ticks(e,10);assert.equal(a.attack.frame,frame);assert.ok(e.sourceCombatCue(a));
  e.togglePause(false);ticks(e,a.attack.move.recovery+2);assert.equal(a.attack,null);assert.equal(e.sourceCombatCue(a),null);
  assert.equal(e.actors[1].health,health);assert.equal(e.projectiles.length,0);
});

for(const id of [SCARLET,EXPOSED])test(id+' successfully landed attack does not unlock a free recovery damage bonus',()=>{
  const e=engineFor(id),[a,b]=e.actors;const before=b.health;
  assert.equal(e.beginAttack(a,'forwardSpecial'),true);
  for(let n=0;n<100&&a.attack&&a.attack.frame<a.attack.move.startup+a.attack.move.active;n++)e.update();
  assert.ok(b.health<before);assert.ok(a.attack.hitCount>0);assert.equal(e.sourceCombatCue(a),null);
});

test('Scarlet needs a rear hit after the miss; Amnion exposed form admits direct body hits during that same real recovery',()=>{
  const lost=(id,rear,recovery)=>{const e=engineFor(NURSE,id),target=whiff(e,1),shooter=e.actors[0],before=target.health;
    target.facing=rear?1:-1;if(!recovery)target.attack.frame=target.attack.move.startup+target.attack.move.active-1;
    e.applyHit(shooter,target,shooter.profile.moves.neutralSpecial,733,1,{ranged:true,direction:1});
    return before-target.health;};
  const baseScarlet=lost(SCARLET,false,false),frontScarlet=lost(SCARLET,false,true),backScarlet=lost(SCARLET,true,true);
  assert.equal(frontScarlet,baseScarlet);assert.ok(Math.abs(backScarlet-baseScarlet*2)<=1);
  const baseAmnion=lost(EXPOSED,false,false);assert.ok(Math.abs(lost(EXPOSED,false,true)-baseAmnion*2)<=1);
  assert.equal(combatReferencePolicy(fighter(HANGING)).whiffExposure,undefined);
  assert.equal(combatReferencePolicy(fighter('homecoming_scarlet_doll_form_094')).whiffExposure,undefined);
});

test('Amnion profiles retain distinct phase attacks and reject free jumps through real combined inputs',()=>{
  for(const id of [HANGING,EXPOSED]){const e=engineFor(id),a=e.actors[0];
    assert.equal(a.profile.referencePolicy.canJump,false);
    for(const key of ['airLight','airHeavy','airSpecial','backThrow'])assert.equal(a.profile.moves[key].enabled,false,id+key);
    e.setTouch('p1','jump','pressed');e.setTouch('p1','special','pressed');ticks(e,1);
    assert.equal(a.y,594);assert.equal(a.grounded,true);assert.equal(a.attack.key,'neutralSpecial');
  }
  const hanging=createCombatProfile(fighter(HANGING)),exposed=createCombatProfile(fighter(EXPOSED));
  assert.equal(hanging.moves.throw.enabled,false);assert.equal(exposed.moves.throw.enabled,true);
  assert.equal(hanging.moves.neutralSpecial.projectile,true);assert.equal(exposed.moves.neutralSpecial.projectile,true);
  assert.equal(hanging.whiffExposure,undefined);assert.equal(hanging.moves.forwardSpecial.travel,0);
});

test('Cynthia hair holds the victim standing and still while allowing a real counter-strike to break the binding',()=>{
  const {e,source,victim}=caught();assert.equal(victim.y,594);assert.equal(victim.grounded,true);
  assert.equal(victim.knockdownTimer,0);assert.equal(victim.vx,0);assert.equal(victim.vy,0);
  for(let n=0;n<80&&victim.hurtFrames>0;n++)e.update();
  const x=victim.x;e.setTouch('p2','right',true);e.setTouch('p2','jump','pressed');ticks(e,1);
  assert.equal(victim.x,x);assert.equal(victim.y,594);assert.equal(victim.grounded,true);assert.ok(victim.status.bindingOrigin);
  e.setTouch('p2','right',false);const before=source.health;e.setTouch('p2','special','pressed');
  for(let n=0;n<75&&source.health===before;n++)e.update();
  assert.equal(victim.lastMoveKey,'neutralSpecial');assert.ok(source.health<before);assert.equal(victim.status,null);
  assert.ok(e.texts.some(t=>t.text==='CHEVEUX ROMPUS'));assert.ok(victim.stats.damageDealt>0);
});

test('Cynthia binding does not break on a victim miss, and zero damage cannot claim a release',()=>{
  const {e,source,victim}=caught();for(let n=0;n<80&&victim.hurtFrames>0;n++)e.update();
  assert.equal(e.releaseSourceBinding(victim,source,0),false);assert.ok(victim.status.bindingOrigin);
  victim.facing=1;e.setTouch('p2','special','pressed');const health=source.health;ticks(e,48);
  assert.equal(source.health,health);assert.equal(victim.status?.id,'bind');assert.ok(victim.status.bindingOrigin);
});

test('a standard virtual gamepad cannot move, jump or dodge out of the hair, but a real strike releases it',()=>{
  const {e,source,victim}=caught();for(let n=0;n<80&&victim.hurtFrames>0;n++)e.update();
  const pads=[0,1].map(index=>({index,id:'hair-pad-'+index,mapping:'standard',connected:true,axes:[0,0],
    buttons:Array.from({length:17},()=>({pressed:false}))}));
  navigator.getGamepads=()=>pads;e.updateGamepads();
  const pad=pads[1],x=victim.x;pad.axes[0]=1;pad.buttons[0].pressed=true;pad.buttons[8].pressed=true;ticks(e,1);
  assert.equal(victim.x,x);assert.equal(victim.y,594);assert.equal(victim.grounded,true);assert.equal(victim.dodgeFrames,0);
  pad.axes[0]=0;pad.buttons[0].pressed=false;pad.buttons[8].pressed=false;ticks(e,1);
  pad.buttons[1].pressed=true;const health=source.health;
  for(let n=0;n<70&&source.health===health;n++)e.update();
  assert.ok(source.health<health);assert.equal(victim.lastMoveKey,'neutralSpecial');assert.equal(victim.status,null);
});

test('hair cannot be escaped through the generic throw step, nor raise an already downed victim',()=>{
  const {e,victim}=caught();for(let n=0;n<80&&victim.hurtFrames>0;n++)e.update();
  const x=victim.x;assert.equal(e.beginAttack(victim,'throw'),true);assert.equal(victim.vx,0);ticks(e,1);assert.equal(victim.x,x);
  const other=engineFor(CYNTHIA),[cyn,nurse]=other.actors;nurse.x=590;nurse.knockdownTimer=30;nurse.state='knockdown';
  const health=nurse.health;assert.equal(other.beginAttack(cyn,'neutralSpecial'),true);
  for(let n=0;n<24;n++)other.update();
  assert.equal(nurse.status,null);assert.ok(nurse.knockdownTimer>0);
  assert.ok(health-nurse.health<=1,'only the already-authored passive ghost field can drain this target');
});

test('binding ownership refresh clears the hair-specific rule and unrelated ground grips keep their prior escape contract',()=>{
  const {e,source,victim}=caught();e.applyStatus(victim,{id:'bind',duration:50,potency:1},null);
  assert.equal(victim.status.bindingOrigin,undefined);assert.equal(e.releaseSourceBinding(victim,source,10),false);
  const other=engineFor('sh3_slurper_042'),[slurper,nurse]=other.actors;nurse.x=590;
  other.setTouch('p1','special','pressed');for(let n=0;n<70&&nurse.status?.id!=='bind';n++)other.update();
  assert.equal(nurse.status?.id,'bind');assert.equal(nurse.status.bindingOrigin,undefined);
  slurper.invuln=0;other.applyHit(nurse,slurper,nurse.profile.moves.neutralSpecial,734,1,{ranged:true,direction:-1});
  assert.equal(nurse.status?.id,'bind');
  const data=fighter(CYNTHIA),move=createCombatProfile(data).moves.neutralSpecial;
  assert.equal(sourceStandingBind({...data,source:'film'},move),false);assert.equal(sourceStandingBind({...data,id:'another-cynthia',baseId:CYNTHIA},move),false);
});

test('Bogeyman Downpour wave is source-scoped, fixed to the floor and never classified as firearm ammunition',()=>{
  const e=engineFor(BOGEYMAN),[a,b]=e.actors;a.x=300;b.x=1100;
  e.setTouch('p1','special','pressed');for(let n=0;n<60&&!e.projectiles.length;n++)e.update();
  assert.equal(e.projectiles.length,1);const p=e.projectiles[0],y=p.y;
  assert.equal(p.y+p.radius,594);assert.equal(p.y,p.groundY);assert.equal(p.vy,0);
  ticks(e,20);assert.equal(p.y,y);assert.equal(p.vy,0);assert.equal(p.gravity,0);
  assert.equal(isFirearmProjectile(a.data,p.move),false);assert.equal(sourceGroundProjectile(a.data,p.move),true);
  assert.equal(sourceGroundProjectile({...a.data,source:'homecoming'},p.move),false);
  assert.equal(sourceGroundProjectile({...a.data,id:'other-bogeyman',baseId:BOGEYMAN},p.move),false);
  assert.equal(a.profile.moves.super.projectile,false,'the authored hammer approach stays a contact super');
});

test('real Bogeyman wave damages a grounded target and a properly timed real jump clears its versus path',()=>{
  for(const jump of [false,true]){const e=engineFor(BOGEYMAN),[a,b]=e.actors;a.x=300;const before=b.health;
    e.setTouch('p1','special','pressed');for(let n=0;n<60&&!e.projectiles.length;n++)e.update();
    if(jump){ticks(e,12);e.setTouch('p2','jump','pressed');}
    let highest=594;for(let n=0;n<65;n++){e.update();highest=Math.min(highest,b.y);}
    if(jump){assert.ok(highest<594);assert.equal(b.health,before);assert.equal(a.stats.damageDealt,0);}
    else{assert.ok(b.health<before);assert.equal(a.stats.damageDealt,before-b.health);}
  }
});
