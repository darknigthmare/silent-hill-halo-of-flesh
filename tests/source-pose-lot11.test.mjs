import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {ROSTER} from '../src/data.js';
import {combineResearch,buildProductionPlan} from '../scripts/build-production-plan.mjs';
import {SOURCE_POSE_SPECIFICATIONS,LOT9_SOURCE_POSE_SPECIFICATIONS,LOT10_SOURCE_POSE_SPECIFICATIONS,
  LOT11_SOURCE_POSE_SPECIFICATIONS,sourcePoseSpecification} from '../scripts/source-pose-specifications.mjs';

const research=combineResearch(await Promise.all(['classic','extended'].map(async name=>
  JSON.parse(await readFile(new URL(`../docs/production/research/${name}.json`,import.meta.url))))));
const references=new Map(research.fighters.map(row=>[row.id,row]));
const roster=new Map(ROSTER.map(row=>[row.id,row]));
const text=(id,pose)=>LOT11_SOURCE_POSE_SPECIFICATIONS.find(row=>row.rowId===`${id}:pose:${pose}`).description;

test('lot11 adds thirty full-body documentary rows without changing either earlier thirty-row brief set',async()=>{
  assert.equal(LOT11_SOURCE_POSE_SPECIFICATIONS.length,30);
  const reviewed=SOURCE_POSE_SPECIFICATIONS.filter(row=>['lot9','lot10','lot11'].includes(row.batch));
  assert.equal(reviewed.length,90);
  assert.equal(new Set(reviewed.map(row=>row.rowId)).size,90);
  assert.equal(new Set(SOURCE_POSE_SPECIFICATIONS.map(row=>row.rowId)).size,SOURCE_POSE_SPECIFICATIONS.length);
  for(const [batch,specs] of [['lot9',LOT9_SOURCE_POSE_SPECIFICATIONS],['lot10',LOT10_SOURCE_POSE_SPECIFICATIONS]]){
    assert.equal(specs.length,30);
    const ledger=JSON.parse(await readFile(new URL(`../docs/production/batches/${batch}-poses.json`,import.meta.url)));
    assert.deepEqual(specs.map(row=>[row.rowId,row.description]),ledger.items.map(row=>[row.rowId,row.description]));
  }
  const ids=[...new Set(LOT11_SOURCE_POSE_SPECIFICATIONS.map(row=>row.fighterId))];
  assert.equal(ids.length,6);
  for(const id of ids)assert.deepEqual(LOT11_SOURCE_POSE_SPECIFICATIONS.filter(row=>row.fighterId===id).map(row=>row.pose),['idle','walk','hurt','knockdown','phase']);
});

test('each new body brief remains bound to its exact identity source edition role and evidence',()=>{
  for(const spec of LOT11_SOURCE_POSE_SPECIFICATIONS){
    const fighter=roster.get(spec.fighterId),reference=references.get(spec.fighterId);
    assert.equal(sourcePoseSpecification(fighter,reference,spec.pose),spec);
    assert.ok(Object.isFrozen(spec)&&Object.isFrozen(spec.evidence));
    assert.ok(spec.evidence.every(id=>research.sources.some(source=>source.id===id)));
    assert.ok(spec.basis.length>40&&spec.limits.length>40);
    assert.match(spec.description,/enti[èe]r|tout le corps/);
    assert.match(spec.description,/Spécification documentaire à produire/);
    for(const changed of [{...reference,id:'sh2_lying_figure_crawling_021'},
      {...reference,source:'film'}, {...reference,referenceEdition:spec.edition+' remake'},
      {...reference,combatRole:'stationary-boss'}, {...reference,referenceIds:reference.referenceIds.join(', ')},
      {...reference,referenceIds:reference.referenceIds.filter(id=>id!==spec.evidence[0])}]){
      assert.equal(sourcePoseSpecification(fighter,changed,spec.pose),null,spec.rowId);
    }
    assert.equal(sourcePoseSpecification({...fighter,source:'bom'},reference,spec.pose),null);
  }
});

