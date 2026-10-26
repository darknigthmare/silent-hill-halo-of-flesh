import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { STAGES, STAGE_EVENTS, STAGE_HAZARDS } from '../src/data.js';
import { STAGE_REFERENCES } from '../src/production-reference.js';
import { applyStageReferencePolicy, stageReferenceEventAllowed, stageReferenceHazardAllowed, STAGE_REFERENCE_TRACKS } from '../src/stage-reference-policy.js';
import { drawStageReferenceTracks, drawStageCinematics } from '../src/stage-cinematics.js';
import { drawStage } from '../src/renderers.js';
import { hazardVolumes } from '../src/combat-geometry.js';

const stage = id => {const value=STAGES.find(s=>s.id===id);assert.ok(value,id);return value;};
const raw = ['classic','extended'].flatMap(name=>JSON.parse(readFileSync(new URL(`../docs/production/research/${name}.json`,import.meta.url),'utf8')).stages);
function canvasTrace(alpha=1){
  const calls=[],stack=[];
  const state={canvas:{width:1280,height:720},globalAlpha:alpha,fillStyle:'#000',strokeStyle:'#000',lineWidth:1};
  const paintKeys=['globalAlpha','fillStyle','strokeStyle','lineWidth'];
  let gradientId=0;
  const gradient=(kind,...args)=>{
    const id=++gradientId;
    calls.push([kind,...args]);
    return {traceGradient:id,addColorStop:(...stop)=>calls.push(['colorStop',id,...stop])};
  };
  Object.assign(state,{
    save(){stack.push(Object.fromEntries(paintKeys.map(key=>[key,state[key]])));calls.push(['save']);},
    restore(){assert.ok(stack.length,'Unbalanced canvas restore');Object.assign(state,stack.pop());calls.push(['restore']);},
    createLinearGradient:(...args)=>gradient('linearGradient',...args),
    createRadialGradient:(...args)=>gradient('radialGradient',...args),
    measureText:text=>({width:String(text).length*7})
  });
  const context=new Proxy(state,{
    get:(target,key)=>key in target?target[key]:(...args)=>calls.push([key,...args]),
    set(target,key,value){target[key]=value;calls.push(['set',key,value?.traceGradient?{gradient:value.traceGradient}:value]);return true;}
  });
  return {context,calls,stack};
}
function render(s,time,options={}) {const r=canvasTrace();drawStage(r.context,s,time,options);assert.equal(r.stack.length,0,s.id);return r.calls;}
function trackTrace(s,track,time,{reducedMotion=false,timer=60}={}) {
  const r=canvasTrace(.37),specific={...s,referenceTracks:[track]};
  if(track.event)drawStageCinematics(r.context,1280,720,specific,{activeEvent:{id:track.event,duration:120},activeTimer:timer},{reducedMotion});
  else drawStageReferenceTracks(r.context,1280,720,specific,time,{reducedMotion});
  assert.equal(r.stack.length,0,track.id);assert.equal(r.context.globalAlpha,.37,track.id);return r.calls;
}

test('all 123 arena references preserve the exact work, note, constraints and unproduced proposals',()=>{
  assert.equal(raw.length,123);
  for(const original of raw){
    const s=stage(original.id),r=s.reference;
    assert.equal(r.identityMatched,true,s.id);assert.equal(r.source,original.source,s.id);
    assert.equal(r.locationStatus,original.locationStatus,s.id);assert.equal(r.locationNote,original.locationNote,s.id);
    assert.deepEqual(r.referenceIds,original.referenceIds,s.id);assert.deepEqual(r.constraints,original.constraints||[],s.id);
    assert.deepEqual(r.proposals,original.animations,s.id);
    assert.deepEqual([...s.referencePolicy.renderedProposalIds,...s.referencePolicy.pendingProposalIds].sort(),original.animations.map((_,i)=>`${s.id}:reference:${i+1}`).sort(),s.id);
  }
});

