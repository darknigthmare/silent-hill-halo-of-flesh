import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {STAGES,ROSTER,STAGE_TERRAINS} from '../src/data.js';
import {FightEngine} from '../src/fight.js';
import {STAGE_REFERENCES} from '../src/production-reference.js';
import {stageReferenceTrackAllowed,applyStageReferencePolicy} from '../src/stage-reference-policy.js';
import {drawStageReferenceTracks,drawStageCinematics} from '../src/stage-cinematics.js';
import {stageSpace,drawStageArchitecture} from '../src/stage-architecture.js';

const stage=id=>{const value=STAGES.find(s=>s.id===id);assert.ok(value,id);return value;};
const additions=[['subway_world','subwayDoorCycle'],['forest_world','forestWindLayers'],['water_prison','waterwheelTurn'],['hospital_world','wheelchairDrift']];
function trace(){
 const calls=[],stack=[],state={globalAlpha:.4,canvas:{width:1280,height:720}};
 state.save=()=>{stack.push(state.globalAlpha);calls.push(['save']);};
 state.restore=()=>{assert.ok(stack.length);state.globalAlpha=stack.pop();calls.push(['restore']);};
 state.createLinearGradient=state.createRadialGradient=(...args)=>({addColorStop:(...color)=>calls.push(['gradient',...args,...color])});
 return {context:new Proxy(state,{get:(target,key)=>key in target?target[key]:(...args)=>calls.push([key,...args])}),calls,stack};
}
const draw=(location,time,reducedMotion=false)=>{
 const r=trace();drawStageReferenceTracks(r.context,1280,720,location,time,{reducedMotion});
 assert.equal(r.context.globalAlpha,.4);assert.equal(r.stack.length,0);return r.calls;
};
const engines=new Set();afterEach(()=>{for(const engine of engines)engine.destroy();engines.clear();});

test('four SH4 proposals bind the existing exact first-visit room evidence without claiming measured animation',()=>{
 for(const [id,key] of additions){
  const location=stage(id),track=location.referenceTracks.find(t=>t.key===key),proposal=STAGE_REFERENCES[id].animations[1];
  assert.ok(track,id);assert.equal(track.id,`${id}:reference:2`);assert.equal(track.source,'sh4');assert.equal(track.proposalIndex,1);
  assert.equal(track.description,proposal.description);assert.deepEqual(track.evidence,proposal.evidence);
  assert.equal(track.fidelity,'adaptation-versus-proposee');assert.equal(track.coverage,'partial-visual-prototype');assert.equal(track.event,null);
  assert.equal(track.timecode,undefined);assert.ok(track.locationScope);assert.match(track.limits,/proposé/);
  assert.equal(stageReferenceTrackAllowed(location,track),true);
  for(const forged of [{...location,source:'sh3'},{...location,id:id+'_second_visit'}]){
   assert.equal(stageReferenceTrackAllowed(forged,track),false);assert.deepEqual(draw({...forged,referenceTracks:[track]},1400),[]);
  }
  assert.ok(!applyStageReferencePolicy({...location,source:'sh3'},{...STAGE_REFERENCES[id],source:'sh3'}).referenceTracks.some(t=>t.key===key));
 }
});

test('selected SH4 rooms exclude adjoining locations, unsupported ambience and the Hazel Street danger',()=>{
 const subway=stage('subway_world');assert.equal(subway.weather,'dust');assert.equal(stageSpace(subway),'interior');assert.ok(!subway.props.includes('turnstile'));
 assert.deepEqual(subway.director.hazardDeck,[]);assert.ok(!subway.director.events.includes('trainRumble'));assert.ok(!subway.referenceTracks.some(t=>/Wallmen|escalator/.test(t.name)));
 const forest=stage('forest_world');assert.equal(stageSpace(forest),'exterior');assert.ok(!forest.props.includes('wish_house'));assert.ok(!forest.layers.includes('wish house'));assert.ok(!forest.animations.includes('forestWind'));
 const prison=stage('water_prison');assert.equal(stageSpace(prison),'interior');assert.equal(prison.weather,'dust');assert.deepEqual(prison.terrain,{id:'concrete',...STAGE_TERRAINS.concrete});
 for(const prop of ['tower','watchtower','cells','spotlight','chains']){assert.ok(!prison.props.includes(prop));assert.ok(!prison.layers.includes(prop));}
 const hospital=stage('hospital_world');for(const prop of ['beds','head','curtains','monitor']){assert.ok(!hospital.props.includes(prop));assert.ok(!hospital.layers.includes(prop));}
 assert.match(hospital.referenceTracks[0].locationScope,/deuxième étage/);assert.match(hospital.referenceTracks[0].limits,/ennemis/);assert.deepEqual(hospital.director.events,[]);
 const forced=trace();drawStageCinematics(forced.context,1280,720,hospital,{activeEvent:{id:'powerFailure',duration:100},activeTimer:50});assert.deepEqual(forced.calls,[]);
});

