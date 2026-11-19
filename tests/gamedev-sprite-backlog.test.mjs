import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditSpriteCoverage,markdownSpriteAudit,inspectFighterClips} from '../scripts/audit-sprite-backlog.mjs';
import {ART_CAMPAIGN_BASE,ART_CAMPAIGN_GROUP_SIZES} from '../scripts/art-campaign-tracking.mjs';
import {readArtContinuation,resolvedHistoricalArtwork} from '../scripts/art-campaign-review.mjs';
import {fileURLToPath} from 'node:url';

test('sprite backlog separates missing art, static art and actual animation',()=>{
 const result=auditSpriteCoverage({entries:[
  {id:'missing',name:'Missing',source:'sh1',frames:0,animatedClips:0,fidelity:'not-assessed'},
  {id:'still',name:'Still',source:'sh1',frames:2,animatedClips:0,fidelity:'unverified',presentations:{missing:['intro']}},
  {id:'moving',name:'Moving',source:'sh1',frames:3,animatedClips:1,fidelity:'unverified',presentations:{missing:[]}}
 ]});
 assert.deepEqual(result.summary,{total:3,illustrated:2,missing:1,animatedClips:1,certified:0});
 assert.deepEqual(result.rows.map(r=>r.id),['moving','still','missing']);
 assert.match(markdownSpriteAudit(result),/P0-validate-animation/);
});

test('sprite backlog rejects absent entries instead of inventing coverage',()=>{
 assert.throws(()=>auditSpriteCoverage({}),/entries missing/);
});

test('audit rejects duplicated fighter identities and contradictory counts',()=>{
 const row={id:'same',name:'Test',source:'sh1',frames:1,animatedClips:0,fidelity:'unverified'};
 assert.throws(()=>auditSpriteCoverage({entries:[row,{...row}]}),/Duplicate/);
 assert.throws(()=>auditSpriteCoverage({entries:[row],total:2}),/total mismatch/);
 assert.throws(()=>auditSpriteCoverage({entries:[row],integrated:0}),/integrated mismatch/);
 assert.throws(()=>auditSpriteCoverage({entries:[{...row,frames:0,animatedClips:1}]}),/Animation without frames/);
 assert.throws(()=>auditSpriteCoverage({entries:[{...row,frames:-1}]}),/Invalid sprite counters/);
});

test('real sprite coverage keeps authored animated clips in the validation queue',async()=>{
 const report=JSON.parse(readFileSync(new URL('../data/sprite-coverage.json',import.meta.url),'utf8'));
 const assets=JSON.parse(readFileSync(new URL('../art/registry.json',import.meta.url),'utf8')).assets;
 const intake=JSON.parse(readFileSync(new URL('../docs/production/art144-intake.json',import.meta.url),'utf8'));
 assert.equal(intake.baseCommit,ART_CAMPAIGN_BASE);
 assert.equal(intake.baselineProfiles,86);
 assert.equal(intake.requested,144);
 assert.equal(intake.entries.length,144);
 const ledgers=Object.entries(ART_CAMPAIGN_GROUP_SIZES).map(([group,size])=>{
  const ledger=JSON.parse(readFileSync(new URL(`../docs/production/batches/art144-${group}.json`,import.meta.url),'utf8'));
  assert.equal(ledger.baseCommit,ART_CAMPAIGN_BASE);
  assert.equal(ledger.requestedItems,size);
  assert.equal(ledger.items.length,size);
  return ledger;
 });
 const rows=ledgers.flatMap(ledger=>ledger.items),candidates=rows.filter(row=>row.status==='implemented-candidate'),blocked=rows.filter(row=>row.status==='blocked');
 assert.equal(rows.length,144,'the original intake is exactly 144 profiles');
 assert.equal(new Set(rows.map(row=>row.entityId)).size,144);
 assert.deepEqual(rows.map(row=>row.entityId).sort(),intake.entries.map(row=>row.fighter.id).sort());
 assert.equal(candidates.length+blocked.length,144);
 assert.equal(candidates.length,52,'the historical ART144 candidate count stays unchanged');
 assert.equal(blocked.length,92,'ART92 resolves later artwork without rewriting ART144 dispositions');
 const continuation=await readArtContinuation(fileURLToPath(new URL('../',import.meta.url)));
 let newlyResolved=0;
 for(const row of rows){
  assert.equal(row.rowId,row.entityId+':pose:idle');
  const later=resolvedHistoricalArtwork(row,assets[row.entityId],continuation);
  if(later)newlyResolved++;
  assert.equal(!!assets[row.entityId],row.status==='implemented-candidate'||later,row.entityId);
 }
 const result=auditSpriteCoverage(report);
 assert.equal(result.summary.total,230);
 // At 221dcc8 the same 230 identities had 86 images and 144 missing.
 // New static candidates move only their own original missing identity.
 assert.equal(result.summary.illustrated,intake.baselineProfiles+candidates.length+newlyResolved);
 assert.equal(result.summary.missing,blocked.length-newlyResolved);
 assert.equal(result.summary.certified,0);
 for(const id of ['sh1_air_screamer_001','origins_faceless_nurse']){
  const row=result.rows.find(candidate=>candidate.id===id);
  assert.equal(row.priority,'P0-validate-animation',id);
  assert.equal(row.animated,1,id);
  assert.equal(row.fidelity,'unverified',id);
 }
 assert.equal(result.rows[0].priority,'P0-validate-animation');
});

test('clip inspector lists only actual authored poses and distinct pixels',()=>{
 const registry={assets:{bird:{frames:[{sha256:'a'},{sha256:'b'}],clips:{idle:{frames:[0,1,0],loop:true},hurt:{frames:[1],loop:false}}}}};
 const inspected=inspectFighterClips(registry,'bird');
 assert.deepEqual(inspected.clips.map(c=>[c.pose,c.animated]),[['idle',true],['hurt',false]]);
 assert.equal(inspectFighterClips(registry,'absent').registered,false);
});
