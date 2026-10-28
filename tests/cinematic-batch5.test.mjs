import test, {afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,STAGES,createCombatProfile} from '../src/data.js';
import {FIGHTER_REFERENCES} from '../src/production-reference.js';
import {STAGE_BITMAPS} from '../src/stage-bitmap-manifest.js';
import {FightEngine} from '../src/fight.js';
import {loreFinisher,lorePresentation,sampleLorePresentation,sampleLoreCinematic,cinematicSummary,drawLoreCinematic,LORE_CINEMATIC_COVERAGE} from '../src/lore-cinematics.js';

// Ariel and Helen use a synthetic cross-work versus pairing in the reviewed
// enclosed SH1 tunnel. The selected Cedar Grove electrotherapy room provides
// no confirmed overhead attachment contract and is not their native boss set.
const SUBJECTS=[
  ['sh1_incubator_018','blueTerminalExposure','nowhere'],
  ['sh1_incubus_019','redSuspendedExposure','nowhere'],
  ['sh2_creeper_025','sh2LowShadowBite','woodside'],
  ['sh3_god_050','incompleteBodyFireline','church'],
  ['origins_straight_jacket_074','closedTorsoLegRelease','alchemilla_origins'],
  ['origins_ariel_078','tetheredDollKicks','sewer_resort'],
  ['origins_memory_of_helen_grady_082','helenSuspendedWheel','sewer_resort'],
  ['origins_memory_of_richard_grady_083','richardWallTentacles','labyrinth'],
  ['homecoming_lurker_085','lurkerLowClawFold','blue_creek'],
  ['homecoming_smog_087','smogExposedExhalation','nightmare_hospital_hc']
];
const FIXED=['sh1_incubator_018','sh1_incubus_019','sh3_god_050','origins_memory_of_helen_grady_082','origins_memory_of_richard_grady_083'];
const KEYS=['intro','taunt','winRound','loseRound','winMatch','loseMatch','outro'];
const fighter=id=>{const d=ROSTER.find(f=>f.id===id);assert.ok(d,id);return d;};
const stage=id=>{const s=STAGES.find(s=>s.id===id);assert.ok(s,id);return s;};
const actor=(id,index=0)=>({data:fighter(id),profile:createCombatProfile(fighter(id)),index,x:index?720:500,y:594,grounded:true,facing:index?-1:1});
const target=()=>actor('sh2_bubble_head_nurse_024',1);
const definition=(a,type='signature')=>a.data.fatalities.find(f=>f.type===type);
const plan=(id,type='signature',options={})=>{const a=actor(id);return loreFinisher({attacker:a,target:target(),stage:stage(SUBJECTS.find(s=>s[0]===id)[2]),definition:definition(a,type),...options});};
const samplePresentation=(a,key,progress)=>sampleLorePresentation(a,{key,progress,lore:lorePresentation(a,key)});
const engines=new Set();
afterEach(()=>{for(const e of engines)e.destroy();engines.clear();});

test('the selected Cedar Grove room cannot supply unconfirmed overhead attachments for Ariel or Helen',()=>{
  for(const id of ['origins_ariel_078','origins_memory_of_helen_grady_082'])for(const type of ['signature','nightmare']){
    assert.equal(plan(id,type).allowed,true,'the explicit cross-work tunnel fixture has reviewed overhead support');
    const refused=plan(id,type,{stage:stage('cedar_grove')});assert.equal(refused.allowed,false);assert.match(refused.reason,/Appui de plafond/);
  }
});

