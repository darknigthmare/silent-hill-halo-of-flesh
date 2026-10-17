import test from 'node:test';
import assert from 'node:assert/strict';
import { ROSTER, STAGES, STAGE_EVENTS, STAGE_HAZARDS } from '../src/data.js';
import { stageChoreographyProfile, drawStageCinematics } from '../src/stage-cinematics.js';
import { drawHazardObjects } from '../src/stage-hazard-renderer.js';
import { hazardVolumes } from '../src/combat-geometry.js';
import { drawStage } from '../src/renderers.js';
import { FightEngine } from '../src/fight.js';
import { isDeepStrictEqual } from 'node:util';

function canvasRecorder(){
  const calls={rects:0,arcs:0,strokes:0};
  const gradient={addColorStop(){}};
  const context=new Proxy({
    canvas:{width:1280,height:720},
    save(){},restore(){},beginPath(){},closePath(){},moveTo(){},lineTo(){},
    quadraticCurveTo(){},bezierCurveTo(){},translate(){},scale(){},rotate(){},
    rect(){},clip(){},stroke(){calls.strokes++},fill(){},strokeRect(){},setLineDash(){},
    ellipse(){},arc(){calls.arcs++},fillRect(){calls.rects++},clearRect(){},
    fillText(){},strokeText(){},drawImage(){},
    measureText:t=>({width:String(t).length*7}),
    createLinearGradient:()=>gradient,createRadialGradient:()=>gradient
  },{get(t,k){return k in t?t[k]:()=>{};},set(t,k,v){t[k]=v;return true;}});
  return {context,calls,canvas:{width:1280,height:720,getContext:()=>context}};
}

// Record actual coordinates, transforms and paint state, not just draw counts.
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

function eventTrace(id,activeTimer,{reducedMotion=false,alpha=1}={}){
  const trace=canvasTrace(alpha);
  const stage={id:'motion-test-'+id,director:{events:[id]}};
  drawStageCinematics(trace.context,1280,720,stage,{activeEvent:{id,duration:120},activeTimer},{reducedMotion});
  return trace;
}

function visualHazard(id,extra={}){
  return {id,profile:STAGE_HAZARDS[id],x:640,y:594,timer:40,maxTimer:80,active:0,maxActive:34,side:1,zoneMin:360,zoneMax:920,...extra};
}

function engine(extra={}){
  globalThis.window ||= {};
  globalThis.localStorage={getItem:()=>null,setItem(){}};
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{getGamepads:()=>[],vibrate:()=>false}});
  globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};
  globalThis.requestAnimationFrame=()=>0;
  const recorder=canvasRecorder();
  return new FightEngine(recorder.canvas,{
    p1:ROSTER[0],p2:ROSTER.find(f=>f.boss)||ROSTER[1],stage:STAGES.find(s=>s.id==='hazel_subway'),artDiagnostic:true,
    mode:'cpu',seed:9081,difficulty:'normal',roundsToWin:2,...extra
  });
}

test('all 123 stages expose only the event choreography allowed by their exact reference',()=>{
  assert.equal(STAGES.length,123);
  for(const stage of STAGES){
    const plan=stageChoreographyProfile(stage);
    assert.equal(plan.cues.length,stage.referencePolicy.allowedEvents.length,stage.id);
    assert.equal(plan.fidelity,'reference-linked / original-versus-prototype');
    assert.deepEqual(plan,stageChoreographyProfile(stage));
    for(const cue of plan.cues){
      assert.ok(stage.director.events.includes(cue.event));
      assert.ok(cue.anchor.x>=.18 && cue.anchor.x<=.82);
      assert.ok(['background','air','ground'].includes(cue.layer));
      assert.ok(cue.description.length>15);
    }
  }
});

test('the 22 legacy event prototypes remain independently renderable for diagnostics',()=>{
  const legacyEvents=Object.keys(STAGE_EVENTS).filter(id=>!STAGE_EVENTS[id].referenceOnly);
  assert.equal(legacyEvents.length,22);
  for(const event of legacyEvents){
    const stage={id:`synthetic-${event}`,name:'Test room',director:{events:[event]}};
    const plan=stageChoreographyProfile(stage);
    assert.equal(plan.cues.length,1,event);
    const {context,calls}=canvasRecorder();
    drawStageCinematics(context,1280,720,stage,{
      activeEvent:{id:event,duration:120},activeTimer:45
    });
    assert.ok(calls.rects>0||calls.arcs>0||calls.strokes>0,`No physical drawing for ${event}`);
  }
});

