/** Validate completed wave23 native QA batches against the final catalogue. No rendering is rerun. */
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {resolve,relative,basename} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {getStage,ROSTER,createCombatProfile} from '../../../src/data.js';
import {SPRITES} from '../../../src/sprite-manifest.js';
import {stageBitmapFor} from '../../../src/stage-bitmaps.js';

const option=name=>process.argv.find(arg=>arg.startsWith('--'+name+'='))?.slice(name.length+3);
if(process.argv.includes('--help')){
  console.log('Aggregate completed wave23 batches only after final imports. Optional --batches=reference-part1,combat-part2,... and --out=/fresh/report.json. Default: all immediate *-partN or *-final batch directories and qa-native/report.json.');
  process.exit(0);
}
const root=resolve(fileURLToPath(new URL('../../../',import.meta.url))),base=resolve(root,'docs/production/vague23'),qa=resolve(base,'qa-native');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex'),jsonHash=value=>hash(JSON.stringify(value));
const read=async path=>JSON.parse(await readFile(path,'utf8'));
function assert(ok,message){if(!ok)throw Error(message);}
function repoPath(path){const absolute=resolve(root,path),rel=relative(root,absolute);assert(rel&&!rel.startsWith('..')&&!rel.startsWith('/'),'Path outside repository: '+path);return {absolute,relative:rel};}
async function exactFile(path,sha256,bytes){const file=repoPath(path),raw=await readFile(file.absolute);assert(hash(raw)===sha256&&(bytes===undefined||raw.length===bytes),'Preserved bytes differ: '+file.relative);return raw;}
const names=(await readdir(base)).sort(),receipts=[],fighters=new Map(),stages=new Map();
for(const name of names.filter(n=>/^characters(?:-extra)?-import-.+\.json$/.test(n)||/^stages-import-.+\.json$/.test(n))){
  const path=resolve(base,name),raw=await readFile(path),r=JSON.parse(raw),character=name.startsWith('characters');
  assert(character?r.wave===23&&r.complete===true:r.protectedScopeUnchanged===true&&r.existingCompositionsPreserved===true,'Incomplete import receipt: '+name);
  for(const input of character?[r.input]:r.inputs){assert(input?.path&&input.sha256,'Missing receipt input: '+name);await exactFile(input.path,input.sha256);}
  if(character)for(const entry of r.entries){
    assert(!fighters.has(entry.fighterId),'Repeated character import: '+entry.fighterId);
    assert(entry.nativePixelsPreserved&&entry.portraitPreserved&&entry.clipSemanticsPreserved&&entry.roleUnchanged,'Import protections absent: '+entry.fighterId);
    await exactFile(entry.path,entry.technical.sha256,entry.technical.bytes);
    fighters.set(entry.fighterId,{...entry,receipt:name});
  }
  else for(const entry of r.stages){assert(!stages.has(entry.stageId),'Repeated stage import: '+entry.stageId);stages.set(entry.stageId,{...entry,receipt:name});}
  receipts.push({file:relative(root,path),sha256:hash(raw),kind:character?'characters':'stages',ids:character?r.entries.map(e=>e.fighterId):r.stages.map(e=>e.stageId)});
}
assert(fighters.size&&stages.size,'Both character and stage import receipts are required.');
const baselinePath=resolve(base,'scope-baseline.json'),baselineRaw=await readFile(baselinePath),baseline=JSON.parse(baselineRaw);
assert(baseline.wave===23&&baseline.baseCommit==='cffb58bbcb78c2bdb1381965ea0efb3e5fb54994','Unexpected wave23 baseline.');
const immutableBaseline=[];
for(const file of baseline.protectedFiles.filter(f=>/^(src|data)\//.test(f.path))){await exactFile(file.path,file.sha256,file.bytes);immutableBaseline.push({path:file.path,sha256:file.sha256});}
const available=(await readdir(qa,{withFileTypes:true})).filter(d=>d.isDirectory()&&/^(reference|combat|stages)-(?:part\d+|final)$/.test(d.name)).map(d=>d.name).sort();
const batches=option('batches')?.split(',').filter(Boolean)||available;
assert(batches.length&&new Set(batches).size===batches.length&&batches.every(n=>available.includes(n)),'Expected unique existing native batch names.');
const catalogues=new Set(['art/registry.json','art/stage-registry.json','src/sprite-manifest.js','src/stage-bitmap-manifest.js']);
const result={schema:1,wave:23,createdAt:new Date().toISOString(),passed:false,browserTest:false,httpTest:false,actorStateInjected:false,
  method:'Aggregation of completed native QA batches only. Every imported ID must have role-appropriate executed evidence and visual review. Every tested sprite and active stage entry, immutable source module, source asset and capture is revalidated against final bytes. Independent later catalogue imports do not require rerendering unchanged entries.',
  receipts,baseline:{path:relative(root,baselinePath),sha256:hash(baselineRaw),immutableSourceFiles:immutableBaseline},
  checks:[],cases:[],rendererPreviews:[],captures:[],assets:[],batches:[],harnesses:[],sourceValidation:[],visualReviews:[],limits:[],counts:{}};
const coveredFighters=new Set(),coveredStages=new Set(),assets=new Map(),harnesses=new Map();
for(const batch of batches){
  const dir=resolve(qa,batch),reportPath=resolve(dir,'report.json'),raw=await readFile(reportPath),r=JSON.parse(raw);
  assert(r.passed===true&&r.errors?.length===0&&r.checks?.length&&r.checks.every(c=>c.passed===true),'Failed or empty native report: '+batch);
  assert(r.browserTest===false&&r.httpTest===false&&r.actorStateInjected===false&&r.completedAt,'Incorrect native execution claim: '+batch);
  const stageBatch=Array.isArray(r.stageIds),harness=stageBatch?'docs/production/vague22/qa-stages-native.mjs':'docs/production/vague23/qa-characters-native.mjs';
  await exactFile(harness,r.harnessSHA256);harnesses.set(harness,{file:harness,sha256:r.harnessSHA256});
  const reviewPath=resolve(dir,'visual-review.json'),reviewRaw=await readFile(reviewPath),review=JSON.parse(reviewRaw);
  assert((review.passed===true||review.technicalResult?.passed===true)&&review.report==='report.json'&&review.inspected?.length&&review.findings?.length,'Missing visual review: '+batch);
  if(review.reportSHA256)assert(review.reportSHA256===hash(raw),'Visual review references different report: '+batch);
  const inspected=new Set(review.inspected),captureMap=new Map();
  for(const capture of r.captures){
    assert(capture.file===basename(capture.file)&&!captureMap.has(capture.file),'Invalid/duplicate capture: '+batch+'/'+capture.file);
    const path=resolve(dir,capture.file),bytes=await exactFile(path,capture.sha256,capture.bytes);
    assert(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&bytes.readUInt32BE(16)===capture.width&&bytes.readUInt32BE(20)===capture.height,'Capture dimensions differ: '+batch+'/'+capture.file);
    captureMap.set(capture.file,capture);result.captures.push({...capture,file:batch+'/'+capture.file,batch});
  }
  assert([...inspected].every(file=>captureMap.has(file)),'Visual review names an absent capture: '+batch);
  assert(Object.keys(r.testedSpriteEntryHashes||{}).length&&Object.keys(r.testedStageEntryHashes||{}).length,'Missing entry fingerprints: '+batch);
  const validated={batch,exactTestedSpriteEntries:[],exactTestedStageEntries:[],catalogueHashes:[],unchangedSources:[]};
  for(const [id,sha256]of Object.entries(r.testedSpriteEntryHashes)){
    assert(SPRITES[id]&&jsonHash(SPRITES[id])===sha256,'Tested sprite entry changed: '+batch+':'+id);validated.exactTestedSpriteEntries.push({id,sha256});
  }
  for(const [id,sha256]of Object.entries(r.testedStageEntryHashes)){
    assert(getStage(id)?.id===id&&jsonHash(stageBitmapFor(getStage(id)))===sha256,'Tested stage entry changed: '+batch+':'+id);validated.exactTestedStageEntries.push({id,sha256});
  }
  for(const required of ['art/registry.json','src/sprite-manifest.js','src/stage-bitmap-manifest.js','src/fight.js','src/renderers.js','src/stage-bitmap-compositions.js'])assert(r.sourceHashes?.[required],'Missing immutable/source fingerprint: '+batch+':'+required);
  for(const [path,shas]of Object.entries(r.sourceHashes)){
    assert(shas.before===shas.after,'Source changed during native execution: '+batch+':'+path);
    const finalSHA256=hash(await readFile(repoPath(path).absolute));
    if(catalogues.has(path))validated.catalogueHashes.push({path,executionSHA256:shas.before,finalSHA256,changedByIndependentImports:finalSHA256!==shas.before,exactTestedEntriesRevalidated:true});
    else{assert(finalSHA256===shas.before,'Renderer/gameplay changed after native execution: '+path);validated.unchangedSources.push({path,sha256:finalSHA256});}
  }
  for(const asset of r.assets){await exactFile(asset.path,asset.sha256,asset.bytes);if(assets.has(asset.path))assert(assets.get(asset.path).sha256===asset.sha256,'Conflicting source asset: '+asset.path);else assets.set(asset.path,asset);}
  if(stageBatch){
    assert(r.stageIds.length===r.cases.length&&new Set(r.stageIds).size===r.stageIds.length,'Incomplete stage batch: '+batch);
    for(const id of r.stageIds){
      const receipt=stages.get(id),cases=r.cases.filter(c=>c.stageId===id),entry=stageBitmapFor(getStage(id));
      assert(receipt&&!coveredStages.has(id)&&cases.length===1&&r.testedStageEntryHashes[id],'Unexpected/repeated stage QA: '+id);
      const c=cases[0],captures=r.captures.filter(cap=>cap.stageId===id&&cap.purpose==='actual-native-FightEngine');
      assert(c.scene===receipt.scene&&c.source===receipt.source&&entry.scene===receipt.scene,'Exact scene/source differs: '+id);
      assert(c.finalFrame>0&&c.commands?.length>=4&&c.commands.every(e=>e.accepted===true)&&c.parallax?.length===2&&new Set(c.parallax.map(e=>e.direction)).size===2,'Incomplete actual stage/input execution: '+id);
      assert(c.parallax.every(e=>e.delta.length===2&&e.delta.every((delta,i)=>Math.abs(delta-e.expected[i])<1e-6)&&receipt.paths.every(path=>e.before.some(d=>d.path===path)&&e.after.some(d=>d.path===path))),'Missing exact planes or live parallax evidence: '+id);
      assert(captures.length&&captures.every(cap=>inspected.has(cap.file))&&receipt.paths.every(path=>r.assets.some(a=>a.path===path)),'Missing reviewed stage capture/assets: '+id);
      coveredStages.add(id);
    }
  }else{
    const ids=[...(r.combatIds||[]),...(r.referenceOnlyIds||[])];
    assert(ids.length&&new Set(ids).size===ids.length&&r.cases.every(c=>(r.combatIds||[]).includes(c.fighterId)),'Unexpected combat cases: '+batch);
    for(const id of ids){
      const receipt=fighters.get(id),fighter=ROSTER.find(f=>f.id===id),policy=fighter&&createCombatProfile(fighter).referencePolicy,role=r.roles.find(role=>role.id===id);
      assert(receipt&&!coveredFighters.has(id)&&r.testedSpriteEntryHashes[id]&&policy?.combatEnabled===receipt.combatEnabled&&role?.combatEnabled===receipt.combatEnabled,'Unexpected/repeated character QA or changed role: '+id);
      assert(r.assets.some(a=>a.path===receipt.path&&a.sha256===receipt.technical.sha256)&&r.assets.some(a=>a.path===receipt.portraitPath),'Missing imported candidate/preserved portrait evidence: '+id);
      if(receipt.combatEnabled){
        const cases=r.cases.filter(c=>c.fighterId===id);
        assert(cases.length===2&&new Set(cases.map(c=>c.playerIndex)).size===2&&new Set(cases.map(c=>c.facing)).size===2,'Both combat orientations required: '+id);
        for(const c of cases)assert(c.frameCount>0&&c.commands?.length>=2&&c.commands.every(e=>e.accepted===true&&e.originalCallback===true&&e.syntheticNativeEvent===true)&&c.draws?.some(d=>d.path===receipt.path)&&c.captures?.length>=3&&c.captures.every(file=>captureMap.get(file)?.purpose==='actual-native-FightEngine')&&inspected.has(c.captures[0]),'Missing actual input/render/review evidence: '+id);
      }else{
        const previews=r.rendererPreviews.filter(p=>p.id===id);
        assert(!r.cases.some(c=>c.fighterId===id)&&previews.length===2&&new Set(previews.map(p=>p.facing)).size===2&&previews.every(p=>p.combatEnabled===false&&p.rendered?.kind==='raster'&&p.rendered.path===receipt.path&&p.rendered.fallback===false&&inspected.has(p.capture)),'Reference-only role lacks both reviewed workshop views: '+id);
      }
      coveredFighters.add(id);
    }
  }
  result.checks.push(...r.checks.map(c=>({...c,batch})));
  result.cases.push(...r.cases.map(c=>({...c,batch,report:batch+'/report.json'})));
  result.rendererPreviews.push(...(r.rendererPreviews||[]).map(p=>({...p,batch,report:batch+'/report.json'})));
  result.batches.push({id:batch,report:batch+'/report.json',reportSHA256:hash(raw),harness,generatedAt:r.generatedAt,completedAt:r.completedAt,checks:r.checks.length,cases:r.cases.length,captures:r.captures.length,dependencies:r.dependencies});
  result.visualReviews.push({batch,file:batch+'/visual-review.json',sha256:hash(reviewRaw),inspected:review.inspected,findings:review.findings,limits:review.limits||review.limitations||[],fidelity:review.fidelity});
  result.sourceValidation.push(validated);result.limits=[...new Set([...result.limits,...r.limits])];
}
assert(coveredFighters.size===fighters.size&&[...fighters.keys()].every(id=>coveredFighters.has(id)),'Imported characters missing native QA: '+[...fighters.keys()].filter(id=>!coveredFighters.has(id)).join(','));
assert(coveredStages.size===stages.size&&[...stages.keys()].every(id=>coveredStages.has(id)),'Imported stages missing native QA: '+[...stages.keys()].filter(id=>!coveredStages.has(id)).join(','));
result.assets=[...assets.values()];result.harnesses=[...harnesses.values()];
result.counts={characters:fighters.size,combatProfiles:[...fighters.values()].filter(f=>f.combatEnabled).length,referenceOnlyProfiles:[...fighters.values()].filter(f=>!f.combatEnabled).length,stages:stages.size,successfulBatches:result.batches.length,duelCases:result.cases.filter(c=>c.fighterId).length,stageCases:result.cases.filter(c=>!c.fighterId).length,referencePreviews:result.rendererPreviews.length,captures:result.captures.length,visuallyInspectedCaptures:result.visualReviews.reduce((n,r)=>n+r.inspected.length,0),checkExecutions:result.checks.length,uniqueSourceAssets:result.assets.length};
result.coveredIds={characters:[...coveredFighters].sort(),stages:[...coveredStages].sort()};
result.checkCountNote='Executed assertions, including common checks repeated across batches; not unique assertions. No test, process exit code or browser result is invented by this aggregation.';
result.captureRetention='Every source asset and capture referenced by the selected successful batch reports is preserved with exact bytes and PNG dimensions.';
result.passed=true;
const out=resolve(option('out')||resolve(qa,'report.json'));await writeFile(out,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({passed:true,out,counts:result.counts}));
