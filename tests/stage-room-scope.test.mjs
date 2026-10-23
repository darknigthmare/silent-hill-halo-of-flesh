import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {STAGES,ROSTER,STAGE_EVENTS} from '../src/data.js';
import {FightEngine} from '../src/fight.js';
import {STAGE_REFERENCES} from '../src/production-reference.js';
import {applyStageReferencePolicy,stageReferenceTrackAllowed} from '../src/stage-reference-policy.js';
import {drawStageReferenceTracks,drawStageCinematics} from '../src/stage-cinematics.js';
import {drawStageArchitecture,stageSpace} from '../src/stage-architecture.js';

const stage=id=>{const value=STAGES.find(s=>s.id===id);assert.ok(value,id);return value;};
const additions=[['historical_society','sh2','paintingGlint',1],['baldwin_mansion','sh2','closedDoorReply',2],['church','sh3','chapelCandleLean',1],['hilltop_center','sh3','officeBlindSway',1]];
function trace(){
 const calls=[],stack=[],state={globalAlpha:.4,canvas:{width:1280,height:720}};
 state.save=()=>{stack.push(state.globalAlpha);calls.push(['save']);};
 state.restore=()=>{assert.ok(stack.length);state.globalAlpha=stack.pop();calls.push(['restore']);};
 state.createLinearGradient=state.createRadialGradient=(...args)=>({addColorStop:(...color)=>calls.push(['gradient',...args,...color])});
 return {context:new Proxy(state,{get:(target,key)=>key in target?target[key]:(...args)=>calls.push([key,...args])}),calls,stack};
}
function draw(location,time,reducedMotion=false){
 const r=trace(),track=location.referenceTracks[0];
 if(track.event)drawStageCinematics(r.context,1280,720,location,{activeEvent:{...STAGE_EVENTS[track.event],id:track.event},activeTimer:time},{reducedMotion});
 else drawStageReferenceTracks(r.context,1280,720,location,time,{reducedMotion});
 assert.equal(r.context.globalAlpha,.4);assert.equal(r.stack.length,0);return r.calls;
}
const engines=new Set();afterEach(()=>{for(const engine of engines)engine.destroy();engines.clear();});

test('four exact room proposals retain original evidence and explicit partial versus scope',()=>{
 for(const [id,source,key,index] of additions){
  const location=stage(id),track=location.referenceTracks.find(t=>t.key===key),proposal=STAGE_REFERENCES[id].animations[index];
  assert.ok(track,id);assert.equal(track.id,`${id}:reference:${index+1}`);assert.equal(track.source,source);
  assert.equal(track.description,proposal.description);assert.deepEqual(track.evidence,proposal.evidence);
  assert.equal(track.coverage,'partial-visual-prototype');assert.equal(track.fidelity,'adaptation-versus-proposee');
  assert.ok(track.locationScope);assert.ok(track.limits.includes('1:1'));assert.equal(track.timecode,undefined);
  assert.equal(stageReferenceTrackAllowed(location,track),true);
  for(const forged of [{...location,source:'film'},{...location,id:id+'_remake'}]){
   assert.equal(stageReferenceTrackAllowed(forged,track),false);assert.deepEqual(draw({...forged,referenceTracks:[track]},43),[]);
  }
  assert.ok(!applyStageReferencePolicy({...location,source:'film'},{...STAGE_REFERENCES[id],source:'film'}).referenceTracks.some(t=>t.key===key));
 }
});

