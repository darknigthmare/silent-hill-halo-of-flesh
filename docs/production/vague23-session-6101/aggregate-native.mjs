/** Consolidate already executed cases; require their exact tested entries in the final catalogue. */
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {getStage,ROSTER,createCombatProfile} from '../../../src/data.js';
import {SPRITES} from '../../../src/sprite-manifest.js';
import {stageBitmapFor} from '../../../src/stage-bitmaps.js';

const root=resolve(fileURLToPath(new URL('../../../',import.meta.url))),base=resolve(root,'docs/production/vague23'),qa=resolve(base,'qa-native');
const hash=b=>createHash('sha256').update(b).digest('hex'),read=async p=>JSON.parse(await readFile(p,'utf8'));
const names=await readdir(base),fighters=[],stages=[];
for(const name of names.filter(n=>/^(fighter|stage)-integration-.*\.json$/.test(n))){const r=await read(resolve(base,name));if(name.startsWith('fighter-'))fighters.push(...r.entries.map(e=>({id:e.fighterId,combatEnabled:e.combatEnabled})));else stages.push(...r.stages.map(s=>s.stageId));}
const expected=[...fighters.map(f=>f.id),...stages];
if(new Set(expected).size!==expected.length)throw Error('Duplicate expected case.');
const catalogues=new Set(['art/registry.json','art/stage-registry.json','src/sprite-manifest.js','src/stage-bitmap-manifest.js']);
const result={schema:1,wave:23,createdAt:new Date().toISOString(),passed:false,browserTest:false,httpTest:false,actorStateInjected:false,
  method:'Aggregation only. No tests or rendering rerun. Each report, native PNG, process observation and executed harness is hashed. Immutable renderer modules must still match; later unrelated catalogue additions are accepted only when every tested sprite and selected stage entry is identical to the executed case.',
  checks:[],cases:[],rendererPreviews:[],captures:[],assets:[],processes:[],harnesses:[],sourceValidation:[],limits:[],counts:{}};
const assets=new Map(),harnesses=new Map();
function assert(ok,message){if(!ok)throw Error(message);}
for(const id of expected){
  const dir=resolve(qa,'cases',id),raw=await readFile(resolve(dir,'report.json')),r=JSON.parse(raw),p=await read(resolve(dir,'process-observation.json'));
  assert(r.passed&&r.errors.length===0&&r.checks.length&&r.checks.every(c=>c.passed),'Failed case: '+id);
  assert(!r.browserTest&&!r.httpTest&&!r.actorStateInjected,'Wrong execution claim: '+id);
  assert(p.passed&&p.exitCode===0&&!(p.signal||p.signalNumber)&&p.reportSHA256===hash(raw),'Process result differs: '+id);
  assert(p.harnessSHA256===r.harnessSHA256&&hash(await readFile(resolve(qa,p.executedHarness)))===r.harnessSHA256,'Executed harness differs: '+id);
  assert(hash(await readFile(resolve(dir,p.log)))===p.logSHA256,'Process log differs: '+id);
  const fighter=fighters.find(f=>f.id===id);
  if(fighter){
    assert(createCombatProfile(ROSTER.find(f=>f.id===id)).referencePolicy.combatEnabled===fighter.combatEnabled,'Role changed: '+id);
    assert(fighter.combatEnabled?r.cases.length===2&&r.cases.every(c=>c.fighterId===id)&&new Set(r.cases.map(c=>c.playerIndex)).size===2:r.cases.length===0&&r.rendererPreviews.length===2&&r.rendererPreviews.every(c=>c.id===id&&c.combatEnabled===false),'Incomplete or improper role QA: '+id);
  }else assert(r.stageIds.length===1&&r.stageIds[0]===id&&r.cases.length===1&&r.cases[0].stageId===id,'Wrong stage case: '+id);
  const validated={id,exactTestedSpriteEntries:[],exactTestedStageEntries:[],catalogueHashes:[],unchangedSources:[]};
  for(const [sprite,sha]of Object.entries(r.testedSpriteEntryHashes)){assert(hash(JSON.stringify(SPRITES[sprite]))===sha,'Tested sprite entry changed: '+sprite);validated.exactTestedSpriteEntries.push({id:sprite,sha256:sha});}
  for(const [stage,sha]of Object.entries(r.testedStageEntryHashes)){assert(hash(JSON.stringify(stageBitmapFor(getStage(stage))))===sha,'Tested stage entry changed: '+stage);validated.exactTestedStageEntries.push({id:stage,sha256:sha});}
  for(const [path,shas]of Object.entries(r.sourceHashes)){
    assert(shas.before===shas.after,'Source changed during a case: '+id+':'+path);
    const finalSHA=hash(await readFile(resolve(root,path)));
    if(catalogues.has(path))validated.catalogueHashes.push({path,executionSHA256:shas.before,finalSHA256:finalSHA,changedByLaterUnrelatedImports:finalSHA!==shas.before,exactTestedEntriesRevalidated:true});
    else{assert(finalSHA===shas.before,'Renderer or gameplay changed after case: '+path);validated.unchangedSources.push({path,sha256:finalSHA});}
  }
  for(const a of r.assets){const bytes=await readFile(resolve(root,a.path));assert(hash(bytes)===a.sha256&&bytes.length===a.bytes,'Source asset differs: '+a.path);if(assets.has(a.path))assert(assets.get(a.path).sha256===a.sha256,'Conflicting asset.');else assets.set(a.path,a);}
  for(const c of r.captures){const bytes=await readFile(resolve(dir,c.file));assert(hash(bytes)===c.sha256&&bytes.length===c.bytes,'Capture differs: '+id+'/'+c.file);result.captures.push({...c,file:'cases/'+id+'/'+c.file,caseId:id});}
  result.checks.push(...r.checks.map(c=>({...c,caseId:id})));
  result.cases.push(...r.cases.map(c=>({...c,processId:id,report:'cases/'+id+'/report.json'})));
  result.rendererPreviews.push(...(r.rendererPreviews||[]).map(c=>({...c,processId:id,report:'cases/'+id+'/report.json'})));
  result.processes.push({...p,id,report:'cases/'+id+'/report.json'});result.sourceValidation.push(validated);
  harnesses.set(r.harnessSHA256,{sha256:r.harnessSHA256,file:p.executedHarness});
  result.limits=[...new Set([...result.limits,...r.limits])];
}
result.assets=[...assets.values()];result.harnesses=[...harnesses.values()];
result.counts={characters:fighters.length,combatProfiles:fighters.filter(f=>f.combatEnabled).length,referenceOnlyProfiles:fighters.filter(f=>!f.combatEnabled).length,stages:stages.length,successfulProcesses:result.processes.length,duelCases:result.cases.filter(c=>c.fighterId).length,stageCases:result.cases.filter(c=>!c.fighterId).length,referencePreviews:result.rendererPreviews.length,captures:result.captures.length,checkExecutions:result.checks.length,uniqueSourceAssets:result.assets.length};
result.checkCountNote='Actual assertion executions, including repeated common checks; not a count of unique assertions. Failed or interrupted attempts are outside these success totals.';
result.captureRetention='All captures referred to by the selected successful reports are preserved with their exact bytes.';
result.browserAvailability=await read(resolve(base,'qa-preparation/environment-probe.json'));
result.browserAvailabilityEvidence='qa-preparation/environment-probe.json';
result.passed=true;
await writeFile(resolve(qa,'report.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({passed:true,counts:result.counts,harnessVariants:result.harnesses.length}));