test('a mismatched or missing reference cannot borrow a source, a weather cue or a physical event',()=>{
  const sample=structuredClone(stage('old_silent_hill')),before=structuredClone(sample);
  for(const reference of [undefined,{...STAGE_REFERENCES.old_silent_hill,source:'film'},{...STAGE_REFERENCES.old_silent_hill,locationStatus:''}]){
    const projected=applyStageReferencePolicy(sample,reference);
    assert.equal(projected.reference.blocked,true);assert.equal(projected.weather,'none');
    assert.equal(projected.shift.enabled,false);assert.equal(projected.shift.startOtherworld,false);
    assert.deepEqual(projected.director.events,[]);assert.deepEqual(projected.director.hazardDeck,[]);
    assert.deepEqual(projected.referenceTracks,[]);assert.equal(projected.terrain.id,'concrete');
  }
  assert.deepEqual(sample,before,'pure projection must not alter the caller catalogue');
});

test('snow belongs to SH1 streets; film ash cannot propagate to unrelated games or interiors',()=>{
  assert.equal(stage('old_silent_hill').weather,'snow');assert.equal(stage('film_midwich').weather,'ash');
  assert.equal(stage('return_streets').weather,'ash');assert.equal(stage('alchemilla').weather,'dust');
  assert.ok(stage('old_silent_hill').referenceTracks.some(t=>t.key==='snowDepth'));
  for(const s of STAGES){if(s.weather==='ash')assert.equal(s.source,'film',s.id);if(s.referencePolicy.interior)assert.notEqual(s.weather,'rain',s.id);}
  for(const id of ['nightmare_school','nightmare_hospital_sm','nightmare_mall_sm'])assert.equal(stage(id).weather,'none',id);
});

test('the ruined SH2 hotel keeps wet tiles and burnt plaster without a new fire or mirror',()=>{
  const s=stage('hotel_otherworld');
  assert.equal(s.weather,'water');assert.equal(s.terrain.id,'wetConcrete');assert.equal(s.referencePolicy.worldState,'fixed-altered');
  assert.ok(s.referenceTracks.some(t=>t.key==='waterRings'));assert.ok(s.referenceTracks.some(t=>t.key==='dustDrift'));
  for(const field of ['props','layers']){assert.ok(!s[field].includes('fire'));assert.ok(!s[field].includes('mirrors'));}
  assert.deepEqual(s.director.hazardDeck,[]);assert.ok(!s.animations.includes('firePulse'));
});

test('geographic corrections change the actual displayed name and retain the former catalogue label',()=>{
  for(const [id,name] of [['church_hc','CHURCH OF THE HOLY WAY'],['prison_hc','OVERLOOK PENITENTIARY'],['prison_meat_locker','LABYRINTH — MEAT LOCKER']]){
    const s=stage(id);assert.equal(s.name,name);assert.equal(s.reference.correctedName,name);assert.notEqual(s.reference.catalogueName,name);
  }
});

test('the first Room 302 and distinct SH4 subway cannot inherit later hauntings or the SH3 train hazard',()=>{
  const room=stage('room_302'),subway=stage('subway_world'),hazel=stage('hazel_subway');
  assert.equal(room.shift.enabled,false);assert.equal(room.shift.startOtherworld,false);assert.equal(room.referencePolicy.worldState,'fixed-normal');
  assert.deepEqual(room.director.events,['referenceWashroomReply']);assert.deepEqual(room.director.hazardDeck,[]);assert.ok(!room.animations.includes('doorPulse'));
  assert.ok(!subway.director.events.includes('trainRumble'));assert.ok(!subway.director.hazardDeck.includes('trainRush'));
  assert.ok(hazel.director.events.includes('trainRumble'));assert.deepEqual(hazel.director.hazardDeck,['trainRush']);
});

