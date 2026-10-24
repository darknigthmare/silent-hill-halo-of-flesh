import test from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,CHRONICLES} from '../src/data.js';
import {combatReferencePolicy} from '../src/combat-reference-policy.js';
import {CHRONICLE_ENCOUNTER_FORMAT,chronicleEncounterPlan,createRun,validateRun,saveRun,loadRun,resumeRun,settleRun,runCombatBlockers} from '../src/run-progress.js';
import {KEYS,MEMORY_SCHEMA,importMemory} from '../src/save-store.js';
const playerId=ROSTER.find(f=>combatReferencePolicy(f).combatEnabled).id;
const fighter=id=>ROSTER.find(f=>f.id===id);
const newRun=routeId=>createRun({mode:'chronicle',playerId,routeId,seed:1187});
class Memory {constructor(){this.data=new Map();this.writes=0;}getItem(k){return this.data.get(k)??null;}setItem(k,v){this.writes++;this.data.set(k,v);}removeItem(k){this.data.delete(k);}}
function legacyRun(routeId) {
  // A synthetic old checkpoint must remain constructible even when today's
  // policy leaves its entire original route as reference dossiers.
  const route=CHRONICLES.find(r=>r.id===routeId),run=newRun('room_21');run.routeId=routeId;
  delete run.chronicleFormat;delete run.chapterIndices;delete run.referenceDossiers;
  run.queue=[...route.fighters];run.stages=route.fighters.map((_,i)=>route.stages[i%route.stages.length]);
  return run;
}

test('chronicle projections preserve every chapter while only routes with a compatible encounter create runs',()=>{
  let dossiers=0;const archiveOnly=[];
  for(const route of CHRONICLES){
    const before=structuredClone(route),plan=chronicleEncounterPlan(route.id);
    assert.equal(plan.chronicleFormat,CHRONICLE_ENCOUNTER_FORMAT);
    const chapters=route.fighters.map((id,i)=>({id,i,stage:route.stages[i%route.stages.length],policy:combatReferencePolicy(fighter(id))}));
    const active=chapters.filter(chapter=>chapter.policy.combatEnabled),inactive=chapters.filter(chapter=>!chapter.policy.combatEnabled);
    assert.deepEqual(plan.queue,active.map(chapter=>chapter.id),route.id);
    assert.deepEqual(plan.chapterIndices,active.map(chapter=>chapter.i),route.id);
    assert.deepEqual(plan.stages,active.map(chapter=>chapter.stage),route.id);
    assert.deepEqual(plan.referenceDossiers,inactive.map(chapter=>({chapterIndex:chapter.i,fighterId:chapter.id,stageId:chapter.stage,role:chapter.policy.role})),route.id);
    assert.equal(plan.queue.length+plan.referenceDossiers.length,route.fighters.length);
    if(active.length){
      const run=newRun(route.id);assert.ok(validateRun(run),route.id);
      for(const key of Object.keys(plan))assert.deepEqual(run[key],plan[key],route.id+'/'+key);
      assert.deepEqual(runCombatBlockers(run),[]);
    }else{
      archiveOnly.push(route.id);assert.equal(plan.referenceDossiers.length,route.fighters.length);
      assert.throws(()=>newRun(route.id),/ne possède pas encore de rencontre combattante compatible.*dossiers consultables/,route.id);
    }
    assert.deepEqual(route,before,'the archive route is not edited');dossiers+=plan.referenceDossiers.length;
  }
  assert.deepEqual(archiveOnly,['harry_ice','maya_villa']);
  assert.equal(dossiers,10,'the existing seven dossiers and three newly excluded pursuit chapters remain explicit');
});

test('archive-only projections cannot become empty runs or overwrite an existing checkpoint during save/import',()=>{
  for(const routeId of ['harry_ice','maya_villa']){
    const memory=new Memory(),saved=newRun('room_21');saveRun(saved,memory);
    const before=new Map(memory.data),writes=memory.writes;
    assert.throws(()=>newRun(routeId),/dossiers consultables/);
    const empty={...saved,routeId,...chronicleEncounterPlan(routeId)};
    assert.equal(validateRun(empty),false,'an archive projection is not a played or pending fight');
    assert.equal(saveRun(empty,memory),null);
    assert.throws(()=>importMemory({schema:MEMORY_SCHEMA,entries:{[KEYS.run]:empty}},memory,{[KEYS.run]:validateRun}));
    assert.deepEqual(memory.data,before);assert.equal(memory.writes,writes);
  }
});

test('old pursuit-route checkpoints remain readable and blocked without dropping chapters or fabricating wins',()=>{
  for(const routeId of ['harry_ice','maya_villa']){
    const memory=new Memory(),old=legacyRun(routeId);assert.equal(validateRun(old),true);saveRun(old,memory);
    const before=memory.getItem(KEYS.run),writes=memory.writes,loaded=loadRun(memory);
    assert.deepEqual(loaded,old);assert.equal(memory.writes,writes);assert.equal(memory.getItem(KEYS.run),before);
    const expected=CHRONICLES.find(r=>r.id===routeId).fighters.map(fighterId=>({fighterId,role:'scripted-encounter'}));
    assert.deepEqual(runCombatBlockers(loaded),expected);
    const resumed=resumeRun(loaded);assert.deepEqual(resumed.queue,old.queue);assert.equal(resumed.index,0);assert.equal(resumed.wins,0);assert.deepEqual(resumed.results,[]);
    assert.equal(memory.getItem(KEYS.run),before);assert.equal(memory.writes,writes);
  }
});

