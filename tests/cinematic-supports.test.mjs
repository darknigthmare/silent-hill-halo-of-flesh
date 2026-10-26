import test, {afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,STAGES,createCombatProfile} from '../src/data.js';
import {FIGHTER_REFERENCES} from '../src/production-reference.js';
import {FightEngine} from '../src/fight.js';
import {loreFinisher,lorePresentation,sampleLorePresentation,sampleLoreCinematic,cinematicSummary,LORE_CINEMATIC_COVERAGE} from '../src/lore-cinematics.js';

// These are authored versus edits of workbook proposals, never source footage
// or produced bitmap poses. Explicit pairings exercise real approved supports.
// Gum Head / Monica's office is a synthetic cross-work versus pairing using
// the room's documented desk, not an encounter from SH4 or Alchemilla furniture.
const SUBJECTS=[
  ['sh1_creeper_009','ankleShadow','midwich'],
  ['sh1_hanged_scratcher_011','ceilingHook','sewer_resort'],
  ['sh2_mandarin_026','underGrateGrip','midwich_nightmare'],
  ['sh2_flesh_lip_027','cageFootLift','sewer_resort'],
  ['sh2_abstract_daddy_028','organicFrameOcclusion','labyrinth'],
  ['sh3_pendulum_039','rotatingShadow','shopping_mall'],
  ['sh3_leonard_wolf_048','waterSurfaceGrip','brookhaven_sh3'],
  ['sh4_hummer_055','buzzingCameraPass','room_302'],
  ['sh4_wall_man_056','wallSupportPull','labyrinth'],
  ['sh4_gum_head_old_type_057','unarmedFurnitureStruggle','hilltop_center']
];
const FIXED=['sh2_mandarin_026','sh2_flesh_lip_027','sh4_wall_man_056'];
const KEYS=['intro','taunt','winRound','loseRound','winMatch','loseMatch','outro'];
const fighter=id=>{const d=ROSTER.find(f=>f.id===id);assert.ok(d,id);return d;};
const stage=id=>{const s=STAGES.find(s=>s.id===id);assert.ok(s,id);return s;};
const actor=(id,index=0)=>({data:fighter(id),profile:createCombatProfile(fighter(id)),index,x:index?720:500,y:594,grounded:true,facing:index?-1:1});
const target=()=>actor('sh2_bubble_head_nurse_024',1);
const plan=(id,type='signature',options={})=>{const a=actor(id);return loreFinisher({attacker:a,target:target(),stage:stage(SUBJECTS.find(s=>s[0]===id)[2]),definition:a.data.fatalities.find(f=>f.type===type),...options});};
const presentation=(a,key,progress)=>sampleLorePresentation(a,{key,progress,lore:lorePresentation(a,key)});
const engines=new Set();
afterEach(()=>{for(const e of engines)e.destroy();engines.clear();});

test('ten source-specific grammars provide twenty contiguous edits without producing animation images',()=>{
  const recipes=new Set();
  for(const [id,recipeId] of SUBJECTS){
    const signature=plan(id),nightmare=plan(id,'nightmare');
    for(const p of [signature,nightmare]){
      assert.ok(p.allowed,`${id}: ${p.reason}`);assert.equal(p.recipeId,recipeId);
      assert.equal(p.ownerId,id);assert.equal(p.source,fighter(id).source);
      assert.equal(p.description,FIGHTER_REFERENCES[id].proposals.finisher.description);
      assert.equal(p.fidelity,'original-versus-staging');assert.equal(p.artStatus,'contextual-images-missing');
      const summary=cinematicSummary(p.id);
      assert.deepEqual(summary.beats.map(b=>[b.attackerPose,b.targetPose]),p.steps.map(b=>[b.attacker.pose,b.target.pose]));
      assert.equal(summary.requirements.unarmed,true);assert.equal(summary.requirements.decisiveMatchOnly,true);
      assert.equal(p.steps[0].from,0);assert.equal(p.steps.at(-1).to,p.duration);
      for(let i=0;i<p.steps.length;i++){
        assert.equal(p.steps[i].from,i?p.steps[i-1].to:0);assert.ok(p.steps[i].ticks>0);
      }
      const end=sampleLoreCinematic(p,p.duration+20);assert.equal(end.complete,true);assert.equal(end.frame,p.duration-1);
    }
    assert.equal(nightmare.steps.length,signature.steps.length+1);
    assert.notDeepEqual(signature.steps,nightmare.steps);recipes.add(signature.recipeId);
  }
  assert.equal(recipes.size,10);assert.equal(LORE_CINEMATIC_COVERAGE.animatedImagesCreated,0);
});

