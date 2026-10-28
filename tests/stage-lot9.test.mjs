import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {STAGES,ROSTER,STAGE_EVENTS,STAGE_TERRAINS} from '../src/data.js';
import {STAGE_REFERENCES} from '../src/production-reference.js';
import {FightEngine} from '../src/fight.js';
import {stageTerrainProfile} from '../src/stage-director.js';
import {stageReferenceTrackAllowed,applyStageReferencePolicy} from '../src/stage-reference-policy.js';
import {drawStageReferenceTracks,drawStageCinematics} from '../src/stage-cinematics.js';
import {drawStageArchitecture,stageSpace} from '../src/stage-architecture.js';

const ledger=JSON.parse(readFileSync(new URL('../docs/production/batches/lot9-stages.json',import.meta.url),'utf8'));
const implemented=ledger.items.filter(i=>i.status==='implemented-candidate'),blocked=ledger.items.filter(i=>i.status==='blocked');
const stage=id=>{const value=STAGES.find(s=>s.id===id);assert.ok(value,id);return value;};
function trace(){
 const calls=[],stack=[],state={globalAlpha:.4,canvas:{width:1280,height:720}};
 state.save=()=>{stack.push(state.globalAlpha);calls.push(['save']);};state.restore=()=>{assert.ok(stack.length);state.globalAlpha=stack.pop();calls.push(['restore']);};
 state.createLinearGradient=state.createRadialGradient=(...args)=>({addColorStop:(...color)=>calls.push(['gradient',...args,...color])});
 return {context:new Proxy(state,{get:(target,key)=>key in target?target[key]:(...args)=>calls.push([key,...args]),set:(target,key,value)=>{target[key]=value;calls.push(['set',key,typeof value==='object'?'gradient':value]);return true;}}),calls,stack};
}
function draw(location,track,time,reducedMotion=false){
 const r=trace(),selected={...location,referenceTracks:[track]};
 if(track.event)drawStageCinematics(r.context,1280,720,selected,{activeEvent:{id:track.event,duration:120},activeTimer:time},{reducedMotion});
 else drawStageReferenceTracks(r.context,1280,720,selected,time,{reducedMotion});
 assert.equal(r.context.globalAlpha,.4);assert.equal(r.stack.length,0);return r.calls;
}
const engines=new Set();afterEach(()=>{for(const e of engines)e.destroy();engines.clear();});
function engineFor(location){
 globalThis.window={};globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
 Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;
 const e=new FightEngine({getContext:()=>trace().context},{p1:ROSTER[0],p2:ROSTER[1],stage:location,mode:'local',roundsToWin:2,timeLimit:99,seed:69,stageDirector:true,stageHazards:true,stageTerrain:true,otherworldShift:true,fatalities:false,stageFatalities:true});engines.add(e);for(let n=e.phaseTimer;n>0;n--)e.update();return e;
}

test('lot9 accounts for exactly thirty real workbook proposals, keeping seven source blocks unimplemented',()=>{
 assert.equal(ledger.requestedItems,30);assert.equal(ledger.items.length,30);assert.equal(new Set(ledger.items.map(i=>i.rowId)).size,30);assert.equal(implemented.length,23);assert.equal(blocked.length,7);
 for(const item of ledger.items){const s=stage(item.entityId),index=Number(item.rowId.split(':').at(-1))-1;assert.ok(STAGE_REFERENCES[s.id].animations[index]);assert.ok(item.evidence.length);assert.ok(item.limits);assert.equal(item.collection,'stageAnimations');}
 for(const item of blocked){const s=stage(item.entityId);assert.deepEqual(item.artifacts,[]);assert.ok(item.reason);assert.ok(!s.referenceTracks.some(t=>t.id===item.rowId),item.rowId);}
});