test('the filtered chapter keeps its original arena instead of rotating the stage list again after a skipped dossier',()=>{
  const route=CHRONICLES.find(r=>r.id==='book_elements'),run=newRun(route.id);
  for(let i=0;i<run.queue.length;i++)assert.equal(run.stages[i],route.stages[run.chapterIndices[i]%route.stages.length]);
  assert.ok(run.referenceDossiers.length===2);
  assert.ok(run.referenceDossiers.every(d=>!run.chapterIndices.includes(d.chapterIndex)));
});

test('format, queue, chapter indices and every dossier field are validated as one complete route projection',()=>{
  const run=newRun('room_21');
  const changes=[
    r=>{r.chronicleFormat='reference-encounters-v2';},r=>{r.chronicleFormat=null;},
    r=>{delete r.chronicleFormat;},r=>{delete r.chapterIndices;},r=>{delete r.referenceDossiers;},
    r=>{r.chapterIndices[0]+=1;},r=>{r.referenceDossiers=[];},r=>{r.referenceDossiers[0].chapterIndex=0;},
    r=>{r.referenceDossiers[0].fighterId=r.playerId;},r=>{r.referenceDossiers[0].role='combatant';},
    r=>{r.referenceDossiers[0].stageId=r.stages[0];},r=>{r.referenceDossiers[0].claimedVictory=true;},
    r=>{r.queue.reverse();},r=>{r.stages.reverse();},
    r=>{r.queue.push(r.referenceDossiers[0].fighterId);r.stages.push(r.referenceDossiers[0].stageId);r.chapterIndices.push(r.referenceDossiers[0].chapterIndex);r.referenceDossiers=[];},
    r=>{r.mode='arcade';}
  ];
  for(const change of changes){const copy=structuredClone(run);change(copy);assert.equal(validateRun(copy),false,String(change));}
  const unchanged=structuredClone(run);unchanged.referenceDossiers=unchanged.referenceDossiers.map(({role,stageId,fighterId,chapterIndex})=>({role,stageId,fighterId,chapterIndex}));
  assert.equal(validateRun(unchanged),true,'ordinary JSON object key order is not significant');
});

test('tampered route metadata is refused before an import changes any stored checkpoint',()=>{
  const memory=new Memory(),saved=newRun('book_elements');saveRun(saved,memory);const before=new Map(memory.data),writes=memory.writes;
  const bad=structuredClone(saved);bad.referenceDossiers[0].role='combatant';
  assert.throws(()=>importMemory({schema:MEMORY_SCHEMA,entries:{[KEYS.run]:bad}},memory,{[KEYS.run]:validateRun}));
  assert.deepEqual(memory.data,before);assert.equal(memory.writes,writes);
});

test('old complete-route checkpoints remain readable and preserve progress without becoming a new format',()=>{
  const memory=new Memory(),old=legacyRun('room_21');
  old.index=1;old.wins=1;old.results=[{index:0,won:true,stats:{healthRatio:.63,maxCombo:4}}];
  assert.equal(validateRun(old),true);saveRun(old,memory);const serialized=memory.getItem(KEYS.run),writes=memory.writes;
  const loaded=loadRun(memory);assert.deepEqual(loaded,old);assert.equal(memory.writes,writes);assert.equal(memory.getItem(KEYS.run),serialized);
  assert.ok(!Object.hasOwn(loaded,'chronicleFormat'));assert.equal(loaded.wins,1);assert.equal(loaded.index,1);
  assert.deepEqual(runCombatBlockers(loaded),[{fighterId:'sh4_sacrificed_walter_071',role:'scripted-encounter'}]);
  const resumed=resumeRun(loaded);assert.deepEqual(resumed.queue,old.queue);assert.equal(resumed.wins,old.wins);assert.equal(resumed.index,old.index);
  assert.equal(memory.getItem(KEYS.run),serialized,'checking whether a run can start never rewrites storage');
});

test('old route shape cannot masquerade as the new format and a filtered queue cannot masquerade as an old save',()=>{
  const old=legacyRun('room_21'),fresh=newRun('room_21');
  assert.equal(validateRun({...old,chronicleFormat:fresh.chronicleFormat,chapterIndices:fresh.chapterIndices,referenceDossiers:fresh.referenceDossiers}),false);
  const disguised=structuredClone(fresh);delete disguised.chronicleFormat;delete disguised.chapterIndices;delete disguised.referenceDossiers;
  assert.equal(validateRun(disguised),false);
  const unchangedLegacy=legacyRun('fog_of_alessa');assert.equal(validateRun(unchangedLegacy),true);
});

test('dossiers never award a victory, alter records or advance a chapter on their own',()=>{
  const run=newRun('book_elements'),before=structuredClone(run);
  assert.ok(run.referenceDossiers.length);chronicleEncounterPlan(run.routeId);runCombatBlockers(run);assert.deepEqual(run,before);
  const result={winnerIndex:0,stats:{winner:{healthRatio:.8,maxCombo:3},loser:{}},snapshot:{p1:{meter:40}}};
  const settled=settleRun(run,result);assert.equal(settled.wins,1);assert.equal(settled.results.length,1);
  assert.deepEqual(settled.referenceDossiers,before.referenceDossiers);
  const resumed=resumeRun(settled);assert.equal(resumed.index,1);assert.equal(resumed.chapterIndices[1],before.chapterIndices[1]);
});
