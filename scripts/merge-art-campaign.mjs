/** Exact missing-profile coverage and additive import. This does not certify native fidelity. */
import {readFile,writeFile,lstat,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,isAbsolute,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {auditRaster} from './raster-validation.mjs';
import {ART_CAMPAIGN_BASE,ART_CAMPAIGN_GROUP_SIZES,ART_CONTINUATION_BASE,ART_CONTINUATION_GROUP_SIZES} from './art-campaign-tracking.mjs';

const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const nonempty=value=>typeof value==='string'&&value.trim().length>0;
const specs={art144:{base:ART_CAMPAIGN_BASE,requested:144,counts:ART_CAMPAIGN_GROUP_SIZES},
 art92:{base:ART_CONTINUATION_BASE,requested:92,counts:ART_CONTINUATION_GROUP_SIZES}};
const campaignSpec=inventory=>{
 const spec=Object.hasOwn(specs,inventory?.campaign)?specs[inventory.campaign]:null;
 if(!spec||inventory.requested!==spec.requested||inventory.entries?.length!==spec.requested)
  throw Error('Exactly '+(spec?.requested||'the declared')+' original missing profiles are required.');
 if(inventory.baseCommit!==spec.base)throw Error('Exact baseline commit required.');
 return spec;
};
const origins=new Set(['conversation-image-generation','external-unspecified','artist-created','scan']);
const safePath=path=>nonempty(path)&&!isAbsolute(path)&&!path.includes('\\')&&
 path.split('/').every(part=>part&&part!=='.'&&part!=='..');

export function validateArtCampaign(inventory,ledgers,fragments,baseline){
 const errors=[],seen=new Set(),groups=new Set(),assets={},totals={candidates:0,blocked:0};
 const {requested,counts}=campaignSpec(inventory),campaign=inventory.campaign;
 const entries=new Map(inventory.entries.map(row=>[row.fighter?.id,row]));
 if(entries.size!==requested||entries.has(undefined))throw Error('Unique original fighter identities required.');
 if(ledgers.length!==5||fragments.length!==5||new Set(fragments.map(row=>row.group)).size!==5)throw Error('All five complete groups required.');
 if(baseline?.schema!==1||!baseline.assets||typeof baseline.assets!=='object')throw Error('Original registry required.');
 for(const ledger of ledgers){
  const group=ledger?.group,fragment=fragments.find(item=>item.group===group);
  if(!Object.hasOwn(counts,group)||groups.has(group)){errors.push('Unknown or duplicate group');continue;}
  groups.add(group);
  if(ledger.schema!==1||ledger.campaign!==campaign||ledger.baseCommit!==inventory.baseCommit||ledger.requestedItems!==counts[group]||ledger.items?.length!==counts[group])
   errors.push(group+': wrong campaign, baseline or exact assigned count');
  if(!fragment||fragment.schema!==1||fragment.campaign!==campaign||fragment.baseCommit!==inventory.baseCommit||!fragment.assets||typeof fragment.assets!=='object'){
   errors.push(group+': registry fragment required');continue;
  }
  const offset=Object.entries(counts).slice(0,Object.keys(counts).indexOf(group)).reduce((n,[,size])=>n+size,0);
  const expected=new Set(inventory.entries.slice(offset,offset+counts[group]).map(row=>row.fighter.id));
  const delivered=new Set();
  for(const item of ledger.items||[]){
   const id=item.entityId,entry=entries.get(id),asset=fragment.assets[id],label=group+':'+id;
   if(!entry||!expected.has(id)||seen.has(id))errors.push(label+': unknown, reassigned or duplicated profile');
   seen.add(id);
   if(item.rowId!==id+':pose:idle'||item.collection!=='poses')errors.push(label+': original idle row required');
   if(!nonempty(item.limits))errors.push(label+': explicit limits required');
   if(!Array.isArray(item.evidence)||!item.evidence.length||item.evidence.some(url=>{try{return new URL(url).protocol!=='https:';}catch{return true;}}))
    errors.push(label+': source HTTPS evidence required');
   if(!Array.isArray(item.artifacts)||item.artifacts.some(path=>!safePath(path)))errors.push(label+': safe artifact paths required');
   if(baseline.assets[id])errors.push(label+': already illustrated at baseline');
   if(item.status==='blocked'){
    totals.blocked++;
    if(!nonempty(item.reason)||asset)errors.push(label+': blocked rows need a reason and cannot acquire artwork');
   }else if(item.status==='implemented-candidate'){
    totals.candidates++;delivered.add(id);
    if(entry?.generationExcluded)errors.push(label+': prior tool refusal or same-subject variant cannot receive new artwork');
    if(!asset||asset.fighterId!==id||asset.source!==entry?.fighter.source||asset.fidelity!=='unverified'||asset.status!=='integrated-candidate'||asset.singleSubjectReviewed!==true)
     errors.push(label+': exact source-owned unverified candidate required');
    if(asset?.frames?.length!==1||asset.animatedClips!==0||Object.keys(asset.clips||{}).length!==1||
     JSON.stringify(asset.clips?.idle?.frames)!=='[0]'||asset.clips?.idle?.loop!==false||asset.clips?.idle?.ticksPerFrame!==1)
     errors.push(label+': one static non-looping idle required; no false animation');
    const frame=asset?.frames?.[0];
    if(frame&&(!origins.has(asset.origin)||!origins.has(frame.origin??asset.origin)||
     ![-1,1].includes(frame.facing)||!Array.isArray(frame.anchor)||frame.anchor.length!==2||
     !frame.anchor.every(n=>Number.isFinite(n)&&n>=0&&n<=1)||!Number.isFinite(frame.bodyHeight)||frame.bodyHeight<.05||frame.bodyHeight>1))
     errors.push(label+': explicit frame provenance, facing and scale required');
    if(frame&&(!/^[a-f0-9]{64}$/.test(frame.sha256||'')||
     frame.path!==`assets/sprites/${id}.${frame.sha256.slice(0,12)}.png`))errors.push(label+': exact hashed identity filename required');
    if(!asset?.portrait||['path','sha256','bytes','width','height','facing'].some(key=>asset.portrait[key]!==frame?.[key]))
     errors.push(label+': portrait must use the same exact static frame');
    if(!item.artifacts?.includes(asset?.frames?.[0]?.path))errors.push(label+': delivered image missing from ledger artifacts');
    if(asset)assets[id]=asset;
   }else errors.push(label+': candidate or explicit blocker required');
  }
  if(Object.keys(fragment.assets).some(id=>!delivered.has(id)))errors.push(group+': undeclared fragment artwork');
 }
 if(seen.size!==requested)errors.push('All original '+requested+' profiles must be covered exactly once.');
 if(errors.length)throw Error(errors.join('\n'));
 return {schema:1,campaign,baseCommit:inventory.baseCommit,requested,
  groups:Object.entries(counts).map(([group,requestedItems])=>({group,requestedItems})),
  candidates:totals.candidates,blocked:totals.blocked,newAnimatedClips:0,certifiedOneToOne:0,assets,passed:true};
}

export async function mergeArtCampaign({root,inventoryPath,baselineRegistryPath,output,apply=false}){
 root=await realpath(root);
 const inventory=JSON.parse(await readFile(inventoryPath)),baseline=JSON.parse(await readFile(baselineRegistryPath));
 const {counts}=campaignSpec(inventory),campaign=inventory.campaign;
 if(hash(await readFile(baselineRegistryPath))!==inventory.baselineRegistrySha256)throw Error('Original baseline registry bytes required.');
 const ledgerPaths=Object.keys(counts).map(group=>`docs/production/batches/${campaign}-${group}.json`);
 const fragmentPaths=Object.keys(counts).map(group=>`art/fragments/${campaign}-${group}.json`);
 const read=async path=>JSON.parse(await readFile(resolve(root,path)));
 const ledgers=await Promise.all(ledgerPaths.map(read)),fragments=await Promise.all(fragmentPaths.map(read));
 const result=validateArtCampaign(inventory,ledgers,fragments,baseline),registry=await read('art/registry.json');
 for(const [id,asset] of Object.entries(baseline.assets))if(JSON.stringify(registry.assets[id])!==JSON.stringify(asset))throw Error('Existing registry object changed: '+id);
 for(const id of Object.keys(registry.assets))if(!baseline.assets[id]&&JSON.stringify(registry.assets[id])!==JSON.stringify(result.assets[id]))throw Error('Unexpected existing campaign artwork: '+id);
 const pixels=new Map(),records=[];
 for(const [id,asset] of Object.entries({...baseline.assets,...result.assets})){
  for(const frame of asset.frames){
   if(!safePath(frame.path)||!/^assets\/sprites\/[a-z0-9_.-]+\.png$/.test(frame.path))throw Error('Unsafe PNG path: '+id);
   const path=resolve(root,frame.path),info=await lstat(path),physical=await realpath(path);
   if(!info.isFile()||info.isSymbolicLink()||physical!==path||relative(root,path).startsWith('..'))throw Error('Regular repository PNG required: '+id);
   const bytes=await readFile(path);
   if(hash(bytes)!==frame.sha256||bytes.length!==frame.bytes)throw Error('PNG bytes do not match registry: '+id);
   // Existing images are rechecked from their bytes too; cached hashes cannot conceal a clone.
   const audit=auditRaster(bytes);
   if(pixels.has(audit.pixelSHA256)&&pixels.get(audit.pixelSHA256)!==id)throw Error('Cross-profile pixel clone: '+id);
   pixels.set(audit.pixelSHA256,id);
   if(result.assets[id]){
    if(audit.width!==frame.width||audit.height!==frame.height||!audit.alpha||audit.animated)throw Error('Static alpha raster required: '+id);
    records.push({id,path:frame.path,sha256:frame.sha256,bytes:frame.bytes,width:audit.width,height:audit.height,visibleBounds:audit.visibleBounds,framingBounds:audit.framingBounds});
   }
  }
 }
 const next={...baseline,assets:{...baseline.assets,...result.assets}},report={...result};delete report.assets;
 Object.assign(report,{preservedProfiles:Object.keys(baseline.assets).length,
  preservedImages:new Set(Object.values(baseline.assets).flatMap(asset=>asset.frames.map(frame=>frame.path))).size,profilesAfter:Object.keys(next.assets).length,
  inventorySha256:hash(await readFile(inventoryPath)),baselineRegistrySha256:hash(await readFile(baselineRegistryPath)),images:records,
  ledgers:await Promise.all(ledgerPaths.map(async path=>({path,sha256:hash(await readFile(resolve(root,path)))}))),
  fragments:await Promise.all(fragmentPaths.map(async path=>({path,sha256:hash(await readFile(resolve(root,path)))}))),
  applied:apply,limits:'Counts, exact baseline coverage and image integrity only. Canonical anatomy, scale, source pose and original fidelity require the separate visual evidence; blocked rows remain missing.'});
 if(apply)await writeFile(resolve(root,'art/registry.json'),JSON.stringify(next,null,2)+'\n');
 if(output)await writeFile(output,JSON.stringify(report,null,2)+'\n');
 return report;
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [inventoryPath,baselineRegistryPath,output,...flags]=process.argv.slice(2);
 const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
 const report=await mergeArtCampaign({root,inventoryPath,baselineRegistryPath,output,apply:flags.includes('--apply')});
 console.log(JSON.stringify({passed:report.passed,requested:report.requested,candidates:report.candidates,blocked:report.blocked,applied:report.applied}));
}
