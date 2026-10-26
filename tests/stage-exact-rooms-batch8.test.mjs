import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {STAGES,ROSTER,STAGE_TERRAINS} from '../src/data.js';
import {STAGE_REFERENCES} from '../src/production-reference.js';
import {FightEngine} from '../src/fight.js';
import {stageTerrainProfile} from '../src/stage-director.js';
import {applyStageReferencePolicy,stageReferenceTrackAllowed} from '../src/stage-reference-policy.js';
import {drawStageReferenceTracks} from '../src/stage-cinematics.js';
import {drawStageArchitecture,stageSpace} from '../src/stage-architecture.js';

const additions=[['prison_meat_locker','sh2','freezerCarcassSway',1],['brookhaven_roof','sh2','rooftopFenceFlex',2],['building_world','sh4','stairwellFanTurn',1],['artaud_theater','origins','artaudSpotlightGlide',2],['brookhaven_sh2','sh2','pursuitElevatorGap',1]];
const stage=id=>{const value=STAGES.find(s=>s.id===id);assert.ok(value,id);return value;};
function trace(){
 const calls=[],stack=[],state={globalAlpha:.4,canvas:{width:1280,height:720}};
 state.save=()=>{stack.push(state.globalAlpha);calls.push(['save']);};state.restore=()=>{assert.ok(stack.length);state.globalAlpha=stack.pop();calls.push(['restore']);};
 state.createLinearGradient=state.createRadialGradient=(...args)=>({addColorStop:(...color)=>calls.push(['gradient',...args,...color])});
 return {context:new Proxy(state,{get:(target,key)=>key in target?target[key]:(...args)=>calls.push([key,...args])}),calls,stack};
}
function draw(location,time,reducedMotion=false,key){
 const r=trace(),selected=key?{...location,referenceTracks:location.referenceTracks.filter(t=>t.key===key)}:location;
 drawStageReferenceTracks(r.context,1280,720,selected,time,{reducedMotion});assert.equal(r.context.globalAlpha,.4);assert.equal(r.stack.length,0);return r.calls;
}
const engines=new Set();afterEach(()=>{for(const e of engines)e.destroy();engines.clear();});

test('five room-specific proposals keep exact ownership, native workbook rows and their partial adaptation status',()=>{
 for(const[id,source,key,index]of additions){
  const location=stage(id),track=location.referenceTracks.find(t=>t.key===key),proposal=STAGE_REFERENCES[id].animations[index];
  assert.ok(track,id);assert.equal(track.id,`${id}:reference:${index+1}`);assert.equal(track.description,proposal.description);assert.deepEqual(track.evidence,proposal.evidence);
  assert.equal(track.source,source);assert.equal(track.event,null);assert.equal(track.coverage,'partial-visual-prototype');assert.equal(track.fidelity,'adaptation-versus-proposee');
  assert.equal(track.timecode,undefined);assert.ok(track.locationScope);assert.ok(track.limits);assert.equal(stageReferenceTrackAllowed(location,track),true);
  for(const forged of[{...location,source:'film'},{...location,id:id+'_remake'}]){assert.equal(stageReferenceTrackAllowed(forged,track),false);assert.deepEqual(draw({...forged,referenceTracks:[track]},1400),[]);}
  const wrongRow={...track,proposalIndex:(index+1)%4,id:`${id}:reference:${(index+1)%4+1}`};
  assert.equal(stageReferenceTrackAllowed(location,wrongRow),false,'a matching room cannot borrow a different proposal row');
  assert.equal(stageReferenceTrackAllowed(location,{...track,event:'powerFailure'}),false,'ambient shapes cannot become unsolicited reactive cues');
 }
});

