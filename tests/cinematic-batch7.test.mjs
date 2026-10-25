import test, {afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,STAGES,createCombatProfile} from '../src/data.js';
import {FIGHTER_REFERENCES} from '../src/production-reference.js';
import {FightEngine} from '../src/fight.js';
import {loreFinisher,lorePresentation,sampleLorePresentation,sampleLoreCinematic,cinematicSummary,LORE_CINEMATIC_COVERAGE} from '../src/lore-cinematics.js';

const SUBJECTS=[
  ['origins_two_back_080','originsJoinedTackle','riverside_motel'],
  ['homecoming_amnion_hanging_form_097','amnionSupportedFrontLegs','underground_hc'],
  ['homecoming_amnion_exposed_form_098','amnionExposedCloseGrip','underground_hc'],
  ['bom_nurse_128','bomPipePairStop','book_light'],
  ['bom_tremer_133','bomTremerLowPressure','book_earth'],
  ['bom_fire_guardian_137','bomFireHandsEmission','book_fire'],
  ['bom_light_guardian_140','bomHeartMaceArm','book_light'],
  ['bom_water_guardian_141','bomAquaticMembers','book_water'],
  ['bom_blood_mama_145','bomDetachedMamaPounce','book_blood']
];
const SUPPORTED=['homecoming_amnion_hanging_form_097','homecoming_amnion_exposed_form_098','bom_water_guardian_141'];
const KEYS=['intro','taunt','winRound','loseRound','winMatch','loseMatch','outro'];
const fighter=id=>{const d=ROSTER.find(f=>f.id===id);assert.ok(d,id);return d;};
const stage=id=>{const s=STAGES.find(s=>s.id===id);assert.ok(s,id);return s;};
const actor=(id,index=0)=>({data:fighter(id),profile:createCombatProfile(fighter(id)),index,x:index?720:500,y:594,grounded:true,facing:index?-1:1});
const target=()=>actor('sh2_bubble_head_nurse_024',1);
const plan=(id,type='signature',options={})=>{const a=actor(id);return loreFinisher({attacker:a,target:target(),stage:stage(SUBJECTS.find(s=>s[0]===id)[2]),definition:a.data.fatalities.find(f=>f.type===type),...options});};
const samplePresentation=(a,key,progress)=>sampleLorePresentation(a,{key,progress,lore:lorePresentation(a,key)});
const engines=new Set();
afterEach(()=>{for(const e of engines)e.destroy();engines.clear();});

test('nine supported subjects own eighteen contiguous versus edits without claiming measured source animation',()=>{
  const recipes=new Set();
  for(const [id,recipeId] of SUBJECTS){
    const signature=plan(id),nightmare=plan(id,'nightmare');
    for(const p of [signature,nightmare]){
      assert.equal(p.allowed,true,`${id}: ${p.reason}`);assert.equal(p.recipeId,recipeId);assert.equal(p.ownerId,id);assert.equal(p.source,fighter(id).source);
      assert.equal(p.description,FIGHTER_REFERENCES[id].proposals.finisher.description);assert.equal(p.fidelity,'original-versus-staging');assert.equal(p.artStatus,'contextual-images-missing');
      assert.deepEqual(cinematicSummary(p.id).beats.map(b=>b.attackerPose),p.steps.map(b=>b.attacker.pose));
      p.steps.forEach((b,i)=>{assert.equal(b.from,i?p.steps[i-1].to:0);assert.ok(b.ticks>0);});assert.equal(p.steps.at(-1).to,p.duration);
      const end=sampleLoreCinematic(p,p.duration+10);assert.equal(end.complete,true);assert.equal(end.frame,p.duration-1);
    }
    assert.equal(nightmare.steps.length,signature.steps.length+1);assert.notDeepEqual(signature.steps,nightmare.steps);recipes.add(recipeId);
  }
  assert.equal(recipes.size,9);assert.equal(LORE_CINEMATIC_COVERAGE.animatedImagesCreated,0);
});

