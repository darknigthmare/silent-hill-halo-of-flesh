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
  const route=CHRONICLES.find(r=>r.id===routeId),run=newRun(routeId);
  delete run.chronicleFormat;delete run.chapterIndices;delete run.referenceDossiers;
  run.queue=[...route.fighters];run.stages=route.fighters.map((_,i)=>route.stages[i%route.stages.length]);
  return run;
}

test('new chronicles preserve chapter order and original stage pairing while every queued role can fight',()=>{
  let dossiers=0;
  for(const route of CHRONICLES){
    const before=structuredClone(route),run=newRun(route.id);
    assert.ok(validateRun(run),route.id);assert.equal(run.chronicleFormat,CHRONICLE_ENCOUNTER_FORMAT);
    const chapters=route.fighters.map((id,i)=>({id,i,stage:route.stages[i%route.stages.length],policy:combatReferencePolicy(fighter(id))}));
    const active=chapters.filter(chapter=>chapter.policy.combatEnabled),inactive=chapters.filter(chapter=>!chapter.policy.combatEnabled);
    assert.deepEqual(run.queue,active.map(chapter=>chapter.id),route.id);
    assert.deepEqual(run.chapterIndices,active.map(chapter=>chapter.i),route.id);
    assert.deepEqual(run.stages,active.map(chapter=>chapter.stage),route.id);
    assert.deepEqual(run.referenceDossiers,inactive.map(chapter=>({chapterIndex:chapter.i,fighterId:chapter.id,stageId:chapter.stage,role:chapter.policy.role})),route.id);
    assert.equal(run.queue.length+run.referenceDossiers.length,route.fighters.length);
    assert.deepEqual(runCombatBlockers(run),[]);assert.deepEqual(route,before,'the archive route is not edited');
    dossiers+=run.referenceDossiers.length;
  }
  assert.equal(dossiers,7,'the seven existing noncombatant/reference-pending chapters remain explicit');
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
