import test from 'node:test';
import assert from 'node:assert/strict';
import { ROSTER, STAGES, STAGE_EVENTS, STAGE_HAZARDS } from '../src/data.js';
import { stageChoreographyProfile, drawStageCinematics } from '../src/stage-cinematics.js';
import { drawStage } from '../src/renderers.js';
import { FightEngine } from '../src/fight.js';

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
function engine(extra={}){
  globalThis.window ||= {};
  globalThis.localStorage={getItem:()=>null,setItem(){}};
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{getGamepads:()=>[],vibrate:()=>false}});
  globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};
  globalThis.requestAnimationFrame=()=>0;
  const recorder=canvasRecorder();
  return new FightEngine(recorder.canvas,{
    p1:ROSTER[0],p2:ROSTER.find(f=>f.boss)||ROSTER[1],stage:STAGES.find(s=>s.id==='st_amelia_marina')||STAGES[0],
    mode:'cpu',seed:9081,difficulty:'normal',roundsToWin:2,...extra
  });
}

test('123 stages expose stable, grounded event choreography without fabricated new events',()=>{
  assert.equal(STAGES.length,123);
  for(const stage of STAGES){
    const plan=stageChoreographyProfile(stage);
    assert.ok(plan.cues.length>=1,`No cues: ${stage.id}`);
    assert.equal(plan.fidelity,'motif-location-attested / choreography-original-versus');
    assert.deepEqual(plan,stageChoreographyProfile(stage));
    for(const cue of plan.cues){
      assert.ok(stage.director.events.includes(cue.event));
      assert.ok(cue.anchor.x>=.18 && cue.anchor.x<=.82);
      assert.ok(['background','air','ground'].includes(cue.layer));
      assert.ok(cue.description.length>15);
    }
  }
});

test('all 22 environmental event families have an independent physical composition',()=>{
  assert.equal(Object.keys(STAGE_EVENTS).length,22);
  for(const event of Object.keys(STAGE_EVENTS)){
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
  const stage=STAGES[0];
  drawStageCinematics(context,1280,720,stage,{activeEvent:null});
  assert.equal(calls.rects,0);
  assert.equal(calls.arcs,0);
  const id=stage.director.events[0];
  drawStage(context,stage,2400,{director:{activeEvent:{id,duration:150},activeTimer:80},reducedMotion:true});
  assert.ok(calls.rects>0);
});

test('stage hazard AI only reacts to publicly telegraphed imminent threats',()=>{
  const e=engine();e.phase='fight';
  assert.equal(e.readTelegraphedHazard(e.actors[1],13),null);
  const hazard=e.spawnHazard('rootSnare');hazard.x=e.actors[1].x;hazard.timer=54;
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
  const hazard=e.spawnHazard('sirenShock');hazard.timer=44;
  const defense=e.readTelegraphedHazard(e.actors[1],13);
  assert.deepEqual(defense,{guard:true});
  e.destroy();
});

test('hazard snapshots expose telegraph geometry and player counterplay',()=>{
  const e=engine();e.phase='fight';
  const hazard=e.spawnHazard('steamVent');
  const warning=e.snapshot().world.director.hazardWarnings.find(item=>item.id==='steamVent');
  assert.equal(warning.frames,hazard.timer);
  assert.equal(warning.center,hazard.x);
  assert.equal(warning.shape,STAGE_HAZARDS.steamVent.shape);
  assert.equal(warning.counterplay,'DÉPLACEMENT OU GARDE');
  e.destroy();
});

test('render FPS does not change combat RNG, AI decisions, hazards or actor stats',()=>{
  const a=engine();const b=engine();
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
});

test('disabled stage animations leave combat warning silhouettes and hitboxes functional',()=>{
  const e=engine({stageAnimations:false});e.phase='fight';
  const hazard=e.spawnHazard('trainRush');hazard.timer=2;
  e.render(800);
  assert.equal(e.hazards.length,1);
  assert.ok(e.snapshot().world.director.hazardWarnings.length===1);
  for(let i=0;i<3;i++)e.update();
  e.render(900);
  assert.equal(hazard.resolved,true);
  e.destroy();
});