test('the plan exposes whole-body constraints without manufacturing images source timings or certified completion',()=>{
  const plan=buildProductionPlan(research);
  for(const spec of LOT11_SOURCE_POSE_SPECIFICATIONS){
    const row=plan.poses.find(row=>row.id===spec.rowId);
    assert.equal(row.description,spec.description,spec.rowId);
    assert.equal(row.edition,spec.edition);
    assert.equal(row.status,'Adaptation à valider sur références');
    assert.notEqual(row.productionStatus,'Validé');
  }
  assert.equal(plan.metrics.certifiedOneToOne,0);
  assert.equal(plan.metrics.measuredSourceMoves,0);
  assert.ok(plan.moves.every(row=>['sourceFrameRate','sourceStart','sourceImpact','sourceEnd'].every(key=>row[key]==='')));
});

test('whole bodies preserve species anatomy regional variants bound limbs and terminal recovery limits',()=>{
  assert.match(text('sh1_night_flutter_002','idle'),/deux ailes membraneuses et deux pattes/);
  assert.match(text('sh1_night_flutter_002','phase'),/ne prouve pas qu’Air Screamer se transforme/);
  assert.match(text('sh1_mumbler_006','idle'),/deux mains.*couteau de Grey Child/);
  assert.match(text('sh1_mumbler_006','phase'),/différence d’édition, pas une métamorphose/);
  assert.match(text('sh1_puppet_nurse_012','idle'),/petit couteau.*masse parasitaire dorsale/);
  assert.match(text('sh1_puppet_doctor_013','phase'),/ne prouve pas une transformation de Nurse en Doctor/);
  assert.match(text('sh2_lying_figure_020','walk'),/bras toujours emprisonnés.*fiche021/);
  assert.match(text('sh2_lying_figure_020','phase'),/dessin|rough sketch/);
  assert.match(text('sh2_creeper_025','idle'),/six pattes et ses antennes.*chaussure/);
  assert.match(text('sh2_creeper_025','knockdown'),/écrasement terminale ne fournit pas un relèvement de manche/);
  assert.match(text('sh2_creeper_025','phase'),/Ne pas importer une sensibilité lumineuse/);
});

test('the delivery ledger names the exact thirty missing briefs and counts no existing fixed idle as new artwork',async()=>{
  const ledger=JSON.parse(await readFile(new URL('../docs/production/batches/lot11-poses.json',import.meta.url)));
  assert.equal(ledger.schema,1);assert.equal(ledger.batch,'lot11');assert.equal(ledger.workstream,'poses');
  assert.equal(ledger.baseCommit,'7b9980d102dc2db385445bc20e4172c1113dda2b');
  assert.equal(ledger.requestedItems,30);assert.equal(ledger.items.length,30);
  assert.equal(ledger.documentationOnly,true);assert.equal(ledger.poseImagesProduced,0);
  assert.equal(ledger.existingFixedIdleCandidatesCountedAsNewImages,false);
  assert.equal(ledger.sourceTimingsMeasured,0);assert.equal(ledger.certifiedOneToOne,0);
  assert.deepEqual(ledger.items.map(row=>row.rowId),LOT11_SOURCE_POSE_SPECIFICATIONS.map(row=>row.rowId));
  for(const [index,item] of ledger.items.entries()){
    const spec=LOT11_SOURCE_POSE_SPECIFICATIONS[index];
    assert.equal(item.collection,'poses');assert.equal(item.entityId,spec.fighterId);assert.equal(item.status,'specified');
    assert.equal(item.field,'description');assert.equal(item.description,spec.description);
    assert.deepEqual(item.artifacts,['scripts/source-pose-specifications.mjs']);
    assert.deepEqual(item.evidence,spec.evidence);assert.ok(item.limits.includes(spec.limits));
  }
  assert.equal(ledger.sourceReview.sources.length,4);assert.equal(ledger.sourceReview.visualReferences.length,6);
});
