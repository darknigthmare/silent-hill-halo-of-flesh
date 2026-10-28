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
const ledger=read('lot11-stages'),candidates=ledger.items.filter(i=>i.status==='implemented-candidate'),blocked=ledger.items.filter(i=>i.status==='blocked');
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

test('lot11 accounts for thirty existing rows: twenty-one supported revisions and nine visible blockers, without reusing a prior delivery',()=>{
 assert.equal(ledger.batch,'lot11');assert.equal(ledger.baseCommit,'7b9980d102dc2db385445bc20e4172c1113dda2b');assert.equal(ledger.requestedItems,30);assert.equal(ledger.items.length,30);assert.equal(candidates.length,21);assert.equal(blocked.length,9);assert.equal(new Set(ledger.items.map(i=>i.rowId)).size,30);
 const previous=new Set(['lot9-stages','lot10-stages'].flatMap(name=>read(name).items.map(i=>i.rowId)));
 for(const i of ledger.items){assert.equal(i.collection,'stageAnimations');assert.equal(i.rowId.split(':')[0],i.entityId);assert.ok(!previous.has(i.rowId));assert.ok(i.originalName&&i.originalProposal&&i.sourceScope&&i.limits&&i.evidence.length);assert.ok(STAGE_REFERENCES[i.entityId].animations[Number(i.rowId.split(':').at(-1))-1]);}
});

test('revised targets retain the complete historical text and deliver only the newly documented element',()=>{
 for(const i of candidates){const s=stage(i.entityId),t=track(i);assert.ok(t,i.rowId);assert.equal(t.description,STAGE_REFERENCES[s.id].animations[t.proposalIndex].description);assert.equal(t.description,i.revisedProposal);assert.equal(t.name,i.implementedElement);assert.equal(t.locationScope,i.sourceScope);assert.equal(t.fidelity,'adaptation-versus-proposee');assert.equal(t.captureStatus,'capture-a-relever');assert.ok(i.revisedProposal!==i.originalProposal);assert.ok(i.revisionReason&&i.artifacts.length);assert.equal(t.trigger,'ambient');assert.equal(t.event,null);assert.equal(t.timecode,undefined);assert.equal(STAGE_REFERENCE_TRACKS[t.key].sceneId,s.referencePolicy.sceneId);}
 for(const i of blocked){assert.ok(i.reason);assert.ok(!stage(i.entityId).referenceTracks.some(t=>t.id===i.rowId),i.rowId);assert.deepEqual(i.artifacts,[]);}
});

test('all twenty-one props reject another source, owner, proposal or selected sub-room',()=>{
 for(const i of candidates){const s=stage(i.entityId),t=track(i);assert.equal(stageReferenceTrackAllowed(s,t),true);
  for(const forged of[{...s,id:s.id+'_other_room'},{...s,source:'borrowed-edition'},{...s,reference:{...s.reference,blocked:true}},{...s,referencePolicy:{...s.referencePolicy,sceneId:'different-sub-room'}}]){
   assert.equal(stageReferenceTrackAllowed(forged,t),false,i.rowId);assert.deepEqual(draw({...forged,referenceTracks:[t]},1100).ids,[]);
  }
  for(const altered of[{...t,id:s.id+':reference:99'},{...t,proposalIndex:99},{...t,source:'borrowed-edition'},{...t,event:'powerFailure'}])assert.equal(stageReferenceTrackAllowed(s,altered),false,i.rowId);
 }
});

test('each original Canvas element changes its own visual trace and freezes with both motion controls',()=>{
 const distinct=new Set();for(const i of candidates){const s={...stage(i.entityId),referenceTracks:[track(i)]},a=draw(s,1100),b=draw(s,5700);assert.deepEqual(a.ids,[i.rowId]);assert.notDeepEqual(a.calls,b.calls,i.rowId);assert.deepEqual(draw(s,1100,{reducedMotion:true}).calls,draw(s,5700,{reducedMotion:true}).calls,i.rowId);assert.deepEqual(draw(s,1100,{animationsEnabled:false}).calls,draw(s,5700,{animationsEnabled:false}).calls,i.rowId);distinct.add(JSON.stringify(a.calls));}assert.equal(distinct.size,21);
});

