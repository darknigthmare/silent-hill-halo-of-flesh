import test, {afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,STAGES,createCombatProfile} from '../src/data.js';
import {FIGHTER_REFERENCES} from '../src/production-reference.js';
import {FightEngine} from '../src/fight.js';
import {SPRITES} from '../src/sprite-manifest.js';
import {actorSpriteState,sampleSpriteClip} from '../src/sprite-animation.js';
import {presentationClipDuration} from '../src/presentation-sequences.js';
import {loreFinisher,lorePresentation,sampleLorePresentation,sampleLoreCinematic,cinematicSummary,LORE_CINEMATIC_COVERAGE} from '../src/lore-cinematics.js';

// The Vita bestiary documents capacities. These edits and their clocks remain
// project-authored versus proposals, with every contextual body image missing.
const SUBJECTS=[
  ['bom_air_screamer_121','bomTalonsCircle','book_wood'],
  ['bom_bogeyman_122','bomHammerStop','book_earth'],
  ['bom_butcher_123','bomCleaverPair','book_wood'],
  ['bom_double_head_124','bomCirclingCharge','book_fire'],
  ['bom_ghost_125','bomToxicPresencePass','book_blood'],
  ['bom_insane_cancer_126','bomMassSpaceCrush','book_water'],
  ['bom_needler_127','bomBladeCrossRetreat','book_steel'],
  ['bom_pyramid_head_129','bomGreatKnifeSweep','book_light'],
  ['bom_schism_130','bomHeadBladeLunge','book_earth'],
  ['bom_straight_jacket_131','bomClosedTorsoJet','book_water']
];
const KEYS=['intro','taunt','winRound','loseRound','winMatch','loseMatch','outro'];
const fighter=id=>{const d=ROSTER.find(f=>f.id===id);assert.ok(d,id);return d;};
const stage=id=>{const s=STAGES.find(s=>s.id===id);assert.ok(s,id);return s;};
const actor=(id,index=0)=>({data:fighter(id),profile:createCombatProfile(fighter(id)),index,x:index?720:500,y:594,grounded:true,facing:index?-1:1});
const target=()=>actor('sh2_bubble_head_nurse_024',1);
const plan=(id,type='signature',options={})=>{const a=actor(id);return loreFinisher({attacker:a,target:target(),stage:stage(SUBJECTS.find(s=>s[0]===id)[2]),definition:a.data.fatalities.find(f=>f.type===type),...options});};
const samplePresentation=(a,key,progress)=>sampleLorePresentation(a,{key,progress,lore:lorePresentation(a,key)});
const engines=new Set();
afterEach(()=>{for(const e of engines)e.destroy();engines.clear();});

test('ten Vita subjects receive twenty owned edits with distinct documented capacities and original versus timing',()=>{
  const recipes=new Set();
  for(const [id,recipeId] of SUBJECTS){
    const signature=plan(id),nightmare=plan(id,'nightmare');
    for(const p of [signature,nightmare]){
      assert.equal(p.allowed,true,`${id}: ${p.reason}`);assert.equal(p.recipeId,recipeId);assert.equal(p.ownerId,id);assert.equal(p.source,'bom');
      assert.equal(p.description,FIGHTER_REFERENCES[id].proposals.finisher.description);assert.ok(p.referenceIds.includes('EXT20'));
      assert.equal(p.fidelity,'original-versus-staging');assert.equal(p.artStatus,'contextual-images-missing');
      assert.ok(p.steps.every(b=>b.attacker.pose.startsWith('bom-')),'an edition never borrows another source pose');
      p.steps.forEach((b,i)=>{assert.equal(b.from,i?p.steps[i-1].to:0);assert.ok(b.ticks>0);});
      assert.equal(p.steps.at(-1).to,p.duration);assert.equal(sampleLoreCinematic(p,p.duration+10).complete,true);
      assert.deepEqual(cinematicSummary(p.id).beats.map(b=>b.attackerPose),p.steps.map(b=>b.attacker.pose));
    }
    assert.equal(nightmare.steps.length,signature.steps.length+1);assert.notDeepEqual(signature.steps,nightmare.steps);recipes.add(recipeId);
  }
  assert.equal(recipes.size,10);assert.equal(LORE_CINEMATIC_COVERAGE.animatedImagesCreated,0);
});