test('room selections exclude props and ambient cues borrowed from adjacent rooms',()=>{
 const church=stage('church');assert.equal(stageSpace(church),'interior');assert.equal(church.referencePolicy.interior,true);
 for(const prop of ['fans','flesh','symbols']){assert.ok(!church.props.includes(prop));assert.ok(!church.layers.includes(prop));}
 const chapel=trace();assert.equal(drawStageArchitecture(chapel.context,1280,720,church),true);assert.equal(chapel.stack.length,0);
 assert.ok(!stage('historical_society').props.includes('stairs'));
 const door=stage('baldwin_mansion');assert.ok(!door.props.includes('fireplace'));assert.ok(!door.animations.includes('firePulse'));
 assert.ok(!door.referenceTracks.some(t=>t.key==='chapelCandleLean'));assert.match(door.referenceTracks[0].limits,/grenier/);
 const office=stage('hilltop_center');assert.ok(!office.props.includes('elevator'));assert.ok(!office.animations.includes('elevatorBlink'));
 assert.match(office.referenceTracks[0].locationScope,/Monica/);assert.equal(office.shift.enabled,false);
});

test('ambient and impact prototypes animate without paint leaks and freeze under reduced motion',()=>{
 for(const [id] of additions){
  const location=stage(id),event=location.referenceTracks[0].event;
  assert.notDeepEqual(draw(location,event?74:1300),draw(location,event?31:6100),id);
  assert.deepEqual(draw(location,event?74:1300,true),draw(location,event?31:6100,true),id);
 }
});

test('Ernest door never opens or exposes a body at any sampled event phase',()=>{
 const location=stage('baldwin_mansion'),left=1280*.5-1280*.088*.5,top=720*.57-720*.25;
 for(let timer=0;timer<=100;timer++){
  const calls=draw(location,timer);
  // One opaque slab covers the complete fixed opening throughout the reply.
  assert.ok(calls.some(c=>c[0]==='fillRect'&&c[1]===left&&c[2]===top&&c[3]===1280*.088&&c[4]===720*.25));
  assert.ok(!calls.some(c=>['arc','ellipse','fillText','drawImage'].includes(c[0])));
 }
 const r=trace();assert.deepEqual(drawStageReferenceTracks(r.context,1280,720,location,7000),[]);assert.deepEqual(r.calls,[]);
});

test('Baldwin local impact reply adds no health, meter, danger, terrain or world-state change',()=>{
 globalThis.window={};globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};
 globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
 Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});
 globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;
 const location=stage('baldwin_mansion'),engine=new FightEngine({getContext:()=>trace().context},{p1:ROSTER[0],p2:ROSTER[1],stage:location,mode:'local',roundsToWin:2,timeLimit:99,seed:52,stageDirector:true,stageHazards:true,stageTerrain:true,otherworldShift:true,fatalities:false,stageFatalities:false});
 engines.add(engine);for(let tick=engine.phaseTimer;tick>0;tick--)engine.update();assert.equal(engine.phase,'fight');
 const runtime=engine.stageRuntime,interaction=location.interactions.find(i=>i.event==='referenceClosedDoorReply');assert.ok(interaction);
 runtime.eventTimer=-1;for(let tick=0;tick<10;tick++)engine.updateStageDirector();assert.equal(runtime.activeEvent,null);
 runtime.heavyImpactPending=true;runtime.lastHeavyImpact={x:50};assert.equal(engine.tryStageInteraction(),false);
 const [actor,target]=engine.actors;target.x=interaction.zone.x*1280;engine.applyHit(actor,target,actor.profile.moves.neutralHeavy,952);
 const state=()=>({health:engine.actors.map(a=>a.health),meter:engine.actors.map(a=>a.meter),world:engine.world.amount,terrain:engine.stage.terrain.id,hazards:engine.hazards.length});
 const before=state();assert.equal(engine.tryStageInteraction(),true);assert.equal(runtime.activeEvent.id,'referenceClosedDoorReply');assert.deepEqual(state(),before);
 assert.equal(runtime.pendingTerrain,null);assert.equal(runtime.linkedHazard,null);
 const event=STAGE_EVENTS.referenceClosedDoorReply;assert.equal(event.referenceOnly,true);assert.equal(event.hazard,undefined);assert.equal(event.terrainPulse,undefined);assert.equal(event.radioBoost,0);assert.equal(event.darkness,0);
 runtime.activeEvent=null;runtime.heavyImpactPending=true;runtime.lastHeavyImpact={x:target.x};assert.equal(engine.tryStageInteraction(),false);
});