test('eight sparse room sets use separate geometry and keep their paint state balanced',()=>{
 const distinct=new Set();for(const id of new Set(candidates.map(i=>i.entityId))){const s=stage(id),r=trace();assert.equal(drawStageArchitecture(r.context,1280,720,s),true,id);assert.equal(stageSpace(s),'interior');assert.equal(r.stack.length,0);assert.equal(r.context.globalAlpha,.61);distinct.add(JSON.stringify(r.calls));const a=trace(),b=trace();drawStage(a.context,s,1000,{reducedMotion:true});drawStage(b.context,s,7000,{reducedMotion:true});assert.deepEqual(a.calls,b.calls,id);}assert.equal(distinct.size,8);
});

test('selected rooms retain neutral footing, one narrative phase and no inherited weather, invocation or physical apparatus',()=>{
 const materials=structuredClone(STAGE_TERRAINS);for(const id of new Set(candidates.map(i=>i.entityId))){const s=stage(id),p=stageTerrainProfile(s);assert.equal(s.reference.blocked,false);assert.equal(s.gameplay.terrainRules,false,id);assert.equal(s.referencePolicy.automaticFinishers,false);assert.equal(s.shift.enabled,false);assert.equal(s.weather,'none');assert.equal(s.visibility.fog,0);assert.deepEqual(s.animations,[]);assert.deepEqual(s.props,[]);assert.deepEqual(s.layers,[]);assert.deepEqual(s.director.events,[]);assert.deepEqual(s.director.hazardDeck,[]);for(const key of['moveScale','jumpScale','dodgeScale','friction','knockbackScale','guardRegenScale'])assert.equal(p[key],STAGE_TERRAINS.concrete[key]);assert.match(p.description,/1:1/);const wrong=applyStageReferencePolicy({...s,source:'wrong-edition'},{...STAGE_REFERENCES[id],source:'wrong-edition'});assert.equal(wrong.referencePolicy.sceneId,undefined);}
 assert.deepEqual(STAGE_TERRAINS,materials);assert.equal(Object.keys(materials).length,14);
});

test('P.T. keeps the photographed light state, radio and closed door without importing the hanging-fridge or phone-vibration proposal',()=>{
 const s=stage('looping_hall');assert.equal(s.referencePolicy.sceneId,'lit-beige-hall-unidentified-loop');assert.equal(s.referencePolicy.worldState,'fixed-normal');assert.match(s.referencePolicy.normalPhaseLabel,/BOUCLE NON DATÉE/);assert.equal(stageReferenceEventAllowed(s,'powerFailure'),false);assert.deepEqual(s.referenceTracks.map(t=>t.key),['ptHangingLantern','ptRadioCabinet','ptBackDoorLight']);assert.ok(s.referenceTracks.some(t=>/RADIO/.test(t.description)));assert.ok(!s.referenceTracks.some(t=>/vibre avant un appel/.test(t.description)));
 const r=trace();drawStage(r.context,s,3000,{otherworld:1,director:{activeEvent:{id:'powerFailure'},activeTimer:50}});assert.equal(r.stack.length,0);
});

test('the workshop counter cannot render the old generic chain, rotary tool or Room321 weapon',()=>{
 const s=stage('curtis_shop');assert.equal(s.referencePolicy.sceneId,'junkyard-counter-first-exchange');assert.deepEqual(s.referenceTracks.map(t=>t.key),['curtisCounterClock','curtisWindowSlits']);assert.ok(!s.referenceTracks.some(t=>t.id==='curtis_shop:reference:1'));assert.equal(stageReferenceTrackAllowed(s,{key:'chainPendulum',id:'curtis_shop:reference:1',proposalIndex:0,source:'homecoming',event:null}),false);assert.ok(ledger.outOfScopeCorrections.some(i=>i.rowId==='curtis_shop:reference:1'&&i.action==='retained-as-unproduced-proposal'));
});

