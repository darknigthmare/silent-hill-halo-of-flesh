import test, {afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,STAGES,createCombatProfile} from '../src/data.js';
import {FIGHTER_REFERENCES} from '../src/production-reference.js';
import {FightEngine} from '../src/fight.js';
import {loreFinisher,lorePresentation,sampleLorePresentation,sampleLoreCinematic,cinematicSummary,LORE_CINEMATIC_COVERAGE} from '../src/lore-cinematics.js';

const IDs=['sh1_grey_child_005','sh1_mumbler_006','sh1_romper_010','sh3_closer_036','sh3_nurse_revolver_044','sh4_patient_060','downpour_screamer_104','downpour_prisoner_juggernaut_110','downpour_bogeyman_115'];
const fighter=id=>{const f=ROSTER.find(f=>f.id===id);assert.ok(f,id);return f;};
const actor=(id,index=0)=>({data:fighter(id),profile:createCombatProfile(fighter(id)),index,x:index?720:500,y:594,grounded:true,facing:index?-1:1});
const target=()=>actor('sh2_bubble_head_nurse_024',1);
const definition=(a,type='signature')=>a.data.fatalities.find(f=>f.type===type);
function viable(a,type='signature'){
  return STAGES.map(stage=>loreFinisher({attacker:a,target:target(),stage,definition:definition(a,type)})).find(plan=>plan.allowed);
}
const neutral={x:0,y:0,alpha:1,pose:'hold'};
const engines=new Set();
afterEach(()=>{for(const e of engines)e.destroy();engines.clear();});

test('nine new subjects have 18 exact, viable edits based on their own workbook proposals',()=>{
  const grammars=new Set();
  for(const id of IDs){
    const a=actor(id),signature=viable(a),nightmare=viable(a,'nightmare');
    assert.ok(signature?.allowed,id);assert.ok(nightmare?.allowed,id);
    assert.equal(signature.id,id+'_signature');assert.equal(signature.ownerId,id);
    assert.equal(signature.source,a.data.source);
    assert.equal(signature.description,FIGHTER_REFERENCES[id].proposals.finisher.description);
    assert.equal(signature.artStatus,'contextual-images-missing');
    assert.equal(signature.fidelity,'original-versus-staging');
    assert.equal(nightmare.steps.length,signature.steps.length+1);
    assert.notDeepEqual(signature.steps,nightmare.steps);
    assert.deepEqual(cinematicSummary(signature.id).beats.map(b=>b.attackerPose),signature.steps.map(b=>b.attacker.pose));
    grammars.add(signature.recipeId);
    for(const p of [signature,nightmare]){
      assert.equal(p.steps[0].from,0);assert.equal(p.steps.at(-1).to,p.duration);
      const end=sampleLoreCinematic(p,p.duration+100);
      assert.equal(end.complete,true);assert.equal(end.frame,p.duration-1);
    }
  }
  assert.equal(grammars.size,9,'different capacities are not one generic edit under nine names');
  assert.equal(LORE_CINEMATIC_COVERAGE.animatedImagesCreated,0);
});

test('the crawling SH2 form keeps a prone percussion edit without the standing form acid exhalation',()=>{
  const crawling=viable(actor('sh2_lying_figure_crawling_021')),standing=viable(actor('sh2_lying_figure_020'));
  assert.ok(crawling?.allowed&&standing?.allowed);
  assert.notEqual(crawling.recipeId,standing.recipeId);
  assert.ok(crawling.steps.every(step=>step.attacker.y===0&&step.attacker.pose.startsWith('prone-')));
  assert.ok(crawling.steps.every(step=>!['spray','mist'].includes(step.effect)));
  assert.ok(!crawling.steps.some(step=>/spray|inhale|exhal|souffle/i.test(step.attacker.pose+' '+step.label)));
  assert.ok(standing.steps.some(step=>step.effect==='spray'));
});

test('low grips, pins and heavy holds reject flying or oversized targets',()=>{
  for(const id of IDs){
    const a=actor(id),stage=STAGES.find(s=>loreFinisher({attacker:a,target:target(),stage:s,definition:definition(a)}).allowed);
    for(const targetId of ['sh1_air_screamer_001','sh3_closer_036']){
      const plan=loreFinisher({attacker:a,target:actor(targetId,1),stage,definition:definition(a)});
      assert.equal(plan.allowed,false,`${id} cannot reuse its standing-body edit on ${targetId}`);
      assert.match(plan.reason,/Anatomie|portée corporelle/);
    }
  }
});

test('door, bedside and barred edits require real reviewed props and cannot borrow an unrelated location',()=>{
  const required=IDs.filter(id=>!['sh1_romper_010','downpour_screamer_104','downpour_bogeyman_115'].includes(id));
  for(const id of required){
    const a=actor(id),stage=STAGES.find(s=>loreFinisher({attacker:a,target:target(),stage:s,definition:definition(a)}).allowed);
    const options={attacker:a,target:target(),stage,definition:definition(a)};
    assert.equal(loreFinisher({...options,stage:{...stage,props:[],layers:[]}}).allowed,false,id);
    assert.equal(loreFinisher({...options,stage:{...stage,source:'film'}}).allowed,false,id);
    assert.equal(loreFinisher({...options,stage:{...stage,reference:{...stage.reference,blocked:true}}}).allowed,false,id);
  }
});

