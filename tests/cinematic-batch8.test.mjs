import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,STAGES,createCombatProfile} from '../src/data.js';
import {FIGHTER_REFERENCES} from '../src/production-reference.js';
import {FightEngine} from '../src/fight.js';
import {loreFinisher,lorePresentation,sampleLorePresentation,sampleLoreCinematic,cinematicSummary,LORE_CINEMATIC_COVERAGE} from '../src/lore-cinematics.js';

const SUBJECTS=[
  ['sh1_floatstinger_016','sh1MothAbdomenPass','central_nightmare'],
  ['sh1_monster_cybil_017','cybilArmedPistolButt','lakeside_amusement'],
  ['sh2_eddie_dombrowski_032','eddieFreezerRevolverCut','prison_meat_locker'],
  ['sh2_maria_final_manifestation_033','mariaFinalMothClosure','hotel_otherworld'],
  ['sh2_mary_final_manifestation_034','maryFinalBlackTail','hotel_otherworld'],
  ['sh4_gum_head_new_type_058','gumNewEquippedClub','building_world'],
  ['sh4_bottom_065','bottomThreeHeadDive','outside_room_302'],
  ['sh4_cynthia_velasquez_victim_16','cynthiaStandingHairClosure','subway_world']
];
const CYBIL='sh1_monster_cybil_017',KEYS=['intro','taunt','winRound','loseRound','winMatch','loseMatch','outro'];
const fighter=id=>{const f=ROSTER.find(f=>f.id===id);assert.ok(f,id);return f;};
const stage=id=>{const s=STAGES.find(s=>s.id===id);assert.ok(s,id);return s;};
const actor=(id,index=0)=>({data:fighter(id),profile:createCombatProfile(fighter(id)),index,x:index?720:500,y:594,grounded:true,facing:index?-1:1,
  ...(id===CYBIL?{ammo:10,weaponDiscarded:false}:{})});
const target=()=>actor('sh2_bubble_head_nurse_024',1);
function plan(id,type='signature',options={}){const a=actor(id);return loreFinisher({attacker:a,target:target(),stage:stage(SUBJECTS.find(s=>s[0]===id)[2]),definition:a.data.fatalities.find(f=>f.type===type),...options});}
const samplePresentation=(a,key,progress)=>sampleLorePresentation(a,{key,progress,lore:lorePresentation(a,key)});
const engines=new Set();
afterEach(()=>{for(const e of engines)e.destroy();engines.clear();});

test('eight exact subjects own sixteen distinct authored versus edits and fifty-six presentation contexts',()=>{
  const recipes=new Set(),contexts=new Set();
  for(const [id,recipe] of SUBJECTS){
    for(const type of ['signature','nightmare']){
      const p=plan(id,type),summary=cinematicSummary(p.id);assert.equal(p.allowed,true,`${id}: ${p.reason}`);assert.equal(p.ownerId,id);assert.equal(p.recipeId,recipe);
      assert.equal(p.description,FIGHTER_REFERENCES[id].proposals.finisher.description);assert.equal(p.source,fighter(id).source);assert.equal(p.fidelity,'original-versus-staging');assert.equal(p.artStatus,'contextual-images-missing');
      assert.ok(p.scopeNote);assert.deepEqual(summary.beats.map(b=>b.attackerPose),p.steps.map(b=>b.attacker.pose));
      p.steps.forEach((b,i)=>{assert.equal(b.from,i?p.steps[i-1].to:0);assert.ok(Number.isSafeInteger(b.ticks)&&b.ticks>0);});assert.equal(p.steps.at(-1).to,p.duration);
      assert.equal(sampleLoreCinematic(p,p.duration+5).complete,true);recipes.add(p.recipeId);
    }
    assert.notDeepEqual(plan(id).steps,plan(id,'nightmare').steps);
    const a=actor(id),before=structuredClone(a);
    for(const key of KEYS){
      const p=lorePresentation(a,key);assert.equal(p.authored,true,id+'/'+key);assert.ok(p.poseIntent&&p.stagingId);assert.equal(p.ownerId,id);assert.equal(p.artStatus,'contextual-images-missing');assert.equal(p.timingProvenance,'original-versus-ticks');
      assert.equal(p.clipKey,`${key}@${id}:${{winRound:'winRound1',loseRound:'loseRound1'}[key]||key}`);contexts.add(p.clipKey);
      for(const progress of [0,.4,1])samplePresentation(a,key,progress);
    }
    assert.deepEqual(a,before);const recovered=samplePresentation(a,'loseRound',1);assert.ok(Math.abs(recovered.x)<1e-9);assert.ok(Math.abs(recovered.y)<1e-9);assert.equal(recovered.alpha,1);
  }
  assert.equal(recipes.size,8);assert.equal(contexts.size,56);assert.equal(LORE_CINEMATIC_COVERAGE.animatedImagesCreated,0);
});