test('four new ambient prototypes freeze under reduced motion and preserve Canvas state',()=>{
 for(const [id] of additions){const location=stage(id);assert.notDeepEqual(draw(location,1400),draw(location,5900),id);assert.deepEqual(draw(location,1400,true),draw(location,5900,true),id);}
});

test('the B2 rotor stays horizontal, stopped car body stays fixed and wheelchair wheels stay grounded',()=>{
 const prison=stage('water_prison');
 for(const time of [0,1400,5900,15999]){
  const wheel=draw(prison,time);assert.ok(wheel.some(c=>c[0]==='ellipse'&&c[3]===97&&c[4]===27));assert.ok(!wheel.some(c=>c[0]==='arc'));
  const car=draw(stage('subway_world'),time).filter(c=>c[0]==='fillRect')[0];assert.deepEqual(car,['fillRect',640-186,720*.57-720*.24,372,720*.24]);
  const chair=draw(stage('hospital_world'),time);const translation=chair.find(c=>c[0]==='translate');assert.equal(translation[2],720*.57);
  const wheels=chair.filter(c=>c[0]==='arc');assert.ok(wheels.length===2&&wheels.every(c=>c[2]+c[3]===0));
 }
});

test('the SH4 first-visit treeline replaces generic mountains without changing exterior space or other forests',()=>{
 const forest=stage('forest_world'),r=trace();assert.equal(stageSpace(forest),'exterior');assert.equal(drawStageArchitecture(r.context,1280,720,forest),true);
 assert.equal(r.stack.length,0);assert.equal(r.context.globalAlpha,.4);assert.ok(r.calls.some(c=>c[0]==='fillRect'&&c[1]===0&&c[2]===0&&c[3]===1280&&c[4]===720*.57));
 assert.ok(r.calls.some(c=>c[0]==='ellipse'));assert.ok(!r.calls.some(c=>c[0]==='fillText'));
 for(const other of [{...forest,source:'sh3'},{...forest,id:'forest_world_second_visit'},{...forest,id:'other_forest',source:'origins'}]){
  const untouched=trace();assert.equal(stageSpace(other),'exterior');assert.equal(drawStageArchitecture(untouched.context,1280,720,other),false);assert.deepEqual(untouched.calls,[]);
 }
});

test('idle simulation and heavy-impact flags cannot turn decorative SH4 props into attacks or rewards',()=>{
 globalThis.window={};globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};
 globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
 Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});
 globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;
 for(const [id] of additions){
  const location=stage(id),engine=new FightEngine({getContext:()=>trace().context},{p1:ROSTER[0],p2:ROSTER[1],stage:location,mode:'local',roundsToWin:2,timeLimit:99,seed:53,stageDirector:true,stageHazards:true,stageTerrain:true,otherworldShift:true,fatalities:false,stageFatalities:false});
  engines.add(engine);for(let tick=engine.phaseTimer;tick>0;tick--)engine.update();assert.equal(engine.phase,'fight');
  const state=()=>({health:engine.actors.map(a=>a.health),meter:engine.actors.map(a=>a.meter),hazards:engine.hazards.length,world:engine.world.amount,terrain:engine.stage.terrain.id});
  const before=state();engine.stageRuntime.eventTimer=-1;engine.stageRuntime.heavyImpactPending=true;engine.stageRuntime.lastHeavyImpact={x:640};
  assert.equal(engine.tryStageInteraction(),false);for(let tick=0;tick<90;tick++)engine.update();assert.deepEqual(state(),before,id);
  assert.equal(engine.stageRuntime.activeEvent,null);assert.equal(engine.stageRuntime.pendingTerrain,null);assert.equal(engine.stageRuntime.linkedHazard??null,null);
 }
});

test('normal Alchemilla waiting room retains two masked prototypes but cannot fire the separate elevator light',()=>{
 const waiting=stage('alchemilla'),light=waiting.referenceTracks.find(t=>t.key==='lampReply');
 // A waiting-room transport bench is not a ward bed; its naked walls cannot
 // authorize a curtain-dependent actor finisher through inherited family props.
 for(const prop of['ward','curtains','monitor','beds']){assert.ok(!waiting.props.includes(prop));assert.ok(!waiting.layers.includes(prop));}
 assert.equal(waiting.referenceTracks.length,2);assert.ok(light);assert.equal(light.event,'referenceLightReply');assert.equal(light.eventEnabled,false);
 assert.match(light.limits,/autre sous-lieu/);assert.ok(!waiting.director.events.includes('referenceLightReply'));assert.ok(!waiting.interactions.some(i=>i.event==='referenceLightReply'));
 assert.ok(!waiting.referencePolicy.renderedProposalIds.includes(light.id));assert.ok(waiting.referencePolicy.pendingProposalIds.includes(light.id));
 const forced=trace();drawStageCinematics(forced.context,1280,720,waiting,{activeEvent:{id:'referenceLightReply',duration:100},activeTimer:50});assert.deepEqual(forced.calls,[]);
});
