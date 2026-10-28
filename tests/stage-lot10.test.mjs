import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {STAGES,ROSTER,STAGE_TERRAINS} from '../src/data.js';
import {STAGE_REFERENCES} from '../src/production-reference.js';
import {stageReferenceTrackAllowed,applyStageReferencePolicy,STAGE_REFERENCE_TRACKS} from '../src/stage-reference-policy.js';
import {drawStageReferenceTracks,stageReferencePresentation} from '../src/stage-cinematics.js';
import {drawStage} from '../src/renderers.js';
import {drawStageArchitecture,stageSpace} from '../src/stage-architecture.js';
import {stageTerrainProfile} from '../src/stage-director.js';
import {FightEngine} from '../src/fight.js';
import {STAGE_BITMAPS} from '../src/stage-bitmap-manifest.js';
const ledger=JSON.parse(readFileSync(new URL('../docs/production/batches/lot10-stages.json',import.meta.url))),previous=JSON.parse(readFileSync(new URL('../docs/production/batches/lot9-stages.json',import.meta.url)));
const parts=ledger.items.filter(i=>i.trigger==='ambient'),recipes=ledger.items.filter(i=>i.trigger==='match-phase');
const stage=id=>{const s=STAGES.find(s=>s.id===id);assert.ok(s,id);return s;};
const trackFor=i=>stage(i.entityId).referenceTracks.find(t=>t.id===i.rowId);
function trace(){const calls=[],stack=[],state={canvas:{width:1280,height:720},globalAlpha:.43};state.save=()=>{stack.push(state.globalAlpha);calls.push(['save']);};state.restore=()=>{assert.ok(stack.length);state.globalAlpha=stack.pop();calls.push(['restore']);};state.createLinearGradient=state.createRadialGradient=(...args)=>({addColorStop:(...color)=>calls.push(['gradient',...args,...color])});return{calls,stack,context:new Proxy(state,{get:(o,k)=>k in o?o[k]:(...a)=>calls.push([k,...a]),set:(o,k,v)=>{o[k]=v;calls.push(['set',k,typeof v==='object'?'gradient':v]);return true;}})};}
function draw(s,time,options={}){const r=trace(),ids=drawStageReferenceTracks(r.context,1280,720,s,time,options);assert.equal(r.stack.length,0);assert.equal(r.context.globalAlpha,.43);return{ids,calls:r.calls};}
const result=(frame=900,timer=145)=>({phase:'roundEnd',frame,phaseTimer:timer,phaseDuration:145,resultTimer:0,round:1});
const engines=new Set();afterEach(()=>{for(const e of engines)e.destroy();engines.clear();});
function engineFor(s){globalThis.window={};globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;const e=new FightEngine({getContext:()=>trace().context},{p1:ROSTER[0],p2:ROSTER[1],stage:s,mode:'local',roundsToWin:2,timeLimit:99,seed:197,stageDirector:true,stageHazards:false,stageTerrain:true,otherworldShift:true,fatalities:false,stageFatalities:false});engines.add(e);return e;}
const matchState=e=>({phase:e.phase,frame:e.frame,phaseTimer:e.phaseTimer,phaseDuration:e.presentationSequence?.duration||145,resultTimer:e.resultTimer||0,round:e.round});

test('lot10 advances exactly thirty distinct real rows with twelve room parts and eighteen conditional result compositions',()=>{
 assert.equal(ledger.batch,'lot10');assert.equal(ledger.requestedItems,30);assert.equal(ledger.items.length,30);assert.equal(parts.length,12);assert.equal(recipes.length,18);assert.equal(new Set(ledger.items.map(i=>i.rowId)).size,30);assert.equal(ledger.items.filter(i=>i.status==='blocked').length,0);
 const prior=new Set(previous.items.map(i=>i.rowId));for(const i of ledger.items){assert.ok(!prior.has(i.rowId),i.rowId);const s=stage(i.entityId),t=trackFor(i),p=STAGE_REFERENCES[s.id].animations[Number(i.rowId.split(':').at(-1))-1];assert.ok(t,i.rowId);assert.equal(i.collection,'stageAnimations');assert.equal(i.status,'implemented-candidate');assert.equal(t.key,i.runtimeKey);assert.equal(t.description,p.description);assert.equal(t.captureStatus,'capture-a-relever');assert.ok(i.evidence.length&&i.artifacts.length&&i.limits&&i.sourceScope);assert.equal(t.fidelity,'adaptation-versus-proposee');assert.equal(t.trigger,i.trigger);assert.equal(t.timecode,undefined);}
 assert.ok(ledger.rejectedBeforeSelection.some(i=>i.candidate.startsWith('villa_rooftop')));
});