test('Eddie requires the original second freezer with both its hooks and freezer, rather than a borrowed meat prop',()=>{
  const id='sh2_eddie_dombrowski_032',original=stage('prison_meat_locker');
  for(const type of ['signature','nightmare']){
    assert.equal(plan(id,type).allowed,true);
    for(const replacement of [stage('toluca_prison'),stage('labyrinth'),{...original,id:'fake-freezer'},{...original,source:'sh2r'},
      {...original,props:['freezer'],layers:[]},{...original,props:['hooks'],layers:[]},{...original,reference:{...original.reference,blocked:true}}]){
      assert.equal(plan(id,type,{stage:replacement}).allowed,false,JSON.stringify(replacement.id));
    }
  }
  assert.deepEqual(cinematicSummary(id+'_signature').requirements.stageIds,['prison_meat_locker']);
  assert.ok(plan(id).steps.every(b=>!/(steam|moving-rail|magic|teleport)/.test(b.attacker.pose)));
});

test('Cybils armed edit rejects discarded, exhausted, low-health or unknown phases without restoring its pistol',()=>{
  for(const patch of [{weaponDiscarded:true},{ammo:0},{ammo:undefined},{ammo:-1},{ammo:11},{ammo:1.5},{weaponDiscarded:undefined},{health:49,maxHealth:100}]){
    const a={...actor(CYBIL),...patch},before=structuredClone(a);
    assert.equal(plan(CYBIL,'signature',{attacker:a}).allowed,false,JSON.stringify(patch));assert.deepEqual(a,before);
  }
  for(const patch of [{health:50,maxHealth:100},{ammo:1}])assert.equal(plan(CYBIL,'signature',{attacker:{...actor(CYBIL),...patch}}).allowed,true);
  const a={...actor(CYBIL),ammo:7,weaponDiscarded:true};
  for(const key of KEYS){const p=lorePresentation(a,key);assert.equal(p.authored,true);assert.match(p.poseIntent,/cybil-unarmed/);assert.match(p.stagingId,/-unarmed$/);for(const progress of [0,.4,1])assert.match(samplePresentation(a,key,progress).pose,/cybil-unarmed/);}
  a.weaponDiscarded=false;a.ammo=undefined;assert.equal(lorePresentation(a,'intro').authored,false,'unknown ammunition is not presented as a verified armed phase');
});

test('Mary and Maria retain independent owners, poses and editing orders without an ending or transformation being invented',()=>{
  const maria=plan('sh2_maria_final_manifestation_033'),mary=plan('sh2_mary_final_manifestation_034');assert.notEqual(maria.recipeId,mary.recipeId);
  for(const [p,prefix] of [[maria,'sh2-maria-final-'],[mary,'sh2-mary-final-']]){
    assert.ok(p.steps.every(b=>b.attacker.pose.startsWith(prefix)&&b.attacker.x===0&&b.attacker.y===0));
    assert.ok(p.steps.every(b=>!/(transform|james|ending|bed-spawn)/.test(b.attacker.pose)));
    for(const key of KEYS)assert.ok(lorePresentation(actor(p.ownerId),key).poseIntent.startsWith(prefix));
  }
  assert.ok(maria.steps[1].attacker.pose.includes('moth'));assert.ok(mary.steps[1].attacker.pose.includes('tail'));
  assert.notDeepEqual(maria.steps.map(b=>b.attacker.pose),mary.steps.map(b=>b.attacker.pose));
});

