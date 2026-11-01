import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {STAGES,ROSTER,STAGE_TERRAINS} from '../src/data.js';
import {STAGE_REFERENCES} from '../src/production-reference.js';
import {STAGE_REFERENCE_TRACKS,stageReferenceTrackAllowed,stageReferenceEventAllowed,applyStageReferencePolicy} from '../src/stage-reference-policy.js';
import {drawStageReferenceTracks} from '../src/stage-cinematics.js';
import {drawStageArchitecture,stageSpace} from '../src/stage-architecture.js';
import {drawStage} from '../src/renderers.js';
import {stageTerrainProfile} from '../src/stage-director.js';
import {FightEngine} from '../src/fight.js';
import {STAGE_BITMAPS} from '../src/stage-bitmap-manifest.js';
const read=name=>JSON.parse(readFileSync(new URL('../docs/production/batches/'+name+'.json',import.meta.url)));
const ledger=read('lot12-stages'),candidates=ledger.items.filter(i=>i.status==='implemented-candidate'),blocked=ledger.items.filter(i=>i.status==='blocked');
const stage=id=>{const s=STAGES.find(s=>s.id===id);assert.ok(s,id);return s;};
const track=i=>stage(i.entityId).referenceTracks.find(t=>t.id===i.rowId);
function trace(){
 const calls=[],stack=[],state={canvas:{width:1280,height:720},globalAlpha:.61};
 state.save=()=>{stack.push(state.globalAlpha);calls.push(['save']);};state.restore=()=>{assert.ok(stack.length,'paint stack underflow');state.globalAlpha=stack.pop();calls.push(['restore']);};
 state.createLinearGradient=state.createRadialGradient=(...args)=>({addColorStop:(...v)=>calls.push(['gradient',...args,...v])});
 return {calls,stack,context:new Proxy(state,{get:(o,k)=>k in o?o[k]:(...args)=>calls.push([k,...args]),set:(o,k,v)=>{o[k]=v;calls.push(['set',k,typeof v==='object'?'gradient':v]);return true;}})};
}
function draw(s,time,options={}){const r=trace(),ids=drawStageReferenceTracks(r.context,1280,720,s,time,options);assert.equal(r.stack.length,0);assert.equal(r.context.globalAlpha,.61);return {ids,calls:r.calls};}
const engines=new Set();afterEach(()=>{for(const e of engines)e.destroy();engines.clear();});
function engineFor(s){
 globalThis.window={};globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
 Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;
 const e=new FightEngine({getContext:()=>trace().context},{p1:ROSTER[0],p2:ROSTER.find(f=>f.id==='sh3_memory_of_alessa_049'),stage:s,mode:'local',roundsToWin:2,timeLimit:99,seed:227,stageDirector:true,stageHazards:true,stageTerrain:true,otherworldShift:true,fatalities:false,stageFatalities:false});engines.add(e);return e;
}

test('lot12 accounts for thirty existing rows: twenty-five supported revisions and five visible blockers, without reusing a prior delivery',()=>{
 assert.equal(ledger.batch,'lot12');assert.equal(ledger.baseCommit,'1e6e408a3ef9d66869fdf7ce26eded06e383d12a');assert.equal(ledger.requestedItems,30);assert.equal(ledger.items.length,30);assert.equal(candidates.length,25);assert.equal(blocked.length,5);assert.equal(new Set(ledger.items.map(i=>i.rowId)).size,30);
 const previous=new Set(['lot9-stages','lot10-stages','lot11-stages'].flatMap(name=>read(name).items.map(i=>i.rowId)));
 for(const i of ledger.items){assert.equal(i.collection,'stageAnimations');assert.equal(i.rowId.split(':')[0],i.entityId);assert.ok(!previous.has(i.rowId));assert.ok(i.originalName&&i.originalProposal&&i.sourceScope&&i.limits&&i.evidence.length);assert.ok(STAGE_REFERENCES[i.entityId].animations[Number(i.rowId.split(':').at(-1))-1]);}
});