test('new parts bind exact source, row and trigger while rejecting forged ownership or events',()=>{
 for(const item of implemented){
  const s=stage(item.entityId),track=s.referenceTracks.find(t=>t.id===item.rowId),proposal=STAGE_REFERENCES[s.id].animations[track.proposalIndex];assert.ok(track);assert.equal(track.key,item.runtimeKey);assert.equal(track.description,proposal.description);assert.deepEqual(track.evidence,proposal.evidence);
  assert.equal(track.fidelity,'adaptation-versus-proposee');assert.equal(track.coverage,'partial-visual-prototype');assert.equal(track.timecode,undefined);assert.equal(track.trigger,item.trigger);
  assert.equal(stageReferenceTrackAllowed(s,track),true);
  for(const forged of[{...s,source:s.source==='film'?'sh2':'film'},{...s,id:s.id+'_another_room'}]){assert.equal(stageReferenceTrackAllowed(forged,track),false);assert.deepEqual(draw(forged,track,50),[]);}
  assert.equal(stageReferenceTrackAllowed(s,{...track,event:track.event?null:'powerFailure'}),false);
  assert.equal(stageReferenceTrackAllowed(s,{...track,proposalIndex:98,id:s.id+':reference:99'}),false);
 }
});

test('local reactions require an actual nearby heavy hit and add no damage, meter, physical hazard or terrain reward',()=>{
 const reactions=implemented.filter(i=>i.trigger==='local-heavy-impact');assert.equal(reactions.length,9);
 for(const item of reactions){
  const s=stage(item.entityId),track=s.referenceTracks.find(t=>t.id===item.rowId),interaction=s.interactions.find(i=>i.proposalId===item.rowId),definition=STAGE_EVENTS[track.event];assert.ok(interaction,item.rowId);
  assert.equal(definition.referenceOnly,true);assert.equal(definition.hazard,undefined);assert.equal(definition.terrainPulse,undefined);assert.equal(definition.darkness,0);assert.equal(definition.radioBoost,0);
  const e=engineFor(s),runtime=e.stageRuntime;runtime.interactionTriggered=s.interactions.filter(i=>i.id!==interaction.id).map(i=>i.id);runtime.activeEvent=null;runtime.eventTimer=-1;runtime.heavyImpactPending=false;
  assert.equal(e.tryStageInteraction(),false,'elapsed time is not a local hit');runtime.heavyImpactPending=true;runtime.lastHeavyImpact={x:interaction.zone.x>.5?0:1280};assert.equal(e.tryStageInteraction(),false,'remote hit cannot reach the prop');
  const [attacker,target]=e.actors;target.x=interaction.zone.x*1280;const health=target.health;e.applyHit(attacker,target,attacker.profile.moves.neutralHeavy,991);assert.ok(target.health<health);assert.equal(runtime.heavyImpactPending,true);
  const state=()=>({health:e.actors.map(a=>a.health),meter:e.actors.map(a=>a.meter),terrain:e.currentTerrain(),world:e.world.amount,hazards:e.hazards.length});const before=state();assert.equal(e.tryStageInteraction(),true);assert.equal(runtime.activeEvent.id,track.event);assert.deepEqual(state(),before);assert.equal(runtime.linkedHazard,null);assert.equal(runtime.pendingTerrain,null);
  runtime.activeEvent=null;runtime.heavyImpactPending=true;runtime.lastHeavyImpact={x:target.x};assert.equal(e.tryStageInteraction(),false,'reply remains once per round');
 }
 assert.equal(STAGES.reduce((n,s)=>n+s.director.events.length,0),28);assert.equal(STAGES.reduce((n,s)=>n+s.interactions.length,0),28);assert.equal(STAGES.reduce((n,s)=>n+s.director.hazardDeck.length,0),8);
});

test('new scenery moves normally and freezes geometry with reduced motion without leaking Canvas state',()=>{
 for(const item of implemented){const s=stage(item.entityId),track=s.referenceTracks.find(t=>t.id===item.rowId),a=track.event?96:1400,b=track.event?42:5900;assert.notDeepEqual(draw(s,track,a),draw(s,track,b),item.rowId);assert.deepEqual(draw(s,track,a,true),draw(s,track,b,true),item.rowId);}
});