test('Amnion stances keep separate anatomical frames and do not borrow a ceiling, foot count or the player finishing blow',()=>{
  for(const [id,kind,prefix] of [['homecoming_amnion_hanging_form_097','spider','hc-amnion-hanging-'],['homecoming_amnion_exposed_form_098','mass','hc-amnion-exposed-']]){
    const p=plan(id),a=actor(id);assert.equal(a.data.visual.kind,kind);
    assert.ok(p.steps.every(b=>b.attacker.pose.startsWith(prefix)&&b.attacker.x===0&&b.attacker.y===0));
    assert.ok(p.steps.every(b=>!/(belly|joshua|birth|detach|transform|flight)/.test(b.attacker.pose)));
    const summary=cinematicSummary(p.id);assert.equal(summary.requirements.needsCeiling,false);assert.equal(summary.requirements.attackerLimbs,null,'unverified total limb count is not canonized');
    for(const key of KEYS)for(const progress of [0,.4,1]){const s=samplePresentation(a,key,progress);assert.equal(Math.abs(s.x),0);assert.equal(Math.abs(s.y),0);assert.ok(s.pose.startsWith(prefix));}
    const forged={...a,data:{...a.data,visual:{...a.data.visual,kind:kind==='spider'?'mass':'spider'}}};
    assert.equal(plan(id,'signature',{attacker:forged}).allowed,false);assert.equal(lorePresentation(forged,'intro').authored,false);
  }
  assert.ok(plan('homecoming_amnion_hanging_form_097').steps.some(b=>b.attacker.pose==='hc-amnion-hanging-front-swing'));
  assert.ok(plan('homecoming_amnion_hanging_form_097').steps.every(b=>!/(smash|slam|stuck|grip|grab)/.test(b.attacker.pose)),'first stance cannot borrow the second-stance smash or grab');
  assert.ok(plan('homecoming_amnion_exposed_form_098').steps.some(b=>b.attacker.pose==='hc-amnion-exposed-close-grip'));
});

test('mechanical and aquatic edits require a reviewed supporting place, including identity, source and blocked-place guards',()=>{
  for(const id of SUPPORTED){
    const original=stage(SUBJECTS.find(s=>s[0]===id)[2]);assert.equal(plan(id).allowed,true);
    for(const replacement of [{...original,props:[],layers:[]},{...original,id:'invented-support'},{...original,source:'wrong-work'},{...original,reference:{...original.reference,blocked:true}}]){
      assert.equal(plan(id,'signature',{stage:replacement}).allowed,false,id);
    }
    assert.equal(plan(id,'signature',{stage:stage('midwich')}).allowed,false,id+' cannot use the outdoor school as its source support');
  }
  for(const type of ['signature','nightmare']){
    const water=plan('bom_water_guardian_141',type);assert.ok(water.steps.every(b=>b.attacker.x===0&&b.attacker.y===0));
    assert.equal(plan('bom_water_guardian_141',type,{stage:stage('book_fire')}).allowed,false,'aquatic action is unavailable on a dry floor');
    assert.ok(water.steps.at(-1).label.includes('NIVEAU FIXE'));
  }
});

test('Nurse retains its actual Vita Steel Pipe while the Light Guardian strikes with its own mace-like arm',()=>{
  const nurse=fighter('bom_nurse_128'),light=fighter('bom_light_guardian_140');assert.equal(nurse.visual.weapon,'pipe');assert.equal(light.visual.weapon,null);
  const np=plan(nurse.id),lp=plan(light.id);assert.equal(cinematicSummary(np.id).requirements.weapon,'pipe');assert.equal(cinematicSummary(lp.id).requirements.weapon,null);
  assert.equal(np.steps.filter(b=>['bom-nurse-pipe-first','bom-nurse-pipe-second'].includes(b.attacker.pose)).length,2);
  assert.ok(lp.steps.some(b=>b.attacker.pose==='bom-light-mace-arm-down'));
  for(const [id,weapon] of [[nurse.id,null],[nurse.id,'scalpel'],[light.id,'mace']]){
    const a={...actor(id),data:{...fighter(id),visual:{...fighter(id).visual,weapon}}};assert.equal(plan(id,'signature',{attacker:a}).allowed,false);assert.equal(lorePresentation(a,'taunt').authored,false);
  }
});