test('the basement is the fixed Otherworld pursuit corridor, with neither a patient ward nor a repeating story death',()=>{
 const location=stage('brookhaven_sh2');assert.equal(location.reference.blocked,false);assert.equal(location.referencePolicy.worldState,'fixed-altered');assert.equal(location.shift.enabled,false);assert.equal(location.shift.startOtherworld,true);
 assert.match(location.reference.locationNote,/B1|sous-sol/);assert.match(location.referenceTracks[0].locationScope,/poursuite/);
 for(const prop of['ward','curtains','monitor','beds','cages']){assert.ok(!location.props.includes(prop));assert.ok(!location.layers.includes(prop));}
 assert.deepEqual(location.animations,[]);assert.deepEqual(location.director.events,[]);assert.deepEqual(location.director.hazardDeck,[]);assert.equal(location.referencePolicy.automaticFinishers,false);
 const blocked=applyStageReferencePolicy(location,{...STAGE_REFERENCES.brookhaven_sh2,locationStatus:'phase-a-preciser'});assert.equal(blocked.reference.blocked,true);assert.deepEqual(blocked.referenceTracks,[]);assert.equal(blocked.shift.startOtherworld,false);
});

test('the selected freezer, roof, stairwell and normal stage omit adjacent-room props and generic loops',()=>{
 const freezer=stage('prison_meat_locker');for(const prop of['cells','watchtower','chains']){assert.ok(!freezer.props.includes(prop));assert.ok(!freezer.layers.includes(prop));}
 assert.ok(freezer.props.includes('hooks'));assert.ok(freezer.props.includes('freezer'));assert.match(freezer.referenceTracks[0].locationScope,/Seconde salle/);
 const roof=stage('brookhaven_roof');assert.equal(stageSpace(roof),'exterior');assert.equal(roof.weather,'none');assert.equal(roof.visibility.fog,0);assert.ok(!roof.props.includes('water'));assert.ok(!roof.props.includes('fence'));assert.equal(roof.referencePolicy.normalPhaseLabel,'TOIT AVANT LA CHUTE');assert.equal(roof.referenceTracks.length,2);
 const building=stage('building_world');for(const prop of['doors','signs','elevator']){assert.ok(!building.props.includes(prop));assert.ok(!building.layers.includes(prop));}assert.match(building.referenceTracks[0].locationScope,/B12 vers B15/);
 const theater=stage('artaud_theater');assert.equal(theater.referencePolicy.worldState,'fixed-normal');assert.equal(theater.shift.enabled,false);assert.equal(theater.shift.startOtherworld,false);assert.match(theater.referencePolicy.normalPhaseLabel,/PROJECTEURS ACTIVÉS/);assert.ok(theater.referenceTracks.some(t=>t.key==='curtainBreathe'));
 for(const[id]of additions){const s=stage(id);assert.deepEqual(s.animations,[]);assert.deepEqual(s.director.events,id==='prison_meat_locker'?['referenceHookReply']:[]);assert.deepEqual(s.director.hazardDeck,[]);assert.deepEqual(s.interactions.map(i=>i.event),id==='prison_meat_locker'?['referenceHookReply']:[]);assert.equal(s.referencePolicy.automaticFinishers,false);}
});

test('five room architectures replace generic doorways and preserve Canvas state without transferring across sources',()=>{
 for(const[id,source]of additions){
  const location=stage(id),r=trace();assert.equal(drawStageArchitecture(r.context,1280,720,location),true);assert.equal(r.stack.length,0);assert.equal(r.context.globalAlpha,.4);
  assert.ok(!r.calls.some(c=>c[0]==='fillRect'&&c[3]===1280*.088&&c[4]===720*.25),'no inherited domestic back doorway in '+id);
  const foreign=trace();drawStageArchitecture(foreign.context,1280,720,{...location,source:'film'});assert.notDeepEqual(foreign.calls,r.calls,source);
  if(id==='brookhaven_sh2'){
   const mesh=r.calls.filter((c,i)=>c[0]==='lineTo'&&r.calls[i-1]?.[0]==='moveTo'&&((r.calls[i-1][2]===720*.24&&c[2]===720*.51)||(r.calls[i-1][2]===720*.51&&c[2]===720*.24)));
   assert.equal(mesh.length,18);assert.ok(mesh.every(c=>c[1]<=1280*.33),'wire mesh ends stay inside the service-window frame');
  }
  if(id==='building_world')assert.ok(r.calls.filter(c=>c[0]==='lineTo'&&c[2]>720*.33&&c[2]<720*.52).length>=14,'both stair flights have visible tread edges');
 }
});

