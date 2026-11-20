/** Read-only decoded-memory audit of integrated wave18 assets and transitions. */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ROSTER,STAGES,getFighter,createCombatProfile} from '../src/data.js';
import {SPRITES} from '../src/sprite-manifest.js';
import {STAGE_BITMAPS} from '../src/stage-bitmap-manifest.js';
import {SpriteCache,combatSpriteFor,retainedCombatFrames,shouldRetireCompletedCombat} from '../src/sprite-system.js';
import {StageBitmapCache,stageBitmapFrames,stageBitmapRooms,validateStageBitmap} from '../src/stage-bitmaps.js';
import {createRun,settleRun,resumeRun,validateRun} from '../src/run-progress.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const baseCommit='167abf6a369ab6c2329c2204e19bac79ce763ac9';
const args=process.argv.slice(2);
if(args.length>1||args.some(arg=>!arg.startsWith('--out=')||!arg.slice(6)))throw Error('Usage: node scripts/audit-wave18-memory.mjs [--out=path]');
const output=args.length?resolve(root,args[0].slice(6)):null;
const gitFile=path=>execFileSync('git',['show',baseCommit+':'+path],{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024});
const hash=text=>createHash('sha256').update(text).digest('hex');
const paths=['art/registry.json','src/sprite-manifest.js','src/stage-bitmap-manifest.js','src/sprite-system.js','src/versus.js'];
const texts=Object.fromEntries(await Promise.all(paths.map(async path=>[path,await readFile(resolve(root,path),'utf8')])));
const baseSpriteText=gitFile('art/registry.json'),baseStageText=gitFile('src/stage-bitmap-manifest.js');
const baseSprites=JSON.parse(baseSpriteText).assets,currentSprites=JSON.parse(texts['art/registry.json']).assets;
const parseStages=text=>JSON.parse(text.slice(text.indexOf('export const STAGE_BITMAPS =')+'export const STAGE_BITMAPS ='.length).trim().replace(/;\s*$/,''));
const baseStages=parseStages(baseStageText);
// The builder enriches pixel bounds, so compare the identity, frame/clip
// contract and memory metadata shared by the authored and runtime registries.
const signature=registry=>JSON.stringify(Object.entries(registry).sort(([a],[b])=>a.localeCompare(b)).map(([id,a])=>({
 id,source:a.source,combatView:a.combatView,clips:a.clips,
 frames:a.frames.map(f=>({path:f.path,sha256:f.sha256,width:f.width,height:f.height,purpose:f.purpose})),
 portrait:a.portrait&&{path:a.portrait.path,sha256:a.portrait.sha256,width:a.portrait.width,height:a.portrait.height}
})));
if(signature(currentSprites)!==signature(SPRITES))throw Error('Wave18 memory audit: art/registry.json and the runtime sprite manifest differ; build the manifest before auditing.');
if(JSON.stringify(parseStages(texts['src/stage-bitmap-manifest.js']))!==JSON.stringify(STAGE_BITMAPS))throw Error('Wave18 memory audit: stage manifest changed during module loading.');