test('all thirty new rows reject borrowed sources, wrong rooms, altered triggers and proposal identities',()=>{
 for(const i of ledger.items){const s=stage(i.entityId),t=trackFor(i);assert.equal(stageReferenceTrackAllowed(s,t),true);for(const foreign of[{...s,source:'wrong-source'},{...s,id:s.id+'_different_room'}]){assert.equal(stageReferenceTrackAllowed(foreign,t),false);assert.deepEqual(draw({...foreign,referenceTracks:[t]},3000,{matchState:result(1000,45)}).ids,[]);}assert.equal(stageReferenceTrackAllowed(s,{...t,id:s.id+':reference:99',proposalIndex:98}),false);assert.equal(stageReferenceTrackAllowed(s,{...t,event:'powerFailure'}),false);if(t.trigger==='match-phase')assert.equal(stageReferenceTrackAllowed(s,{...t,trigger:'ambient'}),false);}
});

test('twelve native room parts move as original Canvas work, freeze with reduced motion and balance paint state',()=>{
 for(const i of parts){const s={...stage(i.entityId),referenceTracks:[trackFor(i)]};assert.notDeepEqual(draw(s,1400).calls,draw(s,5900).calls,i.rowId);assert.deepEqual(draw(s,1400,{reducedMotion:true}).calls,draw(s,5900,{reducedMotion:true}).calls,i.rowId);assert.deepEqual(draw(s,1400,{animationsEnabled:false}).calls,draw(s,5900,{animationsEnabled:false}).calls,i.rowId);}
});

test('result rows draw eighteen different room-specific compositions only with an explicit actual phase',()=>{
 const distinct=new Set();for(const i of recipes){const s={...stage(i.entityId),referenceTracks:[trackFor(i)]};assert.deepEqual(draw(s,3000).ids,[]);for(const matchState of[{phase:'fight',frame:1000,phaseTimer:0,round:1},{phase:'intro',frame:10,phaseTimer:135,round:1},{phase:'fatality',frame:1000,phaseTimer:90,round:1}])assert.deepEqual(draw(s,3000,{matchState}).ids,[]);const rest=draw(s,3000,{matchState:result(1000,45)});assert.deepEqual(rest.ids,[i.rowId]);assert.ok(rest.calls.length>2);distinct.add(JSON.stringify(rest.calls));assert.deepEqual(draw(s,3000,{matchState:result(1000,45),animationsEnabled:false}).ids,[]);}assert.equal(distinct.size,18);
});

test('the pure result clock decelerates and holds, follows a variable presentation duration, and releases at the real next fight',()=>{
 for(const i of recipes){const s=stage(i.entityId),t=trackFor(i),f=STAGE_REFERENCE_TRACKS[t.key].matchRecipe.settleFrames;
  const opening=stageReferencePresentation(s,1,result()),settled=stageReferencePresentation(s,2,result(900+f,145-f)),later=stageReferencePresentation(s,999999,result(1020,25));assert.ok(Math.abs(opening.time-15000)<1e-9);assert.ok(settled.time>opening.time&&settled.time<opening.time+f*1000/60);assert.equal(settled.time,later.time);assert.equal(later.strength,1);
  const variable=stageReferencePresentation(s,3,{...result(1020,80),phaseDuration:200});assert.equal(variable.time,later.time);
  const final=stageReferencePresentation(s,3,{phase:'matchEnd',frame:1100,phaseTimer:0,phaseDuration:145,resultTimer:55,round:1});assert.equal(final.time,later.time);
  const intro1=stageReferencePresentation(s,3,{phase:'intro',frame:1200,phaseTimer:100,round:2}),intro2=stageReferencePresentation(s,4,{phase:'intro',frame:1299,phaseTimer:1,round:2});assert.equal(intro1.time,intro2.time);assert.ok(intro2.strength<intro1.strength);assert.equal(stageReferencePresentation(s,intro1.time,{phase:'fight',frame:1300,phaseTimer:0,round:2}).time,intro1.time);
  assert.deepEqual(draw(s,2,{matchState:result(1020,25)}).calls,draw(s,999999,{matchState:result(1020,25)}).calls);assert.equal(stageReferencePresentation(s,999999,result(1020,25),{reducedMotion:true}).time,0);
 }
});