test('unresolved scene identity or phase has a stable neutral backdrop, no damage and no automatic finisher',()=>{
  const blocked=STAGES.filter(s=>s.reference.blocked);assert.ok(blocked.length>0);
  for(const s of blocked){
    assert.equal(s.referencePolicy.worldState,'unresolved',s.id);assert.deepEqual(s.animations,[],s.id);assert.deepEqual(s.referenceTracks,[],s.id);
    assert.deepEqual(s.director.events,[],s.id);assert.deepEqual(s.director.hazardDeck,[],s.id);assert.equal(s.referencePolicy.automaticFinishers,false,s.id);
    assert.deepEqual(render(s,10),render(s,999000,{otherworld:1,radio:1}),s.id);
    assert.ok(render(s,10).some(c=>c[0]==='fillText'&&c[1]==='DÉCOR EN ATTENTE DE RÉFÉRENCE'),s.id);
  }
});

test('events and hazards come from their exact allowlists, never from a similar family or a forced cue',()=>{
  assert.equal(stageReferenceEventAllowed({reference:{blocked:true}},'powerFailure'),false);
  assert.equal(stageReferenceHazardAllowed({reference:{blocked:true}},'trainRush'),false);
  for(const s of STAGES){
    assert.deepEqual(s.director.events,s.referencePolicy.allowedEvents,s.id);
    assert.deepEqual(s.director.hazardDeck,s.referencePolicy.allowedHazards,s.id);
    for(const [id,event] of Object.entries(STAGE_EVENTS)){
      assert.equal(stageReferenceEventAllowed(s,id),s.director.events.includes(id),s.id+'/'+id);
      if(s.director.events.includes(id)&&event.hazard)assert.ok(s.director.hazardDeck.includes(event.hazard),s.id+'/'+id);
      if(!s.director.events.includes(id)){
        const r=canvasTrace();drawStageCinematics(r.context,1280,720,s,{activeEvent:{...event,id},activeTimer:60});assert.equal(r.calls.length,0,s.id+'/'+id);
      }
    }
    for(const id of Object.keys(STAGE_HAZARDS))assert.equal(stageReferenceHazardAllowed(s,id),s.director.hazardDeck.includes(id),s.id+'/'+id);
  }
});

test('a small explicit catalogue implements precise visual parts instead of labelling every proposal complete',()=>{
  const tracks=STAGES.flatMap(s=>s.referenceTracks),keys=new Set(tracks.map(t=>t.key));
  assert.equal(tracks.length,127);assert.equal(keys.size,97);assert.equal(keys.size,Object.values(STAGE_REFERENCE_TRACKS).filter(track=>!track.pendingLocation).length);
  assert.ok(tracks.length<raw.reduce((n,s)=>n+s.animations.length,0));
  for(const t of tracks){
    const s=stage(t.id.split(':')[0]),proposal=STAGE_REFERENCES[s.id].animations[t.proposalIndex];
    assert.equal(t.id,`${s.id}:reference:${t.proposalIndex+1}`);assert.equal(t.source,s.source);assert.equal(t.description,proposal.description);
    assert.deepEqual(t.evidence,proposal.evidence);assert.equal(t.implementation,'canvas-prototype');assert.equal(t.coverage,'partial-visual-prototype');
    assert.equal(t.fidelity,'adaptation-versus-proposee');assert.ok(['capture-a-relever','storyboard-a-valider'].includes(t.captureStatus));assert.ok(t.implementedElement);
    assert.ok(t.anchor.x>=0&&t.anchor.x<=1&&t.anchor.y<.79);assert.ok(['air','background'].includes(t.layer));
  }
  assert.ok(stage('ebisugaoka').referenceTracks.some(t=>t.key==='flowerBorder'));
  assert.ok(stage('arcade_toluca_lake').referenceTracks.some(t=>t.key==='waterSwell'));
});

