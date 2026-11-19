import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {buildProductionPlan,combineResearch} from '/workspace/scratch/8edddaaaab76/silent-hill-halo-of-flesh/scripts/build-production-plan.mjs';
import {SPRITES} from '/workspace/scratch/8edddaaaab76/silent-hill-halo-of-flesh/src/sprite-manifest.js';
const root='/workspace/scratch/8edddaaaab76/silent-hill-halo-of-flesh';
const work='/workspace/scratch/8edddaaaab76/wave19-workbook';
const bytes=async p=>fs.readFile(path.join(root,p));
const json=async p=>JSON.parse(await bytes(p));
const coverage=await json('data/sprite-coverage.json');
const research=combineResearch(await Promise.all(['classic','extended'].map(n=>json(`docs/production/research/${n}.json`))));
const plan=buildProductionPlan(research);
const inputs=['art/registry.json','art/stage-registry.json','src/sprite-manifest.js','src/stage-bitmap-manifest.js','data/sprite-coverage.json','docs/production/research/classic.json','docs/production/research/extended.json'];
const sources=[];
for(const file of inputs){try{const b=await bytes(file);sources.push({file,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')});}catch(error){if(error.code==='ENOENT'&&file==='art/stage-registry.json')continue;throw error;}}
const facts={capturedAt:new Date().toISOString(),purpose:'Read-only factual coverage snapshot after wave19 integration; not a replacement of the historical production plan.',
 metrics:plan.metrics,coverage:Object.fromEntries(Object.entries(coverage).filter(([k])=>k!=='entries')),
 fighters:plan.fighters.map(f=>({id:f.id,artState:f.artState,animatedClips:f.animatedClips,coverage:coverage.entries.find(e=>e.id===f.id)})),
 poses:plan.poses.map(p=>({id:p.id,fighterId:p.fighterId,pose:p.pose,existing:p.existing})),
 moves:plan.moves.map(m=>({id:m.id,fighterId:m.fighterId,key:m.key,clipStatus:m.clipStatus})),
 stages:plan.stages.map(s=>({id:s.id,currentStatus:s.currentStatus,bitmapProgress:s.bitmapProgress,archivedBitmapProgress:s.archivedBitmapProgress})),
 clips:Object.entries(SPRITES).flatMap(([fighterId,art])=>Object.entries(art.clips).map(([key,clip])=>({fighterId,key,frames:clip.frames.length,distinct:new Set(clip.frames.map(i=>art.frames[i].pixelSHA256||art.frames[i].sha256)).size,ticks:(clip.frameTicks||clip.frames.map(()=>clip.ticksPerFrame)).reduce((a,b)=>a+b,0)}))),sources};
if(coverage.selectionAvailable!==204||coverage.combatSideViewCandidates!==135||coverage.animatedClips!==6||plan.stages.filter(s=>s.bitmapProgress).length!==32)throw new Error('Final integration counts differ from the authorized wave19 snapshot');
await fs.mkdir(work,{recursive:true});
await fs.writeFile(path.join(work,'wave19-current-coverage.json'),JSON.stringify(facts,null,2)+'\n');
await fs.copyFile(path.join(root,'docs/production/SILENT_HILL_HALO_OF_FLESH_PHASE1_MOVESETS_ANIMATIONS.xlsx'),path.join(work,'original-before-wave19.xlsx'));
console.log(JSON.stringify({portraits:coverage.selectionAvailable,sideViews:coverage.combatSideViewCandidates,animatedClips:coverage.animatedClips,stageCandidates:facts.stages.filter(s=>s.bitmapProgress).length,animated:facts.clips.filter(c=>c.distinct>1),metrics:plan.metrics},null,2));
