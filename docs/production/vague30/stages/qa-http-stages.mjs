/** Wave30 entry point. Reuses the existing real HTTP/UI harness without altering it.
 * Run after a fresh build: node docs/production/vague30/stages/qa-http-stages.mjs
 * Evidence directory must not exist; the underlying harness preserves earlier evidence.
 */
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {getStage} from '../../../../src/data.js';
import {stageBitmapFor} from '../../../../src/stage-bitmaps.js';

const root=resolve(fileURLToPath(new URL('../../../../',import.meta.url)));
const ids=['shimizu_residence','arcade_toluca_lake','arcade_prison'];
const expected=[
  ['shf-residence-ii-dining-yellowed-calendar','fixed-normal',true],
  ['arcade-stage3-area1-lakeside-quay','fixed-normal',false],
  ['toluca-prison-otherworld-cell-corridor','fixed-altered',false]
];
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const sourceHashes={};
for(const path of ['src/stage-bitmap-manifest.js','src/stage-reference-policy.js','src/production-reference.js','src/data.js']){
  const [source,built]=await Promise.all([readFile(join(root,path)),readFile(join(root,'dist',path))]);
  assert.equal(digest(built),digest(source),'dist must match current source: '+path);
  sourceHashes[path]=digest(source);
}
for(const [index,id] of ids.entries()){
  const stage=getStage(id),art=stageBitmapFor(stage),[scene,state,ceiling]=expected[index];
  assert.equal(stage.id,id);assert.equal(stage.referencePolicy.sceneId,scene);
  assert.equal(stage.referencePolicy.worldState,state);
  assert.equal(art?.scene,scene);assert.equal(art?.geometry?.ceiling,ceiling);
  assert.deepEqual(stage.director.hazardDeck,[]);
}
const harness='docs/production/vague28/qa-http-stages.mjs';
const args=[harness,'--stages='+ids.join(','),'--build=dist','--out=tests/http-wave30-stages','--port=4292'];
await new Promise((resolveRun,reject)=>{
  const child=spawn(process.execPath,args,{cwd:root,stdio:'inherit',env:process.env});
  child.once('error',reject);
  child.once('exit',(code,signal)=>code===0?resolveRun():reject(new Error('Stage HTTP harness failed: '+(signal||code))));
});
const out=join(root,'tests/http-wave30-stages');
const reportBytes=await readFile(join(out,'report.json'));
const report=JSON.parse(reportBytes);
assert.equal(report.passed,true);
assert.equal(report.build,'dist');
assert.equal(report.browserTest,true);assert.equal(report.httpTest,true);
assert.equal(report.actorStateInjected,false);assert.equal(report.assetSubstitution,false);
assert.deepEqual(report.stages.map(stage=>stage.id).sort(),[...ids].sort());
assert.deepEqual(report.errors,[]);
assert.equal(report.captures.length,3);
for(const id of ids){
  const capture=report.captures.find(item=>item.stageId===id);
  assert.ok(capture&&capture.width>0&&capture.height>0,'real browser capture required: '+id);
  const bytes=await readFile(join(out,capture.file));
  assert.equal(digest(bytes),capture.sha256);
  assert.equal(bytes.length,capture.bytes);
}
for(const [path,before] of Object.entries(sourceHashes)){
  assert.equal(digest(await readFile(join(root,path))),before,'HTTP QA must not alter source: '+path);
}
const summary={schema:1,wave:30,passed:true,build:'dist',stageIds:ids,
  harness,harnessReportWave:report.wave,harnessReportSHA256:digest(reportBytes),
  harnessReport:'report.json',sourceHashes,completedAt:new Date().toISOString(),
  captures:report.captures,checks:report.checks.length,
  limits:['The original wave28 harness report is preserved unchanged.','No offline or service-worker update claim.','Static stage imports; no source animation, combat timing or 1:1 fidelity certified.']};
await writeFile(join(out,'wave30-summary.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({wave:30,passed:true,stageIds:ids,captures:report.captures.length,out:'tests/http-wave30-stages'}));
