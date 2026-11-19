/** Exact baseline preservation, source-byte integrity and real cache-admission audit. */
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {ROSTER,STAGES,createCombatProfile} from '../../../src/data.js';
import {SPRITES} from '../../../src/sprite-manifest.js';
import {SpriteCache,combatSpriteFor} from '../../../src/sprite-system.js';
import {STAGE_BITMAPS} from '../../../src/stage-bitmap-manifest.js';
import {StageBitmapCache,stageBitmapFor,stageBitmapFrames,stageBitmapRooms} from '../../../src/stage-bitmaps.js';

const root=resolve(fileURLToPath(new URL('../../../',import.meta.url))),folder=resolve(root,'docs/production/vague22');
const hash=b=>createHash('sha256').update(b).digest('hex'),jsonHash=v=>hash(JSON.stringify(v));
const read=async path=>JSON.parse(await readFile(path,'utf8'));
const baseline=await read(resolve(folder,'scope-baseline.json'));
const git=args=>execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
if(git(['rev-parse',baseline.baseCommit+'^{tree}']).trim()!==baseline.baseTree)throw Error('Unexpected baseline tree.');
const beforeSprites=JSON.parse(git(['show',baseline.baseCommit+':art/registry.json'])).assets;
const beforeStages=JSON.parse(git(['show',baseline.baseCommit+':src/stage-bitmap-manifest.js']).match(/export const STAGE_BITMAPS = ([\s\S]*);\s*$/)[1]);
const currentSprites=(await read(resolve(root,'art/registry.json'))).assets;
const names=await readdir(folder),receipts=[];
for(const name of names.filter(n=>/^(fighter|stage)-integration-.*\.json$/.test(n)))receipts.push({name,value:await read(resolve(folder,name))});
const characterReceipts=receipts.filter(r=>r.name.startsWith('fighter-'));
const characterIds=characterReceipts.flatMap(r=>r.value.entries.map(e=>e.fighterId));
const stageIds=receipts.filter(r=>r.name.startsWith('stage-')).flatMap(r=>r.value.stages.map(s=>s.stageId));
const report={schema:1,wave:22,createdAt:new Date().toISOString(),baseCommit:baseline.baseCommit,baseTree:baseline.baseTree,
  method:'Read-only semantic and SHA256 comparison with the published base; byte-identical generated assets; real validatePins on unique decoded width×height×4 descriptors. This audit does not render or certify artistic fidelity.',
  checks:[],assets:[],coverage:{},memory:{},passed:false};