test('SHf altar and first threshold exclude the boss weapons, garden bells, absent statue and false dolls',()=>{
 const altar=stage('dark_shrine_corridors'),threshold=stage('dark_shrine_main');assert.equal(altar.referencePolicy.sceneId,'inari-altar-before-replacement');assert.equal(threshold.referencePolicy.sceneId,'first-ritual-chamber-threshold');assert.ok(altar.referenceTracks.every(t=>/autel|boiseries/i.test(t.description)));assert.ok(threshold.referenceTracks.every(t=>/seuil|porte|panneaux|braseros/i.test(t.description)));assert.match(threshold.reference.locationNote,/New Game\+/);assert.ok(!altar.referenceTracks.some(t=>t.key==='chainPendulum'));assert.ok(!threshold.referenceTracks.some(t=>t.key==='bellToll'));
});

test('guide-only Origins placements remain qualified, preserve a closed mirror phase and add no adjacent creature or inventory puzzle',()=>{
 const treatment=stage('cedar_grove'),passage=stage('antique_shop');assert.equal(treatment.referencePolicy.worldState,'fixed-normal');assert.equal(passage.referencePolicy.worldState,'fixed-altered');assert.match(treatment.referenceTracks[0].limits,/sans vue native entière/);assert.ok(passage.referenceTracks.every(t=>/pas une photographie/.test(t.limits)));assert.ok(!treatment.referenceTracks.some(t=>t.id==='cedar_grove:reference:1'));assert.match(ledger.items.find(i=>i.rowId==='cedar_grove:reference:1').reason,/deuxième objet/);
});

test('actual engine frames pause and render without mutating mechanics, health, phase or RNG in all eight rooms',()=>{
 for(const id of new Set(candidates.map(i=>i.entityId))){const e=engineFor(stage(id));while(e.phase==='intro')e.update();for(let n=0;n<30;n++)e.update();const before=JSON.stringify({snapshot:e.snapshot(),runtime:e.stageRuntime,world:e.world,terrain:e.currentTerrain(),actors:e.actors.map(a=>[a.health,a.guard,a.meter])});let reads=0;const rng=e.rng;e.rng=()=>{reads++;return rng();};e.render(1);e.render(987654);assert.equal(reads,0,id);assert.equal(JSON.stringify({snapshot:e.snapshot(),runtime:e.stageRuntime,world:e.world,terrain:e.currentTerrain(),actors:e.actors.map(a=>[a.health,a.guard,a.meter])}),before,id);e.togglePause(true);const frame=e.frame,timer=e.phaseTimer,a=draw(e.stage,frame*1000/60).calls;for(let n=0;n<10;n++)e.update();assert.equal(e.frame,frame);assert.equal(e.phaseTimer,timer);assert.deepEqual(draw(e.stage,e.frame*1000/60).calls,a);e.togglePause(false);e.update();assert.ok(e.frame>frame);assert.equal(e.hazards.length,0);}
});

test('no bitmap or older room is replaced by lot11 and the reviewed global deltas stay explicit',()=>{
 assert.equal(Object.keys(STAGE_BITMAPS).length,6);assert.ok(!candidates.some(i=>STAGE_BITMAPS[i.entityId]));assert.equal(STAGES.reduce((n,s)=>n+s.referenceTracks.length,0),147);assert.equal(STAGES.reduce((n,s)=>n+s.animations.length,0),64);assert.equal(STAGES.reduce((n,s)=>n+s.director.events.length,0),28);assert.equal(STAGES.reduce((n,s)=>n+s.interactions.length,0),28);assert.equal(STAGES.reduce((n,s)=>n+s.director.hazardDeck.length,0),8);
 const waiting=stage('alchemilla');for(const key of['ward','curtains','monitor','beds'])assert.ok(![...waiting.props,...waiting.layers].includes(key));assert.match(stage('artaud_theater').referencePolicy.normalPhaseLabel,/SCÈNE NORMALE/);assert.equal(stage('hinako_home').referencePolicy.sceneId,undefined);
});