test('stage cutscenes do not draw without a live event and respect reduced-motion mode',()=>{
  const {context,calls}=canvasRecorder();
  const stage=STAGES.find(s=>s.id==='alchemilla');
  drawStageCinematics(context,1280,720,stage,{activeEvent:null});
  assert.equal(calls.rects,0);
  assert.equal(calls.arcs,0);
  const id=stage.director.events[0];
  drawStage(context,stage,2400,{director:{activeEvent:{id,duration:150},activeTimer:80},reducedMotion:true});
  assert.ok(calls.rects>0);
});

test('reduced motion freezes all 22 decorative event compositions while their timers advance',()=>{
  const drifting=[];
  for(const id of Object.keys(STAGE_EVENTS).filter(id=>!STAGE_EVENTS[id].referenceOnly)){
    // Both samples are outside the entrance/exit fade, so only composition can differ.
    const early=eventTrace(id,96,{reducedMotion:true});
    const late=eventTrace(id,42,{reducedMotion:true});
    assert.ok(early.calls.some(call=>['fillRect','stroke','fill'].includes(call[0])),id+' still needs a visible motif');
    if(!isDeepStrictEqual(early.calls,late.calls))drifting.push(id);
  }
  assert.deepEqual(drifting,[],'Decorative motion remains enabled for these events');
});

test('reduced event compositions keep lifetime fades and restore the canvas paint state',()=>{
  for(const id of Object.keys(STAGE_EVENTS).filter(id=>!STAGE_EVENTS[id].referenceOnly)){
    const opacities=[120,114,90,30,6,0].map(timer=>{
      const trace=eventTrace(id,timer,{reducedMotion:true,alpha:.4});
      assert.equal(trace.context.globalAlpha,.4,id+' leaked opacity');
      assert.equal(trace.context.fillStyle,'#000',id+' leaked fill');
      assert.equal(trace.stack.length,0,id+' left the canvas saved');
      return trace.calls.find(call=>call[0]==='set'&&call[1]==='globalAlpha')[2];
    });
    assert.equal(opacities[0],0,id+' must enter invisibly');
    assert.ok(opacities[1]>0&&opacities[1]<.4,id+' must fade in');
    assert.equal(opacities[2],.4,id+' must remain visible');
    assert.equal(opacities[3],.4,id+' must remain visible');
    assert.ok(opacities[4]>0&&opacities[4]<.4,id+' must fade out');
    assert.equal(opacities[5],0,id+' must leave invisibly');
  }
});

test('normal mode retains travelling machinery and local event-clock motion',()=>{
  for(const id of ['gurneyRush','trainRumble','carouselStart','steamRelease','waterRise','crtvLock','bellToll','ashFall','rootWake','spotlightHunt','elevatorCall']){
    assert.ok(!isDeepStrictEqual(eventTrace(id,96).calls,eventTrace(id,42).calls),id+' lost its normal animation');
  }
});

test('hazard decoration respects reduced motion without changing warning or damage volumes',()=>{
  for(const id of Object.keys(STAGE_HAZARDS))for(const timer of [40,0]){
    const hazard=visualHazard(id,{timer,active:timer?0:17});
    const before=structuredClone(hazard);
    const expected=hazardVolumes(hazard).map(z=>['rect',z.x,z.y,z.w,z.h]);
    const early=canvasTrace(),late=canvasTrace(),normal=canvasTrace();
    drawHazardObjects(early.context,hazard,1000,{reducedMotion:true});
    drawHazardObjects(late.context,hazard,9000,{reducedMotion:true});
    drawHazardObjects(normal.context,hazard,9000);
    assert.deepEqual(early.calls,late.calls,id+' decorative motion did not stop');
    for(const trace of [early,late,normal]){
      assert.deepEqual(trace.calls.filter(call=>call[0]==='rect'),expected,id+' left its collision volumes');
      assert.equal(trace.stack.length,0,id+' leaked its clip scope');
      assert.equal(trace.context.globalAlpha,1,id+' leaked hazard opacity');
    }
    assert.deepEqual(hazard,before,id+' was mutated by drawing');
  }
});

test('reduced motion keeps active train and gurney silhouettes on their moving hitboxes',()=>{
  for(const id of ['trainRush','gurneyRush'])for(const side of [-1,1]){
    const positions=[];
    for(const active of [34,17,1]){
      const hazard=visualHazard(id,{timer:0,active,side});
      const trace=canvasTrace();
      drawHazardObjects(trace.context,hazard,5000,{reducedMotion:true});
      const bounds=trace.calls.find(call=>call[0]==='rect');
      const zone=hazardVolumes(hazard)[0];
      assert.deepEqual(bounds,['rect',zone.x,zone.y,zone.w,zone.h]);
      positions.push(bounds[1]);
    }
    assert.ok((positions[1]-positions[0])*side>0,id+' stopped travelling');
    assert.ok((positions[2]-positions[1])*side>0,id+' stopped travelling');
  }
});