test('the four-limbed BoM Needler and blade-headed Schism reject anatomy inherited from an unrelated body',()=>{
  const needler=fighter('bom_needler_127'),schism=fighter('bom_schism_130');
  assert.equal(needler.visual.limbs,4);assert.equal(schism.visual.head,'blade');
  assert.equal(cinematicSummary(needler.id+'_signature').requirements.attackerLimbs,4);
  assert.equal(cinematicSummary(schism.id+'_signature').requirements.attackerHead,'blade');
  for(const [id,changes] of [[needler.id,{limbs:6}],[needler.id,{limbs:null}],[schism.id,{head:null}],[schism.id,{head:'helmet'}]]){
    const a={...actor(id),data:{...fighter(id),visual:{...fighter(id).visual,...changes}}};
    assert.equal(plan(id,'signature',{attacker:a}).allowed,false,id);assert.equal(lorePresentation(a,'intro').authored,false,id);
  }
});

test('hammer, Great Cleaver and Great Knife stay distinct, and every exact subject rejects forged bodies and editions',()=>{
  for(const [id] of SUBJECTS){
    for(const data of [{...fighter(id),source:'sh3'},{...fighter(id),visual:{...fighter(id).visual,kind:'fox'}}]){
      const a={...actor(id),data};assert.equal(plan(id,'signature',{attacker:a}).allowed,false,id);assert.equal(lorePresentation(a,'intro').authored,false,id);
    }
    const a={...actor(id),data:{...fighter(id),visual:{...fighter(id).visual,weapon:'pistol'}}};
    assert.equal(plan(id,'signature',{attacker:a}).allowed,false,id);assert.equal(lorePresentation(a,'intro').authored,false,id);
    if(id!=='bom_ghost_125')for(const targetId of ['sh1_air_screamer_001','sh3_closer_036'])assert.equal(plan(id,'signature',{target:actor(targetId,1)}).allowed,false,id+' keeps its physical target envelope');
  }
  assert.equal(cinematicSummary('bom_bogeyman_122_signature').requirements.weapon,'hammer');
  assert.equal(cinematicSummary('bom_butcher_123_signature').requirements.weapon,'cleaver');
  assert.equal(cinematicSummary('bom_pyramid_head_129_signature').requirements.weapon,'great_knife');
});

test('the Vita guide bounds the charge, toxic passage, head lunge and acid jet without adding unobserved grabs or powers',()=>{
  const dog=plan('bom_double_head_124'),ghost=plan('bom_ghost_125'),schism=plan('bom_schism_130'),jacket=plan('bom_straight_jacket_131');
  assert.ok(dog.steps.some(b=>b.attacker.pose==='bom-dog-charge'));assert.match(dog.scopeNote,/morsure.*reste à capturer/);
  assert.ok(dog.steps.every(b=>!/(bite|clamp|grip)/.test(b.attacker.pose)),'the unverified workbook bite is not borrowed from SH3');
  assert.ok(ghost.steps.some(b=>b.attacker.pose==='bom-toxic-presence-pass'));
  assert.ok(ghost.steps.every(b=>!/(grip|punch|sword|teleport)/.test(b.attacker.pose)&&!['impact','slash'].includes(b.effect)));
  assert.ok(schism.steps.some(b=>b.attacker.pose==='bom-head-blade-lunge'));assert.ok(schism.steps.every(b=>!/(grip|grab|throw)/.test(b.attacker.pose)));
  assert.ok(jacket.steps.every(b=>b.attacker.pose.startsWith('bom-closed-torso-')&&!/(punch|fist|leg-clamp|hand)/.test(b.attacker.pose)));
  assert.ok(jacket.steps.some(b=>b.effect==='spray'));
});

test('the two short cleaver cuts, lateral knife sweep and four-blade retreat are separate action grammars',()=>{
  const butcher=plan('bom_butcher_123'),pyramid=plan('bom_pyramid_head_129'),needler=plan('bom_needler_127');
  assert.deepEqual(butcher.steps.filter(b=>b.effect==='slash').map(b=>b.attacker.pose),['bom-cleaver-first-cut','bom-cleaver-second-cut']);
  assert.ok(pyramid.steps.some(b=>b.attacker.pose==='bom-great-knife-sweep'));
  assert.ok(pyramid.steps.every(b=>!/(spear|thrust|grip)/.test(b.attacker.pose)));
  assert.ok(needler.steps.some(b=>b.attacker.pose==='bom-four-blades-cross'));
  assert.ok(needler.steps.some(b=>b.attacker.pose==='bom-four-blades-oblique-retreat'));
  assert.ok(needler.steps.every(b=>b.attacker.y===0),'the Vita proposal does not import the Homecoming vertical leap');
});