test('knife, revolver, club and hammer edits retain their exact equipment and subject edition',()=>{
  for(const id of ['sh1_grey_child_005','sh3_nurse_revolver_044','sh4_patient_060','downpour_bogeyman_115']){
    const a=actor(id),stage=STAGES.find(s=>loreFinisher({attacker:a,target:target(),stage:s,definition:definition(a)}).allowed);
    const options={attacker:a,target:target(),stage,definition:definition(a)};
    a.data={...a.data,visual:{...a.data.visual,weapon:'spear'}};
    assert.equal(loreFinisher(options).allowed,false,id);
    assert.equal(lorePresentation(a,'intro').authored,false,id);
    const other=actor(id);other.data={...other.data,source:'film'};
    assert.equal(loreFinisher({...options,attacker:other}).allowed,false,id);
    assert.equal(lorePresentation(other,'intro').authored,false,id);
  }
});

test('63 new presentation tracks preserve the precise proposal, body, context and reversible round result',()=>{
  const keys=['intro','taunt','winRound','loseRound','winMatch','loseMatch','outro'];
  const expectedProposal=key=>({winRound:'winRound1',loseRound:'loseRound1'}[key]||key);
  let total=0;
  for(const id of IDs){
    const a=actor(id);
    for(const key of keys){
      const lore=lorePresentation(a,key);
      assert.equal(lore.authored,true,`${id}/${key}`);
      assert.equal(lore.ownerId,id);assert.equal(lore.source,a.data.source);
      assert.equal(lore.clipKey,`${key}@${id}:${expectedProposal(key)}`);
      assert.equal(lore.description,FIGHTER_REFERENCES[id].proposals[expectedProposal(key)].description);
      assert.equal(lore.reversible,['taunt','winRound','loseRound'].includes(key));
      assert.equal(lore.artStatus,'contextual-images-missing');
      assert.equal(lore.timingProvenance,'original-versus-ticks');assert.ok(lore.poseIntent);
      total++;
    }
    for(const progress of [0,.25,.5,.75,1]){
      const sample=sampleLorePresentation(a,{key:'loseRound',progress,lore:lorePresentation(a,'loseRound')});
      assert.equal(sample.y,0);assert.equal(sample.alpha,1);
      if(progress===1)assert.ok(Math.abs(sample.x)<1e-9,`${id} is ready for the next round`);
    }
    assert.equal(lorePresentation(a,'super').authored,false);
  }
  assert.equal(total,63);
});

test('four-support landing differs from grounded entry and presentation sampling never changes gameplay state',()=>{
  const romper=actor('sh1_romper_010'),child=actor('sh1_grey_child_005');
  const sample=(a,key,progress)=>sampleLorePresentation(a,{key,progress,lore:lorePresentation(a,key)});
  assert.ok(sample(romper,'intro',.2).y<0);assert.equal(sample(child,'intro',.2).y,0);
  assert.notEqual(sample(romper,'intro',.2).pose,sample(child,'intro',.2).pose);
  for(const id of IDs){
    const a=actor(id),original=structuredClone(a);
    for(const key of ['intro','taunt','loseRound','outro'])for(const progress of [0,.4,1])sample(a,key,progress);
    assert.deepEqual(a,original);
    a.profile.referencePolicy={...a.profile.referencePolicy,canMove:false,canJump:false};
    for(const key of ['intro','loseRound','outro']){
      const state=sample(a,key,.4);assert.equal(state.x,0);assert.equal(state.y,0);
    }
    const forged={...a,data:{...a.data,source:'film'}};
    assert.deepEqual(sampleLorePresentation(forged,{key:'intro',progress:.4,lore:lorePresentation(a,'intro')}),neutral);
  }
});

function engine(roundsToWin){
  globalThis.window={};globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};
  globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
  Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});
  globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;
  const gradient=()=>({addColorStop(){}});
  const ctx=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient},{get:(target,key)=>key in target?target[key]:()=>{}});
  const e=new FightEngine({getContext:()=>ctx},{p1:fighter('downpour_bogeyman_115'),p2:fighter('sh2_bubble_head_nurse_024'),stage:STAGES.find(s=>s.id==='midwich'),
    mode:'local',roundsToWin,timeLimit:99,seed:952,stageHazards:false,stageDirector:false,otherworldShift:false,fatalities:true,stageFatalities:false});
  engines.add(e);for(let n=e.phaseTimer;n>0;n--)e.update();assert.equal(e.phase,'fight');return e;
}

test('a new hammer edit plays only at the deciding victory and its shared clock freezes on pause',()=>{
  const intermediate=engine(2),[a,b]=intermediate.actors;
  b.health=0;b.lastHit={attackerIndex:0,isSuper:false,environmental:false};intermediate.resolveKnockouts();
  assert.equal(intermediate.phase,'roundEnd');assert.equal(intermediate.fatality,null);
  assert.equal(a.presentation.key,'winRound');assert.equal(b.presentation.key,'loseRound');
  assert.equal(a.presentation.reversible,true);assert.equal(b.presentation.reversible,true);
  const final=engine(1),[winner,loser]=final.actors;
  loser.health=0;loser.lastHit={attackerIndex:0,isSuper:false,environmental:false};final.resolveKnockouts();
  assert.equal(final.phase,'fatality');assert.equal(final.fatality.choreography.recipeId,'hammerSentence');
  for(let n=0;n<48;n++)final.update();const frame=final.fatality.sample.frame;
  final.togglePause(true);for(let n=0;n<9;n++)final.update();assert.equal(final.fatality.sample.frame,frame);
  final.togglePause(false);final.update();assert.equal(final.fatality.sample.frame,frame+1);
  assert.equal(winner.data.visual.weapon,'hammer');assert.equal(final.projectiles.length,0);
});
