/** Import independent native projectile PNGs after validating the complete delivery. */
import {readFile,writeFile,mkdir,link,copyFile,lstat,access} from 'node:fs/promises';
import {resolve,dirname,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {PROJECTILE_BITMAPS} from '../../../src/projectile-bitmap-manifest.js';
import {validateProjectileRegistry} from '../../../src/projectile-bitmaps.js';
import {auditProjectileBitmaps,buildProjectileBitmaps} from '../../../scripts/build-projectile-bitmaps.mjs';
import {auditRaster} from '../../../scripts/raster-validation.mjs';

const root=fileURLToPath(new URL('../../../',import.meta.url));
const input=process.argv.find(arg=>arg.startsWith('--input='))?.slice(8);
const output=process.argv.find(arg=>arg.startsWith('--receipt='))?.slice(10);
if(!input||!output)throw Error('Use --input=delivery.json --receipt=fresh-receipt.json');
try{await access(resolve(output));throw Error('Use a fresh receipt path.');}catch(error){if(error.code!=='ENOENT')throw error;}
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const raw=await readFile(resolve(input)),delivery=JSON.parse(raw);
const baseline=JSON.parse(await readFile(resolve(root,'docs/production/vague28/baseline.json'),'utf8'));
const protect=async()=>{
  for(const file of baseline.protectedFiles)
    if(sha(await readFile(resolve(root,file.path)))!==file.sha256)throw Error('Protected scope changed: '+file.path);
};
await protect();
if(!Array.isArray(delivery.effects)||!delivery.effects.length||!Array.isArray(delivery.assets))throw Error('Expected effects[] and assets[].');
const registry=structuredClone(PROJECTILE_BITMAPS),sources=new Map(delivery.assets.map(asset=>[asset.path,asset]));
if(sources.size!==delivery.assets.length)throw Error('Duplicate asset destination.');
const incoming=[];
for(const effect of delivery.effects){
  if(Object.hasOwn(registry,effect.id))throw Error('Existing effect must be preserved: '+effect.id);
  registry[effect.id]=structuredClone(effect);
  const frame=effect.frame,source=sources.get(frame?.path);
  if(!source?.localPath)throw Error('Missing native source: '+effect.id);
  if(['sha256','bytes','width','height'].some(key=>source[key]!==frame[key]))throw Error('Receipt metadata mismatch: '+effect.id);
  const bytes=await readFile(source.localPath),audit=auditRaster(bytes);
  if(sha(bytes)!==frame.sha256||bytes.length!==frame.bytes||audit.width!==frame.width||audit.height!==frame.height||
    audit.format!=='PNG'||audit.animated||!audit.alpha||JSON.stringify(audit.framingBounds)!==JSON.stringify(frame.framingBounds))
    throw Error('Native PNG mismatch: '+effect.id);
  const target=resolve(root,frame.path);
  if(relative(root,target).startsWith('..'))throw Error('Destination outside project.');
  incoming.push({effect,source,frame,target,pixelSHA256:audit.pixelSHA256});
}
validateProjectileRegistry(registry);
if(new Set(incoming.map(row=>row.frame.path)).size!==incoming.length||incoming.length!==sources.size)
  throw Error('Delivery must contain one independent PNG per effect.');
const receipt={schema:1,wave:28,createdAt:new Date().toISOString(),input:{path:resolve(input),sha256:sha(raw)},effects:[],assets:[]};
for(const {effect,source,frame,target,pixelSHA256} of incoming){
  await mkdir(dirname(target),{recursive:true});let transfer;
  try{
    const info=await lstat(target);
    if(!info.isFile()||info.isSymbolicLink()||sha(await readFile(target))!==frame.sha256)throw Error('Existing destination differs: '+frame.path);
    transfer='existing-exact-file';
  }catch(error){
    if(error.code!=='ENOENT')throw error;
    try{await link(source.localPath,target);transfer='hardlink-original';}
    catch(linkError){if(linkError.code!=='EXDEV')throw linkError;await copyFile(source.localPath,target);transfer='exact-copy-original';}
  }
  if(sha(await readFile(target))!==frame.sha256)throw Error('Transferred PNG differs: '+frame.path);
  receipt.effects.push({id:effect.id,fighterId:effect.fighterId,source:effect.source,slots:effect.slots});
  receipt.assets.push({...frame,pixelSHA256,localSource:source.localPath,transfer,pixelsModified:false});
}
// Identity, documented references, active slots, floor policy and every old/new PNG
// must pass before the runtime manifest or offline asset block is changed.
receipt.audit=await auditProjectileBitmaps({root,registry});
for(const [id,old] of Object.entries(PROJECTILE_BITMAPS))
  if(JSON.stringify(old)!==JSON.stringify(registry[id]))throw Error('Existing effect changed: '+id);
await protect();
await writeFile(resolve(root,'src/projectile-bitmap-manifest.js'),
  '// Authored independent projectile PNGs. Static candidates; fidelity remains unverified.\nexport const PROJECTILE_BITMAPS = '+JSON.stringify(registry,null,2)+';\n');
await buildProjectileBitmaps({root,registry});
receipt.existingEffectsPreserved=true;receipt.protectedScopeUnchanged=true;
await mkdir(dirname(resolve(output)),{recursive:true});
await writeFile(resolve(output),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({addedEffects:incoming.length,totalEffects:receipt.audit.effects,totalSlots:receipt.audit.slots,receipt:resolve(output)}));