test('Bottom keeps its three heads and two hands while the New Type retains only its already equipped club',()=>{
  const id='sh4_bottom_065',bottom=plan(id),gum=plan('sh4_gum_head_new_type_058');
  assert.ok(bottom.steps.every(b=>b.attacker.pose.startsWith('sh4-bottom-three-head-')&&!/(point|twin|coat)/.test(b.attacker.pose)));
  assert.ok(bottom.steps.some(b=>b.attacker.pose.endsWith('dive')));
  for(const patch of [{head:'two'},{limbs:4},{kind:'humanoid'},{weapon:'club'}]){
    const a={...actor(id),data:{...fighter(id),visual:{...fighter(id).visual,...patch}}};assert.equal(plan(id,'signature',{attacker:a}).allowed,false);assert.equal(lorePresentation(a,'intro').authored,false);
  }
  assert.ok(gum.steps.every(b=>b.attacker.pose.startsWith('sh4-gum-new-club-')&&!/(steal|candle|old-type)/.test(b.attacker.pose)));
  for(const weapon of [null,'pipe','pistol']){const a={...actor(gum.ownerId),data:{...fighter(gum.ownerId),visual:{...fighter(gum.ownerId).visual,weapon}}};assert.equal(plan(gum.ownerId,'signature',{attacker:a}).allowed,false);}
});

test('Cynthia keeps the bound target standing without swapping sides, throwing it down or inventing a turnstile',()=>{
  for(const type of ['signature','nightmare']){
    const p=plan('sh4_cynthia_velasquez_victim_16',type);assert.ok(p.steps.every(b=>b.target.x===0&&b.target.y===0));
    assert.ok(p.steps.some(b=>b.target.pose==='standing-bound'&&b.target.alpha===1));assert.ok(p.steps.every(b=>!/(fall|throw|teleport|turnstile|wall)/.test(b.target.pose)));
    for(let n=0;n<p.duration;n++){const s=sampleLoreCinematic(p,n,{distance:200,direction:-1});assert.equal(Math.abs(s.target.x),0);assert.equal(Math.abs(s.target.y),0);}
  }
});

test('new timelines reject borrowed identities, altered body classes and unsupported airborne or giant targets',()=>{
  for(const [id] of SUBJECTS){
    for(const data of [{...fighter(id),source:'borrowed-work'},{...fighter(id),visual:{...fighter(id).visual,kind:'fox'}}]){
      const a={...actor(id),data};assert.equal(plan(id,'signature',{attacker:a}).allowed,false,id);assert.equal(lorePresentation(a,'intro').authored,false,id);
    }
    for(const targetId of ['sh1_air_screamer_001','sh3_closer_036'])assert.equal(plan(id,'signature',{target:actor(targetId,1)}).allowed,false,id);
  }
});

function engine(id,stageId){
  globalThis.window={};globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
  Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;
  const gradient=()=>({addColorStop(){}}),ctx=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient},{get:(t,k)=>k in t?t[k]:()=>{}});
  const e=new FightEngine({getContext:()=>ctx},{p1:fighter(id),p2:fighter('sh2_bubble_head_nurse_024'),stage:stage(stageId),mode:'local',roundsToWin:2,timeLimit:99,seed:2628,
    stageTerrain:false,stageHazards:false,stageDirector:false,otherworldShift:false,fatalities:true,stageFatalities:false});engines.add(e);return e;
}
function ticks(e,n){for(let i=0;i<n;i++)e.update();}
function knockout(e,type='signature'){const t=e.actors[1];t.health=0;t.lastHit={attackerIndex:0,isSuper:type==='nightmare',environmental:false};e.resolveKnockouts();}