test('revised targets retain the complete historical text and deliver only the newly documented element',()=>{
 for(const i of candidates){const s=stage(i.entityId),t=track(i);assert.ok(t,i.rowId);assert.equal(t.description,STAGE_REFERENCES[s.id].animations[t.proposalIndex].description);assert.equal(t.description,i.revisedProposal);assert.equal(t.name,i.implementedElement);assert.equal(t.locationScope,i.sourceScope);assert.equal(t.fidelity,'adaptation-versus-proposee');assert.equal(t.captureStatus,STAGE_REFERENCES[s.id].animations[t.proposalIndex].captureStatus||'capture-a-relever');assert.ok(i.revisedProposal!==i.originalProposal);assert.ok(i.revisionReason&&i.artifacts.length);assert.equal(t.trigger,'ambient');assert.equal(t.event,null);assert.equal(t.timecode,undefined);assert.equal(STAGE_REFERENCE_TRACKS[t.key].sceneId,s.referencePolicy.sceneId);}
 for(const i of blocked){assert.ok(i.reason);if(i.rowId!=='brookhaven_sh2:reference:2')assert.ok(!stage(i.entityId).referenceTracks.some(t=>t.id===i.rowId),i.rowId);assert.deepEqual(i.artifacts,[]);}
});

test('all twenty-five props reject another source, owner, proposal or selected sub-room',()=>{
 for(const i of candidates){const s=stage(i.entityId),t=track(i);assert.equal(stageReferenceTrackAllowed(s,t),true);
  for(const forged of[{...s,id:s.id+'_other_room'},{...s,source:'borrowed-edition'},{...s,reference:{...s.reference,blocked:true}},{...s,referencePolicy:{...s.referencePolicy,sceneId:'different-sub-room'}}]){
   assert.equal(stageReferenceTrackAllowed(forged,t),false,i.rowId);assert.deepEqual(draw({...forged,referenceTracks:[t]},1100).ids,[]);
  }
  for(const altered of[{...t,id:s.id+':reference:99'},{...t,proposalIndex:99},{...t,source:'borrowed-edition'},{...t,event:'powerFailure'}])assert.equal(stageReferenceTrackAllowed(s,altered),false,i.rowId);
 }
});

test('each original Canvas element changes its own visual trace and freezes with both motion controls',()=>{
 const distinct=new Set();for(const i of candidates){const s={...stage(i.entityId),referenceTracks:[track(i)]},a=draw(s,1100),b=draw(s,5700);assert.deepEqual(a.ids,[i.rowId]);assert.notDeepEqual(a.calls,b.calls,i.rowId);assert.deepEqual(draw(s,1100,{reducedMotion:true}).calls,draw(s,5700,{reducedMotion:true}).calls,i.rowId);assert.deepEqual(draw(s,1100,{animationsEnabled:false}).calls,draw(s,5700,{animationsEnabled:false}).calls,i.rowId);distinct.add(JSON.stringify(a.calls));}assert.equal(distinct.size,25);
});

test('nine sparse room sets use separate geometry and keep their paint state balanced',()=>{
 const distinct=new Set();for(const id of new Set(candidates.map(i=>i.entityId))){const s=stage(id),r=trace();assert.equal(drawStageArchitecture(r.context,1280,720,s),true,id);assert.equal(stageSpace(s),'interior');assert.equal(r.stack.length,0);assert.equal(r.context.globalAlpha,.61);distinct.add(JSON.stringify(r.calls));const a=trace(),b=trace();drawStage(a.context,s,1000,{reducedMotion:true});drawStage(b.context,s,7000,{reducedMotion:true});assert.deepEqual(a.calls,b.calls,id);}assert.equal(distinct.size,9);
});

test('selected rooms retain neutral footing, one narrative phase and no inherited weather, invocation or physical apparatus',()=>{
 const materials=structuredClone(STAGE_TERRAINS);for(const id of new Set(candidates.map(i=>i.entityId))){const s=stage(id),p=stageTerrainProfile(s);assert.equal(s.reference.blocked,false);assert.equal(s.gameplay.terrainRules,false,id);assert.equal(s.referencePolicy.automaticFinishers,false);assert.equal(s.shift.enabled,false);assert.equal(s.weather,'none');assert.equal(s.visibility.fog,0);assert.deepEqual(s.animations,[]);assert.deepEqual(s.props,[]);assert.deepEqual(s.layers,[]);assert.deepEqual(s.director.events,id==='blue_creek'?['referenceRailingReply']:[]);assert.deepEqual(s.director.hazardDeck,[]);for(const key of['moveScale','jumpScale','dodgeScale','friction','knockbackScale','guardRegenScale'])assert.equal(p[key],STAGE_TERRAINS.concrete[key]);assert.match(p.description,/1:1/);const wrong=applyStageReferencePolicy({...s,source:'wrong-edition'},{...STAGE_REFERENCES[id],source:'wrong-edition'});assert.equal(wrong.referencePolicy.sceneId,undefined);}
 assert.deepEqual(STAGE_TERRAINS,materials);assert.equal(Object.keys(materials).length,14);
});


