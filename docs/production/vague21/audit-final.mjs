/** Read-only stage-scope and decoded-memory audit. Writes only its JSON report. */
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {STAGES} from '../../../src/data.js';
import {STAGE_BITMAPS} from '../../../src/stage-bitmap-manifest.js';
import {StageBitmapCache,stageBitmapFor,stageBitmapFrames,stageBitmapRooms} from '../../../src/stage-bitmaps.js';

const root=fileURLToPath(new URL('../../../',import.meta.url));
const out=resolve(root,process.argv.find(arg=>arg.startsWith('--out='))?.slice(6)||'docs/production/vague21/final-audit.json');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const baseline=JSON.parse(await readFile(resolve(root,'docs/production/vague21/scope-baseline.json'),'utf8'));
const selection=JSON.parse(await readFile(resolve(root,'docs/production/vague21/selection-decisions.json'),'utf8'));
const git=args=>execFileSync('git',args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:8*1024*1024});
let base;
for(const candidate of [baseline.basePublishedCommit,baseline.baseLocalCommit]){
  try{git(['cat-file','-e',candidate+'^{commit}']);base=candidate;break;}catch{}
}
if(!base)throw Error('The published base, or its identical local tree, must be available.');
if(git(['rev-parse',base+'^{tree}']).trim()!=='227f202a85e02046cd81f5438116bdc86aee7071')throw Error('Unexpected comparison tree.');
const before=JSON.parse(git(['show',base+':src/stage-bitmap-manifest.js']).match(/export const STAGE_BITMAPS = ([\s\S]*);\s*$/)[1]);
const report={schema:1,createdAt:new Date().toISOString(),baseCommitUsed:base,basePublishedCommit:baseline.basePublishedCommit,
  method:'Exact source hashes and immutable base registry comparison. Stage-cache admission uses the real validatePins and unique width×height×4 accounting. No image decoding, browser, animation or combat-behaviour claim is inferred.',
  checks:[],protectedFiles:[],coverage:{},memory:{},passed:false};
const check=(name,passed,detail)=>{report.checks.push({name,passed:!!passed,...(detail===undefined?{}:{detail})});if(!passed)throw Error(name);};
const selected=registry=>STAGES.filter(stage=>!stage.reference?.blocked&&stageBitmapFor(stage,registry));
const rooms=registry=>Object.values(registry).flatMap(stageBitmapRooms);
const frames=rs=>[...new Map(rs.flatMap(room=>room.layers.flatMap(layer=>layer.frames)).map(frame=>[frame.path,frame])).values()];
try{
  for(const file of baseline.protectedFiles){
    const bytes=await readFile(resolve(root,file.path)),sha256=hash(bytes);check('Protected source unchanged: '+file.path,bytes.length===file.bytes&&sha256===file.sha256);
    report.protectedFiles.push({path:file.path,sha256,bytes:bytes.length});
  }
  check('Every existing composition and historical variant is unchanged',Object.entries(before).every(([id,art])=>JSON.stringify(STAGE_BITMAPS[id])===JSON.stringify(art)));
  const added=Object.keys(STAGE_BITMAPS).filter(id=>!Object.hasOwn(before,id));
  check('Only the delivered missing stages were added',JSON.stringify([...added].sort())===JSON.stringify([...selection.deliveredStageIds].sort()));
  check('Every new stage was previously missing and is now active',added.every(id=>{const stage=STAGES.find(item=>item.id===id);return !stageBitmapFor(stage,before)&&!!stageBitmapFor(stage);}));
  const outsideBlocks=text=>text.replace(/\/\/ BITMAP_REVISION_BEGIN[\s\S]*?\/\/ BITMAP_REVISION_END/,'REVISION').replace(/  \/\/ STAGE_BITMAP_ASSETS_BEGIN[\s\S]*?  \/\/ STAGE_BITMAP_ASSETS_END/,'ASSETS');
  check('Service worker changes are confined to its generated bitmap blocks',outsideBlocks(git(['show',base+':service-worker.js']))===outsideBlocks(await readFile(resolve(root,'service-worker.js'),'utf8')));
  const activeBefore=selected(before),activeAfter=selected(STAGE_BITMAPS),allFrames=frames(rooms(STAGE_BITMAPS));
  const activeFrames=stageBitmapFrames(activeAfter),missing=STAGES.filter(stage=>stage.reference?.blocked||!stageBitmapFor(stage));
  report.coverage={totalStages:STAGES.length,beforeActive:activeBefore.length,afterActive:activeAfter.length,beforeMissing:STAGES.length-activeBefore.length,afterMissing:missing.length,
    remainingUnblocked:missing.filter(stage=>!stage.reference?.blocked).length,remainingBlocked:missing.filter(stage=>stage.reference?.blocked).length,
    storedRoomCompositions:rooms(STAGE_BITMAPS).length,referencedPNGCount:allFrames.length,activePNGCount:activeFrames.length,historicalInactivePNGCount:allFrames.length-activeFrames.length,
    addedStageIds:added,addedPNGCount:stageBitmapFrames(added.map(id=>STAGES.find(stage=>stage.id===id))).length};
  const newFrames=stageBitmapFrames(added.map(id=>STAGES.find(stage=>stage.id===id)));
  report.assets=[];
  for(const frame of newFrames){
    const bytes=await readFile(resolve(root,frame.path));check('Integrated PNG bytes unchanged: '+frame.path,bytes.length===frame.bytes&&hash(bytes)===frame.sha256);
    report.assets.push({...frame});
  }
  const cache=new StageBitmapCache(),cost=fs=>[...new Map(fs.map(frame=>[frame.path,frame])).values()].reduce((sum,frame)=>sum+frame.width*frame.height*4,0);
  report.memory.budgetBytes=cache.maxBytes;check('Existing stage cache budget is preserved',cache.maxBytes===64*1024*1024);
  function auditSets(sets){
    let pairCount=0,maxSingle={bytes:0,ids:[]},maxPair={bytes:0,ids:[]};
    for(let i=0;i<sets.length;i++){
      const left=sets[i];cache.validatePins(left.frames);const single=cost(left.frames);if(single>maxSingle.bytes)maxSingle={bytes:single,ids:[left.id]};
      for(let j=i;j<sets.length;j++){
        const right=sets[j],union=[...left.frames,...right.frames];cache.validatePins(union);pairCount++;const bytes=cost(union);if(bytes>maxPair.bytes)maxPair={bytes,ids:[left.id,right.id]};
      }
    }
    return {setCount:sets.length,singleCount:sets.length,pairCountIncludingSelf:pairCount,maxSingle,maxRetainedPair:maxPair,rejections:0};
  }
  report.memory.active=auditSets(activeAfter.map(stage=>({id:stage.id,frames:stageBitmapFrames([stage])})));
  report.memory.allStoredRooms=auditSets(rooms(STAGE_BITMAPS).map(room=>({id:room.stageId+':'+(room.scene||'default'),frames:frames([room])})));
  check('All active stages and all stored-room pairs fit without budget increase',true);
  report.missingStages=missing.map(stage=>({id:stage.id,name:stage.name,source:stage.source,blocked:!!stage.reference?.blocked}));
  report.passed=true;
}catch(error){report.failure=String(error.stack||error);process.exitCode=1;}
await writeFile(out,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:report.passed,coverage:report.coverage,memory:report.memory,report:out,failure:report.failure}));