test('all selected background motions animate normally and freeze in reduced motion without leaking paint state',()=>{
  for(const s of STAGES)for(const t of s.referenceTracks){
    if(t.trigger==='match-phase'){assert.deepEqual(trackTrace(s,t,1400),[],t.id+' requires an explicit engine phase');continue;}
    if(t.eventEnabled===false){assert.deepEqual(trackTrace(s,t,1400,{timer:96}),[],t.id+' must remain inactive in this room');continue;}
    assert.ok(!isDeepStrictEqual(trackTrace(s,t,1400,{timer:96}),trackTrace(s,t,5900,{timer:42})),t.id+' is not animated');
    assert.deepEqual(trackTrace(s,t,1400,{timer:96,reducedMotion:true}),trackTrace(s,t,5900,{timer:42,reducedMotion:true}),t.id+' still moves');
  }
});

test('complete reference-bound stage rendering freezes when motion is reduced or ambience is disabled',()=>{
  for(const s of STAGES)for(const option of [{reducedMotion:true},{animationsEnabled:false}])assert.deepEqual(render(s,1400,option),render(s,5900,option),s.id);
});

test('fixed narrative states survive a caller supplying a different Otherworld amount',()=>{
  for(const id of ['room_302','old_silent_hill','hotel_otherworld','nightmare_school','film_midwich']){
    const s=stage(id);assert.deepEqual(render(s,2400,{otherworld:0}),render(s,2400,{otherworld:1}),id);
  }
  const transition=stage('alchemilla_origins');assert.equal(transition.shift.enabled,true);
  assert.ok(!isDeepStrictEqual(render(transition,2400,{otherworld:0}),render(transition,2400,{otherworld:1})));
});

test('reactive reference tracks require a local heavy impact and cannot run as an ambient loop',()=>{
  for(const s of STAGES)for(const t of s.referenceTracks.filter(t=>t.event&&t.eventEnabled!==false)){
    const r=canvasTrace();assert.deepEqual(drawStageReferenceTracks(r.context,1280,720,{...s,referenceTracks:[t]},2400),[]);
    assert.equal(r.calls.length,0);assert.equal(t.trigger,'local-heavy-impact');assert.equal(STAGE_EVENTS[t.event].referenceOnly,true);
    assert.equal(STAGE_EVENTS[t.event].hazard,undefined);
    const interaction=s.interactions.find(i=>i.event===t.event);assert.equal(interaction.trigger,t.trigger);assert.equal(interaction.zone.x,t.anchor.x);assert.ok(interaction.zone.radius>0&&interaction.zone.radius<.5);
    const early=trackTrace(s,t,0,{timer:120}),visible=trackTrace(s,t,0,{timer:60}),late=trackTrace(s,t,0,{timer:0});
    const opacity=calls=>calls.find(c=>c[0]==='set'&&c[1]==='globalAlpha')[2];
    assert.equal(opacity(early),0);assert.equal(opacity(visible),.37);assert.equal(opacity(late),0);
  }
});

test('two simultaneous physical dangers suppress both competing scenery motions without moving collision geometry',()=>{
  const s={id:'two-danger-diagnostic',family:'street',weather:'none',props:[],animations:['trainPass','waterRipple'],director:{events:['trainRumble']}};
  const hazards=['trainRush','waterSurge'].map((id,i)=>({id,profile:STAGE_HAZARDS[id],x:500+i*180,y:594,timer:i?35:0,active:i?0:17,maxTimer:80,maxActive:34,side:1,zoneMin:320,zoneMax:930}));
  const before=structuredClone(hazards),volumes=hazards.map(hazardVolumes);
  const director={activeEvent:{id:'trainRumble',...STAGE_EVENTS.trainRumble},activeTimer:70,linkedHazard:null};
  for(const reducedMotion of [false,true]){
    const actual=render(s,3100,{hazards,director,reducedMotion});
    const expected=render({...s,animations:[]},3100,{hazards,director:{...director,activeEvent:null},reducedMotion});
    assert.deepEqual(actual,expected,'a second moving prop remains behind the collision-aligned pass');
  }
  assert.deepEqual(hazards,before);assert.deepEqual(hazards.map(hazardVolumes),volumes);
});
