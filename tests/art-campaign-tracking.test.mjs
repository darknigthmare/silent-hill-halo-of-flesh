import test from 'node:test';
import assert from 'node:assert/strict';
import {applyArtCampaignProgress,ART_CAMPAIGN_GROUP_SIZES} from '../scripts/art-campaign-tracking.mjs';

function fixture(){
  const id='subject',rowId=id+':pose:idle';
  const plan={poses:[{id:rowId,fighterId:id,source:'sh1',pose:'idle',existing:'Aucun clip dédié',productionStatus:'Rôle à décider'}],
    tasks:[{id:id+':art',reason:'PNG à produire',status:'À faire'},{id:id+':role',reason:'Keep original role',status:'Validé'}]};
  const delivery={batch:'art144',group:'a',workstream:'art',collection:'poses',rowId,entityId:id,
    status:'implemented-candidate',limits:'Static candidate; original animation unmeasured.',evidence:['https://example.org/exact-source']};
  const assets={[id]:{fighterId:id,source:'sh1',frames:[{path:'assets/sprites/subject.png'}],clips:{idle:{frames:[0],loop:false,ticksPerFrame:1}}}};
  return {id,rowId,plan,delivery,assets};
}

test('ART144 covers its exact 30/30/30/30/24 allocation without padding',()=>{
  assert.deepEqual(Object.values(ART_CAMPAIGN_GROUP_SIZES),[30,30,30,30,24]);
  assert.equal(Object.values(ART_CAMPAIGN_GROUP_SIZES).reduce((a,b)=>a+b,0),144);
});

test('a static candidate is recorded without closing art or changing a resolved noncombat role',()=>{
  const f=fixture(),role=structuredClone(f.plan.tasks[1]);
  const progress=applyArtCampaignProgress(f.plan,[f.delivery],f.assets);
  assert.equal(progress.assessed,1);assert.equal(progress.candidates,1);assert.equal(progress.blocked,0);assert.equal(progress.pending,143);
  assert.equal(progress.certifiedOneToOne,false);assert.match(f.plan.poses[0].existing,/image idle fixe importée/);
  assert.equal(f.plan.poses[0].productionStatus,'Rôle à décider');assert.equal(f.plan.tasks[0].status,'À faire');
  assert.equal(f.plan.tasks[0].delivery,'art144-static-candidate-2026-11-01');
  assert.deepEqual(f.plan.tasks[1],role);assert.match(f.plan.tasks[0].reason,/rôle et les capacités restent inchangés/);
});

test('new artwork cannot erase the exact old source limitation from the row or parent action',()=>{
  const f=fixture(),old={...f.delivery,batch:'lot12',status:'blocked',reason:'Original full body was not visible.',limits:'No native timing was measured.'};
  applyArtCampaignProgress(f.plan,[old,f.delivery],f.assets);
  for(const value of [f.plan.poses[0].existing,f.plan.tasks[0].reason]){
    assert.ok(value.includes(old.reason));assert.ok(value.includes(old.limits));
    assert.match(value,/ne la déclare pas automatiquement résolue/);assert.match(value,/ni certification 1:1/);
  }
});

test('current blockers retain both earlier and current reasons without borrowing an existing image',()=>{
  const f=fixture(),old={...f.delivery,batch:'lot9',status:'blocked',reason:'Earlier tool refusal.'};
  f.delivery.status='blocked';f.delivery.reason='The earlier refusal remains respected.';
  const progress=applyArtCampaignProgress(f.plan,[old,f.delivery],{});
  assert.equal(progress.candidates,0);assert.equal(progress.blocked,1);
  for(const value of [f.plan.poses[0].existing,f.plan.tasks[0].reason]){
    assert.ok(value.includes(old.reason));assert.ok(value.includes(f.delivery.reason));
  }
  assert.throws(()=>applyArtCampaignProgress(fixture().plan,[f.delivery],f.assets),/blocked row requires/);
});

test('a declared import needs its own exact-source static idle rather than a placeholder or animated stand-in',()=>{
  for(const corrupt of [f=>delete f.assets[f.id],f=>f.assets[f.id].source='sh2',
    f=>f.assets[f.id].fighterId='borrowed',f=>f.assets[f.id].clips.idle.frames=[0,0],
    f=>f.assets[f.id].clips.idle.loop=true,f=>f.assets[f.id].frames=[]]){
    const f=fixture();corrupt(f);
    assert.throws(()=>applyArtCampaignProgress(f.plan,[f.delivery],f.assets),/own imported static idle/);
  }
});

test('duplicate, wrong-owner and non-idle deliveries cannot inflate the campaign',()=>{
  const f=fixture();assert.throws(()=>applyArtCampaignProgress(f.plan,[f.delivery,{...f.delivery,group:'b'}],f.assets),/Duplicate/);
  for(const corrupt of [d=>d.rowId='test:case',d=>d.entityId='another',d=>d.collection='moves',
    d=>d.limits='',d=>d.evidence=[],d=>d.status='certified']){
    const g=fixture();corrupt(g.delivery);
    assert.throws(()=>applyArtCampaignProgress(g.plan,[g.delivery],g.assets),/Invalid ART144/);
  }
});