test('Tremer stays low and limbless in its action grammar and unverified Fire Guardian gestures remain explicitly excluded',()=>{
  const tremer=plan('bom_tremer_133'),fire=plan('bom_fire_guardian_137');
  assert.ok(tremer.steps.every(b=>b.attacker.y===0&&b.attacker.pose.startsWith('bom-tremer-low-')));
  assert.ok(tremer.steps.every(b=>!/(leg|hand|claw|bite|wing|projectile)/.test(b.attacker.pose)));assert.match(tremer.scopeNote,/proposition versus/);
  assert.ok(fire.steps.every(b=>b.attacker.x===0&&b.attacker.y===0&&b.attacker.alpha===1));
  assert.ok(fire.steps.some(b=>b.attacker.pose==='bom-fire-hands-emit'));assert.match(fire.scopeNote,/Bond et décharge corporelle.*restent à confirmer/);
  assert.ok(fire.steps.every(b=>!/(jump|leap|blast|explod|wing|meteor)/.test(b.attacker.pose)));
});

test('Two-Back stays joined and detached Blood Mama neither creates a baby nor reattaches to a parent',()=>{
  const joined=plan('origins_two_back_080'),mama=plan('bom_blood_mama_145');
  assert.ok(joined.steps.every(b=>b.attacker.pose.startsWith('origins-joined-bodies-')));assert.match(joined.scopeNote,/projectile exclu/);
  assert.ok(joined.steps.some(b=>b.attacker.pose==='origins-joined-bodies-tackle'));
  assert.ok(mama.steps.every(b=>b.attacker.pose.startsWith('bom-mama-detached-')));
  assert.ok(mama.steps.some(b=>b.attacker.pose==='bom-mama-detached-pounce'&&b.attacker.y<0));
  assert.ok(mama.steps.every(b=>!/(baby|spawn|birth|summon|reattach)/.test(b.attacker.pose)));
});

test('all new edits reject borrowed work identities, forged body classes and unsupported airborne or oversized targets',()=>{
  for(const [id] of SUBJECTS){
    for(const data of [{...fighter(id),source:'unrelated-work'},{...fighter(id),visual:{...fighter(id).visual,kind:'fox'}}]){
      const a={...actor(id),data};assert.equal(plan(id,'signature',{attacker:a}).allowed,false,id);assert.equal(lorePresentation(a,'intro').authored,false,id);
    }
    for(const targetId of ['sh1_air_screamer_001','sh3_closer_036'])assert.equal(plan(id,'signature',{target:actor(targetId,1)}).allowed,false,id);
  }
});

test('sixty-three exact presentation contexts stay reversible in round one and sampling does not mutate combat or change form',()=>{
  const contexts=new Set();
  for(const [id] of SUBJECTS){
    const a=actor(id),before=structuredClone(a);
    for(const key of KEYS){
      const lore=lorePresentation(a,key),proposal=({winRound:'winRound1',loseRound:'loseRound1'}[key]||key);
      assert.equal(lore.authored,true,id+'/'+key);assert.equal(lore.description,FIGHTER_REFERENCES[id].proposals[proposal].description);assert.equal(lore.clipKey,`${key}@${id}:${proposal}`);
      assert.ok(lore.poseIntent&&lore.stagingId);assert.equal(lore.artStatus,'contextual-images-missing');assert.equal(lore.timingProvenance,'original-versus-ticks');
      assert.equal(lore.reversible,['taunt','winRound','loseRound'].includes(key));contexts.add(lore.clipKey);
      for(const progress of [0,.4,.8,1])samplePresentation(a,key,progress);
    }
    assert.deepEqual(a,before);const recovered=samplePresentation(a,'loseRound',1);assert.ok(Math.abs(recovered.x)<1e-9);assert.equal(recovered.y,0);assert.equal(recovered.alpha,1);
    if(id!=='bom_tremer_133')assert.equal(samplePresentation(a,'outro',1).alpha,1,'the result keeps its source-specific body and form');
  }
  assert.equal(contexts.size,63);
});

