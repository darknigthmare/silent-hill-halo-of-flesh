/** Exact wave26 preservation and cache audit. This does not render or certify fidelity.
 * --ids=id,id --receipt=/retained/receipt.json [--receipt=...] --out=/fresh/report.json
 */
import {readFile,writeFile,access,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve,dirname,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {ROSTER,STAGES,createCombatProfile} from '../../../src/data.js';
import {SPRITES} from '../../../src/sprite-manifest.js';
import {SpriteCache,combatSpriteFor} from '../../../src/sprite-system.js';
import {STAGE_BITMAPS} from '../../../src/stage-bitmap-manifest.js';
import {StageBitmapCache,stageBitmapFor,stageBitmapFrames,stageBitmapRooms} from '../../../src/stage-bitmaps.js';

const root=resolve(fileURLToPath(new URL('../../../',import.meta.url)));
const option=name=>process.argv.find(x=>x.startsWith('--'+name+'='))?.slice(name.length+3);
const expectedIds=(option('ids')||'').split(',').filter(Boolean);
const receiptPaths=process.argv.filter(x=>x.startsWith('--receipt=')).map(x=>resolve(x.slice(10)));
const animatedReceiptPaths=process.argv.filter(x=>x.startsWith('--animated-receipt=')).map(x=>resolve(x.slice(19)));
const stageReceiptPaths=process.argv.filter(x=>x.startsWith('--stage-receipt=')).map(x=>resolve(x.slice(16)));
const expectedStageIds=(option('stage-ids')||'').split(',').filter(Boolean);
if(!expectedIds.length||new Set(expectedIds).size!==expectedIds.length||!receiptPaths.length||!option('out'))throw Error('Explicit unique --ids, completed --receipt paths, and a fresh --out are required.');
if(new Set(expectedStageIds).size!==expectedStageIds.length||Boolean(expectedStageIds.length)!==Boolean(stageReceiptPaths.length))throw Error('Unique --stage-ids and corresponding --stage-receipt paths must be supplied together.');
if(animatedReceiptPaths.length>1)throw Error('Only the explicitly scoped Air Screamer animated replacement is supported.');
const out=resolve(option('out'));
try{await access(out);throw Error('Preserve prior audit evidence; use a fresh output.');}catch(e){if(e.code!=='ENOENT')throw e;}
const hash=b=>createHash('sha256').update(b).digest('hex'),jsonHash=v=>hash(JSON.stringify(v));
const read=async path=>JSON.parse(await readFile(path,'utf8'));
const git=args=>execFileSync('git',args,{cwd:root,maxBuffer:32*1024*1024});
const baseline=await read(resolve(root,'docs/production/vague26/scope-baseline.json'));
// Restored directly from published wave25 commit8c2b563; compare its exact tree.
if(baseline.baseCommit!=='8c2b56320ceb9fd5490660cb8e20a2dbf62c57bb'||baseline.baseTree!=='6a91576644a19bd0fb2ac23278e8584071e61dca'||git(['rev-parse',baseline.baseTree+'^{tree}']).toString().trim()!==baseline.baseTree)throw Error('Unexpected reconciled wave26 baseline.');
const before=JSON.parse(git(['show',baseline.baseTree+':art/registry.json'])).assets;
const beforeStages=JSON.parse(git(['show',baseline.baseTree+':src/stage-bitmap-manifest.js']).toString().match(/export const STAGE_BITMAPS = ([\s\S]*);\s*$/)[1]);
const current=(await read(resolve(root,'art/registry.json'))).assets;
const sameSet=(a,b)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
const evidencePath=path=>{if(typeof path!=='string')throw Error('Missing evidence path');const index=path.indexOf('docs/production/');if(index<0)throw Error('Evidence must be retained within the repository: '+path);return resolve(root,path.slice(index));};
const withoutRasterAudit=value=>JSON.stringify(value,(key,v)=>['visibleBounds','alphaBounds','framingBounds','pixelSHA256','transparentFraction'].includes(key)?undefined:v);
const report={schema:1,wave:26,createdAt:new Date().toISOString(),baseCommit:baseline.baseCommit,baseTree:baseline.baseTree,
  method:'Exact SHA256 and semantic comparison to the reconciled local baseline; source and selection preservation; real cache admission for changed combat views against existing opponents.',
  visualQA:false,browserTest:false,originalTimingCertified:false,oneToOneCertified:false,
  checks:[],assets:[],receipts:[],animatedReceipts:[],stageReceipts:[],coverage:{},memory:{},passed:false};
const check=(name,ok,detail)=>{report.checks.push({name,passed:!!ok,...(detail===undefined?{}:{detail})});if(!ok)throw Error(name);};
const bytesCost=frames=>[...new Map(frames.map(f=>[f.path,f])).values()].reduce((n,f)=>n+f.width*f.height*4,0);
try{
  const ids=[],animatedIds=[];
  for(const path of receiptPaths){
    const receiptRaw=await readFile(path),receipt=JSON.parse(receiptRaw);
    check('Completed import receipt: '+relative(root,path),receipt.complete===true&&Array.isArray(receipt.entries)&&receipt.entries.length>0);
    const deliveryRaw=await readFile(evidencePath(receipt.input.path)),delivery=JSON.parse(deliveryRaw);
    check('Immutable selected delivery: '+relative(root,path),hash(deliveryRaw)===receipt.input.sha256&&sameSet(delivery.selected.map(x=>x.fighterId),receipt.entries.map(x=>x.fighterId)));
    report.receipts.push({path:relative(root,path),sha256:hash(receiptRaw),delivery:{path:relative(root,evidencePath(receipt.input.path)),sha256:hash(deliveryRaw)}});
    for(const entry of receipt.entries){
      const id=entry.fighterId,item=delivery.selected.find(x=>x.fighterId===id),art=current[id],frame=art?.frames?.[0],fighter=ROSTER.find(f=>f.id===id);
      ids.push(id);
      const source=await readFile(evidencePath(item.localPath||item.file));
      const representativeSwarm=id==='film_creeper_swarm_film_173'&&fighter?.source==='film'&&
        before[id].frames.length===1&&before[id].frames[0].sha256==='8171253b7eed7045da6e7e09ab2059c314b34e0506e3fd0713160458951a6b57'&&
        item.singleSubjectReviewed===false&&item.singleCollectiveProfileReviewed===true&&item.subjectCount===3&&item.priorDisplayedSubjectCount===3&&
        item.composition==='representative-swarm'&&item.sourceSubjectCountCertified===false&&art.composition===item.composition&&
        art.subjectCount===3&&art.sourceSubjectCountCertified===false&&art.collectiveProfileReviewed===true&&
        entry.reviewScope==='one-representative-swarm-profile-three-bodies'&&entry.reviewedSubjectCount===3&&entry.sourceSubjectCountCertified===false;
      check('One complete reviewed native profile with an honest subject count: '+id,(id==='film_creeper_swarm_film_173'?representativeSwarm:item.singleSubjectReviewed===true)&&item.wholeSubjectReviewed===true&&Array.isArray(item.references)&&item.references.length>0);
      check('Native source, imported idle and receipt agree: '+id,frame?.sha256===item.sha256&&entry.path===frame?.path&&hash(source)===item.sha256&&source.length===frame.bytes&&entry.nativePixelsPreserved===true);
      check('Source edition and existing role agree: '+id,item.source===fighter?.source&&art.source===fighter.source&&entry.combatEnabled===createCombatProfile(fighter).referencePolicy.combatEnabled);
      check('Candidate status and static clip accounting are explicit: '+id,art.combatView==='side-view-candidate'&&art.fidelity==='unverified'&&art.frames[0].path!==art.portrait.path&&art.animatedClips===before[id].animatedClips);
      const bytes=await readFile(resolve(root,frame.path));
      check('PNG bytes and dimensions match their descriptor: '+id,bytes.length===frame.bytes&&hash(bytes)===frame.sha256&&frame.width>=256&&frame.height>=128&&frame.width<=4096&&frame.height<=4096);
      report.assets.push({fighterId:id,path:frame.path,sha256:frame.sha256,bytes:frame.bytes,width:frame.width,height:frame.height,combatEnabled:entry.combatEnabled,calibration:{facing:frame.facing,anchor:frame.anchor,bodyHeight:frame.bodyHeight}});
    }
  }
  for(const path of animatedReceiptPaths){
    const receiptRaw=await readFile(path),receipt=JSON.parse(receiptRaw);
    const id='sh1_air_screamer_001',prior=before[id],art=current[id];
    check('Completed dedicated Air Screamer receipt',receipt.complete===true&&receipt.fighterId===id&&JSON.stringify(receipt.replacedFrameIndices)==='[0,1,2]'&&Array.isArray(receipt.frames)&&receipt.frames.length===3);
    const deliveryRaw=await readFile(evidencePath(receipt.input.path)),delivery=JSON.parse(deliveryRaw);
    check('Immutable three-pose Air Screamer delivery',hash(deliveryRaw)===receipt.input.sha256&&Array.isArray(delivery.selected)&&delivery.selected.length===3&&delivery.selected.every(x=>x.fighterId===id)&&sameSet(delivery.selected.map(x=>x.frameIndex),[0,1,2]));
    check('Air Screamer source and role remain exact',art.source==='sh1'&&ROSTER.find(f=>f.id===id).source==='sh1'&&createCombatProfile(ROSTER.find(f=>f.id===id)).referencePolicy.combatEnabled===true);
    check('Air Screamer existing sequence and durations are retained',JSON.stringify(art.clips)===JSON.stringify(prior.clips)&&JSON.stringify(art.clips.idle.frames)==='[0,1,0,2]'&&JSON.stringify(art.clips.idle.frameTicks)==='[6,6,6,6]'&&art.clips.idle.ticksPerFrame===6&&art.clips.idle.loop===true&&JSON.stringify(art.clips.walk.frames)==='[3]'&&art.animatedClips===1);
    check('Air Screamer has exactly four frames and an unchanged glide',prior.frames.length===4&&art.frames.length===4&&JSON.stringify(art.frames[3])===JSON.stringify(prior.frames[3]));
    check('Air Screamer poses share one canvas, body anchor and body scale',art.frames.slice(0,3).every(frame=>frame.width===art.frames[0].width&&frame.height===art.frames[0].height&&JSON.stringify(frame.anchor)===JSON.stringify(art.frames[0].anchor)&&frame.bodyHeight===art.frames[0].bodyHeight));
    const retained=[{index:3,sha256:prior.frames[3].sha256}];
    check('Only the existing glide is explicitly retained as legacy metadata',JSON.stringify(art.retainedLegacyCombatFrames)===JSON.stringify(retained));
    const allowed=new Set(['frames','combatView','retainedLegacyCombatFrames']);
    check('Every other Air Screamer metadata field is unchanged',sameSet(Object.keys(prior).filter(k=>!allowed.has(k)),Object.keys(art).filter(k=>!allowed.has(k)))&&Object.keys(prior).filter(k=>!allowed.has(k)).every(k=>JSON.stringify(prior[k])===JSON.stringify(art[k])));
    check('Air Screamer is a reviewed lateral candidate, not a certified source animation',art.combatView==='side-view-candidate'&&art.fidelity==='unverified');
    for(const frameIndex of [0,1,2]){
      const item=delivery.selected.find(x=>x.frameIndex===frameIndex),entry=receipt.frames.find(x=>x.frameIndex===frameIndex),frame=art.frames[frameIndex];
      const source=await readFile(evidencePath(item.localPath||item.file)),active=await readFile(resolve(root,frame.path));
      check('Reviewed complete native Air Screamer pose '+frameIndex,item.source==='sh1'&&item.singleSubjectReviewed===true&&item.wholeSubjectReviewed===true&&Array.isArray(item.references)&&item.references.length>0);
      check('Native Air Screamer bytes match the receipt and active pose '+frameIndex,!!entry&&entry.path===frame.path&&entry.sha256===item.sha256&&frame.sha256===item.sha256&&hash(source)===item.sha256&&source.length===frame.bytes&&active.equals(source));
      check('Explicit lateral purpose and calibration for Air Screamer pose '+frameIndex,frame.purpose==='combat'&&frame.view==='side-view'&&frame.facing===1&&JSON.stringify(frame.anchor)===JSON.stringify(item.calibrationProposal.anchor)&&frame.bodyHeight===item.calibrationProposal.bodyHeight&&frame.path!==art.portrait.path);
      report.assets.push({fighterId:id,frameIndex,path:frame.path,sha256:frame.sha256,bytes:frame.bytes,width:frame.width,height:frame.height,combatEnabled:true,calibration:{facing:frame.facing,anchor:frame.anchor,bodyHeight:frame.bodyHeight}});
    }
    ids.push(id);animatedIds.push(id);
    report.animatedReceipts.push({path:relative(root,path),sha256:hash(receiptRaw),delivery:{path:relative(root,evidencePath(receipt.input.path)),sha256:hash(deliveryRaw)},fighterId:id,replacedFrameIndices:[0,1,2],preservedFrameIndices:[3],preservedClips:art.clips,newAnimatedClips:0});
  }
  check('No profile imported twice',new Set(ids).size===ids.length);
  check('Only the explicit reviewed profiles were imported',sameSet(ids,expectedIds));
  const stageIds=[];
  for(const path of stageReceiptPaths){
    const receiptRaw=await readFile(path),receipt=JSON.parse(receiptRaw),delivered=[];
    check('Completed preserving stage import: '+relative(root,path),receipt.protectedScopeUnchanged===true&&receipt.existingCompositionsPreserved===true&&receipt.stages.length>0);
    for(const input of receipt.inputs){
      const raw=await readFile(evidencePath(input.path));
      check('Immutable stage delivery: '+relative(root,evidencePath(input.path)),hash(raw)===input.sha256);
      delivered.push(...JSON.parse(raw).stages.map(s=>s.stageId));
    }
    check('Stage delivery matches receipt: '+relative(root,path),sameSet(delivered,receipt.stages.map(s=>s.stageId)));
    stageIds.push(...delivered);
    report.stageReceipts.push({path:relative(root,path),sha256:hash(receiptRaw),stageIds:delivered});
    for(const asset of receipt.assets){
      const native=await readFile(evidencePath(asset.localSource)),active=await readFile(resolve(root,asset.path));
      check('Native stage source and active asset are exact: '+asset.path,asset.pixelsModified===false&&native.length===asset.bytes&&hash(native)===asset.sha256&&active.equals(native));
      report.assets.push({stageId:asset.stageId,path:asset.path,sha256:asset.sha256,bytes:asset.bytes,width:asset.width,height:asset.height});
    }
  }
  check('Exactly the explicit reviewed missing stages were imported',new Set(stageIds).size===stageIds.length&&sameSet(stageIds,expectedStageIds));
  check('Sprite manifest matches authored registry except recalculated raster fields',withoutRasterAudit(SPRITES)===withoutRasterAudit(current));
  for(const file of baseline.protectedFiles){const raw=await readFile(resolve(root,file.path));check('Protected file unchanged: '+file.path,raw.length===file.bytes&&hash(raw)===file.sha256);}
  check('All runtime profile definitions remain exact',ROSTER.length===baseline.roster.length&&ROSTER.every(f=>baseline.roster.some(b=>b.id===f.id&&b.definitionSHA256===jsonHash(f))));
  check('No character identity added or removed',sameSet(Object.keys(before),Object.keys(current)));
  check('Exactly the reviewed registry entries changed',sameSet(Object.keys(current).filter(id=>jsonHash(current[id])!==jsonHash(before[id])),expectedIds));
  for(const [id,prior] of Object.entries(before)){
    const now=current[id];
    const staticIdleAdded=ids.includes(id)&&prior.combatView==='selection-only'&&prior.frames.length===0&&Object.keys(prior.clips).length===0;
    const expectedClips=staticIdleAdded?{idle:{frames:[0],ticksPerFrame:1,loop:false}}:prior.clips;
    check('Preserved selection and prior clips, with only an explicit missing static idle added: '+id,JSON.stringify(prior.portrait)===JSON.stringify(now.portrait)&&JSON.stringify(expectedClips)===JSON.stringify(now.clips)&&prior.animatedClips===now.animatedClips);
    if(ids.includes(id)){
      const firstPreservedIndex=animatedIds.includes(id)?3:1;
      check('Other authored poses preserved: '+id,JSON.stringify(prior.frames.slice(firstPreservedIndex))===JSON.stringify(now.frames.slice(firstPreservedIndex)));
    }
  }
  check('Every previous stage and historical composition is unchanged',Object.entries(beforeStages).every(([id,art])=>jsonHash(STAGE_BITMAPS[id])===jsonHash(art)));
  const addedStages=Object.keys(STAGE_BITMAPS).filter(id=>!Object.hasOwn(beforeStages,id));
  check('Only the delivered stage entries were added',sameSet(addedStages,expectedStageIds));
  check('New stage entries were missing and are now selectable',addedStages.every(id=>{const stage=STAGES.find(s=>s.id===id);return stage&&!stage.reference?.blocked&&!stageBitmapFor(stage,beforeStages)&&!!stageBitmapFor(stage,STAGE_BITMAPS);}));
  const priorFrames=[...new Map([...Object.values(before).flatMap(a=>[...a.frames,a.portrait].filter(Boolean)),...Object.values(beforeStages).flatMap(stageBitmapRooms).flatMap(room=>room.layers.flatMap(l=>l.frames))].map(f=>[f.path,f])).values()];
  for(const frame of priorFrames){const raw=await readFile(resolve(root,frame.path));if(raw.length!==frame.bytes||hash(raw)!==frame.sha256)throw Error('Previous PNG changed: '+frame.path);}
  check('Every previously referenced character and stage PNG remains byte-identical',true,{files:priorFrames.length});
  const outsideGenerated=text=>text.replace(/\/\/ BITMAP_REVISION_BEGIN[\s\S]*?\/\/ BITMAP_REVISION_END/,'REVISION').replace(/  \/\/ SPRITE_ASSETS_BEGIN[\s\S]*?  \/\/ SPRITE_ASSETS_END/,'SPRITES').replace(/  \/\/ STAGE_BITMAP_ASSETS_BEGIN[\s\S]*?  \/\/ STAGE_BITMAP_ASSETS_END/,'STAGES');
  check('Service worker changes limited to generated asset/revision blocks',outsideGenerated(git(['show',baseline.baseTree+':service-worker.js']).toString())===outsideGenerated(await readFile(resolve(root,'service-worker.js'),'utf8')));
  const priorStageTest=git(['show',baseline.baseTree+':tests/stage-bitmaps.test.mjs']).toString();
  const expectedStageTest=priorStageTest.replace('sh1_air_screamer_001.f208137d6414.png','sh1_air_screamer_001.3af1bfe6260c.png');
  check('CI regression fix changes only the obsolete Air Screamer asset expectation',expectedStageTest!==priorStageTest&&expectedStageTest===await readFile(resolve(root,'tests/stage-bitmaps.test.mjs'),'utf8'));
  const priorBrowserWorkflow=git(['show',baseline.baseTree+':.github/workflows/browser-qa.yml']).toString();
  const expectedBrowserWorkflow=priorBrowserWorkflow.replace('      - name: Retain test report and captures only','      - name: Inspect wave26 native artwork in the built HTTP app\n        run: node docs/production/vague26/run-ci-browser-check.mjs\n      - name: Retain test report and captures only').replace('            tests/http-art-batch4/','            tests/http-art-batch4/\n            tests/http-wave26-native/');
  check('Browser CI adds only the scoped art check and retained captures, preserving permissions and existing steps',expectedBrowserWorkflow!==priorBrowserWorkflow&&expectedBrowserWorkflow===await readFile(resolve(root,'.github/workflows/browser-qa.yml'),'utf8'));
  const coverage=await read(resolve(root,'data/sprite-coverage.json'));
  const activeStages=STAGES.filter(s=>!s.reference?.blocked&&stageBitmapFor(s,STAGE_BITMAPS));
  const missingStages=STAGES.filter(s=>s.reference?.blocked||!stageBitmapFor(s,STAGE_BITMAPS));
  const combatIds=ids.filter(id=>createCombatProfile(ROSTER.find(f=>f.id===id)).referencePolicy.combatEnabled===true);
  report.coverage={sprites:Object.fromEntries(Object.entries(coverage).filter(([k,v])=>typeof v!=='object')),
    upgradedProfiles:{total:ids.length,staticProfiles:ids.length-animatedIds.length,existingAnimatedProfilesReoriented:animatedIds.length,existingAnimatedFrameReplacements:animatedIds.length*3,animatedIds,combatCandidates:combatIds.length,referenceOnly:ids.length-combatIds.length,ids,combatIds,referenceOnlyIds:ids.filter(id=>!combatIds.includes(id)),newPortraits:0,newAnimatedClips:0},
    stages:{total:STAGES.length,active:activeStages.length,missing:missingStages.length,missingUnblocked:missingStages.filter(s=>!s.reference?.blocked).length,blocked:missingStages.filter(s=>s.reference?.blocked).length,added:stageIds.length,ids:stageIds,storedCompositions:Object.values(STAGE_BITMAPS).flatMap(stageBitmapRooms).length,activePNG:stageBitmapFrames(activeStages,STAGE_BITMAPS).length}};
  const filledMissing=ids.filter(id=>before[id].combatView==='selection-only'&&before[id].frames.length===0);
  const upgradedLegacy=ids.filter(id=>!filledMissing.includes(id));
  report.coverage.upgradedProfiles.filledMissing=filledMissing;
  report.coverage.upgradedProfiles.upgradedLegacy=upgradedLegacy;
  report.coverage.upgradedProfiles.newStaticIdles=filledMissing.length;
  check('Coverage follows exact upgraded and newly supplied views and stages, with no animation added',coverage.combatSideViewCandidates===baseline.coverage.sprites.combatSideViewCandidates+ids.length&&coverage.combatLegacyUnreviewed===baseline.coverage.sprites.combatLegacyUnreviewed-upgradedLegacy.length&&coverage.animatedClips===baseline.coverage.sprites.animatedClips&&coverage.selectionAvailable===baseline.coverage.sprites.selectionAvailable&&coverage.combatMissing===baseline.coverage.sprites.combatMissing-filledMissing.length&&coverage.selectionMissing===baseline.coverage.sprites.selectionMissing&&coverage.certified===0&&activeStages.length===baseline.coverage.stages.active+stageIds.length);
  const cache=new SpriteCache();
  check('Existing fighter cache budget retained',cache.maxBytes===64*1024*1024);
  const seen=new Set(),pairs=[];
  for(const id of combatIds)for(const opponent of ROSTER){
    if(!createCombatProfile(opponent).referencePolicy.combatEnabled)continue;
    const pair=[id,opponent.id].sort(),key=pair.join('|');if(seen.has(key))continue;seen.add(key);
    const arts=pair.map(member=>combatSpriteFor(ROSTER.find(f=>f.id===member),SPRITES));
    if(arts.some(x=>!x))continue;
    const frames=arts.flatMap(a=>a.frames);cache.validatePins(frames);pairs.push({ids:pair,decodedBytes:bytesCost(frames)});
  }
  report.memory={fighterBudgetBytes:cache.maxBytes,changedPairsChecked:pairs.length,maximumDecodedBytes:Math.max(0,...pairs.map(x=>x.decodedBytes)),rejections:0,
    scope:'Changed combat views paired with every currently illustrated, combat-enabled opponent. Other registry frames are verified unchanged; the earlier full pair matrix is not recounted as a new run.'};
  check('All affected illustrated duels fit the existing cache',pairs.length>0||combatIds.length===0,report.memory);
  const stageCache=new StageBitmapCache(),rooms=Object.values(STAGE_BITMAPS).flatMap(stageBitmapRooms),stagePairs=new Set();
  let maxStageBytes=0;
  check('Existing stage cache budget retained',stageCache.maxBytes===64*1024*1024);
  for(const id of stageIds)for(const [roomIndex,room] of rooms.entries()){
    const key=[id,room.stageId+':'+(room.scene||roomIndex)].sort().join('|');if(stagePairs.has(key))continue;stagePairs.add(key);
    const frames=[...stageBitmapFrames([STAGES.find(s=>s.id===id)],STAGE_BITMAPS),...room.layers.flatMap(l=>l.frames)];
    stageCache.validatePins(frames);maxStageBytes=Math.max(maxStageBytes,bytesCost(frames));
  }
  report.memory.stages={budgetBytes:stageCache.maxBytes,changedStageRoomPairsChecked:stagePairs.size,maximumDecodedBytes:maxStageBytes,rejections:0,scope:'Each newly authored stage paired with every stored room composition, including historical room variants. No full unchanged pair matrix is recounted.'};
  check('All affected stage and historical room pairs fit the existing cache',stagePairs.size>0||stageIds.length===0,report.memory.stages);
  report.missingStages=missingStages.map(s=>({id:s.id,name:s.name,source:s.source,blocked:!!s.reference?.blocked}));
  report.missingCombat=coverage.entries.filter(e=>e.combatView==='missing');
  report.legacyViews=coverage.entries.filter(e=>e.combatView==='legacy-unreviewed');
  report.missingPortraits=coverage.entries.filter(e=>e.selection===false);
  report.passed=true;
}catch(error){report.failure=String(error.stack||error);process.exitCode=1;}
report.completedAt=new Date().toISOString();
await mkdir(dirname(out),{recursive:true});
await writeFile(out,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,coverage:report.coverage,memory:report.memory,out,failure:report.failure}));