test('ten additional exact subjects own twenty distinct edits and seventy proposal contexts',()=>{
  const recipes=new Set(),contexts=new Set();
  for(const [id,recipeId] of SUBJECTS){
    const signature=plan(id),nightmare=plan(id,'nightmare');
    for(const p of [signature,nightmare]){
      assert.equal(p.allowed,true,`${id}: ${p.reason}`);assert.equal(p.recipeId,recipeId);
      assert.equal(p.ownerId,id);assert.equal(p.source,fighter(id).source);
      assert.equal(p.description,FIGHTER_REFERENCES[id].proposals.finisher.description);
      assert.equal(p.fidelity,'original-versus-staging');assert.equal(p.artStatus,'contextual-images-missing');
      const summary=cinematicSummary(p.id);assert.equal(summary.requirements.unarmed,true);assert.equal(summary.requirements.decisiveMatchOnly,true);
      assert.deepEqual(summary.beats.map(b=>[b.attackerPose,b.targetPose]),p.steps.map(b=>[b.attacker.pose,b.target.pose]));
      p.steps.forEach((b,index)=>{assert.equal(b.from,index?p.steps[index-1].to:0);assert.ok(b.ticks>0);});
      assert.equal(p.steps.at(-1).to,p.duration);assert.equal(sampleLoreCinematic(p,p.duration+10).complete,true);
    }
    assert.equal(nightmare.steps.length,signature.steps.length+1);assert.notDeepEqual(signature.steps,nightmare.steps);recipes.add(recipeId);
    for(const key of KEYS){
      const lore=lorePresentation(actor(id),key),proposal=({winRound:'winRound1',loseRound:'loseRound1'}[key]||key);
      assert.equal(lore.authored,true,id+'/'+key);assert.equal(lore.description,FIGHTER_REFERENCES[id].proposals[proposal].description);
      assert.equal(lore.clipKey,`${key}@${id}:${proposal}`);assert.ok(lore.poseIntent&&lore.stagingId);
      assert.equal(lore.artStatus,'contextual-images-missing');assert.equal(lore.timingProvenance,'original-versus-ticks');contexts.add(lore.clipKey);
    }
  }
  assert.equal(recipes.size,10);assert.equal(contexts.size,70);assert.equal(LORE_CINEMATIC_COVERAGE.animatedImagesCreated,0);
});

test('Incubator blue lightning, Incubus red lightning and incomplete God ground fire keep their distinct anatomy and branch',()=>{
  const blue=plan('sh1_incubator_018'),red=plan('sh1_incubus_019'),god=plan('sh3_god_050');
  assert.ok(blue.steps.some(b=>b.effect==='blue-exposure'));assert.ok(!blue.steps.some(b=>b.effect==='red-exposure'||/wings|incubus-/.test(b.attacker.pose)));
  assert.ok(red.steps.some(b=>b.effect==='red-exposure'));assert.ok(!red.steps.some(b=>b.effect==='blue-exposure'||/incubator-/.test(b.attacker.pose)));
  assert.ok(god.steps.some(b=>b.attacker.pose==='god-ground-fire'));assert.ok(god.steps.some(b=>b.effect==='embers'));
  assert.ok(god.steps.every(b=>!/(meteor|wing|leg|walk|fly)/.test(b.attacker.pose)));
  assert.equal(plan('sh3_god_050','signature',{target:actor('sh1_air_screamer_001',1)}).allowed,false,'ground fire does not become an aerial grip');
});

test('five fixed bosses retain world anchors and Ariel descends only vertically on the existing suspension',()=>{
  for(const id of FIXED){
    const a=actor(id);assert.equal(a.profile.referencePolicy.canMove,false,id);
    for(const type of ['signature','nightmare']){
      const p=plan(id,type);assert.ok(p.steps.every(b=>b.attacker.x===0&&b.attacker.y===0),id);
      for(let tick=0;tick<p.duration;tick+=11){const s=sampleLoreCinematic(p,tick);assert.equal(s.attacker.x,0);assert.equal(s.attacker.y,0);}
    }
    for(const key of KEYS)for(const progress of [0,.3,.8,1]){const s=samplePresentation(a,key,progress);assert.equal(s.x,0,id+'/'+key);assert.equal(s.y,0,id+'/'+key);}
  }
  const ariel=plan('origins_ariel_078');assert.ok(ariel.steps.every(b=>b.attacker.x===0&&b.attacker.pose.startsWith('ariel-tethered-')));
  assert.ok(ariel.steps.some(b=>b.attacker.y<0));assert.equal(ariel.steps.at(-1).attacker.y,ariel.steps[0].attacker.y);
  for(const id of ['origins_ariel_078','origins_memory_of_helen_grady_082']){
    assert.equal(plan(id,'signature',{stage:stage('midwich')}).allowed,false,id+' cannot borrow an outdoor ceiling');
    assert.equal(plan(id,'signature',{stage:stage('old_silent_hill')}).allowed,false,id+' cannot suspend in an open street');
  }
  assert.equal(plan('origins_memory_of_richard_grady_083','signature',{stage:stage('old_silent_hill')}).allowed,false,'the wall is mandatory');
});