function engine(id,stageId){
  globalThis.window={};globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};
  globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
  Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});
  globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;
  const gradient=()=>({addColorStop(){}}),ctx=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient},{get:(t,k)=>k in t?t[k]:()=>{}});
  const e=new FightEngine({getContext:()=>ctx},{p1:fighter(id),p2:fighter('sh2_bubble_head_nurse_024'),stage:stage(stageId),mode:'local',roundsToWin:2,timeLimit:99,seed:2527,
    stageTerrain:false,stageHazards:false,stageDirector:false,otherworldShift:false,fatalities:true,stageFatalities:false});engines.add(e);return e;
}
function ticks(e,n){for(let i=0;i<n;i++)e.update();}
function knockout(e,type){const t=e.actors[1];t.health=0;t.lastHit={attackerIndex:0,isSuper:type==='nightmare',environmental:false};e.resolveKnockouts();}

test('eighteen actual deciding matches keep forms and supports, recover the first round and freeze shared clocks on pause',()=>{
  for(const [id,recipeId,stageId] of SUBJECTS)for(const type of ['signature','nightmare']){
    const e=engine(id,stageId),form=e.actors[0].data.id;ticks(e,e.phaseTimer);knockout(e,type);
    assert.equal(e.phase,'roundEnd');assert.equal(e.fatality,null);assert.equal(e.actors[0].roundWins,1);assert.ok(e.actors.every(a=>a.presentation.reversible));
    ticks(e,e.phaseTimer);ticks(e,e.phaseTimer);assert.equal(e.phase,'fight');assert.ok(e.actors.every(a=>a.health===a.maxHealth&&!a.presentation));
    knockout(e,type);assert.equal(e.phase,'fatality',id);assert.equal(e.fatality.choreography.recipeId,recipeId);assert.equal(e.fatality.definition.id,`${id}_${type}`);ticks(e,47);
    const frame=e.fatality.sample.frame,tracks=e.actors.map(a=>a.presentation.frame);e.togglePause(true);ticks(e,13);
    assert.equal(e.fatality.sample.frame,frame);assert.deepEqual(e.actors.map(a=>a.presentation.frame),tracks);e.togglePause(false);e.update();assert.equal(e.fatality.sample.frame,frame+1);
    if(SUPPORTED.includes(id)){assert.equal(e.fatality.sample.attacker.x,0);assert.equal(e.fatality.sample.attacker.y,0);}
    assert.equal(e.actors.length,2);assert.equal(e.projectiles.length,0);assert.equal(e.actors[0].data.id,form);ticks(e,e.fatality.timer);
    assert.equal(e.phase,'roundEnd');assert.equal(e.actors[0].roundWins,2);assert.equal(e.actors[0].stats.fatalities,1);assert.equal(e.actors[1].health,0);
    ticks(e,9);assert.equal(e.actors[1].health,0);assert.equal(e.actors[0].data.id,form);assert.equal(e.actors[0].stats.fatalities,1);e.destroy();engines.delete(e);
  }
});

test('an actual dry Water Guardian result remains an ordinary final KO instead of fabricating an aquatic execution',()=>{
  const e=engine('bom_water_guardian_141','book_fire');ticks(e,e.phaseTimer);knockout(e,'signature');
  assert.equal(e.phase,'roundEnd');assert.equal(e.actors[0].roundWins,1);assert.equal(e.fatality,null);
  ticks(e,e.phaseTimer);ticks(e,e.phaseTimer);knockout(e,'signature');assert.equal(e.phase,'roundEnd');assert.equal(e.actors[0].roundWins,2);
  assert.equal(e.fatality,null);assert.equal(e.actors[0].stats.fatalities,0);assert.match(e.lastCinematicBlock.reason,/Premier plan requis/);assert.equal(e.actors[1].health,0);
});