const check=(name,ok,detail)=>{report.checks.push({name,passed:!!ok,...(detail===undefined?{}:{detail})});if(!ok)throw Error(name);};
const rooms=registry=>Object.values(registry).flatMap(stageBitmapRooms);
const roomFrames=rs=>[...new Map(rs.flatMap(r=>r.layers.flatMap(l=>l.frames)).map(f=>[f.path,f])).values()];
const active=registry=>STAGES.filter(s=>!s.reference?.blocked&&stageBitmapFor(s,registry));
const cost=frames=>[...new Map(frames.map(f=>[f.path,f])).values()].reduce((n,f)=>n+f.width*f.height*4,0);
try{
  check('No repeated profile or stage across incremental imports',new Set(characterIds).size===characterIds.length&&new Set(stageIds).size===stageIds.length);
  check('Every character import completed',characterReceipts.every(r=>r.value.complete===true));
  for(const f of baseline.protectedFiles){const raw=await readFile(resolve(root,f.path));check('Protected source unchanged: '+f.path,raw.length===f.bytes&&hash(raw)===f.sha256);}
  check('All 230 runtime definitions are unchanged',ROSTER.length===baseline.roster.length&&ROSTER.every(f=>baseline.roster.some(b=>b.id===f.id&&b.definitionSHA256===jsonHash(f))));
  check('No new or deleted character IDs',JSON.stringify(Object.keys(beforeSprites).sort())===JSON.stringify(Object.keys(currentSprites).sort()));
  const changed=Object.keys(currentSprites).filter(id=>jsonHash(currentSprites[id])!==jsonHash(beforeSprites[id]));
  check('Exactly the delivered character entries changed',JSON.stringify([...changed].sort())===JSON.stringify([...characterIds].sort()));
  for(const [id,before] of Object.entries(beforeSprites)){
    const now=currentSprites[id];
    check('Historical portrait and animated clips preserved: '+id,JSON.stringify(before.portrait)===JSON.stringify(now.portrait)&&JSON.stringify(before.clips)===JSON.stringify(now.clips)&&before.animatedClips===now.animatedClips);
    if(characterIds.includes(id))check('Only static idle frame replaced: '+id,JSON.stringify(before.frames.slice(1))===JSON.stringify(now.frames.slice(1))&&now.combatView==='side-view-candidate'&&now.fidelity==='unverified');
  }
  check('Existing stage entries and historical room variants preserved',Object.entries(beforeStages).every(([id,a])=>jsonHash(STAGE_BITMAPS[id])===jsonHash(a)));
  const added=Object.keys(STAGE_BITMAPS).filter(id=>!Object.hasOwn(beforeStages,id));
  check('Exactly the delivered missing stages were added',JSON.stringify([...added].sort())===JSON.stringify([...stageIds].sort()));
  check('New stages were absent and are now selectable',added.every(id=>{const s=STAGES.find(x=>x.id===id);return !s.reference?.blocked&&!stageBitmapFor(s,beforeStages)&&!!stageBitmapFor(s);}));
  const outsideBlocks=text=>text.replace(/\/\/ BITMAP_REVISION_BEGIN[\s\S]*?\/\/ BITMAP_REVISION_END/,'REVISION').replace(/  \/\/ SPRITE_ASSETS_BEGIN[\s\S]*?  \/\/ SPRITE_ASSETS_END/,'SPRITES').replace(/  \/\/ STAGE_BITMAP_ASSETS_BEGIN[\s\S]*?  \/\/ STAGE_BITMAP_ASSETS_END/,'STAGES');
  check('Service worker changes confined to generated asset/revision blocks',outsideBlocks(git(['show',baseline.baseCommit+':service-worker.js']))===outsideBlocks(await readFile(resolve(root,'service-worker.js'),'utf8')));
  const newFrames=[...characterIds.map(id=>currentSprites[id].frames[0]),...stageBitmapFrames(stageIds.map(id=>STAGES.find(s=>s.id===id)))];
  for(const f of newFrames){const raw=await readFile(resolve(root,f.path));check('Exact native PNG: '+f.path,raw.length===f.bytes&&hash(raw)===f.sha256);report.assets.push({path:f.path,bytes:f.bytes,sha256:f.sha256,width:f.width,height:f.height});}
  const priorFrames=[...new Map([...Object.values(beforeSprites).flatMap(a=>[...a.frames,a.portrait].filter(Boolean)),...roomFrames(rooms(beforeStages))].map(f=>[f.path,f])).values()];
  for(const f of priorFrames){const raw=await readFile(resolve(root,f.path));if(raw.length!==f.bytes||hash(raw)!==f.sha256)throw Error('Historical PNG changed: '+f.path);}
  check('Every previously referenced PNG remains byte-identical',true,{files:priorFrames.length});
  const coverage=await read(resolve(root,'data/sprite-coverage.json'));
  const stages=active(STAGE_BITMAPS),missing=STAGES.filter(s=>s.reference?.blocked||!stageBitmapFor(s));
  const combatIds=characterIds.filter(id=>createCombatProfile(ROSTER.find(f=>f.id===id)).referencePolicy.combatEnabled===true);
  report.coverage={sprites:Object.fromEntries(Object.entries(coverage).filter(([k,v])=>typeof v!=='object')),
    newCharacters:{total:characterIds.length,combatCandidates:combatIds.length,referenceOnly:characterIds.length-combatIds.length,ids:characterIds,combatIds,referenceOnlyIds:characterIds.filter(id=>!combatIds.includes(id)),newPortraits:0,newAnimatedClips:0},
    stages:{total:STAGES.length,beforeActive:baseline.coverage.stages.active,afterActive:stages.length,remaining:missing.length,remainingUnblocked:missing.filter(s=>!s.reference?.blocked).length,blocked:missing.filter(s=>s.reference?.blocked).length,added:stageIds.length,ids:stageIds,storedCompositions:rooms(STAGE_BITMAPS).length,referencedPNG:roomFrames(rooms(STAGE_BITMAPS)).length,activePNG:stageBitmapFrames(stages).length}};
  check('Coverage and static-pose accounting agree',coverage.combatSideViewCandidates===baseline.coverage.sprites.combatSideViewCandidates+characterIds.length&&coverage.combatLegacyUnreviewed===baseline.coverage.sprites.combatLegacyUnreviewed-characterIds.length&&coverage.animatedClips===baseline.coverage.sprites.animatedClips&&coverage.selectionAvailable===baseline.coverage.sprites.selectionAvailable&&coverage.certified===0);
  const fighterCache=new SpriteCache(),stageCache=new StageBitmapCache();
  report.memory.budgets={fighters:fighterCache.maxBytes,stages:stageCache.maxBytes};
  check('Existing independent 64 MiB budgets preserved',fighterCache.maxBytes===64*1024*1024&&stageCache.maxBytes===64*1024*1024);
  const fighters=ROSTER.filter(f=>createCombatProfile(f).referencePolicy.combatEnabled===true);
  const admitted=(cache,frames)=>{try{cache.validatePins(frames);return true;}catch{return false;}};
  const pairs={enabledFighters:fighters.length,total:0,illustrated:0,admitted:0,missing:0,rejected:0,previouslyAdmitted:0,regressions:[],maxDecodedBytes:0};
  for(let i=0;i<fighters.length;i++)for(let j=i;j<fighters.length;j++){
    pairs.total++;const ids=[fighters[i].id,fighters[j].id],current=ids.map(id=>combatSpriteFor(ROSTER.find(f=>f.id===id),SPRITES)),prior=ids.map(id=>combatSpriteFor(ROSTER.find(f=>f.id===id),beforeSprites));
    const oldOK=prior.every(Boolean)&&admitted(fighterCache,prior.flatMap(a=>a.frames));if(oldOK)pairs.previouslyAdmitted++;
    if(current.some(a=>!a)){pairs.missing++;if(oldOK)pairs.regressions.push({ids,reason:'missing'});continue;}
    pairs.illustrated++;const fs=current.flatMap(a=>a.frames),ok=admitted(fighterCache,fs);if(ok)pairs.admitted++;else pairs.rejected++;
    pairs.maxDecodedBytes=Math.max(pairs.maxDecodedBytes,cost(fs));if(oldOK&&!ok)pairs.regressions.push({ids,reason:'budget'});
  }
  report.memory.fighterPairs=pairs;check('No previously admitted illustrated duel exceeds its cache budget',pairs.regressions.length===0);
  function stagePairs(sets){let pairs=0,max=0;for(let i=0;i<sets.length;i++)for(let j=i;j<sets.length;j++){const fs=[...sets[i].frames,...sets[j].frames];stageCache.validatePins(fs);pairs++;max=Math.max(max,cost(fs));}return {sets:sets.length,pairsIncludingSelf:pairs,maxDecodedBytes:max,rejections:0};}
  report.memory.activeStagePairs=stagePairs(stages.map(s=>({frames:stageBitmapFrames([s])})));
  report.memory.allStoredRoomPairs=stagePairs(rooms(STAGE_BITMAPS).map(r=>({frames:roomFrames([r])})));
  check('Active and historical stage pairs fit the existing cache',true);
  report.missingStages=missing.map(s=>({id:s.id,name:s.name,source:s.source,blocked:!!s.reference?.blocked}));
  report.missingCombat=coverage.entries.filter(e=>e.combatView==='missing');
  report.legacyViews=coverage.entries.filter(e=>e.combatView==='legacy-unreviewed');
  report.passed=true;
}catch(e){report.failure=String(e.stack||e);process.exitCode=1;}
await writeFile(resolve(folder,'final-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,coverage:report.coverage,memory:report.memory,failure:report.failure}));