test('the named source rooms retain only photographed equipment and never restore the incompatible retired prototype',()=>{
 for(const [id,keys] of [
  ['woodside',['wood208Clock','wood208TV','wood208Shutters']],
  ['labyrinth',['boxFacesPedestal','boxFacesCube','boxFacesPanels']],
  ['shopping_mall',['happyBurgerBlinds','happyBurgerTable','happyBurgerChairs']],
  ['room_302',['room302ChainedDoor','room302CeilingLight','room302Kitchenette']],
  ['water_prison',['waterPrisonValve','waterPrisonPeepholes','waterPrisonShaft']],
  ['apartment_world',['room105Desk','room105Chair','room105Bars']]]) {
  const s=stage(id);assert.deepEqual(s.referenceTracks.map(t=>t.key),keys);assert.ok(!s.referenceTracks.some(t=>['cubeTurn','washroomHoleReply','waterwheelTurn','doorReply','shutterLift'].includes(t.key)));
 }
 const blue=stage('blue_creek');assert.ok(blue.referenceTracks.some(t=>t.id==='blue_creek:reference:3'&&t.key==='blueStairRailReply'));assert.equal(stageReferenceEventAllowed(blue,'referenceRailingReply'),true);assert.equal(blue.weather,'none');assert.ok(!blue.props.includes('water'));const rails=trace();drawStageArchitecture(rails.context,1280,720,blue);assert.ok(rails.calls.some(c=>c[0]==='lineTo'&&c[1]===1280*.55+94&&c[2]===720*.56-73),'fixed railing stays visible without the impact event');
 const prison=stage('toluca_prison');assert.equal(prison.referenceTracks.length,1);assert.equal(stageReferenceEventAllowed(prison,'referenceCellReply'),false);assert.equal(stageReferenceTrackAllowed(prison,{key:'cellDoorReply',id:'toluca_prison:reference:3',proposalIndex:2,source:'sh2',event:'referenceCellReply'}),false);
 assert.ok(stage('brookhaven_sh2').referenceTracks.some(t=>t.key==='pursuitElevatorGap'),'a blocked request for stronger source proof does not silently delete the former qualified candidate');
});

test('photographed fixed mechanisms never rotate, operate a puzzle, expose a portrait or add a body',()=>{
 for(const id of ['woodside','labyrinth','room_302','water_prison','apartment_world']){
  for(const i of candidates.filter(i=>i.entityId===id)){
   const a=draw({...stage(id),referenceTracks:[track(i)]},1100),b=draw({...stage(id),referenceTracks:[track(i)]},5700);
   for(const calls of[a.calls,b.calls])assert.ok(!calls.some(c=>['rotate','fillText','drawImage'].includes(c[0])),i.rowId);
   assert.deepEqual(a.calls.filter(c=>['moveTo','lineTo','ellipse','fillRect'].includes(c[0])&&!c.some(v=>typeof v==='string'&&/gradient/.test(v))),b.calls.filter(c=>['moveTo','lineTo','ellipse','fillRect'].includes(c[0])&&!c.some(v=>typeof v==='string'&&/gradient/.test(v))),i.rowId+' changes light only, not source mechanism position');
  }
 }
});

test('actual engine rendering and pause preserve all mechanics and source-scene state in nine rooms',()=>{
 for(const id of new Set(candidates.map(i=>i.entityId))){
  const e=engineFor(stage(id));while(e.phase==='intro')e.update();for(let n=0;n<30;n++)e.update();
  const stamp=()=>JSON.stringify({snapshot:e.snapshot(),runtime:e.stageRuntime,world:e.world,actors:e.actors.map(a=>[a.health,a.guard,a.meter]),terrain:e.currentTerrain()});
  const before=stamp();let reads=0;const rng=e.rng;e.rng=()=>{reads++;return rng();};e.render(1);e.render(987654);assert.equal(reads,0,id);assert.equal(stamp(),before,id);
  e.togglePause(true);const frame=e.frame,timer=e.phaseTimer;for(let n=0;n<10;n++)e.update();assert.equal(e.frame,frame);assert.equal(e.phaseTimer,timer);e.togglePause(false);e.update();assert.ok(e.frame>frame);assert.equal(e.hazards.length,0);
 }
});
