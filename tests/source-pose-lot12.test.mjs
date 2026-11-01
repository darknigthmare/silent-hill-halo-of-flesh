import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {ROSTER} from '../src/data.js';
import {combineResearch,buildProductionPlan} from '../scripts/build-production-plan.mjs';
import {SOURCE_POSE_SPECIFICATIONS,LOT9_SOURCE_POSE_SPECIFICATIONS,LOT10_SOURCE_POSE_SPECIFICATIONS,
  LOT11_SOURCE_POSE_SPECIFICATIONS,LOT12_SOURCE_POSE_SPECIFICATIONS,sourcePoseSpecification} from '../scripts/source-pose-specifications.mjs';
const research=combineResearch(await Promise.all(['classic','extended'].map(async name=>JSON.parse(await readFile(new URL(`../docs/production/research/${name}.json`,import.meta.url))))));
const references=new Map(research.fighters.map(row=>[row.id,row]));
const roster=new Map(ROSTER.map(row=>[row.id,row]));
const text=(id,pose)=>LOT12_SOURCE_POSE_SPECIFICATIONS.find(row=>row.rowId===`${id}:pose:${pose}`).description;

test('lot12 adds thirty distinct documentary briefs and preserves all ninety earlier descriptions',async()=>{
  assert.equal(LOT12_SOURCE_POSE_SPECIFICATIONS.length,30);
  const reviewed=SOURCE_POSE_SPECIFICATIONS.filter(row=>['lot9','lot10','lot11','lot12'].includes(row.batch));
  assert.equal(reviewed.length,120);assert.equal(new Set(reviewed.map(row=>row.rowId)).size,120);
  for(const [batch,specs] of [['lot9',LOT9_SOURCE_POSE_SPECIFICATIONS],['lot10',LOT10_SOURCE_POSE_SPECIFICATIONS],['lot11',LOT11_SOURCE_POSE_SPECIFICATIONS]]){
    const ledger=JSON.parse(await readFile(new URL(`../docs/production/batches/${batch}-poses.json`,import.meta.url)));
    assert.deepEqual(specs.map(row=>[row.rowId,row.description]),ledger.items.map(row=>[row.rowId,row.description]));
  }
  const ids=[...new Set(LOT12_SOURCE_POSE_SPECIFICATIONS.map(row=>row.fighterId))];
  assert.equal(ids.length,6);
  for(const id of ids)assert.deepEqual(LOT12_SOURCE_POSE_SPECIFICATIONS.filter(row=>row.fighterId===id).map(row=>row.pose),['idle','walk','hurt','knockdown','phase']);
});

test('brief lookup binds exact subject edition evidence and source role including stationary Twinfeeler',()=>{
  for(const spec of LOT12_SOURCE_POSE_SPECIFICATIONS){
    const fighter=roster.get(spec.fighterId),reference=references.get(spec.fighterId);
    assert.equal(sourcePoseSpecification(fighter,reference,spec.pose),spec,spec.rowId);
    assert.ok(Object.isFrozen(spec)&&Object.isFrozen(spec.evidence));
    assert.match(spec.description,/corps entier/);assert.match(spec.description,/Spécification documentaire/);
    assert.ok(spec.evidence.every(id=>research.sources.some(source=>source.id===id)));
    const wrongRole=(spec.combatRole||'combatant')==='combatant'?'stationary-boss':'combatant';
    for(const changed of [{...reference,id:'fake-id'}, {...reference,source:'film'}, {...reference,referenceEdition:spec.edition+' remake'},
      {...reference,combatRole:wrongRole}, {...reference,referenceIds:reference.referenceIds.join(', ')}, {...reference,referenceIds:reference.referenceIds.filter(id=>id!==spec.evidence[0])}]){
      assert.equal(sourcePoseSpecification(fighter,changed,spec.pose),null,spec.rowId);
    }
    assert.equal(sourcePoseSpecification({...fighter,source:'bom'},reference,spec.pose),null);
  }
  for(const spec of LOT12_SOURCE_POSE_SPECIFICATIONS.filter(row=>row.fighterId==='sh1_twinfeeler_015'))assert.equal(spec.combatRole,'stationary-boss');
});