test('ceiling, floor grate, water, wall and furniture are real requirements, including source and blocked-place checks',()=>{
  for(const id of ['sh1_hanged_scratcher_011','sh2_mandarin_026','sh2_flesh_lip_027','sh3_leonard_wolf_048','sh4_wall_man_056','sh4_gum_head_old_type_057']){
    const validStage=stage(SUBJECTS.find(s=>s[0]===id)[2]);assert.ok(plan(id).allowed,id);
    for(const replacement of [
      {...validStage,props:[],layers:[]},
      {...validStage,id:'invented-support'},
      {...validStage,source:'unrelated-edition'},
      {...validStage,reference:{...validStage.reference,blocked:true}}
    ])assert.equal(plan(id,'signature',{stage:replacement}).allowed,false,id);
  }
  assert.equal(plan('sh3_leonard_wolf_048','signature',{stage:stage('midwich')}).allowed,false,'no dry-water teleport');
  assert.equal(plan('sh2_mandarin_026','signature',{stage:stage('alchemilla')}).allowed,false,'a ceiling does not substitute for a floor grate');
  assert.equal(plan('sh4_wall_man_056','signature',{stage:stage('old_silent_hill')}).allowed,false,'open street does not supply the fixed wall');
  assert.equal(plan('sh4_gum_head_old_type_057','signature',{stage:stage('alchemilla')}).allowed,false,'the reviewed SH1 waiting room does not supply a desk, bed, gurney or wheelchair');
});

test('the fixed Mandarin, 2001 cage and Wall Man keep their support throughout both edits',()=>{
  for(const id of FIXED){
    assert.equal(actor(id).profile.referencePolicy.canMove,false);
    for(const type of ['signature','nightmare']){
      const p=plan(id,type);assert.ok(p.allowed,id);
      assert.ok(p.steps.every(b=>b.attacker.x===0&&b.attacker.y===0),id);
      for(let tick=0;tick<p.duration;tick+=7){const s=sampleLoreCinematic(p,tick);assert.equal(s.attacker.x,0);assert.equal(s.attacker.y,0);}
    }
    const a=actor(id);
    for(const key of KEYS)for(const progress of [0,.2,.7,1]){
      const s=presentation(a,key,progress);assert.equal(s.x,0,id+'/'+key);assert.equal(s.y,0,id+'/'+key);
    }
  }
  const cage=plan('sh2_flesh_lip_027');
  assert.ok(cage.steps.every(b=>b.attacker.pose.startsWith('cage-')));
  assert.ok(!cage.steps.some(b=>/break|unfold|spider|leg|shard|remake/.test(b.attacker.pose)),'no remake phase or new limbs');
  assert.ok(cage.steps.some(b=>b.target.y<0),'the existing feet lift the target');
});

test('the actual open Midwich courtyard overrides inherited ceiling motifs for new and previous ceiling edits',()=>{
  assert.ok(stage('midwich').layers.includes('ceiling-lights'),'the inherited motif would otherwise produce a false ceiling');
  for(const id of ['sh1_hanged_scratcher_011','sh2_flesh_lip_027','sh2_spider_mannequin','homecoming_scarlet_spider_form_095'])for(const type of ['signature','nightmare']){
    const a=actor(id),options={attacker:a,target:target(),definition:a.data.fatalities.find(f=>f.type===type)};
    const courtyard=loreFinisher({...options,stage:stage('midwich')});
    assert.equal(courtyard.allowed,false,id);assert.match(courtyard.reason,/Appui de plafond/);
    assert.equal(loreFinisher({...options,stage:stage('sewer_resort')}).allowed,true,id+' retains the real sewer tunnel support');
    assert.equal(loreFinisher({...options,stage:stage('woodside')}).allowed,true,id+' retains the enclosed apartment hallway support');
  }
});

