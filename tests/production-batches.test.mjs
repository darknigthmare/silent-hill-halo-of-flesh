import test from 'node:test';
import assert from 'node:assert/strict';
import {validateProductionBatches,BATCH_WORKSTREAMS} from '../scripts/validate-production-batches.mjs';

const baseCommit='98ccc47a4c26bd05fd90b2751705730783ef8eaa';
function fixture(){
  const plan={sources:[{id:'SOURCE'}]},ledgers=[];
  for(const [workstream,collection] of Object.entries(BATCH_WORKSTREAMS)){
    plan[collection]||=[];
    const items=Array.from({length:30},(_,index)=>{
      const rowId=`${workstream}-${index}`,entityId=workstream+'-owner';
      plan[collection].push({id:rowId,entityId});
      return {rowId,entityId,collection,status:'implemented-candidate',artifacts:['src/example.js'],evidence:['SOURCE'],limits:'Candidate; timing unmeasured.'};
    });
    ledgers.push({schema:1,batch:'lot9',workstream,baseCommit,requestedItems:30,items});
  }
  return {plan,ledgers};
}
const run=({ledgers,plan})=>validateProductionBatches(ledgers,plan,{baseCommit});
test('six lots contain 180 real row work items without promoting them to fidelity certification',()=>{
  const f=fixture();f.ledgers[0].items[0]={...f.ledgers[0].items[0],status:'blocked',artifacts:[],reason:'No source view available.'};
  const report=run(f);assert.equal(report.agents,6);assert.equal(report.rowWorkItems,180);
  assert.equal(report.certifiedOneToOne,false);assert.equal(report.workstreams[0].declaredStatuses.blocked,1);
});
test('missing agents, duplicate rows, padded counts and a wrong baseline cannot satisfy thirty per agent',()=>{
  for(const change of [f=>f.ledgers.pop(),f=>f.ledgers.push(f.ledgers[0]),
    f=>f.ledgers[0].items.pop(),f=>{f.ledgers[0].items[1]=f.ledgers[0].items[0];},
    f=>{f.ledgers[0].requestedItems=29;},f=>{f.ledgers[0].baseCommit='0'.repeat(40);}]){
    const f=fixture();change(f);assert.throws(()=>run(f));
  }
});
test('a test case or another character cannot substitute for the exact Excel row',()=>{
  for(const change of [item=>{item.rowId='tests:passed:30';},item=>{item.entityId='another-owner';},
    item=>{item.collection='moves';},item=>{item.status='certified';},item=>{item.evidence=['unknown'];},
    item=>{item.evidence=['http://example.org/source'];},item=>{item.artifacts=['../outside.png'];},
    item=>{item.artifacts=[];},item=>{item.limits='';},item=>{item.status='blocked';}]){
    const f=fixture();change(f.ledgers[0].items[0]);assert.throws(()=>run(f));
  }
});
test('the baseline comparison refuses unchanged claimed deliveries and accepts explicitly blocked rows',()=>{
  const f=fixture(),previousPlan=structuredClone(f.plan);
  assert.throws(()=>validateProductionBatches(f.ledgers,f.plan,{baseCommit,previousPlan}),/did not change/);
  for(const rows of Object.values(f.plan))for(const row of rows)row.updated='Substantive delivery is reviewed separately.';
  assert.equal(validateProductionBatches(f.ledgers,f.plan,{baseCommit,previousPlan}).rowWorkItems,180);
  const item=f.ledgers[0].items[0];delete f.plan[item.collection].find(row=>row.id===item.rowId).updated;
  item.status='blocked';item.artifacts=[];item.reason='No adequate source.';
  assert.equal(validateProductionBatches(f.ledgers,f.plan,{baseCommit,previousPlan}).rowWorkItems,180);
  previousPlan[item.collection]=previousPlan[item.collection].filter(row=>row.id!==item.rowId);
  assert.throws(()=>validateProductionBatches(f.ledgers,f.plan,{baseCommit,previousPlan}),/original baseline row/);
});