const unique=frames=>[...new Map(frames.map(frame=>[frame.path,frame])).values()];
const bytes=frames=>unique(frames).reduce((sum,frame)=>sum+frame.width*frame.height*4,0);
const fighterCache=new SpriteCache(),stageCache=new StageBitmapCache();
const admitted=(cache,frames)=>{try{cache.validatePins(frames);return true;}catch{return false;}};
const fighterFrames=(id,registry=SPRITES)=>combatSpriteFor(getFighter(id),registry)?.frames||[];
const enabled=ROSTER.filter(f=>createCombatProfile(f).referencePolicy?.combatEnabled!==false);
const measureCold=registry=>{
 const pairs=new Map();let total=0,illustrated=0,admittedCount=0,missing=0,rejected=0,max={bytes:0,ids:[]};
 for(let i=0;i<enabled.length;i++)for(let j=i;j<enabled.length;j++){
  const ids=[enabled[i].id,enabled[j].id],sets=ids.map(id=>fighterFrames(id,registry));
  const has=sets.every(frames=>frames.length>0),frames=sets.flat(),size=bytes(frames),ok=has&&admitted(fighterCache,frames);
  total++;if(has)illustrated++;else missing++;if(ok)admittedCount++;else if(has)rejected++;
  if(has&&size>max.bytes)max={bytes:size,MiB:size/1048576,ids};
  pairs.set(ids.join('|'),{ids,illustrated:has,admitted:ok,bytes:size});
 }
 return {summary:{enabledFighters:enabled.length,totalPairsIncludingMirrors:total,illustrated,admitted:admittedCount,missingCombatArt:missing,rejectedForBudget:rejected,max},pairs};
};
const before=measureCold(baseSprites),after=measureCold(SPRITES);
const previousAdmitted=[...before.pairs.values()].filter(pair=>pair.admitted);
const regressions=previousAdmitted.flatMap(pair=>{
 const next=after.pairs.get(pair.ids.join('|'));return next?.admitted?[]:[{ids:pair.ids,beforeBytes:pair.bytes,afterBytes:next?.bytes??null,missingArt:!next?.illustrated}];
});
const actorPaths=registry=>new Set(Object.values(registry).flatMap(a=>[a.portrait,...a.frames].filter(Boolean)).map(f=>f.path));
const oldActorPaths=actorPaths(baseSprites),newActorPaths=[...actorPaths(SPRITES)].filter(path=>!oldActorPaths.has(path));
const stagePaths=registry=>new Set(Object.values(registry).flatMap(art=>stageBitmapRooms(art).flatMap(room=>room.layers.flatMap(layer=>layer.frames))).map(frame=>frame.path));
const oldStagePaths=stagePaths(baseStages),newStagePaths=[...stagePaths(STAGE_BITMAPS)].filter(path=>!oldStagePaths.has(path));

function measureStages(registry){
 const selected=STAGES.map(stage=>({stage,frames:stageBitmapFrames([stage],registry)}));
 let maxSingle={bytes:0,ids:[]},maxRetainedPair={bytes:0,ids:[]},rejectedSingles=0,rejectedPairs=0;
 for(let i=0;i<selected.length;i++){
  const first=selected[i],single=bytes(first.frames);if(single>maxSingle.bytes)maxSingle={bytes:single,ids:[first.stage.id]};
  if(!admitted(stageCache,first.frames))rejectedSingles++;
  for(let j=i;j<selected.length;j++){
   const second=selected[j],frames=[...first.frames,...second.frames],size=bytes(frames);
   if(size>maxRetainedPair.bytes)maxRetainedPair={bytes:size,ids:[first.stage.id,second.stage.id]};
   if(!admitted(stageCache,frames))rejectedPairs++;
  }
 }
 const rooms=Object.values(registry).flatMap(art=>stageBitmapRooms(art).map(room=>{
  validateStageBitmap(STAGES.find(stage=>stage.id===art.stageId),room);
  return {stageId:art.stageId,scene:room.scene,frames:room.layers.flatMap(layer=>layer.frames)};
 }));
 let allRoomPairMaxBytes=0;
 for(let i=0;i<rooms.length;i++)for(let j=i;j<rooms.length;j++)allRoomPairMaxBytes=Math.max(allRoomPairMaxBytes,bytes([...rooms[i].frames,...rooms[j].frames]));
 return {registeredStages:Object.keys(registry).length,selectedWithBitmap:selected.filter(s=>s.frames.length).length,declaredRooms:rooms.length,maxSingle,maxRetainedPair,rejectedSingles,rejectedPairs,allDeclaredRoomPairMaxBytes:allRoomPairMaxBytes};
}