test('small bites, foot lifts and supported pulls reject airborne, huge and fixed target anatomies',()=>{
  for(const [id] of SUBJECTS)for(const targetId of ['sh1_air_screamer_001','sh3_closer_036','sh2_flesh_lip_027']){
    const p=plan(id,'signature',{target:actor(targetId,1)});
    assert.equal(p.allowed,false,`${id} -> ${targetId}`);assert.match(p.reason,/Anatomie|portée corporelle|conclusion scénarisée/);
  }
});

test('exact attacker anatomy, absent equipment and edition cannot be replaced by forged variants',()=>{
  for(const [id] of SUBJECTS){
    for(const changed of [
      {...fighter(id),visual:{...fighter(id).visual,kind:'fox'}},
      {...fighter(id),visual:{...fighter(id).visual,weapon:'club'}},
      {...fighter(id),visual:{...fighter(id).visual,weapon:'none'}},
      {...fighter(id),source:'unrelated-edition'}
    ]){
      const a={...actor(id),data:changed};assert.equal(plan(id,'signature',{attacker:a}).allowed,false,id);
      assert.equal(lorePresentation(a,'intro').authored,false,id);
    }
    assert.equal(plan(id,'signature',{definition:fighter('sh1_air_screamer_001').fatalities[0]}).allowed,false,id);
  }
});

test('low insect, wingless two-torso rotation, small winged bite and empty-handed struggle stay distinct',()=>{
  const creeper=plan('sh1_creeper_009'),pendulum=plan('sh3_pendulum_039'),hummer=plan('sh4_hummer_055'),gum=plan('sh4_gum_head_old_type_057');
  assert.ok(creeper.steps.every(b=>b.attacker.y===0),'Creeper never receives a human jump');
  assert.ok(pendulum.steps.every(b=>b.attacker.pose.startsWith('two-torso-')));
  assert.equal(fighter('sh3_pendulum_039').visual.kind,'flyer');assert.equal(fighter('sh3_pendulum_039').visual.limbs,4);
  assert.ok(!pendulum.steps.some(b=>b.sound==='wing'||/wing|feather/.test(b.attacker.pose)));
  assert.ok(hummer.steps.some(b=>b.attacker.pose==='small-wing-bite-pass'));
  assert.ok(!hummer.steps.some(b=>/claw|grip|pin|carry/.test(b.attacker.pose)),'small Hummer does not acquire a large flyer grip');
  assert.equal(fighter('sh4_gum_head_old_type_057').visual.weapon,null);
  assert.equal(fighter('sh4_gum_head_new_type_058').visual.weapon,'club','new type retains its own equipped-weapon variant');
  assert.ok(gum.steps.every(b=>!/(club|steal|stolen|weapon)/.test(b.attacker.pose)));
});

test('seventy presentation contexts retain the exact workbook proposals and do not mutate combat state',()=>{
  let total=0;const contexts=new Set();
  for(const [id] of SUBJECTS){
    const a=actor(id),original=structuredClone(a);
    for(const key of KEYS){
      const lore=lorePresentation(a,key),proposalKey=({winRound:'winRound1',loseRound:'loseRound1'}[key]||key);
      assert.equal(lore.authored,true,id+'/'+key);assert.equal(lore.ownerId,id);
      assert.equal(lore.description,FIGHTER_REFERENCES[id].proposals[proposalKey].description);
      assert.equal(lore.clipKey,`${key}@${id}:${proposalKey}`);assert.ok(lore.stagingId&&lore.poseIntent);
      assert.equal(lore.artStatus,'contextual-images-missing');assert.equal(lore.timingProvenance,'original-versus-ticks');
      assert.equal(lore.reversible,['taunt','winRound','loseRound'].includes(key));contexts.add(lore.clipKey);total++;
      for(const progress of [0,.3,.8,1])presentation(a,key,progress);
    }
    assert.deepEqual(a,original,id+' sampling is read-only');
    for(const progress of [0,.5,1])assert.equal(presentation(a,'loseRound',progress).alpha,1);
    const ready=presentation(a,'loseRound',1);assert.ok(Math.abs(ready.x)<1e-9&&Math.abs(ready.y)<1e-9);
    const forged={...a,data:{...a.data,source:'unrelated-edition'}};
    assert.deepEqual(sampleLorePresentation(forged,{key:'intro',progress:.4,lore:lorePresentation(a,'intro')}),{x:0,y:0,alpha:1,pose:'hold'});
  }
  assert.equal(total,70);assert.equal(contexts.size,70);
});

