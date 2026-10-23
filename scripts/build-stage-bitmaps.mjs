/** Validate authored exact-stage PNGs and refresh only their service-worker block. */
import {readFile,writeFile,lstat,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {STAGES} from '../src/data.js';
import {STAGE_BITMAPS} from '../src/stage-bitmap-manifest.js';
import {validateStageBitmap} from '../src/stage-bitmaps.js';

export const MAX_STAGE_BITMAP_BYTES=24*1024*1024;
const sourceRoot=fileURLToPath(new URL('../',import.meta.url));
const decoder=fileURLToPath(new URL('./validate-stage-png.py',import.meta.url));
const fail=message=>{throw new Error('Stage bitmap manifest: '+message);};

export function auditStagePng(bytes,{python=process.env.HALO_PYTHON||(process.platform==='win32'?'python':'python3')}={}){
  if(!Buffer.isBuffer(bytes)||!bytes.length||bytes.length>MAX_STAGE_BITMAP_BYTES)fail('PNG must be 1..24 MiB');
  const decoded=spawnSync(python,[decoder],{input:bytes,timeout:15000,maxBuffer:128*1024,windowsHide:true});
  if(decoded.error||decoded.status!==0)fail('PNG decode failed (Python + Pillow required): '+String(decoded.stderr||decoded.error||'decoder exit').slice(0,500));
  let result;
  try{result=JSON.parse(decoded.stdout.toString());}catch{fail('invalid PNG decoder response');}
  const sha=createHash('sha256').update(bytes).digest('hex');
  if(result.format!=='PNG'||result.animated!==false||result.sha256!==sha||
    ![result.width,result.height].every(n=>Number.isSafeInteger(n)&&n>0&&n<=4096)||
    !/^[a-f0-9]{64}$/.test(result.pixelSHA256))fail('inconsistent PNG decoder response');
  return result;
}

export async function auditStageBitmaps({root=sourceRoot,registry=STAGE_BITMAPS,stages=STAGES,python}={}){
  if(!registry||typeof registry!=='object'||Array.isArray(registry))fail('registry must be an object');
  const physicalRoot=await realpath(root),known=new Map(stages.map(stage=>[stage.id,stage]));
  const paths=new Set(),decoded=new Map();
  for(const [id,art] of Object.entries(registry)){
    const stage=known.get(id);
    if(!stage||art?.stageId!==id||stage.source!==art.source)fail('identity/source mismatch '+id);
    try{validateStageBitmap(stage,art);}catch(error){fail(id+': '+error.message);}
    if(stage.reference?.blocked)fail('unresolved stage '+id);
    for(const frame of art.layers.flatMap(layer=>layer.frames)){
      const path=resolve(physicalRoot,frame.path);
      if(relative(physicalRoot,path).startsWith('..'))fail('outside source root '+frame.path);
      const info=await lstat(path),physical=await realpath(path);
      if(!info.isFile()||info.isSymbolicLink()||physical!==path||info.size<1||info.size>MAX_STAGE_BITMAP_BYTES)fail('unsafe/oversized PNG '+frame.path);
      const bytes=await readFile(path),sha=createHash('sha256').update(bytes).digest('hex');
      if(sha!==frame.sha256||bytes.length!==frame.bytes)fail('file metadata mismatch '+frame.path);
      if(!decoded.has(sha))decoded.set(sha,auditStagePng(bytes,{python}));
      const audit=decoded.get(sha);
      if(audit.width!==frame.width||audit.height!==frame.height)fail('decoded dimensions mismatch '+frame.path);
      paths.add('/'+frame.path);
    }
  }
  return {stages:Object.keys(registry).length,files:paths.size,paths:[...paths].sort()};
}

export async function bitmapRevision(root=sourceRoot){
  const hash=createHash('sha256');
  for(const name of ['src/sprite-manifest.js','src/stage-bitmap-manifest.js']){
    hash.update(name+'\0');hash.update(await readFile(resolve(root,name)));hash.update('\0');
  }
  return hash.digest('hex');
}

export async function buildStageBitmaps(options={}){
  const root=options.root||sourceRoot,report=await auditStageBitmaps(options);
  report.revision=await bitmapRevision(root);
  const workerPath=resolve(root,'service-worker.js'),worker=await readFile(workerPath,'utf8');
  const begin='// STAGE_BITMAP_ASSETS_BEGIN',end='// STAGE_BITMAP_ASSETS_END';
  if(worker.split(begin).length!==2||worker.split(end).length!==2)fail('service worker stage markers missing/duplicated');
  const pattern=/(^  \/\/ STAGE_BITMAP_ASSETS_BEGIN)(\r?\n)([\s\S]*?)(^  \/\/ STAGE_BITMAP_ASSETS_END)/gm;
  let replacements=0;
  let updated=worker.replace(pattern,(_match,opening,newline,_content,closing)=>{
    replacements++;
    return opening+newline+report.paths.map(path=>'  '+JSON.stringify(path)+',').join(newline)+(report.paths.length?newline:'')+closing;
  });
  if(replacements!==1)fail('invalid service worker stage marker order');
  const revisionBegin='// BITMAP_REVISION_BEGIN',revisionEnd='// BITMAP_REVISION_END';
  if(worker.split(revisionBegin).length!==2||worker.split(revisionEnd).length!==2)fail('service worker bitmap revision markers missing/duplicated');
  const revisionPattern=/(^\/\/ BITMAP_REVISION_BEGIN)(\r?\n)([\s\S]*?)(^\/\/ BITMAP_REVISION_END)/gm;
  replacements=0;
  updated=updated.replace(revisionPattern,(_match,opening,newline,_content,closing)=>{
    replacements++;
    return opening+newline+`const BITMAP_REVISION = '${report.revision}';`+newline+closing;
  });
  if(replacements!==1)fail('invalid service worker bitmap revision marker order');
  if(!/^const STATIC_CACHE = `[^`]*\$\{BITMAP_REVISION\}[^`]*`;$/m.test(worker)||!/^const RUNTIME_CACHE = `[^`]*\$\{BITMAP_REVISION\}[^`]*`;$/m.test(worker))fail('cache keys must interpolate bitmap revision');
  if(updated!==worker)await writeFile(workerPath,updated);
  console.log(`Stage bitmap audit: ${report.stages}/${(options.stages||STAGES).length} exact-stage candidates; ${report.files} PNG files; no visual certification inferred.`);
  return report;
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await buildStageBitmaps();
