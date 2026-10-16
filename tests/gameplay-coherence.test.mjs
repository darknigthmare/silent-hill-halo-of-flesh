import test from 'node:test';
import assert from 'node:assert/strict';
import { ROSTER,STAGES,STAGE_HAZARDS,STAGE_EVENTS } from '../src/data.js';
import { bodyProfile,bodyBox,bodyPushRadius,moveBox,overlaps,hazardVolumes,hazardTouches,hasGroundContact } from '../src/combat-geometry.js';
import { localEventAllowed,localHazardAllowed,localAnimationAllowed } from '../src/stage-lore-policy.js';
import { stageSpace } from '../src/stage-architecture.js';
import { drawStage,drawMonster } from '../src/renderers.js';
import { drawStageCinematics } from '../src/stage-cinematics.js';
import { rasterPlacement } from '../src/sprite-system.js';
import { FightEngine } from '../src/fight.js';

const fighter = kind=>ROSTER.find(f=>f.visual.kind===kind);
function recorder(){
  const calls=[];const gradient={addColorStop:(...a)=>calls.push(['stop',...a])};
  const context = new Proxy({canvas:{width:1280,height:720},globalAlpha:1,
    createLinearGradient:()=>gradient,createRadialGradient:()=>gradient,measureText:s=>({width:String(s).length*7})},
    {get:(t,k)=>k in t?t[k]:(...args)=>calls.push([k,...args]),set:(t,k,v)=>{t[k]=v;calls.push(['set',k,v]);return true;}});
  return {calls,context,canvas:{width:1280,height:720,getContext:()=>context}};
}
function make(extra={}){
  globalThis.window ||= {};
  globalThis.localStorage={getItem:()=>null,setItem(){}};
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{getGamepads:()=>[],vibrate:()=>false}});
  globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;
  const r=recorder();const e=new FightEngine(r.canvas,{p1:fighter('nurse'),p2:fighter('humanoid'),stage:STAGES[0],mode:'local',timeLimit:99,seed:8101,...extra});
  e.phase='fight';e.actors.forEach(a=>{a.state='idle';a.invuln=0});return e;
}
function hazard(id,x=640){return {id,profile:STAGE_HAZARDS[id],x,y:594,timer:80,maxTimer:80,active:0,maxActive:34,side:1,zoneMin:x-230,zoneMax:x+230};}

