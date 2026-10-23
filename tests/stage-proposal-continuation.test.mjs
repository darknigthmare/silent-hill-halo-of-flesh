import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {STAGES,ROSTER,STAGE_EVENTS} from '../src/data.js';
import {FightEngine} from '../src/fight.js';
import {STAGE_REFERENCES} from '../src/production-reference.js';
import {applyStageReferencePolicy,stageReferenceTrackAllowed,STAGE_REFERENCE_TRACKS} from '../src/stage-reference-policy.js';
import {drawStageReferenceTracks,drawStageCinematics} from '../src/stage-cinematics.js';
import {drawStageArchitecture,stageSpace} from '../src/stage-architecture.js';

const stage=id=>{const value=STAGES.find(s=>s.id===id);assert.ok(value,id);return value;};
const additions=[['toluca_prison','sh2','cellDoorReply',2,'referenceCellReply'],['labyrinth','sh2','cubeTurn',1,null],['room_302','sh4','washroomHoleReply',2,'referenceWashroomReply']];
function trace(){
 const calls=[],stack=[],state={globalAlpha:.4,canvas:{width:1280,height:720}};
 state.save=()=>{stack.push(state.globalAlpha);calls.push(['save']);};
 state.restore=()=>{assert.ok(stack.length);state.globalAlpha=stack.pop();calls.push(['restore']);};
 state.createLinearGradient=state.createRadialGradient=(...args)=>({addColorStop:(...color)=>calls.push(['gradient',...args,...color])});
 const context=new Proxy(state,{get:(target,key)=>key in target?target[key]:(...args)=>calls.push([key,...args])});
 return {context,calls,stack};
}
const engines=new Set();afterEach(()=>{for(const engine of engines)engine.destroy();engines.clear();});
function engineFor(location){
 globalThis.window={};globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};
 globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
 Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});
 globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;
 const context=trace().context;
 const engine=new FightEngine({getContext:()=>context},{p1:ROSTER.find(f=>f.id==='sh1_air_screamer_001'),p2:ROSTER.find(f=>f.id==='sh2_bubble_head_nurse_024'),stage:location,mode:'local',roundsToWin:2,timeLimit:99,seed:51,stageDirector:true,stageHazards:true,stageTerrain:true,otherworldShift:true,fatalities:false,stageFatalities:false});
 engines.add(engine);for(let tick=engine.phaseTimer;tick>0;tick--)engine.update();assert.equal(engine.phase,'fight');return engine;
}

test('three new scenery parts bind existing workbook proposals without inventing measured source timing',()=>{
 for(const [id,source,key,index,event] of additions){
  const location=stage(id),track=location.referenceTracks.find(t=>t.key===key),proposal=STAGE_REFERENCES[id].animations[index];
  assert.ok(track,id+'/'+key);assert.equal(track.id,`${id}:reference:${index+1}`);assert.equal(track.source,source);
  assert.equal(track.description,proposal.description);assert.deepEqual(track.evidence,proposal.evidence);
  assert.equal(track.event,event);assert.equal(track.coverage,'partial-visual-prototype');assert.equal(track.fidelity,'adaptation-versus-proposee');
  assert.equal(stageReferenceTrackAllowed(location,track),true);assert.equal(track.timecode,undefined);
  if(event){assert.equal(STAGE_EVENTS[event].referenceOnly,true);assert.equal(STAGE_EVENTS[event].hazard,undefined);assert.equal(STAGE_EVENTS[event].terrainPulse,undefined);assert.equal(STAGE_EVENTS[event].radioBoost,0);}
 }
});

test('pending props cannot merge the music room with its courtyard or the gallows courtyard with a cellblock',()=>{
 const location=stage('midwich');assert.equal(STAGE_REFERENCE_TRACKS.pianoKeyReply.pendingLocation,'music-room');
 assert.ok(!location.referenceTracks.some(track=>track.key==='pianoKeyReply'));assert.ok(!location.director.events.includes('referencePianoReply'));
 assert.equal(STAGE_EVENTS.referencePianoReply,undefined);
 const forged={key:'pianoKeyReply',id:'midwich:reference:3',source:'sh1',proposalIndex:2,anchor:{x:.23,y:.58}};
 assert.equal(stageReferenceTrackAllowed(location,forged),false);
 const r=trace();assert.deepEqual(drawStageReferenceTracks(r.context,1280,720,{...location,referenceTracks:[forged]},1000),[]);assert.deepEqual(r.calls,[]);
 const prison=stage('toluca_prison');assert.equal(stageSpace(prison),'interior');assert.equal(STAGE_REFERENCE_TRACKS.ropePendulum.pendingLocation,'gallows-courtyard');
 assert.ok(!prison.referenceTracks.some(track=>track.key==='ropePendulum'));assert.ok(prison.referenceTracks.some(track=>track.key==='cellDoorReply'));
 const rope={key:'ropePendulum',id:'toluca_prison:reference:2',source:'sh2',proposalIndex:1,anchor:{x:.68,y:.25}};
 assert.equal(stageReferenceTrackAllowed(prison,rope),false);
 const cellblock=trace();assert.deepEqual(drawStageReferenceTracks(cellblock.context,1280,720,{...prison,referenceTracks:[rope]},1000),[]);assert.deepEqual(cellblock.calls,[]);
});

