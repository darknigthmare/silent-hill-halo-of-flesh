/** Validate individual story illustrations and maintain their offline asset block. */
import {readFile,writeFile,lstat,realpath} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {ROSTER,STAGES} from '../src/data.js';
import {storyArtwork} from '../src/story-art.js';
import {auditStagePng,MAX_STAGE_BITMAP_BYTES} from './build-stage-bitmaps.mjs';

const sourceRoot=fileURLToPath(new URL('../',import.meta.url));
export async function auditStoryArtwork({root=sourceRoot}={}) {
  const physicalRoot=await realpath(root),paths=new Set(),entries=[];
  for(const fighter of ROSTER) {
    const art=storyArtwork(fighter.id);
    if(!art)continue;
    if(art.fighterId!==fighter.id||art.source!==fighter.source||art.status!=='integrated-candidate'||art.fidelity!=='unverified')throw Error('Story artwork identity/status mismatch: '+fighter.id);
    if(!STAGES.some(stage=>stage.id===art.stageId&&stage.source===art.source))throw Error('Story artwork stage/source mismatch: '+fighter.id);
    for(const moment of ['intro','rival','ending']) {
      const frame=art[moment];if(!frame)continue;
      if(!/^assets\/stories\/[a-z0-9_.-]+\.png$/.test(frame.path)||!frame.alt||!frame.caption)throw Error('Invalid story illustration: '+fighter.id+'/'+moment);
      const path=resolve(physicalRoot,frame.path),info=await lstat(path);
      if(relative(physicalRoot,path).startsWith('..')||!info.isFile()||info.isSymbolicLink()||await realpath(path)!==path||info.size>MAX_STAGE_BITMAP_BYTES)throw Error('Unsafe story image: '+frame.path);
      const bytes=await readFile(path),digest=createHash('sha256').update(bytes).digest('hex'),audit=auditStagePng(bytes);
      if(digest!==frame.sha256||bytes.length!==frame.bytes||audit.width!==frame.width||audit.height!==frame.height||audit.format!=='PNG'||audit.animated)throw Error('Story image metadata mismatch: '+frame.path);
      if(!frame.path.includes(digest.slice(0,12))||paths.has('/'+frame.path))throw Error('Story image must have its own versioned file: '+frame.path);
      paths.add('/'+frame.path);
      entries.push({fighterId:fighter.id,source:fighter.source,stageId:art.stageId,moment,path:frame.path,sha256:digest,bytes:bytes.length,width:audit.width,height:audit.height,animated:false,fidelity:art.fidelity});
    }
  }
  return {stories:new Set(entries.map(e=>e.fighterId)).size,illustrations:entries.length,paths:[...paths].sort(),entries};
}
export async function buildStoryArtwork(options={}) {
  const report=await auditStoryArtwork(options),workerPath=resolve(options.root||sourceRoot,'service-worker.js');
  const worker=await readFile(workerPath,'utf8');
  const begin='// STORY_ART_ASSETS_BEGIN',end='// STORY_ART_ASSETS_END';
  if(worker.split(begin).length!==2||worker.split(end).length!==2)throw Error('Story asset markers missing or duplicated');
  let count=0;
  const updated=worker.replace(/(^  \/\/ STORY_ART_ASSETS_BEGIN)(\r?\n)([\s\S]*?)(^  \/\/ STORY_ART_ASSETS_END)/gm,(_match,opening,newline,_body,closing)=>{
    count++;return opening+newline+report.paths.map(path=>'  '+JSON.stringify(path)+',').join(newline)+(report.paths.length?newline:'')+closing;
  });
  if(count!==1)throw Error('Story asset marker order invalid');
  if(updated!==worker)await writeFile(workerPath,updated);
  console.log('Story artwork audit: '+report.stories+' individual stories; '+report.illustrations+' static candidate illustrations; no fidelity certification.');
  return report;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await buildStoryArtwork();