test('all 230 procedural bodies have finite positive geometry and unchanged visual scale',()=>{
  for(const data of ROSTER){const a={data,x:640,y:594,grounded:true};const b=bodyBox(a);assert.ok(b.w>0&&b.h>0);assert.ok(Object.values(b).every(Number.isFinite));assert.equal(bodyProfile(data).scale,data.visual.scale);assert.ok(bodyPushRadius(a)<=b.w/2);}
});
test('small insects no longer inherit a humanoid-height hurtbox',()=>{
  const insect=bodyBox({data:fighter('insect'),x:640,y:594}),nurse=bodyBox({data:fighter('nurse'),x:640,y:594});assert.ok(insect.h<nurse.h*.35);assert.ok(insect.w>insect.h);
});
test('quadruped and worm bodies are wide and low rather than standing human boxes',()=>{
  for(const kind of ['quadruped','worm']){const b=bodyBox({data:fighter(kind),x:640,y:594});assert.ok(b.w>b.h);}
});
test('child and giant raster calibration applies the existing body scale exactly once',()=>{
  const frame={width:640,height:427,anchor:[.5,.95],facing:1,bodyHeight:.9};
  for(const kind of ['child','giant']){const f=fighter(kind),p=bodyProfile(f),image=rasterPlacement(f,frame,640,594);assert.equal(image.height*frame.bodyHeight,p.height*p.scale);assert.ok(Math.abs(image.width/image.height-frame.width/frame.height)<1e-12);}
});
test('crouching collision stays at .68 while unavailable art is not falsely squash-animated',()=>{
  const f=fighter('nurse'),a={data:f,x:640,y:594};const r=recorder();drawMonster(r.context,f,640,594,{state:{crouching:true}});
  assert.ok(Math.abs(bodyBox({...a,crouching:true}).h/bodyBox(a).h-.68)<1e-12);
  assert.ok(!r.calls.some(c=>c[0]==='scale'),'No geometric fallback or squashed standing pose is synthesized.');
  assert.ok(r.calls.some(c=>c[0]==='fillText'&&c[1]==='VISUEL À PRODUIRE'));
});
test('low input reaches a creeper while a standing high attack passes above it',()=>{
  const attacker={data:fighter('nurse'),x:640,y:594,facing:1},target={data:fighter('insect'),x:725,y:594};assert.ok(overlaps(moveBox(attacker,{level:'low',reach:140}),bodyBox(target)));assert.ok(!overlaps(moveBox(attacker,{level:'high',reach:140}),bodyBox(target)));
});
test('projectiles leave the firing creature body instead of a universal human chest height',()=>{
  const e=make({p1:fighter('insect')});const a=e.actors[0],move=a.profile.moves.neutralSpecial;e.spawnProjectile(a,{...move,trap:false,projectile:true,projectileCount:1},1);const shot=e.projectiles[0],body=bodyBox(a);assert.ok(shot.y>=body.y&&shot.y<=body.y+body.h);e.destroy();
});
test('water slows grounded actors but not flyers, suspended cages or jumping actors',()=>{
  const flooded=STAGES.find(s=>s.terrain.id==='flooded');const e=make({stage:flooded});assert.ok(e.terrainForActor(e.actors[0]).moveScale<1);e.actors[0].grounded=false;assert.equal(e.terrainForActor(e.actors[0]).moveScale,1);e.destroy();
  for(const kind of ['flyer','cage','ghost']){const e=make({p1:fighter(kind),stage:flooded});assert.equal(hasGroundContact(e.actors[0]),false);assert.equal(e.terrainForActor(e.actors[0]).moveScale,1);e.destroy();}
});
test('directional dodge follows the requested safe side; neutral dodge remains backwards',()=>{
  const e=make();const a=e.actors[0];a.facing=1;e.setTouch('p1','right',true);e.setTouch('p1','dodge','pressed');e.updateActor(a,0);assert.ok(a.vx>0);e.destroy();
  const b=make(),x=b.actors[0];x.facing=1;b.setTouch('p1','dodge','pressed');b.updateActor(x,0);assert.ok(x.vx<0);b.destroy();
});
test('body separation uses both body widths and does not collide across vertical gaps',()=>{
  const e=make({p1:fighter('worm'),p2:fighter('quadruped')});const[a,b]=e.actors;a.x=600;b.x=601;e.resolveBodyCollision();assert.ok(b.x-a.x>=bodyPushRadius(a)+bodyPushRadius(b)-1e-8);a.x=600;b.x=601;a.y=100;a.grounded=false;e.resolveBodyCollision();assert.equal(b.x-a.x,1);e.destroy();
});
test('wall-side push transfers separation to the free actor',()=>{
  const e=make();const[a,b]=e.actors;a.x=e.arenaInset(70);b.x=a.x+1;e.resolveBodyCollision();assert.ok(b.x-a.x>=bodyPushRadius(a)+bodyPushRadius(b)-1e-8);e.destroy();
});
test('wide bodies stay inside the screen at both boundaries',()=>{
  const e=make({p1:fighter('worm')});const a=e.actors[0];for(const x of [-900,4000]){a.x=x;a.vx=0;e.physics(a);const b=bodyBox(a);assert.ok(b.x>=0&&b.x+b.w<=1280);}e.destroy();
});
test('all 29 hazards have finite clipped collision volumes for warning and active phases',()=>{
  for(const id of Object.keys(STAGE_HAZARDS))for(const x of [35,640,1245]){const h=hazard(id,x);for(const timer of [80,0]){h.timer=timer;h.active=34;for(const r of hazardVolumes(h)){assert.ok(Object.values(r).every(Number.isFinite));assert.ok(r.x>=0&&r.x+r.w<=1280&&r.w>0&&r.h>0);}}}
});
test('road-collapse warning and damage concern the SAME selected edge only',()=>{
  const h=hazard('roadCollapse',140);assert.ok(hazardTouches(h,{x:100,y:594}));assert.ok(!hazardTouches(h,{x:1180,y:594}));assert.deepEqual(hazardVolumes(h).map(r=>[r.x,r.w]),[[0,188]]);
});
test('fighter-targeted ice crack stays local instead of drawing on an unrelated screen edge',()=>{
  const h=hazard('iceFracture',640);assert.ok(hazardTouches(h,{x:640,y:594}));assert.ok(!hazardTouches(h,{x:80,y:594}));assert.equal(hazardVolumes(h)[0].x,460);
});
test('ring center is safe but a body crossing the inner boundary is hit',()=>{
  const h=hazard('crtvPulse',640);assert.equal(hazardVolumes(h).length,2);assert.ok(!hazardTouches(h,{data:fighter('insect'),x:640,y:594}));assert.ok(hazardTouches(h,{data:fighter('quadruped'),x:700,y:594}));
});
test('root attacks have physical vertical extent and can be jumped; psychic waves cannot',()=>{
  const actor={data:fighter('nurse'),x:640,y:500,grounded:false};assert.ok(!hazardTouches(hazard('rootSnare'),actor));assert.ok(hazardTouches(hazard('sirenShock'),actor));
});
test('train and gurney collision travel monotonically within their announced lane',()=>{
  for(const id of ['trainRush','gurneyRush'])for(const side of [-1,1]){const h=hazard(id);h.side=side;h.timer=0;let previous=null;for(let active=34;active>=1;active--){h.active=active;const b=hazardVolumes(h)[0],warning=hazardVolumes(h,{preview:true})[0];assert.ok(b.x>=warning.x&&b.x+b.w<=warning.x+warning.w+1e-8);if(previous!==null)assert.ok((b.x-previous)*side>=0);previous=b.x;}}
});
test('a passing train hits an actor once, not once per active frame',()=>{
  const e=make();const a=e.actors[0];a.x=640;const h=e.spawnHazard('trainRush');Object.assign(h,{x:640,zoneMin:400,zoneMax:880,side:1,timer:1});let first=null;for(let i=0;i<35;i++){e.updateHazards();if(a.stats.hazardsTaken&&first===null)first=i;}assert.equal(a.stats.hazardsTaken,1);assert.ok(first!==null);e.destroy();
});
test('a physical prop does not damage the far end of its path before it arrives',()=>{
  const e=make();const a=e.actors[0];a.x=910;const h=e.spawnHazard('gurneyRush');Object.assign(h,{x:680,zoneMin:400,zoneMax:960,side:1,timer:0,active:34});e.resolveHazard(h);assert.equal(a.stats.hazardsTaken,0);h.active=1;e.resolveHazard(h,true);assert.equal(a.stats.hazardsTaken,1);e.destroy();
});
test('unguarded environmental damage interrupts an attack instead of permitting a ghost swing',()=>{
  const e=make();const a=e.actors[0];e.beginAttack(a,'neutralHeavy');assert.ok(a.attack);const h=e.spawnHazard('sirenShock');e.resolveHazard(h);assert.equal(a.attack,null);assert.ok(a.hurtFrames>0);e.destroy();
});
test('no damage is applied after time-out has already ended the round',()=>{
  const e=make();e.matchTime=.0001;e.actors[0].health=500;e.actors[1].health=499;const h=e.spawnHazard('sirenShock');h.timer=1;const hp=e.actors.map(a=>a.health);e.update();assert.notEqual(e.phase,'fight');assert.deepEqual(e.actors.map(a=>a.health),hp);assert.equal(h.resolved,false);e.destroy();
});
test('all stage decks obey their own listed props instead of injecting source-wide setpieces',()=>{
  for(const s of STAGES){for(const id of s.director.events)assert.ok(localEventAllowed(s,id),`${s.id}/${id}`);for(const id of s.director.hazardDeck)assert.ok(localHazardAllowed(s,id),`${s.id}/${id}`);for(const id of s.animations)assert.ok(localAnimationAllowed(s,id),`${s.id}/${id}`);}
});
test('Lakeview local rules cannot inherit an unrelated generic fire or mirror event',()=>{
  const s=STAGES.find(s=>s.id==='lakeview');assert.deepEqual(s.director.events,['portraitWatch','powerFailure']);assert.ok(!s.director.hazardDeck.includes('emberFall'));assert.ok(!s.animations.includes('mirrorGlitch'));
});
test('Brookhaven roof is outside, with no hospital-bed or gurney animation',()=>{
  const s=STAGES.find(s=>s.id==='brookhaven_roof');assert.equal(stageSpace(s),'exterior');assert.ok(!s.director.events.includes('gurneyRush'));assert.ok(!s.animations.includes('hospitalMonitor'));
});
test('named interior rooms are rendered indoors rather than in front of a distant building',()=>{
  for(const id of ['lakeview','brookhaven_sh2','room_302'])assert.equal(stageSpace(STAGES.find(s=>s.id===id)),'interior');
});
test('reduced motion freezes decorative geometry while retaining the current Otherworld state',()=>{
  const s=STAGES.find(s=>s.id==='lakeview');const a=recorder(),b=recorder();drawStage(a.context,s,1000,{otherworld:.6,reducedMotion:true});drawStage(b.context,s,9000,{otherworld:.6,reducedMotion:true});assert.deepEqual(JSON.parse(JSON.stringify(a.calls)),JSON.parse(JSON.stringify(b.calls)));
});
test('disabled ambience freezes weather and machinery as well as the extra animation tracks',()=>{
  const s=STAGES.find(s=>s.id==='st_amelia_marina');const a=recorder(),b=recorder();drawStage(a.context,s,1000,{animationsEnabled:false});drawStage(b.context,s,9000,{animationsEnabled:false});assert.deepEqual(JSON.parse(JSON.stringify(a.calls)),JSON.parse(JSON.stringify(b.calls)));
});
test('linked stage event draws no second independently placed damaging prop',()=>{
  const s=STAGES.find(s=>s.director.events.includes('gurneyRush')),r=recorder();drawStageCinematics(r.context,1280,720,s,{activeEvent:{id:'gurneyRush',...STAGE_EVENTS.gurneyRush},activeTimer:50,linkedHazard:hazard('gurneyRush')});assert.equal(r.calls.length,0);
});
test('snapshots provide exact hurtboxes and warning/travel volumes for Observation',()=>{
  const e=make();e.spawnHazard('rootSnare');const s=e.snapshot();assert.deepEqual(s.p1.body,bodyBox(e.actors[0]));assert.ok(s.world.director.hazardWarnings[0].zones.length>0);assert.ok(s.world.director.hazardWarnings[0].counterplay.includes('SAUT'));e.destroy();
});
