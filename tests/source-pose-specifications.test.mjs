import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {ROSTER} from '../src/data.js';
import {combineResearch,buildProductionPlan,CORE_POSES} from '../scripts/build-production-plan.mjs';
import {LOT9_SOURCE_POSE_SPECIFICATIONS as SOURCE_POSE_SPECIFICATIONS,sourcePoseSpecification} from '../scripts/source-pose-specifications.mjs';

const research=combineResearch(await Promise.all(['classic','extended'].map(async name=>
  JSON.parse(await readFile(new URL(`../docs/production/research/${name}.json`,import.meta.url))))));
const refs=new Map(research.fighters.map(row=>[row.id,row]));
const fighters=new Map(ROSTER.map(row=>[row.id,row]));

test('thirty source-specific briefs cover six exact identities and five existing core-pose slots each',()=>{
  assert.equal(SOURCE_POSE_SPECIFICATIONS.length,30);
  assert.equal(new Set(SOURCE_POSE_SPECIFICATIONS.map(row=>row.rowId)).size,30);
  const ids=[...new Set(SOURCE_POSE_SPECIFICATIONS.map(row=>row.fighterId))];
  assert.equal(ids.length,6);
  for(const id of ids){
    const rows=SOURCE_POSE_SPECIFICATIONS.filter(row=>row.fighterId===id);
    assert.deepEqual(rows.map(row=>row.pose),['idle','walk','hurt','knockdown','phase']);
    for(const row of rows){
      assert.equal(row.rowId,`${id}:pose:${row.pose}`);
      assert.ok(CORE_POSES.includes(row.pose));
      assert.equal(sourcePoseSpecification(fighters.get(id),refs.get(id),row.pose),row);
      assert.ok(row.evidence.length&&row.evidence.every(ref=>research.sources.some(source=>source.id===ref)));
      assert.match(row.description,/Spécification documentaire à produire/);
      assert.ok(row.basis.length>40&&row.limits.length>40);
    }
  }
});

test('pose briefs cannot cross identity, source, role, edition or evidence ownership boundaries',()=>{
  for(const row of SOURCE_POSE_SPECIFICATIONS){
    const fighter=fighters.get(row.fighterId),reference=refs.get(row.fighterId);
    for(const changed of [{...reference,id:'sh2_mannequin_022'},
      {...reference,source:'bom'},
      {...reference,referenceEdition:row.edition+' remake'},
      {...reference,combatRole:'unverified'},
      {...reference,referenceIds:reference.referenceIds.join(', ')},
      {...reference,referenceIds:null},
      {...reference,referenceIds:reference.referenceIds.filter(id=>id!==row.evidence[0])}]){
      assert.equal(sourcePoseSpecification(fighter,changed,row.pose),null);
    }
    assert.equal(sourcePoseSpecification({...fighter,source:'bom'},reference,row.pose),null);
    assert.equal(sourcePoseSpecification({...fighter,id:'__proto__'},reference,row.pose),null);
    assert.equal(sourcePoseSpecification(fighter,reference,'constructor'),null);
    assert.equal(sourcePoseSpecification(fighter,reference,'jump'),null);
  }
  assert.equal(sourcePoseSpecification(null,null,'idle'),null);
});

test('the final plan receives all thirty descriptions without certifying or producing any core pose',()=>{
  const plan=buildProductionPlan(research);
  assert.equal(plan.poses.length,2300);
  for(const brief of SOURCE_POSE_SPECIFICATIONS){
    const row=plan.poses.find(row=>row.id===brief.rowId);
    assert.equal(row.description,brief.description,brief.rowId);
    assert.equal(row.edition,brief.edition);
    assert.equal(row.status,'Adaptation à valider sur références');
    assert.notEqual(row.productionStatus,'Validé');
    assert.ok(brief.evidence.every(id=>row.referenceIds.split(/\s*,\s*/).includes(id)));
  }
  assert.equal(plan.metrics.certifiedOneToOne,0);
  assert.equal(plan.metrics.measuredSourceMoves,0);
  assert.ok(plan.moves.every(row=>['sourceFrameRate','sourceStart','sourceImpact','sourceEnd'].every(key=>row[key]==='')));
});

test('the briefs preserve the actor-specific supports and distinguish missing recovery from source death',()=>{
  const text=(id,pose)=>SOURCE_POSE_SPECIFICATIONS.find(row=>row.rowId===`${id}:pose:${pose}`).description;
  assert.match(text('sh1_air_screamer_001','knockdown'),/abattre l’oiseau et l’achever ensuite/);
  assert.match(text('sh1_hanged_scratcher_011','knockdown'),/knockdown récupérable.*chute tardive après mort/);
  assert.match(text('sh1_hanged_scratcher_011','phase'),/derni[èe]r appui inférieur.*première prise supérieure/);
  assert.match(text('sh3_pendulum_039','walk'),/grandes lames latérales servant d’appuis/);
  assert.match(text('sh3_pendulum_039','hurt'),/ne certifie pas une immunité générale/);
  assert.match(text('sh4_twin_victim_059','idle'),/deux têtes voisines.*manteau sombre/);
  assert.match(text('sh4_patient_060','knockdown'),/sol horizontal et glissade d’escalier/);
  assert.match(text('sh4_patient_060','hurt'),/continuité de la main armée/);
  assert.match(text('sh4_bottom_065','idle'),/troisième inversée sous le torse/);
  assert.match(text('sh4_bottom_065','phase'),/ni pose de pointage ou transformation/);
});

test('the lot9 delivery ledger names exactly the same thirty specified Excel rows and evidence',async()=>{
  const ledger=JSON.parse(await readFile(new URL('../docs/production/batches/lot9-poses.json',import.meta.url)));
  assert.equal(ledger.schema,1);assert.equal(ledger.batch,'lot9');assert.equal(ledger.workstream,'poses');
  assert.equal(ledger.baseCommit,'98ccc47a4c26bd05fd90b2751705730783ef8eaa');
  assert.equal(ledger.requestedItems,30);assert.equal(ledger.items.length,30);
  assert.deepEqual(ledger.items.map(row=>row.rowId),SOURCE_POSE_SPECIFICATIONS.map(row=>row.rowId));
  for(const [index,item] of ledger.items.entries()){
    const brief=SOURCE_POSE_SPECIFICATIONS[index];
    assert.equal(item.collection,'poses');assert.equal(item.entityId,brief.fighterId);assert.equal(item.status,'specified');
    assert.deepEqual(item.evidence,brief.evidence);
    assert.deepEqual(item.artifacts,['scripts/source-pose-specifications.mjs','scripts/build-production-plan.mjs']);
    assert.ok(item.limits.includes(brief.limits));
    assert.equal(item.field,'description');assert.equal(item.description,brief.description);
  }
});
