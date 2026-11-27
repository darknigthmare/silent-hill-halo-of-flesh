/** Validate authored projectile PNGs and refresh only their service-worker block. */
import {readFile,writeFile,lstat,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ROSTER,createCombatProfile} from '../src/data.js';
import {REFERENCE_SOURCES} from '../src/production-reference.js';
import {sourceGroundProjectile} from '../src/combat-reference-policy.js';
import {PROJECTILE_BITMAPS} from '../src/projectile-bitmap-manifest.js';
import {validateProjectileRegistry} from '../src/projectile-bitmaps.js';
import {auditRaster,MAX_RASTER_BYTES} from './raster-validation.mjs';

const sourceRoot=fileURLToPath(new URL('../',import.meta.url));
const fail=message=>{throw new Error('Projectile bitmap manifest: '+message);};

export async function auditProjectileBitmaps({root=sourceRoot,registry=PROJECTILE_BITMAPS,fighters=ROSTER,references=REFERENCE_SOURCES}={}){
  validateProjectileRegistry(registry);
  const physicalRoot=await realpath(root),known=new Map(fighters.map(fighter=>[fighter.id,fighter]));
  const paths=new Set(),owners=new Set(),decoded=new Map(),entries=[];
  for(const art of Object.values(registry)){
    const fighter=known.get(art.fighterId);
    if(!fighter||fighter.source!==art.source)fail('identity/source mismatch '+art.id);
    const profile=createCombatProfile(fighter);
    for(const slot of art.slots){
      const move=profile.moves[slot];
      if(!move?.projectile||move.trap||move.enabled===false)fail('not an enabled projectile '+art.id+':'+slot);
      if(sourceGroundProjectile(fighter,move)!==(art.presentation.anchor==='ground'))fail('floor anchor does not match the existing projectile '+art.id+':'+slot);
    }
    if(art.referenceIds.some(id=>!Object.hasOwn(references,id)))fail('unknown source reference '+art.id);
    const frame=art.frame,path=resolve(physicalRoot,frame.path);
    if(relative(physicalRoot,path).startsWith('..'))fail('outside source root '+frame.path);
    const info=await lstat(path),physical=await realpath(path);
    if(!info.isFile()||info.isSymbolicLink()||physical!==path||info.size<1||info.size>MAX_RASTER_BYTES)fail('unsafe/oversized PNG '+frame.path);
    const bytes=await readFile(path),sha=createHash('sha256').update(bytes).digest('hex');
    if(sha!==frame.sha256||bytes.length!==frame.bytes)fail('file metadata mismatch '+frame.path);
    if(!decoded.has(sha))decoded.set(sha,auditRaster(bytes));
    const audit=decoded.get(sha);
    if(audit.format!=='PNG'||audit.animated!==false||audit.alpha!==true||audit.width!==frame.width||audit.height!==frame.height)fail('one transparent PNG required '+frame.path);
    if(frame.framingBounds&&JSON.stringify(frame.framingBounds)!==JSON.stringify(audit.framingBounds))fail('framing metadata mismatch '+frame.path);
    paths.add('/'+frame.path);owners.add(art.fighterId);
    entries.push({id:art.id,fighterId:art.fighterId,source:art.source,slots:art.slots,frame:frame.path,
      width:audit.width,height:audit.height,framingBounds:audit.framingBounds,transparentFraction:audit.transparentFraction,
      pixelSHA256:audit.pixelSHA256,status:art.status,fidelity:art.fidelity,animated:false});
  }
  return {effects:entries.length,fighters:owners.size,slots:entries.reduce((n,entry)=>n+entry.slots.length,0),
    files:paths.size,animatedClips:0,certified:0,paths:[...paths].sort(),entries};
}

export async function buildProjectileBitmaps(options={}){
  const root=options.root||sourceRoot,report=await auditProjectileBitmaps(options);
  const workerPath=resolve(root,'service-worker.js'),worker=await readFile(workerPath,'utf8');
  const begin='// PROJECTILE_BITMAP_ASSETS_BEGIN',end='// PROJECTILE_BITMAP_ASSETS_END';
  if(worker.split(begin).length!==2||worker.split(end).length!==2)fail('service worker projectile markers missing/duplicated');
  let count=0;
  const updated=worker.replace(/(^  \/\/ PROJECTILE_BITMAP_ASSETS_BEGIN)(\r?\n)([\s\S]*?)(^  \/\/ PROJECTILE_BITMAP_ASSETS_END)/gm,
    (_match,opening,newline,_content,closing)=>{
      count++;return opening+newline+report.paths.map(path=>'  '+JSON.stringify(path)+',').join(newline)+(report.paths.length?newline:'')+closing;
    });
  if(count!==1)fail('invalid service worker projectile marker order');
  if(updated!==worker)await writeFile(workerPath,updated);
  console.log(`Projectile bitmap audit: ${report.effects} static candidates; ${report.fighters} exact profiles; ${report.slots} slots; no visual certification inferred.`);
  return report;
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await buildProjectileBitmaps();