test('pose constraints separate quadrupeds larva grounded lizard and adult moth without manufactured cycles',()=>{
  assert.match(text('sh1_groaner_003','idle'),/quatre pattes.*queue/);
  assert.match(text('sh1_groaner_003','hurt'),/interruption du bond mordu/);
  assert.match(text('sh1_wormhead_004','walk'),/tête infestée.*copier ses images/);
  assert.match(text('sh1_wormhead_004','phase'),/pas une transition anatomique/);
  assert.match(text('sh1_romper_010','walk'),/bond offensif avec maintien et long bond qui renverse sans étouffer/);
  assert.match(text('sh1_romper_010','knockdown'),/plaquage subi par Harry décrit la victime/);
  assert.match(text('sh1_split_head_014','idle'),/ne justifie pas l’ajout de deux pattes arrière/);
  assert.match(text('sh1_split_head_014','phase'),/rejet verdâtre.*projectile offensif/);
  assert.match(text('sh1_twinfeeler_015','walk'),/plaque métallique.*sortie de la plaque/);
  assert.match(text('sh1_twinfeeler_015','knockdown'),/retraite vivante/);
  assert.match(text('sh1_twinfeeler_015','phase'),/ne fournit ni cocon ni métamorphose/);
  assert.match(text('sh1_floatstinger_016','idle'),/deux paires d’ailes.*antennes/);
  assert.match(text('sh1_floatstinger_016','walk'),/Aucun cycle de pas/);
  assert.match(text('sh1_floatstinger_016','knockdown'),/mort source ne fournit ni redécollage/);
});

test('all thirty real plan rows stay unapproved with zero invented source timing or one-to-one certification',()=>{
  const plan=buildProductionPlan(research);
  for(const spec of LOT12_SOURCE_POSE_SPECIFICATIONS){
    const row=plan.poses.find(row=>row.id===spec.rowId);
    assert.equal(row.description,spec.description,spec.rowId);assert.equal(row.edition,spec.edition);
    assert.equal(row.status,'Adaptation à valider sur références');assert.notEqual(row.productionStatus,'Validé');
  }
  assert.equal(plan.metrics.certifiedOneToOne,0);assert.equal(plan.metrics.measuredSourceMoves,0);
  assert.ok(plan.moves.every(row=>['sourceFrameRate','sourceStart','sourceImpact','sourceEnd'].every(key=>row[key]==='')));
});

test('ledger documents thirty baseline rows and no pixel or existing idle counted as new production',async()=>{
  const ledger=JSON.parse(await readFile(new URL('../docs/production/batches/lot12-poses.json',import.meta.url)));
  assert.equal(ledger.batch,'lot12');assert.equal(ledger.baseCommit,'1e6e408a3ef9d66869fdf7ce26eded06e383d12a');
  assert.equal(ledger.requestedItems,30);assert.equal(ledger.items.length,30);assert.equal(ledger.documentationOnly,true);
  assert.equal(ledger.poseImagesProduced,0);assert.equal(ledger.sourceTimingsMeasured,0);assert.equal(ledger.certifiedOneToOne,0);
  assert.equal(ledger.existingFixedIdleCandidatesCountedAsNewImages,false);
  for(const [index,item] of ledger.items.entries()){
    const spec=LOT12_SOURCE_POSE_SPECIFICATIONS[index];assert.equal(item.rowId,spec.rowId);assert.equal(item.entityId,spec.fighterId);
    assert.equal(item.status,'specified');assert.equal(item.field,'description');assert.equal(item.description,spec.description);
    assert.deepEqual(item.artifacts,['scripts/source-pose-specifications.mjs']);assert.deepEqual(item.evidence,spec.evidence);
  }
  assert.equal(ledger.sourceReview.sources.length,3);assert.equal(ledger.sourceReview.visualReferences.length,6);
});