test('airborne short drops recover for round two while locomotion prohibitions suppress every offset',()=>{
  for(const id of ['sh3_pendulum_039','sh4_hummer_055']){
    const a=actor(id);assert.ok(presentation(a,'intro',.2).y<0);
    assert.ok(presentation(a,'loseRound',.5).y>0);assert.ok(Math.abs(presentation(a,'loseRound',1).y)<1e-9);
    assert.ok(presentation(a,'outro',.8).y<0);
  }
  for(const [id] of SUBJECTS){
    const a=actor(id);a.profile.referencePolicy={...a.profile.referencePolicy,canMove:false,canJump:false};
    for(const key of KEYS)for(const progress of [.2,.6,1]){const s=presentation(a,key,progress);assert.equal(s.x,0);assert.equal(s.y,0);}
  }
});

function engine(id,stageId){
  globalThis.window={};globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};
  globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
  Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});
  globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;
  const gradient=()=>({addColorStop(){}}),ctx=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient},{get:(t,k)=>k in t?t[k]:()=>{}});
  const e=new FightEngine({getContext:()=>ctx},{p1:fighter(id),p2:fighter('sh2_bubble_head_nurse_024'),stage:stage(stageId),mode:'local',roundsToWin:2,timeLimit:99,seed:1104,
    stageTerrain:false,stageHazards:false,stageDirector:false,otherworldShift:false,fatalities:true,stageFatalities:false});
  engines.add(e);return e;
}
function ticks(e,n){for(let i=0;i<n;i++)e.update();}
function knockout(e,type){const target=e.actors[1];target.health=0;target.lastHit={attackerIndex:0,isSuper:type==='nightmare',environmental:false};e.resolveKnockouts();}

test('all ten actual matches preserve round one, freeze each final clock and award the deciding score exactly once',()=>{
  for(const [id,recipeId,stageId] of SUBJECTS)for(const type of ['signature','nightmare']){
    const e=engine(id,stageId);ticks(e,e.phaseTimer);assert.equal(e.phase,'fight');
    knockout(e,type);assert.equal(e.phase,'roundEnd',id);assert.equal(e.fatality,null);assert.equal(e.actors[0].roundWins,1);
    assert.equal(e.actors[0].presentation.key,'winRound');assert.equal(e.actors[1].presentation.key,'loseRound');
    assert.ok(e.actors.every(a=>a.presentation.reversible));
    ticks(e,e.phaseTimer);ticks(e,e.phaseTimer);assert.equal(e.phase,'fight');assert.equal(e.round,2);
    assert.ok(e.actors.every(a=>a.health===a.maxHealth&&!a.presentation));
    knockout(e,type);assert.equal(e.phase,'fatality',id);assert.equal(e.fatality.choreography.recipeId,recipeId);
    assert.equal(e.fatality.definition.id,`${id}_${type}`);assert.equal(e.actors[0].roundWins,1);
    ticks(e,39);const frame=e.fatality.sample.frame,tracks=e.actors.map(a=>a.presentation.frame);
    e.togglePause(true);ticks(e,13);assert.equal(e.fatality.sample.frame,frame);assert.deepEqual(e.actors.map(a=>a.presentation.frame),tracks);
    e.togglePause(false);e.update();assert.equal(e.fatality.sample.frame,frame+1);
    if(FIXED.includes(id)){assert.equal(e.fatality.sample.attacker.x,0);assert.equal(e.fatality.sample.attacker.y,0);}
    assert.equal(e.projectiles.length,0);ticks(e,e.fatality.timer);
    assert.equal(e.phase,'roundEnd');assert.equal(e.actors[0].roundWins,2);assert.equal(e.actors[0].stats.fatalities,1);assert.equal(e.actors[1].health,0);
    ticks(e,10);assert.equal(e.actors[0].stats.fatalities,1);e.destroy();engines.delete(e);
  }
});