test('seventy presentation contexts preserve proposal ownership without changing health, resources or combat state',()=>{
  const contexts=new Set();
  for(const [id] of SUBJECTS){
    const a=actor(id),before=structuredClone(a);
    for(const key of KEYS){
      const lore=lorePresentation(a,key),proposal=({winRound:'winRound1',loseRound:'loseRound1'}[key]||key);
      assert.equal(lore.authored,true,id+'/'+key);assert.equal(lore.ownerId,id);assert.equal(lore.source,'bom');
      assert.equal(lore.clipKey,`${key}@${id}:${proposal}`);assert.equal(lore.description,FIGHTER_REFERENCES[id].proposals[proposal].description);
      assert.ok(lore.poseIntent.startsWith('bom-'));assert.equal(lore.artStatus,'contextual-images-missing');assert.equal(lore.timingProvenance,'original-versus-ticks');
      assert.equal(lore.reversible,['taunt','winRound','loseRound'].includes(key));contexts.add(lore.clipKey);
      for(const progress of [0,.3,.7,1])samplePresentation(a,key,progress);
    }
    assert.deepEqual(a,before);const ready=samplePresentation(a,'loseRound',1);
    assert.ok(Math.abs(ready.x)<1e-9&&Math.abs(ready.y)<1e-9);assert.equal(ready.alpha,1);
    a.profile.referencePolicy={...a.profile.referencePolicy,canMove:false,canJump:false};
    for(const key of KEYS){const s=samplePresentation(a,key,.4);assert.equal(s.x,0);assert.equal(s.y,0);}
  }
  assert.equal(contexts.size,70);
});

test('Ghost fades only partially in round one, fully dissipates at final defeat and remains present as winner',()=>{
  const a=actor('bom_ghost_125');
  assert.equal(samplePresentation(a,'loseRound',0).alpha,1);assert.equal(samplePresentation(a,'loseRound',1).alpha,1);
  assert.ok(samplePresentation(a,'loseRound',.5).alpha>0&&samplePresentation(a,'loseRound',.5).alpha<1);
  assert.equal(samplePresentation(a,'loseMatch',1).alpha,0);
  for(const key of ['winRound','winMatch','outro'])assert.equal(samplePresentation(a,key,1).alpha,1);
  assert.ok(plan(a.data.id).steps.every(b=>b.attacker.alpha>0),'winning passage is not its own death');
});

test('Insane Cancer explosion remains an image intent confined to its own final loss and never destroys a winning attacker',()=>{
  const a=actor('bom_insane_cancer_126');
  for(const key of KEYS){const p=lorePresentation(a,key);assert.equal(/explosion/.test(p.poseIntent),key==='loseMatch');}
  assert.match(lorePresentation(a,'loseMatch').poseIntent,/awaiting-frames/);
  for(const type of ['signature','nightmare'])assert.ok(plan(a.data.id,type).steps.every(b=>b.attacker.alpha===1&&!/(explod|blast|burst)/.test(b.attacker.pose)));
  for(const key of ['winMatch','outro'])assert.equal(samplePresentation(a,key,1).alpha,1);
});

function engine(id,stageId,targetId='sh2_bubble_head_nurse_024'){
  globalThis.window={};globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};
  globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
  Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});
  globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;
  const gradient=()=>({addColorStop(){}}),ctx=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient},{get:(t,k)=>k in t?t[k]:()=>{}});
  const e=new FightEngine({getContext:()=>ctx},{p1:fighter(id),p2:fighter(targetId),stage:stage(stageId),mode:'local',roundsToWin:2,timeLimit:99,seed:2510,
    stageTerrain:false,stageHazards:false,stageDirector:false,otherworldShift:false,fatalities:true,stageFatalities:false});engines.add(e);return e;
}
function ticks(e,n){for(let i=0;i<n;i++)e.update();}
function knockout(e,type){const t=e.actors[1];t.health=0;t.lastHit={attackerIndex:0,isSuper:type==='nightmare',environmental:false};e.resolveKnockouts();}