const nurse='origins_faceless_nurse',scraper='arcade_scraper_arcade';
function resultEngine(playerId,opponentId){return {phase:'matchEnd',destroyed:false,isPresentingOutro:()=>false,actors:[
 {data:getFighter(playerId),grounded:true,presentation:{key:'outro',frame:89,duration:90,complete:true}},
 {data:getFighter(opponentId),grounded:true,ko:true,presentation:{key:'loseMatch',frame:144,duration:145,complete:true}}
]};}
function transitionCase(mode,seed){
 let run=createRun({mode,playerId:nurse,seed});
 const target=run.queue.indexOf(scraper);
 if(target<1||!validateRun(run))throw Error(`Wave18 memory audit: ${mode}/${seed} no longer supplies the recorded continuation.`);
 for(let index=0;index<target;index++){
  run=settleRun(run,{winnerIndex:0,stats:{winner:{healthRatio:1}},snapshot:{p1:{meter:0}}});
  if(index<target-1)run=resumeRun(run);
 }
 const next=resumeRun(run);
 if(!validateRun(run)||!validateRun(next))throw Error('Wave18 memory audit: invalid generated run transition.');
 const oldPair=[run.playerId,run.queue[run.index]],newPair=[next.playerId,next.queue[next.index]];
 const engine=resultEngine(...oldPair),retained=retainedCombatFrames(engine),pairFrames=newPair.flatMap(id=>fighterFrames(id));
 const originalUnion=[...pairFrames,...retained],gate=shouldRetireCompletedCombat(engine,pairFrames,{settled:true,resultVisible:true,retainedFrames:retained,cache:fighterCache});
 const finalPins=gate?pairFrames:originalUnion;
 const oldStage=STAGES.find(stage=>stage.id===run.stages[run.index]),newStage=STAGES.find(stage=>stage.id===next.stages[next.index]);
 const oldStageFrames=stageBitmapFrames([oldStage]),nextStageFrames=stageBitmapFrames([newStage]);
 const guardOptions={settled:true,resultVisible:true,retainedFrames:retained,cache:fighterCache};
 const refusalChecks={
  hidden:!shouldRetireCompletedCombat(engine,pairFrames,{...guardOptions,resultVisible:false}),
  unsettled:!shouldRetireCompletedCombat(engine,pairFrames,{...guardOptions,settled:false}),
  live:!shouldRetireCompletedCombat({...engine,phase:'fight'},pairFrames,guardOptions),
  reversibleRound:!shouldRetireCompletedCombat({...engine,phase:'roundEnd'},pairFrames,guardOptions),
  activeOutro:!shouldRetireCompletedCombat({...engine,isPresentingOutro:()=>true},pairFrames,guardOptions),
  destroyed:!shouldRetireCompletedCombat({...engine,destroyed:true},pairFrames,guardOptions),
  coldTooLarge:!shouldRetireCompletedCombat(engine,[...pairFrames,{path:'memory-audit:oversized-cold-image',width:4096,height:4096}],guardOptions)
 };
 return {mode,seed,queue:run.queue,stages:run.stages,oldPair,newPair,remainingIds:[next.playerId,...next.queue.slice(next.index)],
  before:{index:run.index,wins:run.wins,status:run.status,valid:validateRun(run)},after:{index:next.index,wins:next.wins,status:next.status,valid:validateRun(next)},
  allRemainingCombatSpritesPresent:[next.playerId,...next.queue.slice(next.index)].every(id=>fighterFrames(id).length>0),
  coldPair:{bytes:bytes(pairFrames),MiB:bytes(pairFrames)/1048576,frames:unique(pairFrames).length,admitted:admitted(fighterCache,pairFrames)},
  oldResult:{bytes:bytes(retained),paths:retained.map(f=>f.path)},
  originalPinUnion:{bytes:bytes(originalUnion),MiB:bytes(originalUnion)/1048576,frames:unique(originalUnion).length,admitted:admitted(fighterCache,originalUnion)},
  completedResultGate:{retires:gate,finalPinnedBytes:bytes(finalPins),admitted:admitted(fighterCache,finalPins),refusalChecks},
  separateStageCache:{nextBytes:bytes(nextStageFrames),originalUnionBytes:bytes([...oldStageFrames,...nextStageFrames]),finalPinnedBytes:bytes(gate?nextStageFrames:[...oldStageFrames,...nextStageFrames]),admitted:admitted(stageCache,gate?nextStageFrames:[...oldStageFrames,...nextStageFrames])}
 };
}

