import test from 'node:test';
import assert from 'node:assert/strict';
import {auditSpriteCoverage,markdownSpriteAudit} from '../scripts/audit-sprite-backlog.mjs';

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