test('linked hazards suppress every duplicate decorative event in both motion modes',()=>{
  for(const [id,event] of Object.entries(STAGE_EVENTS)){
    if(!event.hazard)continue;
    for(const reducedMotion of [false,true]){
      const trace=canvasTrace();
      drawStageCinematics(trace.context,1280,720,{id:'linked-'+id,director:{events:[id]}},{
        activeEvent:{...event,id},activeTimer:50,linkedHazard:visualHazard(event.hazard)
      },{reducedMotion});
      assert.equal(trace.calls.length,0,id+' drew a second physical prop');
    }
  }
});

test('stage hazard AI only reacts to publicly telegraphed imminent threats',()=>{
  const e=engine();e.phase='fight';
  assert.equal(e.readTelegraphedHazard(e.actors[1],13),null);
  const hazard=e.spawnHazard('rootSnare',{diagnostic:true});hazard.x=e.actors[1].x;hazard.timer=54;
  const defense=e.readTelegraphedHazard(e.actors[1],13);
  assert.ok(defense?.left||defense?.right,`Expected movement, got ${JSON.stringify(defense)}`);
  assert.equal(defense.light,undefined);
  assert.equal(defense.special,undefined);
  hazard.timer=300;
  assert.equal(e.readTelegraphedHazard(e.actors[1],13),null);
  e.destroy();
});

test('global warning permits guarding instead of requiring a nonexistent safe lane',()=>{
  const e=engine();e.phase='fight';
  const hazard=e.spawnHazard('sirenShock',{diagnostic:true});hazard.timer=44;
  const defense=e.readTelegraphedHazard(e.actors[1],13);
  assert.deepEqual(defense,{guard:true});
  e.destroy();
});

test('hazard snapshots expose telegraph geometry and player counterplay',()=>{
  const e=engine();e.phase='fight';
  const hazard=e.spawnHazard('steamVent',{diagnostic:true});
  const warning=e.snapshot().world.director.hazardWarnings.find(item=>item.id==='steamVent');
  assert.equal(warning.frames,hazard.timer);
  assert.equal(warning.center,hazard.x);
  assert.equal(warning.shape,STAGE_HAZARDS.steamVent.shape);
  assert.equal(warning.counterplay,'DÉPLACEMENT OU GARDE');
  e.destroy();
});

test('render FPS does not change combat RNG, AI decisions, hazards or actor stats',()=>{
  for(const reducedMotion of [false,true]){
    const a=engine({stage:STAGES.find(s=>s.id==='alchemilla')});const b=engine({stage:STAGES.find(s=>s.id==='alchemilla')});
    a.settings.reducedMotion=reducedMotion;b.settings.reducedMotion=reducedMotion;
    a.phase='fight';b.phase='fight';
    for(let i=0;i<240;i++){
      a.shake=12;b.shake=12;
      a.update();b.update();
      b.render(i*16.6667);
    }
    assert.deepEqual(a.snapshot(),b.snapshot());
    assert.deepEqual(a.actors.map(o=>[o.x,o.y,o.vx,o.vy,o.aiTimer,o.aiIntent]),
      b.actors.map(o=>[o.x,o.y,o.vx,o.vy,o.aiTimer,o.aiIntent]));
    a.destroy();b.destroy();
  }
});

test('paused rendering freezes event and hazard clocks despite later wall-clock timestamps',()=>{
  for(const reducedMotion of [false,true]){
    const e=engine({stage:STAGES.find(s=>s.id==='alchemilla')});
    e.settings.reducedMotion=reducedMotion;e.phase='fight';e.frame=73;
    const id=e.stage.director.events[0];
    e.stageRuntime.activeEvent={...STAGE_EVENTS[id],id};
    e.stageRuntime.activeTimer=60;
    e.stageRuntime.linkedHazard=null;
    const chains=Object.entries(STAGE_HAZARDS).find(([,profile])=>profile.visual==='chains')[0];
    e.spawnHazard(chains,{diagnostic:true});
    e.paused=true;
    const before=e.snapshot();
    const frames=[1000,900000].map(now=>{
      const trace=canvasTrace();e.ctx=trace.context;
      e.update();e.render(now);
      return trace.calls;
    });
    assert.deepEqual(frames[0],frames[1]);
    assert.deepEqual(e.snapshot(),before);
    e.destroy();
  }
});

test('disabled stage animations leave combat warning silhouettes and hitboxes functional',()=>{
  const e=engine({stageAnimations:false});e.phase='fight';
  const hazard=e.spawnHazard('trainRush',{diagnostic:true});hazard.timer=2;
  e.render(800);
  assert.equal(e.hazards.length,1);
  assert.ok(e.snapshot().world.director.hazardWarnings.length===1);
  for(let i=0;i<3;i++)e.update();
  e.render(900);
  assert.equal(hazard.resolved,true);
  e.destroy();
});
