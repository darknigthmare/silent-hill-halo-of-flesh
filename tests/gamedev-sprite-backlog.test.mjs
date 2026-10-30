import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditSpriteCoverage,markdownSpriteAudit,inspectFighterClips} from '../scripts/audit-sprite-backlog.mjs';

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

test('real sprite coverage identifies Air Screamer as animation-validation candidate',()=>{
 const report=JSON.parse(readFileSync(new URL('../data/sprite-coverage.json',import.meta.url),'utf8'));
 const result=auditSpriteCoverage(report);
 assert.equal(result.summary.total,230);
 assert.equal(result.summary.illustrated,74);
 assert.equal(result.summary.missing,156);
 const first=result.rows[0];
 assert.equal(first.id,'sh1_air_screamer_001');
 assert.equal(first.priority,'P0-validate-animation');
 assert.equal(first.animated,1);
 assert.equal(first.fidelity,'unverified');
});

test('clip inspector lists only actual authored poses and distinct pixels',()=>{
 const registry={assets:{bird:{frames:[{sha256:'a'},{sha256:'b'}],clips:{idle:{frames:[0,1,0],loop:true},hurt:{frames:[1],loop:false}}}}};
 const inspected=inspectFighterClips(registry,'bird');
 assert.deepEqual(inspected.clips.map(c=>[c.pose,c.animated]),[['idle',true],['hurt',false]]);
 assert.equal(inspectFighterClips(registry,'absent').registered,false);
});