test('replacement bitmap ceiling contracts override names and motifs, while compatible overlays retain the procedural support',()=>{
  const id='origins_ariel_078',a=actor(id),options={attacker:a,target:target(),stage:stage('woodside'),definition:definition(a)};
  const original=STAGE_BITMAPS.woodside;
  try{
    STAGE_BITMAPS.woodside={...original,scene:'renamed-open-looking-title',geometry:{ceiling:true}};
    assert.equal(loreFinisher(options).allowed,true,'only the structured ceiling contract grants replacement support');
    for(const replacement of [
      {...original,scene:'interior-corridor',geometry:{ceiling:false}},
      {...original,scene:'interior-corridor',geometry:undefined},
      {...original,geometry:{ceiling:'true'}},
      {...original,geometry:{ceiling:true},source:'sh1'},
      {...original,geometry:{ceiling:true},stageId:'another-location'}
    ]){STAGE_BITMAPS.woodside=replacement;assert.equal(loreFinisher(options).allowed,false);}
    STAGE_BITMAPS.woodside={...original,mode:'overlay',geometry:undefined};assert.equal(loreFinisher(options).allowed,true);
    STAGE_BITMAPS.woodside={...original,mode:'overlay',geometry:{ceiling:false}};assert.equal(loreFinisher(options).allowed,false);
    STAGE_BITMAPS.woodside={...original,mode:'overlay',geometry:{ceiling:true}};
    assert.equal(loreFinisher({...options,stage:{...options.stage,props:[],layers:[]}}).allowed,false,'an overlay cannot invent a ceiling in a supportless procedural scene');
  }finally{STAGE_BITMAPS.woodside=original;}
  const originalCourtyard=STAGE_BITMAPS.midwich;
  try{STAGE_BITMAPS.midwich={...originalCourtyard,scene:'arbitrary-enclosed-name'};
    assert.equal(loreFinisher({...options,stage:stage('midwich')}).allowed,false,'renaming the courtyard cannot promote it into an interior');
  }finally{STAGE_BITMAPS.midwich=originalCourtyard;}
});

test('Straight-Jacket keeps its closed torso, Smog has exposed exhalation without a charge and SH2 Creeper retains its own edition',()=>{
  const jacket=plan('origins_straight_jacket_074'),smog=plan('homecoming_smog_087'),creeper=plan('sh2_creeper_025');
  assert.ok(jacket.steps.every(b=>b.attacker.pose.startsWith('closed-torso-')));
  assert.ok(jacket.steps.some(b=>b.attacker.pose==='closed-torso-leg-clamp'));assert.ok(jacket.steps.some(b=>b.effect==='spray'));
  assert.ok(jacket.steps.every(b=>!/(punch|fist|hand|arm-grip)/.test(b.attacker.pose)));
  assert.ok(smog.steps.slice(1).every(b=>b.attacker.x===smog.steps[0].attacker.x));
  assert.ok(smog.steps.slice(1,4).every(b=>/exposed/.test(b.attacker.pose)));
  assert.ok(smog.steps.every(b=>!['impact','slash'].includes(b.effect)&&!['rush','hit','heavy'].includes(b.sound)));
  assert.ok(creeper.steps.every(b=>b.attacker.y===0&&b.attacker.pose.startsWith('sh2-six-leg-')));
  assert.notEqual(creeper.recipeId,cinematicSummary('sh1_creeper_009_signature').recipeId);
  assert.equal(creeper.source,'sh2');
});

test('new source-specific edits reject forged bodies, borrowed equipment, source variants and incompatible grips',()=>{
  for(const [id] of SUBJECTS){
    for(const changed of [
      {...fighter(id),visual:{...fighter(id).visual,kind:'fox'}},
      {...fighter(id),visual:{...fighter(id).visual,weapon:'pistol'}},
      {...fighter(id),source:'unrelated-edition'}
    ]){const a={...actor(id),data:changed};assert.equal(plan(id,'signature',{attacker:a}).allowed,false,id);assert.equal(lorePresentation(a,'intro').authored,false,id);}
    if(!['sh1_incubator_018','sh1_incubus_019','sh3_god_050'].includes(id))for(const targetId of ['sh1_air_screamer_001','sh3_closer_036']){
      assert.equal(plan(id,'signature',{target:actor(targetId,1)}).allowed,false,id+' grip is not scaled into another target anatomy');
    }
  }
});

test('round-one recovery is reversible, holding outros stay visible and pure staging changes no combat state',()=>{
  for(const [id] of SUBJECTS){
    const a=actor(id),before=structuredClone(a);
    for(const key of KEYS)for(const progress of [0,.25,.6,1])samplePresentation(a,key,progress);
    assert.deepEqual(a,before);assert.equal(lorePresentation(a,'loseRound').reversible,true);
    for(const progress of [0,.4,1]){const s=samplePresentation(a,'loseRound',progress);assert.equal(s.alpha,1);assert.equal(s.y,0);}
    assert.ok(Math.abs(samplePresentation(a,'loseRound',1).x)<1e-9);
    for(const key of ['winMatch','loseMatch'])assert.equal(lorePresentation(a,key).reversible,false);
  }
  for(const id of ['origins_straight_jacket_074','origins_ariel_078','origins_memory_of_helen_grady_082','origins_memory_of_richard_grady_083','homecoming_smog_087'])for(const progress of [0,.5,1]){
    const s=samplePresentation(actor(id),'outro',progress);assert.equal(s.alpha,1,id);assert.equal(s.x,0,id);assert.equal(s.y,0,id);
  }
});