async function simulateContinuation(facts,{failFinal=false}={}){
 const failures=new Set();let peak=0,cache;
 cache=new SpriteCache({url:path=>path,createImage:()=>{
  peak=Math.max(peak,cache.bytes+cache.reservedBytes);
  const image={decode:async()=>{}};
  Object.defineProperty(image,'src',{set(path){const frame=cache.entries.get(path).frame;image.naturalWidth=frame.width;image.naturalHeight=frame.height;
   queueMicrotask(()=>failures.has(path)?image.onerror?.():image.onload?.());
  }});return image;
 }});
 cache.pin(facts.oldPair.flatMap(id=>fighterFrames(id)));
 const oldLoaded=await cache.prepare(facts.oldPair.map(getFighter));
 const engine=resultEngine(...facts.oldPair),retained=retainedCombatFrames(engine);cache.pin(retained);
 const originalImages=retained.map(frame=>[frame.path,cache.peek(frame.path)]);
 const globalPreflight=await cache.prepare(facts.remainingIds.map(getFighter));
 const oldResultReadyAfterGlobal=originalImages.every(([path,image])=>cache.peek(path)===image);
 const next=facts.newPair.flatMap(id=>fighterFrames(id));
 const gate=globalPreflight.ok&&shouldRetireCompletedCombat(engine,next,{settled:true,resultVisible:true,retainedFrames:retained,cache});
 if(gate)cache.pin([]);
 const rollback=cache.pinnedFrames();let finalPinError=null;
 try{cache.pin([...next,...(gate?[]:retained)]);}catch(error){finalPinError=error.message;}
 const missing=next.find(frame=>cache.status(frame.path)!=='ready');
 if(failFinal&&missing)failures.add(missing.path);
 const prepared=finalPinError?null:await cache.prepare(facts.newPair.map(getFighter));
 let failedRollback=null,retry=null;
 if(failFinal&&prepared&&!prepared.ok){
  cache.pin(rollback);failedRollback={pinnedPaths:[...cache.pins],emptyAfterRetirement:gate&&cache.pins.size===0};
  failures.clear();cache.pin(next);const repeated=await cache.prepare(facts.newPair.map(getFighter));
  retry={ok:repeated.ok,nextPairFullyReady:next.every(frame=>cache.status(frame.path)==='ready')};
 }
 return {method:'Real SpriteCache and imported retirement decision; synthetic image decoder with the integrated native dimensions. This does not execute DOM, canvas, HTTP or checkpoint writes.',oldPairLoaded:oldLoaded.ok,wholeRemainingRunPreflight:globalPreflight.ok,oldResultReadyAfterGlobal,retirementDecision:gate,finalPinError,finalPreflight:prepared?.ok??null,injectedFailurePath:failFinal?missing?.path??null:null,failedRollback,retry,peakDecodedAndReservedBytes:peak,budgetBytes:cache.maxBytes,withinBudget:peak<=cache.maxBytes};
}