test('new props cannot transfer to another edition or an ID copied with a different source',()=>{
 for(const [id,source,key] of additions){
  const location=stage(id),track=location.referenceTracks.find(t=>t.key===key);
  for(const forged of [{...location,source:'film'},{...location,id:id+'_remake'}]){
   assert.equal(stageReferenceTrackAllowed(forged,track),false,id+'/'+key);
   const only={...forged,referenceTracks:[track]},r=trace();
   if(track.event)drawStageCinematics(r.context,1280,720,only,{activeEvent:{id:track.event,duration:100},activeTimer:50});
   else assert.deepEqual(drawStageReferenceTracks(r.context,1280,720,only,2000),[]);
   assert.deepEqual(r.calls,[],id+'/'+key);
  }
  const forged=applyStageReferencePolicy({...location,source:'film'},{...STAGE_REFERENCES[id],source:'film'});
  assert.ok(!forged.referenceTracks.some(t=>t.key===key),id+'/'+source);
 }
});

test('new ambient props and reactions freeze geometry under reduced motion and preserve paint alpha',()=>{
 for(const [id,,key] of additions){
  const location=stage(id),track=location.referenceTracks.find(t=>t.key===key),only={...location,referenceTracks:[track]};
  const draw=(time,reduced)=>{
   const r=trace();if(track.event)drawStageCinematics(r.context,1280,720,only,{activeEvent:{id:track.event,duration:100},activeTimer:time},{reducedMotion:reduced});
   else drawStageReferenceTracks(r.context,1280,720,only,time,{reducedMotion:reduced});
   assert.equal(r.context.globalAlpha,.4);assert.equal(r.stack.length,0);return r.calls;
  };
  assert.notDeepEqual(draw(track.event?74:1300,false),draw(track.event?31:6100,false),id+'/'+key);
  assert.deepEqual(draw(track.event?74:1300,true),draw(track.event?31:6100,true),id+'/'+key);
 }
});

test('the underground Labyrinth uses interior architecture and the initial washroom hole is stationary',()=>{
 const maze=stage('labyrinth');assert.equal(stageSpace(maze),'interior');assert.equal(maze.referencePolicy.interior,true);assert.ok(maze.visibility.fog<=.2);
 const interior=trace();assert.equal(drawStageArchitecture(interior.context,1280,720,maze),true);assert.equal(interior.stack.length,0);
 const room=stage('room_302'),a=trace(),b=trace();drawStageArchitecture(a.context,1280,720,room);drawStageArchitecture(b.context,1280,720,room);
 assert.deepEqual(a.calls,b.calls);assert.ok(a.calls.some(call=>call[0]==='ellipse'&&call[1]===1280*.78&&call[2]===720*.49));
 const other=trace();drawStageArchitecture(other.context,1280,720,{...room,source:'film'});assert.ok(!other.calls.some(call=>call[0]==='ellipse'&&call[1]===1280*.78));
});

test('two real local impact reactions grant no extra health, meter, hazard, terrain or phase changes',()=>{
 for(const id of ['toluca_prison','room_302']){
  const location=stage(id),engine=engineFor(location),runtime=engine.stageRuntime,interaction=location.interactions.find(i=>i.trigger==='local-heavy-impact');assert.ok(interaction,id);
  runtime.eventTimer=-1;for(let tick=0;tick<10;tick++)engine.updateStageDirector();assert.equal(runtime.activeEvent,null,id+': elapsed time alone');
  runtime.heavyImpactPending=true;runtime.lastHeavyImpact={x:interaction.zone.x>.5?30:1250};assert.equal(engine.tryStageInteraction(),false,id+': remote impact');
  const [actor,target]=engine.actors;target.x=interaction.zone.x*1280;const health=target.health;engine.applyHit(actor,target,actor.profile.moves.neutralHeavy,951);assert.ok(target.health<health);assert.equal(runtime.heavyImpactPending,true);
  const state=()=>({health:engine.actors.map(a=>a.health),meter:engine.actors.map(a=>a.meter),phase:engine.world.amount,terrain:engine.stage.terrain.id,hazards:engine.hazards.length});
  const before=state();assert.equal(engine.tryStageInteraction(),true,id);assert.equal(runtime.activeEvent.id,interaction.event);
  assert.deepEqual(state(),before,id+': visual cue adds no gameplay reward');assert.equal(runtime.pendingTerrain,null);assert.equal(runtime.linkedHazard,null);
  runtime.activeEvent=null;runtime.heavyImpactPending=true;runtime.lastHeavyImpact={x:target.x};assert.equal(engine.tryStageInteraction(),false,id+': once per round');
 }
});