test('sixteen real deciding edits recover the first round, keep pause clocks and produce exactly one final result',()=>{
  for(const [id,recipe,stageId] of SUBJECTS)for(const type of ['signature','nightmare']){
    const e=engine(id,stageId);ticks(e,e.phaseTimer);knockout(e,type);assert.equal(e.phase,'roundEnd');assert.equal(e.fatality,null);assert.equal(e.actors[0].roundWins,1);
    ticks(e,e.phaseTimer);ticks(e,e.phaseTimer);assert.equal(e.phase,'fight');assert.ok(e.actors.every(a=>a.health===a.maxHealth&&!a.presentation));
    const resources=e.actors.map(a=>[a.ammo,a.meter,a.guard,a.stats.damageDealt]);knockout(e,type);assert.equal(e.phase,'fatality',id);assert.equal(e.fatality.choreography.recipeId,recipe);
    ticks(e,51);const frame=e.fatality.sample.frame;e.togglePause(true);ticks(e,13);assert.equal(e.fatality.sample.frame,frame);e.togglePause(false);e.update();assert.equal(e.fatality.sample.frame,frame+1);
    assert.equal(e.actors[0].data.id,id);assert.equal(e.actors.length,2);assert.equal(e.projectiles.length,0);assert.deepEqual(e.actors.map(a=>[a.ammo,a.meter,a.guard,a.stats.damageDealt]),resources);
    ticks(e,e.fatality.timer);assert.equal(e.phase,'roundEnd');assert.equal(e.actors[0].roundWins,2);assert.equal(e.actors[0].stats.fatalities,1);assert.equal(e.actors[1].health,0);ticks(e,9);assert.equal(e.actors[1].health,0);assert.equal(e.actors[0].stats.fatalities,1);
    e.destroy();engines.delete(e);
  }
});

test('ten actual missed shots carry Cybils disarmed result through both rounds and full retry alone restores her armed intro',()=>{
  const e=engine(CYBIL,'lakeside_amusement');ticks(e,e.phaseTimer);const [a,t]=e.actors;a.x=110;t.x=1150;
  for(let count=0;count<10;count++){assert.equal(e.beginAttack(a,'neutralSpecial'),true);ticks(e,70);}
  assert.equal(a.ammo,0);assert.equal(a.weaponDiscarded,true);assert.equal(t.health,t.maxHealth);
  knockout(e);assert.equal(e.phase,'roundEnd');assert.match(a.presentation.lore.poseIntent,/cybil-unarmed/);ticks(e,e.phaseTimer);ticks(e,e.phaseTimer);
  assert.equal(e.phase,'fight');assert.equal(a.ammo,0);assert.equal(a.weaponDiscarded,true);knockout(e);assert.equal(e.phase,'roundEnd');assert.equal(e.fatality,null);assert.equal(a.stats.fatalities,0);assert.equal(a.roundWins,2);assert.match(e.lastCinematicBlock.reason,/pistolet/);
  assert.match(a.presentation.lore.poseIntent,/cybil-unarmed/);e.resetMatch();assert.equal(a.ammo,10);assert.equal(a.weaponDiscarded,false);assert.match(a.presentation.lore.poseIntent,/cybil-armed-pistol-entry/);
});

test('actual low-health disarming keeps the remaining ammunition and blocks the armed ending after healing',()=>{
  const e=engine(CYBIL,'lakeside_amusement');ticks(e,e.phaseTimer);const a=e.actors[0];a.health=a.maxHealth*.5;e.update();assert.equal(a.weaponDiscarded,false);
  a.health-=1;e.update();assert.equal(a.weaponDiscarded,true);assert.equal(a.ammo,10);a.health=a.maxHealth;
  assert.equal(loreFinisher({attacker:a,target:e.actors[1],stage:e.stage,definition:a.data.fatalities[0]}).allowed,false);
  assert.equal(e.beginTaunt(a),false,'real discard recovery still owns the actor');ticks(e,a.phaseLock+1);
  assert.equal(e.beginTaunt(a),true);assert.match(a.presentation.lore.poseIntent,/cybil-unarmed/);assert.equal(a.ammo,10);
});
