import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {ROSTER} from '../src/data.js';
import {combineResearch,buildProductionPlan} from '../scripts/build-production-plan.mjs';
import {SOURCE_POSE_SPECIFICATIONS,LOT9_SOURCE_POSE_SPECIFICATIONS,LOT10_SOURCE_POSE_SPECIFICATIONS,sourcePoseSpecification} from '../scripts/source-pose-specifications.mjs';

const research=combineResearch(await Promise.all(['classic','extended'].map(async name=>
  JSON.parse(await readFile(new URL(`../docs/production/research/${name}.json`,import.meta.url))))));
const refs=new Map(research.fighters.map(row=>[row.id,row]));
const roster=new Map(ROSTER.map(row=>[row.id,row]));
const text=(id,pose)=>LOT10_SOURCE_POSE_SPECIFICATIONS.find(row=>row.rowId===`${id}:pose:${pose}`).description;

test('lot10 contributes thirty new source-pose descriptions while the thirty lot9 briefs remain intact',async()=>{
  assert.equal(LOT10_SOURCE_POSE_SPECIFICATIONS.length,30);
  assert.equal(LOT9_SOURCE_POSE_SPECIFICATIONS.length,30);
  assert.equal(SOURCE_POSE_SPECIFICATIONS.length,60);
  assert.equal(new Set(SOURCE_POSE_SPECIFICATIONS.map(row=>row.rowId)).size,60);
  const old=JSON.parse(await readFile(new URL('../docs/production/batches/lot9-poses.json',import.meta.url)));
  for(const item of old.items){
    assert.equal(LOT9_SOURCE_POSE_SPECIFICATIONS.find(row=>row.rowId===item.rowId).description,item.description);
  }
  const ids=[...new Set(LOT10_SOURCE_POSE_SPECIFICATIONS.map(row=>row.fighterId))];
  assert.equal(ids.length,6);
  for(const id of ids)assert.deepEqual(LOT10_SOURCE_POSE_SPECIFICATIONS.filter(row=>row.fighterId===id).map(row=>row.pose),['idle','walk','hurt','knockdown','phase']);
});

test('lot10 briefs require their own identity edition source role and array of bound evidence',()=>{
  for(const spec of LOT10_SOURCE_POSE_SPECIFICATIONS){
    const fighter=roster.get(spec.fighterId),reference=refs.get(spec.fighterId);
    assert.equal(sourcePoseSpecification(fighter,reference,spec.pose),spec);
    for(const changed of [{...reference,id:'sh2_mary_final_manifestation_034'},
      {...reference,source:'film'}, {...reference,referenceEdition:spec.edition+' remake'},
      {...reference,combatRole:'stationary-boss'}, {...reference,referenceIds:reference.referenceIds.join(', ')},
      {...reference,referenceIds:reference.referenceIds.filter(id=>id!==spec.evidence[0])}]){
      assert.equal(sourcePoseSpecification(fighter,changed,spec.pose),null);
    }
    assert.ok(spec.evidence.every(id=>research.sources.some(row=>row.id===id)));
    assert.ok(spec.basis.length>40&&spec.limits.length>40);
    assert.match(spec.description,/Spécification documentaire à produire/);
  }
  const maria=roster.get('sh2_maria_final_manifestation_033');
  assert.equal(sourcePoseSpecification(roster.get('sh2_mary_final_manifestation_034'),refs.get(maria.id),'phase'),null);
});

test('the plan receives all new descriptions without turning documentary delivery into produced poses or original timing',()=>{
  const plan=buildProductionPlan(research);
  assert.equal(plan.poses.length,2300);
  for(const spec of LOT10_SOURCE_POSE_SPECIFICATIONS){
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

test('lot10 preserves specific source states instead of borrowing guns anatomy or terminal recoveries',()=>{
  assert.match(text('sh1_monster_cybil_017','phase'),/dix tirs.*seuil de santé.*adaptation du versus/);
  assert.match(text('sh1_monster_cybil_017','hurt'),/réaction hurt répétable/);
  assert.match(text('sh2_lying_figure_crawling_021','walk'),/bras dans leur enveloppe.*mains ajoutées/);
  assert.match(text('sh2_lying_figure_crawling_021','knockdown'),/ne doit pas changer silencieusement en020/);
  assert.match(text('sh2_maria_final_manifestation_033','idle'),/ne décrit pas une rencontre de Born from a Wish/);
  assert.match(text('sh2_maria_final_manifestation_033','knockdown'),/ne peut pas déduire un nouveau décollage/);
  assert.match(text('sh3_closer_church_variant','phase'),/ne prouve pas une transformation instantanée/);
  assert.match(text('sh4_jasper_gein_victim_17','knockdown'),/extinction des flammes.*Sword of Obedience/);
  assert.match(text('sh4_andrew_desalvo_victim_18','idle'),/pantalon bleu.*repère18\/21/);
  assert.match(text('sh4_andrew_desalvo_victim_18','phase'),/pas son anatomie.*pas lui donner|pas son anatomie.*ne pas lui donner/);
});

test('the lot10 ledger binds exactly thirty new specified Excel rows to these descriptions and source evidence',async()=>{
  const ledger=JSON.parse(await readFile(new URL('../docs/production/batches/lot10-poses.json',import.meta.url)));
  assert.equal(ledger.schema,1);assert.equal(ledger.batch,'lot10');assert.equal(ledger.workstream,'poses');
  assert.equal(ledger.baseCommit,'79c64fe91590567253eb35630018e877d590d7a0');
  assert.equal(ledger.requestedItems,30);assert.equal(ledger.items.length,30);
  assert.deepEqual(ledger.items.map(row=>row.rowId),LOT10_SOURCE_POSE_SPECIFICATIONS.map(row=>row.rowId));
  for(const [index,item] of ledger.items.entries()){
    const spec=LOT10_SOURCE_POSE_SPECIFICATIONS[index];
    assert.equal(item.collection,'poses');assert.equal(item.entityId,spec.fighterId);assert.equal(item.status,'specified');
    assert.equal(item.field,'description');assert.equal(item.description,spec.description);
    assert.deepEqual(item.artifacts,['scripts/source-pose-specifications.mjs']);
    assert.deepEqual(item.evidence,spec.evidence);assert.ok(item.limits.includes(spec.limits));
  }
});