test('twenty deciding matches preserve the ordinary next round, freeze on pause and award one final result without reviving the victim',()=>{
  for(const [id,recipeId,stageId] of SUBJECTS)for(const type of ['signature','nightmare']){
    const e=engine(id,stageId);ticks(e,e.phaseTimer);assert.equal(e.phase,'fight');
    knockout(e,type);assert.equal(e.phase,'roundEnd');assert.equal(e.fatality,null);assert.equal(e.actors[0].roundWins,1);assert.ok(e.actors.every(a=>a.presentation.reversible));
    ticks(e,e.phaseTimer);ticks(e,e.phaseTimer);assert.equal(e.phase,'fight');assert.ok(e.actors.every(a=>a.health===a.maxHealth&&!a.presentation));
    knockout(e,type);assert.equal(e.phase,'fatality',id);assert.equal(e.fatality.choreography.recipeId,recipeId);assert.equal(e.fatality.definition.id,`${id}_${type}`);
    ticks(e,44);const frame=e.fatality.sample.frame,tracks=e.actors.map(a=>a.presentation.frame);
    e.togglePause(true);ticks(e,12);assert.equal(e.fatality.sample.frame,frame);assert.deepEqual(e.actors.map(a=>a.presentation.frame),tracks);
    e.togglePause(false);e.update();assert.equal(e.fatality.sample.frame,frame+1);assert.equal(e.projectiles.length,0);
    ticks(e,e.fatality.timer);assert.equal(e.phase,'roundEnd');assert.equal(e.actors[0].roundWins,2);assert.equal(e.actors[0].stats.fatalities,1);
    assert.equal(e.actors[1].health,0);ticks(e,9);assert.equal(e.actors[1].health,0);assert.equal(e.actors[0].stats.fatalities,1);e.destroy();engines.delete(e);
  }
});

test('an actual Insane Cancer defeat recovers in round one and reserves terminal destruction intent for the final ordinary KO',()=>{
  const e=engine('bom_bogeyman_122','book_earth','bom_insane_cancer_126');ticks(e,e.phaseTimer);knockout(e,'signature');
  assert.equal(e.phase,'roundEnd');assert.equal(e.actors[1].presentation.key,'loseRound');assert.ok(!/explosion/.test(e.actors[1].presentation.lore.poseIntent));
  ticks(e,e.phaseTimer);ticks(e,e.phaseTimer);assert.equal(e.actors[1].health,e.actors[1].maxHealth);assert.equal(e.phase,'fight');
  knockout(e,'signature');assert.equal(e.phase,'roundEnd');assert.equal(e.fatality,null,'incompatible grip falls back to the ordinary final KO');
  assert.equal(e.actors[1].presentation.key,'loseMatch');assert.match(e.actors[1].presentation.lore.poseIntent,/final-collapse-explosion-awaiting-frames/);
  assert.equal(e.actors[1].health,0);assert.equal(e.actors[0].roundWins,2);assert.equal(e.actors[0].stats.fatalities,0);
});

test('Twin Victim exact static pointing taunt returns to idle on cancellation and cannot dress another presentation',()=>{
  const id='sh4_twin_victim_059',art=SPRITES[id],key=`taunt@${id}:taunt`;
  assert.ok(art);assert.equal(art.source,'sh4');assert.equal(art.fidelity,'unverified');
  assert.deepEqual(art.clips.idle.frames,[0]);assert.deepEqual(art.clips[key].frames,[1]);assert.equal(art.clips[key].loop,false);
  assert.notEqual(art.frames[0].sha256,art.frames[1].sha256);assert.equal(art.animatedClips,0,'two static images are not an authored animation');
  const e=engine(id,'room_302');ticks(e,e.phaseTimer);const a=e.actors[0];assert.equal(e.phase,'fight');
  const sample=()=>sampleSpriteClip(art,actorSpriteState(a));
  assert.equal(sample().frameIndex,0);assert.equal(e.beginTaunt(a),true);
  assert.equal(a.presentation.clipKey,key);assert.equal(presentationClipDuration(a,a.presentation),1);
  assert.equal(sample().pose,key);assert.equal(sample().fallback,false);assert.equal(sample().frameIndex,1);
  ticks(e,12);assert.equal(sample().frameIndex,1,'the fixed contextual image holds on the shared presentation clock');
  assert.equal(e.cancelTaunt(a),true);assert.equal(a.presentation,null);assert.equal(sample().pose,'idle');assert.equal(sample().frameIndex,0);
  for(const other of ['intro','winRound','loseRound','winMatch','loseMatch','outro','finisher']){
    const track=other==='finisher'?{key:other,finisherId:id+'_signature'}:{key:other};
    e.beginPresentations('regression-context',[track,{key:'winRound'}],90);
    const s=sample();assert.equal(s.frameIndex,0,other+' must report its real idle fallback');assert.equal(s.fallback,true);assert.notEqual(s.pose,key);
  }
  // lore.artStatus describes the complete authored choreography. The exact
  // sprite manifest independently records this one available static candidate.
  assert.equal(lorePresentation(a,'taunt').artStatus,'contextual-images-missing');
});
