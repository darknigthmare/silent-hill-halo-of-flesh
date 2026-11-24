/** Reconcile final native evidence without counting intermediate runs twice. */
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {dirname,join,basename} from 'node:path';
import {createHash} from 'node:crypto';
import {SPRITES} from '../../../src/sprite-manifest.js';
import {STAGE_BITMAPS} from '../../../src/stage-bitmap-manifest.js';

const base='docs/production/vague28/',hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const definitions=[
  {name:'characters',report:'characters/qa-native-final/report.json',harness:'characters/qa-attacks-native.mjs',checks:334,cases:8,captures:8},
  {name:'projectiles',report:'projectiles/qa-native-after-cache-fix/report.json',harness:'projectiles/qa-native.mjs',checks:79,cases:4,captures:6},
  {name:'stages',report:'stages/qa-native-final/report.json',harness:'stages/qa-native-final.mjs',checks:109,cases:3,captures:3}
];
const suites=[];
for(const definition of definitions){
  const path=base+definition.report,bytes=await readFile(path),report=JSON.parse(bytes);
  assert.equal(report.passed??report.success,true,path);
  assert.equal(report.browserTest,false);assert.equal(report.httpTest,false);
  assert.equal(report.actorStateInjected,false);
  assert.equal(report.checks.length,definition.checks);
  assert.ok(report.checks.every(check=>check.passed));
  assert.equal((report.cases||report.scenes).length,definition.cases);
  assert.equal(report.captures.length,definition.captures);
  const sources=[];
  for(const [file,record] of Object.entries(report.sourceHashes)){
    const expected=typeof record==='string'?record:record.after;
    if(typeof record!=='string')assert.equal(record.before,record.after,file);
    assert.equal(hash(await readFile(file)),expected,file);
    sources.push({path:file,sha256:expected});
  }
  const harnessHash=hash(await readFile(base+definition.harness));
  if(report.harnessSHA256)assert.equal(harnessHash,report.harnessSHA256);
  else assert.equal(report.sourceHashes[base+definition.harness],harnessHash);
  for(const asset of report.assets){
    const actual=await readFile(asset.path);
    assert.equal(hash(actual),asset.sha256,asset.path);assert.equal(actual.length,asset.bytes);
  }
  for(const [id,expected] of Object.entries(report.testedSpriteEntryHashes||{}))assert.equal(hash(JSON.stringify(SPRITES[id])),expected,id);
  for(const [id,expected] of Object.entries(report.testedStageEntryHashes||{}))assert.equal(hash(JSON.stringify(STAGE_BITMAPS[id])),expected,id);
  const captures=[];
  for(const capture of report.captures){
    assert.equal(basename(capture.file),capture.file);
    const file=join(dirname(path),capture.file),actual=await readFile(file);
    assert.equal(hash(actual),capture.sha256,file);assert.equal(actual.length,capture.bytes);
    assert.equal(actual.readUInt32BE(16),1280);assert.equal(actual.readUInt32BE(20),720);
    captures.push({path:file,sha256:capture.sha256,bytes:capture.bytes});
  }
  suites.push({name:definition.name,report:path,reportSHA256:hash(bytes),checks:report.checks.length,
    scenes:definition.cases,captures,sources,harness:{path:base+definition.harness,sha256:harnessHash}});
}
const log=await readFile(base+'node-tests-final.txt','utf8');
assert.match(log,/tests 1301\b/);assert.match(log,/pass 1301\b/);assert.match(log,/fail 0\b/);
const admission=await json(base+'cache-admission.json');assert.equal(admission.passed,true);
const summary=await json(base+'summary.json');assert.equal(summary.passed,true);
assert.equal(summary.delivered.uniquePNG,12);
const poses=await json(base+'pose-backlog.json');
for(const source of poses.sourceHashes)assert.equal(hash(await readFile(source.path)),source.sha256,source.path);
const commands=[
  {command:'npm run verify',log:'verify-final.txt',scope:'Generated data and package before the cache-only code correction; all final PNGs present.'},
  {command:'node scripts/build.mjs --verify-only',log:'build-after-cache-fix.txt',scope:'Final package, including the cache correction.'},
  {command:'node --test --test-concurrency=2',log:'node-tests-final.txt',scope:'Final full Node suite: 1301 passed, 0 failed.'},
  {command:'node --test tests/native-attack-budget.test.mjs tests/sprites.test.mjs tests/stage-bitmaps.test.mjs tests/completed-result-retirement.test.mjs',log:'cache-fix-tests.txt',scope:'66 targeted tests, included again in the full Node suite; not additional tests.'}
];
for(const command of commands){
  command.exitCode=0;command.log=base+command.log;command.logSHA256=hash(await readFile(command.log));
}
const result={schema:1,wave:28,createdAt:new Date().toISOString(),passed:true,
  native:{checks:suites.reduce((n,s)=>n+s.checks,0),scenes:suites.reduce((n,s)=>n+s.scenes,0),
    captures:suites.reduce((n,s)=>n+s.captures.length,0),suites},
  node:{tests:1301,passed:1301,failed:0},commands,
  memory:{report:base+'cache-admission.json',sha256:hash(await readFile(base+'cache-admission.json')),
    fighters:admission.fighters,stages:admission.stages,projectiles:admission.projectiles},
  preservation:{report:base+'summary.json',sha256:hash(await readFile(base+'summary.json')),
    oldAssetsByteIdentical:summary.preservation.assetFilesVerifiedByteIdentical,
    protectedRulesAndWorkbooks:summary.preservation.protectedRuleAndWorkbookFiles},
  poseBacklog:{report:base+'pose-backlog.json',sha256:hash(await readFile(base+'pose-backlog.json')),
    profiles:poses.summary.mainBacklogProfiles,commands:poses.summary.commands,
    note:'Documentary clip-key census; not new runtime tests or a count of required animation frames.'},
  http:{state:'not-run',reason:'Local Chromium is blocked by socket() Operation not permitted; remote workflow awaits publication.',
    preparedScenes:13,runner:base+'run-ci-browser-check.mjs'},
  limits:['Final native runs only: earlier diagnostic captures are preserved but not added to these counts.',
    'Native Canvas and input callbacks do not validate Chromium, HTTP, browser events or service workers.',
    'Admission pair counts are not played matches.',
    'No source timing, complete animation cycle or 1:1 fidelity is certified.',
    'The full Python workbook suite previously stopped with exit 137 in wave27; it was not rerun here.']};
await writeFile(base+'verification.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({passed:true,node:result.node,native:{checks:result.native.checks,scenes:result.native.scenes,captures:result.native.captures},oldAssets:result.preservation.oldAssetsByteIdentical}));
