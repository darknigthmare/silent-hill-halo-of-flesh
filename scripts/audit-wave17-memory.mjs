import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {ROSTER,STAGES,createCombatProfile} from '../src/data.js';
import {SpriteCache,combatSpriteFor,retainedCombatFrames} from '../src/sprite-system.js';
import {StageBitmapCache,stageBitmapFrames,stageBitmapRooms,validateStageBitmap} from '../src/stage-bitmaps.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const baseCommit='96cbd9c49233230e8ddaed08f6f6063734aef96e';
const args=process.argv.slice(2);
if(args.length>1||args.some(arg=>!arg.startsWith('--out=')||!arg.slice(6)))throw new Error('Usage: node scripts/audit-wave17-memory.mjs [--out=path]');
// Relative output paths are resolved from the repository root; no output file
// is written unless --out is explicitly supplied.
const output=args.length?resolve(root,args[0].slice(6)):null;
const gitFile=path=>execFileSync('git',['show',baseCommit+':'+path],{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024});
const digest=text=>createHash('sha256').update(text).digest('hex');
const parseManifest=text=>JSON.parse(text.slice(text.indexOf('export const STAGE_BITMAPS =')+'export const STAGE_BITMAPS ='.length).trim().replace(/;\s*$/,''));
const currentSpriteText=await readFile(root+'art/registry.json','utf8');
const currentStageText=await readFile(root+'src/stage-bitmap-manifest.js','utf8');
const currentFlowText=await readFile(root+'src/versus.js','utf8');
const baseSpriteText=gitFile('art/registry.json');
const baseStageText=gitFile('src/stage-bitmap-manifest.js');
const baseSprites=JSON.parse(baseSpriteText).assets,currentSprites=JSON.parse(currentSpriteText).assets,integratedSprites=currentSprites;
const baseStages=parseManifest(baseStageText),currentStages=parseManifest(currentStageText),integratedStages=currentStages;
const reviewedProfileIds=['downpour_doll_106','shattered_raw_shock_diseased_101','bom_nurse_128','bom_needler_127'];
const fighterCache=new SpriteCache(),stageCache=new StageBitmapCache();
if(fighterCache.maxBytes!==64*1024*1024||stageCache.maxBytes!==64*1024*1024)throw Error('Unexpected runtime budget');
const unique=frames=>[...new Map(frames.map(frame=>[frame.path,frame])).values()];
const bytes=frames=>unique(frames).reduce((sum,frame)=>sum+frame.width*frame.height*4,0);
const allowed=(cache,frames)=>{try{cache.validatePins(frames);return true;}catch{return false;}};
const fFrames=(id,registry)=>combatSpriteFor(ROSTER.find(f=>f.id===id),registry)?.frames||[];
const enabled=ROSTER.filter(f=>createCombatProfile(f).referencePolicy?.combatEnabled!==false);
const coldStats=registry=>{
 let total=0,admitted=0,missing=0,rejected=0,max={bytes:0,ids:[]};
 const results=new Map();
 for(let i=0;i<enabled.length;i++)for(let j=i;j<enabled.length;j++){
  const ids=[enabled[i].id,enabled[j].id],frames=ids.flatMap(id=>fFrames(id,registry));
  const has=ids.every(id=>fFrames(id,registry).length);
  const size=bytes(frames),ok=has&&allowed(fighterCache,frames),key=ids.join('|');
  total++;if(!has)missing++;else if(ok)admitted++;else rejected++;
  if(has&&size>max.bytes)max={bytes:size,ids};
  results.set(key,{ok,has,bytes:size,ids});
 }
 return {summary:{enabledFighters:enabled.length,totalPairsIncludingMirrors:total,admitted,missingCombatArt:missing,rejectedForBudget:rejected,max},results};
};
const baseCold=coldStats(baseSprites),integratedCold=coldStats(integratedSprites);
const comparison=(oldStats,newStats)=>[...oldStats.results].flatMap(([key,old])=>old.ok&&!newStats.results.get(key).ok?[{ids:old.ids,before:old.bytes,after:newStats.results.get(key).bytes}]:[]);
const stageStats=registry=>{
 const selections=STAGES.map(stage=>({stage,frames:stageBitmapFrames([stage],registry)}));
 let maxSingle={bytes:0,ids:[]},maxRetainedPair={bytes:0,ids:[]},rejectedSingles=0,rejectedPairs=0;
 for(let i=0;i<selections.length;i++){
  const one=selections[i],size=bytes(one.frames);if(size>maxSingle.bytes)maxSingle={bytes:size,ids:[one.stage.id]};
  if(!allowed(stageCache,one.frames))rejectedSingles++;
  for(let j=i;j<selections.length;j++){
   const two=selections[j],frames=[...one.frames,...two.frames],size=bytes(frames);
   if(size>maxRetainedPair.bytes)maxRetainedPair={bytes:size,ids:[one.stage.id,two.stage.id]};
   if(!allowed(stageCache,frames))rejectedPairs++;
  }
 }
 const rooms=Object.values(registry).flatMap(entry=>stageBitmapRooms(entry).map(room=>({id:entry.stageId,scene:room.scene,frames:room.layers.flatMap(layer=>layer.frames)})));
 for(const room of rooms)validateStageBitmap(STAGES.find(stage=>stage.id===room.id),{...registry[room.id],...stageBitmapRooms(registry[room.id]).find(value=>value.scene===room.scene)});
 const largestRoom=rooms.map(room=>({id:room.id,scene:room.scene,bytes:bytes(room.frames)})).sort((a,b)=>b.bytes-a.bytes)[0];
 let allRoomPairBound=0;
 for(let i=0;i<rooms.length;i++)for(let j=i;j<rooms.length;j++)allRoomPairBound=Math.max(allRoomPairBound,bytes([...rooms[i].frames,...rooms[j].frames]));
 return {registeredStages:Object.keys(registry).length,selectedStages:selections.filter(s=>s.frames.length).length,declaredRooms:rooms.length,maxSingle,maxRetainedPair,rejectedSingles,rejectedPairs,largestRoom,allDeclaredRoomPairMaxBytes:allRoomPairBound,newStages:selections.filter(s=>['film_hospital','underground_hc'].includes(s.stage.id)).map(s=>({id:s.stage.id,bytes:bytes(s.frames),frameCount:unique(s.frames).length}))};
};
const oldIds=['sh1_air_screamer_001','sh1_groaner_003'],nextIds=['origins_faceless_nurse','sh1_air_screamer_001'];
const liveEngine={phase:'fight',actors:oldIds.map(id=>({data:ROSTER.find(f=>f.id===id),presentation:null,grounded:true,state:'idle'}))};
const transitionFacts=registry=>{
 const retained=retainedCombatFrames(liveEngine,registry),next=nextIds.flatMap(id=>fFrames(id,registry)),combined=[...retained,...next];
 return {retainedBytes:bytes(retained),nextPairBytes:bytes(next),combinedBytes:bytes(combined),combinedFrames:unique(combined).length,admitted:allowed(fighterCache,combined)};
};
async function simulate(registry,releaseBeforeNext=false){
 let peak=0,cache;
 const allFrames=new Map(Object.values(registry).flatMap(art=>art.frames).map(frame=>[frame.path,frame]));
 cache=new SpriteCache({url:path=>path,createImage:()=>{
   peak=Math.max(peak,cache.bytes+cache.reservedBytes);
   const image={decode:async()=>{}};
   Object.defineProperty(image,'src',{set(path){const frame=allFrames.get(path);image.naturalWidth=frame.width;image.naturalHeight=frame.height;queueMicrotask(()=>image.onload?.());}});
   return image;
 }});
 const retained=retainedCombatFrames(liveEngine,registry);cache.pin(retained);
 const oldLoaded=await Promise.all(retained.map(frame=>cache.load(frame)));
 if(releaseBeforeNext)cache.pin([]);
 const prepared=await cache.prepare(nextIds.map(id=>ROSTER.find(f=>f.id===id)),{registry});
 let finalPinAccepted=true,finalPinError=null;
 try {cache.pin([...(releaseBeforeNext?[]:retained),...nextIds.flatMap(id=>fFrames(id,registry))]);} catch(error) {finalPinAccepted=false;finalPinError=error.message;}
 const finalPrepared=finalPinAccepted?await cache.prepare(nextIds.map(id=>ROSTER.find(f=>f.id===id)),{registry}):null;
 return {oldLoaded:oldLoaded.every(Boolean),releasedOldLeaseBeforeNext:releaseBeforeNext,prepared:prepared.ok,failed:prepared.failed,finalPinAccepted,finalPinError,finalPrepared:finalPrepared?.ok??null,newPairFullyReady:nextIds.flatMap(id=>fFrames(id,registry)).every(frame=>cache.status(frame.path)==='ready'),peakBytes:peak,maxBytes:cache.maxBytes,retainedStillReady:retained.every(frame=>cache.status(frame.path)==='ready')};
}
const presentationClips=Object.values(integratedSprites).flatMap(art=>Object.keys(art.clips).filter(key=>['winMatch','loseMatch','outro','finished'].includes(key.split('@')[0])).map(key=>({id:art.fighterId,key})));
const largestFrame=Object.values(integratedSprites).flatMap(art=>art.frames.map(frame=>({id:art.fighterId,path:frame.path,bytes:frame.width*frame.height*4}))).sort((a,b)=>b.bytes-a.bytes)[0];
const settledBound=integratedCold.summary.max.bytes+2*largestFrame.bytes;
const result={
 schema:1,createdAt:new Date().toISOString(),baseCommit,
 inputDigests:{baseRegistry:digest(baseSpriteText),currentRegistry:digest(currentSpriteText),baseStageManifest:digest(baseStageText),currentStageManifest:digest(currentStageText),currentVersus:digest(currentFlowText)},
 selectionFlowCorrection:{randomizeReturnsToSelection:currentFlowText.includes('if(state.engine||state.loadingSprites)showSelect();'),newStageReturnsToSelection:currentFlowText.includes('if(stage.id!==state.stage.id&&(state.engine||state.loadingSprites))showSelect();'),writtenByAuditor:false,browserVerificationPerformedByAuditor:false,extraRecoveryTransactionRecommended:false},
 method:"Read-only comparison of the committed base and the actual integrated art/registry.json and src/stage-bitmap-manifest.js. No external proposals or scratch files are read. Decoded bytes = unique path width × height × 4. Real SpriteCache.validatePins and stageBitmapFrames used. No registry or budget edited.",
 budgets:{fighterBytes:fighterCache.maxBytes,stageBytes:stageCache.maxBytes,separateCaches:true,compressedPngBytesUsed:false},
 nurse:{id:'origins_faceless_nurse',before:{frames:fFrames('origins_faceless_nurse',baseSprites).length,bytes:bytes(fFrames('origins_faceless_nurse',baseSprites))},after:{frames:fFrames('origins_faceless_nurse',integratedSprites).length,bytes:bytes(fFrames('origins_faceless_nurse',integratedSprites))}},
 fighterProfiles:reviewedProfileIds.map(id=>({id,beforeBytes:bytes(fFrames(id,baseSprites)),afterBytes:bytes(fFrames(id,integratedSprites)),frameCount:fFrames(id,integratedSprites).length,combatEnabled:createCombatProfile(ROSTER.find(f=>f.id===id)).referencePolicy?.combatEnabled!==false})),
 coldDuels:{base:baseCold.summary,integrated:integratedCold.summary,regressions:comparison(baseCold,integratedCold)},
 stages:{base:stageStats(baseStages),integrated:stageStats(integratedStages)},
 settledResult:{finalResultPresentationClips:presentationClips,largestFrame,conservativeNewPairPlusTwoRetainedFramesBytes:settledBound,budgetBytes:fighterCache.maxBytes,passes:presentationClips.length===0&&settledBound<=fighterCache.maxBytes,scope:"Bound valid for current registry with no final-result presentation clips; final result retains at most one fallback/core-KO frame per actor. An existing taunt does not run during matchEnd."},
 livePreviousMatch:{oldIds,nextIds,before:transitionFacts(baseSprites),after:transitionFacts(integratedSprites),simulatedBefore:await simulate(baseSprites),simulatedAfter:await simulate(integratedSprites),simulatedAfterSelectionReset:await simulate(integratedSprites,true),conclusion:"The retained-live simulation isolates the oversized union found before the flow correction. The selectionFlowCorrection fields report whether the integrated guards return through showSelect before an effective new selection. The reset simulation checks the resulting cache behavior, without replacing browser verification or changing recovery."}
};
const serialized=JSON.stringify(result,null,2)+'\n';
if(output){
 await mkdir(dirname(output),{recursive:true});
 await writeFile(output,serialized);
 console.log(JSON.stringify({report:output,coldDuelRegressions:result.coldDuels.regressions.length,settledResultWithinBudget:result.settledResult.passes,selectionFlowCorrection:result.selectionFlowCorrection},null,2));
}else process.stdout.write(serialized);