test('new light compositing is deterministic and reduced motion softens blue and red exposure without drawing anatomy',()=>{
  for(const id of ['sh1_incubator_018','sh1_incubus_019']){
    const p=plan(id),step=p.steps.find(b=>/exposure/.test(b.effect)),sample=sampleLoreCinematic(p,step.from+8),before=structuredClone(sample);
    const paint=reducedMotion=>{const stops=[],fills=[];const ctx={save(){},restore(){},createRadialGradient(){return {addColorStop(offset,color){stops.push([offset,color]);}};},fillRect(...args){fills.push(args);}};
      drawLoreCinematic(ctx,sample,{reducedMotion});return {stops,fills};};
    const normal=paint(false);assert.deepEqual(paint(false),normal);assert.deepEqual(sample,before);
    assert.equal(normal.fills.length,1);assert.equal(paint(true).fills.length,1);assert.notDeepEqual(paint(true).stops,normal.stops);
    assert.match(normal.stops[0][1],id==='sh1_incubator_018'?/128,169,223/:/207,102,85/);
  }
});

function engine(id,stageId){
  globalThis.window={};globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};
  globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
  Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});
  globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;
  const gradient=()=>({addColorStop(){}}),ctx=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient},{get:(t,k)=>k in t?t[k]:()=>{}});
  const e=new FightEngine({getContext:()=>ctx},{p1:fighter(id),p2:fighter('sh2_bubble_head_nurse_024'),stage:stage(stageId),mode:'local',roundsToWin:2,timeLimit:99,seed:2405,
    stageTerrain:false,stageHazards:false,stageDirector:false,otherworldShift:false,fatalities:true,stageFatalities:false});
  engines.add(e);return e;
}
function ticks(e,n){for(let i=0;i<n;i++)e.update();}
function knockout(e,type){const t=e.actors[1];t.health=0;t.lastHit={attackerIndex:0,isSuper:type==='nightmare',environmental:false};e.resolveKnockouts();}

test('twenty actual deciding matches keep round one reversible, pause their common clock and finish exactly once without reviving the target',()=>{
  for(const [id,recipeId,stageId] of SUBJECTS)for(const type of ['signature','nightmare']){
    const e=engine(id,stageId);ticks(e,e.phaseTimer);assert.equal(e.phase,'fight');
    knockout(e,type);assert.equal(e.phase,'roundEnd',id);assert.equal(e.fatality,null);assert.equal(e.actors[0].roundWins,1);assert.ok(e.actors.every(a=>a.presentation.reversible));
    ticks(e,e.phaseTimer);ticks(e,e.phaseTimer);assert.equal(e.phase,'fight');assert.ok(e.actors.every(a=>a.health===a.maxHealth&&!a.presentation));
    knockout(e,type);assert.equal(e.phase,'fatality',id);assert.equal(e.fatality.choreography.recipeId,recipeId);assert.equal(e.fatality.definition.id,`${id}_${type}`);
    ticks(e,45);const frame=e.fatality.sample.frame,tracks=e.actors.map(a=>a.presentation.frame);
    e.togglePause(true);ticks(e,13);assert.equal(e.fatality.sample.frame,frame);assert.deepEqual(e.actors.map(a=>a.presentation.frame),tracks);
    e.togglePause(false);e.update();assert.equal(e.fatality.sample.frame,frame+1);
    if(FIXED.includes(id)){assert.equal(e.fatality.sample.attacker.x,0);assert.equal(e.fatality.sample.attacker.y,0);}
    assert.equal(e.projectiles.length,0);ticks(e,e.fatality.timer);assert.equal(e.phase,'roundEnd');assert.equal(e.actors[0].roundWins,2);
    assert.equal(e.actors[0].stats.fatalities,1);assert.equal(e.actors[1].health,0);ticks(e,10);assert.equal(e.actors[1].health,0);assert.equal(e.actors[0].stats.fatalities,1);
    e.destroy();engines.delete(e);
  }
});