test('the film room never claims Brookhaven or a nurse corridor and the clinical dream cannot replay its later elevator scene',()=>{
 const alessa=stage('film_hospital');assert.equal(alessa.name,'HÔPITAL DU FILM — CHAMBRE D’ALESSA');assert.equal(alessa.reference.blocked,false);assert.equal(alessa.referencePolicy.normalPhaseLabel,'CHAMBRE D’ALESSA · FILM 2006');assert.equal(alessa.referencePolicy.worldState,'fixed-normal');
 for(const prop of['beds','gurneys','chains','monitor'])assert.ok(!alessa.props.includes(prop));assert.equal(alessa.referenceTracks.filter(t=>t.trigger!=='match-phase').length,1);assert.equal(alessa.referenceTracks[0].key,'gansAlessaTentCloth');
 const clinical=stage('nightmare_hospital_hc');assert.equal(clinical.referencePolicy.worldState,'fixed-normal');assert.equal(clinical.shift.startOtherworld,false);assert.equal(clinical.shift.enabled,false);assert.match(clinical.referencePolicy.normalPhaseLabel,/AVANT LE MIROIR/);assert.ok(!clinical.referenceTracks.some(t=>t.proposalIndex===1));
 const nave=stage('film_church');assert.equal(nave.referencePolicy.worldState,'fixed-normal');assert.equal(nave.shift.enabled,false);for(const prop of['flesh','chains'])assert.ok(!nave.props.includes(prop));
 for(const s of[alessa,clinical,nave]){const e=engineFor(s),world=e.world.amount;for(let n=0;n<90;n++)e.update();assert.equal(e.world.amount,world);assert.equal(s.referencePolicy.automaticFinishers,false);}
});

test('new architecture separates the six-tunnel arena, Fire industrial room, Earth mine and Wood clearing',()=>{
 const tunnel=trace();drawStageArchitecture(tunnel.context,1280,720,stage('nightmare_mall'));assert.equal(tunnel.calls.filter(c=>c[0]==='ellipse').length,6,'no seventh opening');
 for(const id of['book_fire','book_earth']){const s=stage(id),r=trace();assert.equal(s.referencePolicy.interior,true);assert.equal(stageSpace(s),'interior');assert.equal(drawStageArchitecture(r.context,1280,720,s),true);assert.equal(r.stack.length,0);const foreign={...s,source:'arcade'};assert.equal(stageSpace(foreign),'exterior');assert.equal(drawStageArchitecture(trace().context,1280,720,foreign),false);}
 const wood=stage('book_wood');assert.equal(stageSpace(wood),'exterior');assert.ok(!wood.props.includes('runes'));
 assert.ok(!stage('book_fire').props.includes('lava'));assert.ok(!stage('book_blood').props.includes('pools'));assert.match(stage('book_blood').terrain.description,/liquidité/);
 const grand=stage('grand_hotel');for(const prop of['boiler','elevator','dolls','portraits'])assert.ok(!grand.props.includes(prop));
 const shepherd=stage('shepherds_glen');for(const prop of['townhall','trees'])assert.ok(!shepherd.props.includes(prop));
});

test('all fifteen selected contexts use neutral actual versus physics and preserve fourteen material profiles and explicit overrides',()=>{
 const materials=structuredClone(STAGE_TERRAINS),keys=['moveScale','jumpScale','dodgeScale','friction','knockbackScale','guardRegenScale'];
 for(const id of new Set(implemented.map(i=>i.entityId))){
  const s=stage(id),terrain=stageTerrainProfile(s);assert.equal(s.gameplay.terrainRules,false,id);assert.equal(s.referencePolicy.terrainRules,false);assert.match(terrain.description,/1:1/);for(const key of keys)assert.equal(terrain[key],STAGE_TERRAINS.concrete[key],id+'/'+key);assert.deepEqual(stageTerrainProfile(s,'flooded'),{id:'flooded',...STAGE_TERRAINS.flooded});
  const forged=applyStageReferencePolicy({...s,source:s.source==='film'?'sh2':'film'},{...STAGE_REFERENCES[s.id],source:s.source==='film'?'sh2':'film'});assert.equal(forged.referencePolicy.terrainPresentation,undefined);assert.ok(!forged.referenceTracks.some(t=>implemented.some(i=>i.runtimeKey===t.key)));
 }
 assert.equal(Object.keys(STAGE_TERRAINS).length,14);assert.deepEqual(STAGE_TERRAINS,materials);
});