test('real KO, pause, next intro and TIME drive the room composition without render RNG, health, terrain or state mutation',()=>{
 for(const id of['dark_shrine','nightmare_hospital_sm','book_fire','film_hospital']){const e=engineFor(stage(id));while(e.phase==='intro')e.update();assert.equal(e.phase,'fight');e.endRound(e.actors[0],'K.O.');assert.equal(e.phase,'roundEnd');for(let n=0;n<60;n++)e.update();const state=matchState(e),projection=stageReferencePresentation(e.stage,1,state);assert.equal(projection.strength,1);let randomReads=0;const rng=e.rng;e.rng=()=>{randomReads++;return rng();};const before=JSON.stringify({snapshot:e.snapshot(),world:e.world,terrain:e.currentTerrain(),runtime:e.stageRuntime,actors:e.actors.map(a=>[a.health,a.guard,a.meter]),phase:e.phase,frame:e.frame,timer:e.phaseTimer});e.render(1);e.render(987654);assert.equal(randomReads,0);assert.equal(JSON.stringify({snapshot:e.snapshot(),world:e.world,terrain:e.currentTerrain(),runtime:e.stageRuntime,actors:e.actors.map(a=>[a.health,a.guard,a.meter]),phase:e.phase,frame:e.frame,timer:e.phaseTimer}),before);e.togglePause(true);for(let n=0;n<5;n++)e.update();assert.deepEqual(matchState(e),state);e.togglePause(false);while(e.phase==='roundEnd')e.update();assert.equal(e.phase,'intro');assert.equal(e.round,2);assert.ok(stageReferencePresentation(e.stage,1,matchState(e)).track);while(e.phase==='intro')e.update();assert.equal(e.phase,'fight');assert.equal(stageReferencePresentation(e.stage,e.frame*1000/60,matchState(e)).track,null);e.matchTime=.0001;e.update();assert.equal(e.phase,'roundEnd');assert.ok(stageReferencePresentation(e.stage,1,matchState(e)).track);}
});

test('new SHf and Wii rooms retain exact distinct phases, no unsupported fixture, no material advantage and explicit overrides',()=>{
 const materials=structuredClone(STAGE_TERRAINS),contexts=new Set(parts.map(i=>i.entityId));for(const id of contexts){const s=stage(id),p=stageTerrainProfile(s);assert.equal(s.reference.blocked,false);assert.equal(s.gameplay.terrainRules,false);assert.equal(s.referencePolicy.automaticFinishers,false);assert.equal(s.shift.enabled,false);assert.equal(s.weather,'none');assert.equal(s.visibility.fog,0);assert.deepEqual(s.animations,[]);for(const k of['moveScale','jumpScale','dodgeScale','friction','knockbackScale','guardRegenScale'])assert.equal(p[k],STAGE_TERRAINS.concrete[k]);assert.deepEqual(stageTerrainProfile(s,'flooded'),{id:'flooded',...STAGE_TERRAINS.flooded});assert.match(p.description,/1:1/);const r=trace();assert.equal(drawStageArchitecture(r.context,1280,720,s),true);assert.equal(r.stack.length,0);const foreign=applyStageReferencePolicy({...s,source:'wrong-source'},{...STAGE_REFERENCES[id],source:'wrong-source'});assert.equal(foreign.referencePolicy.terrainPresentation,undefined);}
 assert.equal(stageSpace(stage('dark_shrine')),'exterior');assert.equal(stageSpace(stage('nightmare_school')),'exterior');assert.match(stage('hinako_home').referencePolicy.terrainPresentation.name,/PLANCHER/);assert.match(stage('shimizu_residence').referencePolicy.terrainPresentation.name,/TATAMI/);assert.ok(!stage('hinako_home').props.includes('tatami'));assert.ok(!stage('hinako_home').props.includes('roots'));assert.ok(!stage('corrupted_ebisugaoka').props.includes('roots'));assert.ok(stage('corrupted_ebisugaoka').referenceTracks.some(t=>t.key==='rootBorder'));assert.match(stage('school_shf').reference.locationNote,/personnel/);assert.ok(!stage('nightmare_hospital_sm').props.includes('beds'));assert.ok(!stage('nightmare_mall_sm').props.includes('escalator'));assert.equal(Object.keys(materials).length,14);assert.deepEqual(STAGE_TERRAINS,materials);
});

test('renderer forwards match projection to all scenery while leaving galleries ambient and all six replacement bitmaps masked',()=>{
 const s=stage('book_fire'),phase=result(1020,25),a=trace(),b=trace();drawStage(a.context,s,1,{matchState:phase});drawStage(b.context,s,987654,{matchState:phase});assert.deepEqual(a.calls,b.calls);const native=draw(s,1000),resultFrame=draw(s,1000,{matchState:phase});assert.ok(!native.ids.includes('book_fire:reference:4'));assert.ok(resultFrame.ids.includes('book_fire:reference:4'));assert.equal(STAGES.reduce((n,s)=>n+s.director.events.length,0),28);assert.equal(STAGES.reduce((n,s)=>n+s.interactions.length,0),28);assert.equal(STAGES.reduce((n,s)=>n+s.director.hazardDeck.length,0),8);assert.equal(STAGES.flatMap(s=>s.referenceTracks).length,147);
 const replaced=STAGES.filter(s=>STAGE_BITMAPS[s.id]?.source===s.source&&STAGE_BITMAPS[s.id].mode==='replace');assert.equal(replaced.length,6);assert.equal(replaced.flatMap(s=>s.referenceTracks).length,6);assert.ok(!replaced.some(s=>recipes.some(i=>i.entityId===s.id)));
});