const cases=[transitionCase('tournament',231),transitionCase('arcade',28),transitionCase('ritual',105)];
for(const facts of cases){facts.successSimulation=await simulateContinuation(facts);facts.failureAndRetrySimulation=await simulateContinuation(facts,{failFinal:true});}
const stagesBefore=measureStages(baseStages),stagesAfter=measureStages(STAGE_BITMAPS);
const finalPresentationClips=Object.values(SPRITES).flatMap(art=>Object.keys(art.clips).filter(key=>['winMatch','loseMatch','outro','finished'].includes(key.split('@')[0])).map(key=>({fighterId:art.fighterId,key})));
const pair=frames=>({frameCount:unique(frames).length,bytes:bytes(frames),MiB:bytes(frames)/1048576,admitted:admitted(fighterCache,frames)});
const checks={
 originalBudgetsPreserved:fighterCache.maxBytes===64*1024*1024&&stageCache.maxBytes===64*1024*1024,
 allPreviouslyAdmittedIllustratedDuelsStillAdmitted:regressions.length===0,
 allCurrentIllustratedDuelsAdmitted:after.summary.rejectedForBudget===0,
 nurseScraperColdPairAdmitted:admitted(fighterCache,[...fighterFrames(nurse),...fighterFrames(scraper)]),
 allStageSelectionsAndOldNewPairsAdmitted:stagesAfter.rejectedSingles===0&&stagesAfter.rejectedPairs===0&&stagesAfter.allDeclaredRoomPairMaxBytes<=stageCache.maxBytes,
 generatedTransitionsAdmittedAfterGate:cases.every(c=>c.allRemainingCombatSpritesPresent&&c.coldPair.admitted&&c.completedResultGate.admitted&&c.separateStageCache.admitted),
 unsafeRetirementContextsRefused:cases.every(c=>Object.values(c.completedResultGate.refusalChecks).every(Boolean)),
 continuationCacheSimulationsPass:cases.every(c=>c.successSimulation.oldPairLoaded&&c.successSimulation.wholeRemainingRunPreflight&&c.successSimulation.oldResultReadyAfterGlobal&&c.successSimulation.finalPreflight&&c.successSimulation.withinBudget),
 failureRetrySimulationsPass:cases.every(c=>c.failureAndRetrySimulation.injectedFailurePath&&c.failureAndRetrySimulation.finalPreflight===false&&c.failureAndRetrySimulation.failedRollback?.emptyAfterRetirement&&c.failureAndRetrySimulation.retry?.ok&&c.failureAndRetrySimulation.withinBudget)
};
const result={schema:1,createdAt:new Date().toISOString(),baseCommit,
 method:'Read-only comparison of git base167abf6 and the integrated authored/runtime registries. No scratch paths, proposed assets, external worktrees, decoded pixel edits or budget mutations. Unique paths cost width×height×4; compressed PNG size does not determine decoded memory. Current combat-enabled roster policies define legal pairs.',
 inputSHA256:{...Object.fromEntries(paths.map(path=>[path,hash(texts[path])])),baseSpriteRegistry:hash(baseSpriteText),baseStageManifest:hash(baseStageText)},
 runtimeManifestMatchesRegistry:true,budgets:{fighterBytes:fighterCache.maxBytes,stageBytes:stageCache.maxBytes,separateCaches:true},
 integratedDelta:{newSpritePNGCount:newActorPaths.length,newSpritePaths:newActorPaths,newStagePNGCount:newStagePaths.length,newStagePaths,newStageIds:Object.keys(STAGE_BITMAPS).filter(id=>!Object.hasOwn(baseStages,id))},
 coldDuels:{base:before.summary,integrated:after.summary,previouslyAdmittedIllustratedPairsChecked:previousAdmitted.length,regressions},
 largestRelevantActors:[nurse,scraper,'homecoming_scarlet_doll_form_094'].map(id=>({id,...pair(fighterFrames(id))})),
 nurseScraperColdPair:pair([...fighterFrames(nurse),...fighterFrames(scraper)]),
 distinction:'A cold duo and a next-duo-plus-old-result pin union are different sets. The66MiB original unions below are expected counterexamples, not cold-duel regressions. The new gate releases only an already-visible completed result after successful global preflight; failure/retry UI and frozen-canvas behavior are checked separately by the targeted transaction tests and HTTP QA.',
 settledPresentationClipInventory:finalPresentationClips,transitions:cases,
 stages:{base:stagesBefore,integrated:stagesAfter},checks,passed:Object.values(checks).every(Boolean),
 limits:['This audit does not claim successful browser gameplay, HTTP/network recovery, canvas-pixel preservation, checkpoint durability, art fidelity or source timing.','The imported decision is exercised here; the surrounding UI gates for preflight success, lease/selection validity and displayed DOM result are verified in completed-result-retirement.test.mjs and the wave18 HTTP QA.']};
const serialized=JSON.stringify(result,null,2)+'\n';
if(output){await mkdir(dirname(output),{recursive:true});await writeFile(output,serialized);console.log(JSON.stringify({report:output,passed:result.passed,checks,coldDuelRegressions:regressions.length,counterexampleUnionBytes:cases.map(c=>({mode:c.mode,seed:c.seed,bytes:c.originalPinUnion.bytes,retired:c.completedResultGate.retires}))},null,2));}
else process.stdout.write(serialized);
if(!result.passed)process.exitCode=1;
