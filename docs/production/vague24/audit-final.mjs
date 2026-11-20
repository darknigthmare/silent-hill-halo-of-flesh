/** Exact wave24 preservation and cache audit. This does not render or certify fidelity.
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
import {stageBitmapFor,stageBitmapFrames,stageBitmapRooms} from '../../../src/stage-bitmaps.js';

const root=resolve(fileURLToPath(new URL('../../../',import.meta.url)));
const option=name=>process.argv.find(x=>x.startsWith('--'+name+'='))?.slice(name.length+3);
const expectedIds=(option('ids')||'').split(',').filter(Boolean);
const receiptPaths=process.argv.filter(x=>x.startsWith('--receipt=')).map(x=>resolve(x.slice(10)));
if(!expectedIds.length||new Set(expectedIds).size!==expectedIds.length||!receiptPaths.length||!option('out'))throw Error('Explicit unique --ids, completed --receipt paths, and a fresh --out are required.');
const out=resolve(option('out'));
try{await access(out);throw Error('Preserve prior audit evidence; use a fresh output.');}catch(e){if(e.code!=='ENOENT')throw e;}
const hash=b=>createHash('sha256').update(b).digest('hex'),jsonHash=v=>hash(JSON.stringify(v));
const read=async path=>JSON.parse(await readFile(path,'utf8'));
const git=args=>execFileSync('git',args,{cwd:root,maxBuffer:32*1024*1024});
const baseline=await read(resolve(root,'docs/production/vague24/scope-baseline.json'));
// The recovery was published as remote commit 4b36a85 with this exact tree.
// Compare by the reachable immutable tree so a fresh clone does not need the local-only reconciliation commit.
if(baseline.baseCommit!=='54404d2280f6feee9530e95c42ffcb711a597e19'||baseline.baseTree!=='1fcc00e732178bcf5bd2948da8d2f8a32d6713d1'||git(['rev-parse',baseline.baseTree+'^{tree}']).toString().trim()!==baseline.baseTree)throw Error('Unexpected reconciled wave24 baseline.');
const before=JSON.parse(git(['show',baseline.baseTree+':art/registry.json'])).assets;
const current=(await read(resolve(root,'art/registry.json'))).assets;
const sameSet=(a,b)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
const evidencePath=path=>{if(typeof path!=='string')throw Error('Missing evidence path');const index=path.indexOf('docs/production/');if(index<0)throw Error('Evidence must be retained within the repository: '+path);return resolve(root,path.slice(index));};
const withoutRasterAudit=value=>JSON.stringify(value,(key,v)=>['visibleBounds','alphaBounds','framingBounds','pixelSHA256','transparentFraction'].includes(key)?undefined:v);
const report={schema:1,wave:24,createdAt:new Date().toISOString(),baseCommit:baseline.baseCommit,baseTree:baseline.baseTree,
  method:'Exact SHA256 and semantic comparison to the reconciled local baseline; source and selection preservation; real cache admission for changed combat views against existing opponents.',
  visualQA:false,browserTest:false,originalTimingCertified:false,oneToOneCertified:false,
  checks:[],assets:[],receipts:[],coverage:{},memory:{},passed:false};
const check=(name,ok,detail)=>{report.checks.push({name,passed:!!ok,...(detail===undefined?{}:{detail})});if(!ok)throw Error(name);};
const bytesCost=frames=>[...new Map(frames.map(f=>[f.path,f])).values()].reduce((n,f)=>n+f.width*f.height*4,0);
try{
  const ids=[];
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
      check('One complete reviewed native subject: '+id,item.singleSubjectReviewed===true&&item.wholeSubjectReviewed===true&&Array.isArray(item.references)&&item.references.length>0);
      check('Native source, imported idle and receipt agree: '+id,frame?.sha256===item.sha256&&entry.path===frame?.path&&hash(source)===item.sha256&&source.length===frame.bytes&&entry.nativePixelsPreserved===true);
      check('Source edition and existing role agree: '+id,item.source===fighter?.source&&art.source===fighter.source&&entry.combatEnabled===createCombatProfile(fighter).referencePolicy.combatEnabled);
      check('Candidate status and static clip accounting are explicit: '+id,art.combatView==='side-view-candidate'&&art.fidelity==='unverified'&&art.frames[0].path!==art.portrait.path&&art.animatedClips===before[id].animatedClips);
      const bytes=await readFile(resolve(root,frame.path));
      check('PNG bytes and dimensions match their descriptor: '+id,bytes.length===frame.bytes&&hash(bytes)===frame.sha256&&frame.width>=256&&frame.height>=128&&frame.width<=4096&&frame.height<=4096);
      report.assets.push({fighterId:id,path:frame.path,sha256:frame.sha256,bytes:frame.bytes,width:frame.width,height:frame.height,combatEnabled:entry.combatEnabled,calibration:{facing:frame.facing,anchor:frame.anchor,bodyHeight:frame.bodyHeight}});
    }
  }
  check('No profile imported twice',new Set(ids).size===ids.length);
  check('Only the explicit reviewed profiles were imported',sameSet(ids,expectedIds));
  check('Sprite manifest matches authored registry except recalculated raster fields',withoutRasterAudit(SPRITES)===withoutRasterAudit(current));
  for(const file of baseline.protectedFiles){const raw=await readFile(resolve(root,file.path));check('Protected file unchanged: '+file.path,raw.length===file.bytes&&hash(raw)===file.sha256);}
  check('All runtime profile definitions remain exact',ROSTER.length===baseline.roster.length&&ROSTER.every(f=>baseline.roster.some(b=>b.id===f.id&&b.definitionSHA256===jsonHash(f))));
  check('No character identity added or removed',sameSet(Object.keys(before),Object.keys(current)));
  check('Exactly the reviewed registry entries changed',sameSet(Object.keys(current).filter(id=>jsonHash(current[id])!==jsonHash(before[id])),expectedIds));
  for(const [id,prior] of Object.entries(before)){
    const now=current[id];
    check('Preserved selection and clips: '+id,JSON.stringify(prior.portrait)===JSON.stringify(now.portrait)&&JSON.stringify(prior.clips)===JSON.stringify(now.clips)&&prior.animatedClips===now.animatedClips);
    if(ids.includes(id))check('Other authored poses preserved: '+id,JSON.stringify(prior.frames.slice(1))===JSON.stringify(now.frames.slice(1)));
  }
  const oldStageRaw=git(['show',baseline.baseTree+':src/stage-bitmap-manifest.js']);
  check('Every stage and historical composition is unchanged',oldStageRaw.equals(await readFile(resolve(root,'src/stage-bitmap-manifest.js'))));
  const priorFrames=[...new Map(Object.values(before).flatMap(a=>[...a.frames,a.portrait].filter(Boolean)).map(f=>[f.path,f])).values()];
  for(const frame of priorFrames){const raw=await readFile(resolve(root,frame.path));if(raw.length!==frame.bytes||hash(raw)!==frame.sha256)throw Error('Previous PNG changed: '+frame.path);}
  check('Every previously referenced character PNG remains byte-identical',true,{files:priorFrames.length});
  const outsideGenerated=text=>text.replace(/\/\/ BITMAP_REVISION_BEGIN[\s\S]*?\/\/ BITMAP_REVISION_END/,'REVISION').replace(/  \/\/ SPRITE_ASSETS_BEGIN[\s\S]*?  \/\/ SPRITE_ASSETS_END/,'SPRITES');
  check('Service worker changes limited to sprite/revision blocks',outsideGenerated(git(['show',baseline.baseTree+':service-worker.js']).toString())===outsideGenerated(await readFile(resolve(root,'service-worker.js'),'utf8')));
  const coverage=await read(resolve(root,'data/sprite-coverage.json'));
  const activeStages=STAGES.filter(s=>!s.reference?.blocked&&stageBitmapFor(s,STAGE_BITMAPS));
  const missingStages=STAGES.filter(s=>s.reference?.blocked||!stageBitmapFor(s,STAGE_BITMAPS));
  const combatIds=ids.filter(id=>createCombatProfile(ROSTER.find(f=>f.id===id)).referencePolicy.combatEnabled===true);
  report.coverage={sprites:Object.fromEntries(Object.entries(coverage).filter(([k,v])=>typeof v!=='object')),
    upgradedProfiles:{total:ids.length,combatCandidates:combatIds.length,referenceOnly:ids.length-combatIds.length,ids,combatIds,referenceOnlyIds:ids.filter(id=>!combatIds.includes(id)),newPortraits:0,newAnimatedClips:0},
    stages:{total:STAGES.length,active:activeStages.length,missing:missingStages.length,missingUnblocked:missingStages.filter(s=>!s.reference?.blocked).length,blocked:missingStages.filter(s=>s.reference?.blocked).length,storedCompositions:Object.values(STAGE_BITMAPS).flatMap(stageBitmapRooms).length,activePNG:stageBitmapFrames(activeStages,STAGE_BITMAPS).length}};
  check('Coverage follows exact restored/upgraded views, not animations',coverage.combatSideViewCandidates===baseline.coverage.sprites.combatSideViewCandidates+ids.length&&coverage.combatLegacyUnreviewed===baseline.coverage.sprites.combatLegacyUnreviewed-ids.length&&coverage.animatedClips===baseline.coverage.sprites.animatedClips&&coverage.selectionAvailable===baseline.coverage.sprites.selectionAvailable&&coverage.combatMissing===baseline.coverage.sprites.combatMissing&&coverage.selectionMissing===baseline.coverage.sprites.selectionMissing&&coverage.certified===0&&activeStages.length===baseline.coverage.stages.active);
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
  report.missingCombat=coverage.entries.filter(e=>e.combatView==='missing');
  report.legacyViews=coverage.entries.filter(e=>e.combatView==='legacy-unreviewed');
  report.missingPortraits=coverage.entries.filter(e=>e.selection===false);
  report.passed=true;
}catch(error){report.failure=String(error.stack||error);process.exitCode=1;}
report.completedAt=new Date().toISOString();
await mkdir(dirname(out),{recursive:true});
await writeFile(out,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,coverage:report.coverage,memory:report.memory,out,failure:report.failure}));