test('each room moves its local part around fixed support points and freezes under reduced motion',()=>{
 for(const[id,,key]of additions){const location=stage(id);assert.notDeepEqual(draw(location,1400,false,key),draw(location,5900,false,key),id);assert.deepEqual(draw(location,1400,true,key),draw(location,5900,true,key),id);}
 const freezer=stage('prison_meat_locker'),hook=time=>draw(freezer,time,false,'freezerCarcassSway').filter(c=>c[0]==='arc'||c[0]==='translate');assert.deepEqual(hook(1400),hook(5900),'hook and swing pivot stay at the same point');
 const roof=stage('brookhaven_roof'),posts=time=>draw(roof,time,false,'rooftopFenceFlex').filter(c=>c[0]==='moveTo'||c[0]==='lineTo');assert.deepEqual(posts(1400),posts(5900),'fence frame and mesh endpoints remain attached');
 const fan=stage('building_world'),rim=time=>draw(fan,time,false,'stairwellFanTurn').filter(c=>c[0]==='ellipse'||c[0]==='arc');assert.deepEqual(rim(1400),rim(5900),'fan rim and hub stay fixed');
 const lift=stage('brookhaven_sh2'),frame=time=>draw(lift,time,false,'pursuitElevatorGap').filter(c=>c[0]==='fillRect').slice(0,2);assert.deepEqual(frame(1400),frame(5900),'elevator aperture and outer frame stay still');
});

test('actual room simulations keep neutral terrain and cannot turn the decor into a hazard, phase shift or finisher',()=>{
 globalThis.window={};globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
 Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;
 const materials=structuredClone(STAGE_TERRAINS),keys=['moveScale','jumpScale','dodgeScale','friction','knockbackScale','guardRegenScale'];
 for(const[id]of additions){
  const location=stage(id),terrain=stageTerrainProfile(location);assert.equal(location.gameplay.terrainRules,false);assert.equal(location.referencePolicy.terrainRules,false);assert.match(terrain.description,/1:1/);
  for(const key of keys)assert.equal(terrain[key],STAGE_TERRAINS.concrete[key],id+'/'+key);
  assert.deepEqual(stageTerrainProfile(location,'flooded'),{id:'flooded',...STAGE_TERRAINS.flooded});
  const e=new FightEngine({getContext:()=>trace().context},{p1:ROSTER[0],p2:ROSTER[1],stage:location,mode:'local',roundsToWin:2,timeLimit:99,seed:57,stageDirector:true,stageHazards:true,stageTerrain:true,otherworldShift:true,fatalities:false,stageFatalities:true});engines.add(e);
  for(let n=e.phaseTimer;n>0;n--)e.update();const before={health:e.actors.map(a=>a.health),world:e.world.amount};e.stageRuntime.eventTimer=-1;e.stageRuntime.heavyImpactPending=true;e.stageRuntime.lastHeavyImpact={x:640};assert.equal(e.tryStageInteraction(),false);
  for(let n=0;n<90;n++)e.update();assert.deepEqual({health:e.actors.map(a=>a.health),world:e.world.amount},before,id);assert.equal(e.hazards.length,0);assert.equal(e.stageRuntime.activeEvent,null);assert.equal(e.stageRuntime.pendingTerrain,null);
 }
 assert.equal(Object.keys(STAGE_TERRAINS).length,14);assert.deepEqual(STAGE_TERRAINS,materials);
});
