/** Review later artwork without rewriting the historical ART144 dispositions. */
import {readFile} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import {resolve,isAbsolute} from 'node:path';
import {ART_CONTINUATION_BASE,ART_CONTINUATION_GROUP_SIZES} from './art-campaign-constants.mjs';
import {hasCombatSprite} from '../src/sprite-usage.js';

const record=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const nonempty=value=>typeof value==='string'&&!!value.trim();
const safeArtifact=value=>nonempty(value)&&!isAbsolute(value)&&!value.includes('\\')&&value.split('/').every(part=>part&&part!=='.'&&part!=='..');
const evidence=value=>Array.isArray(value)&&value.length>0&&value.every(url=>{
 try{return nonempty(url)&&new URL(url).protocol==='https:';}catch{return false;}
});
const artifacts=value=>Array.isArray(value)&&value.every(safeArtifact);
const exactRow=(row,id)=>record(row)&&row.entityId===id&&row.collection==='poses'&&row.rowId===id+':pose:idle';

function staticCandidate(id,source,art){
 if(!record(art)||art.fighterId!==id||art.source!==source||art.fidelity!=='unverified'||art.status!=='integrated-candidate'||
  art.singleSubjectReviewed!==true||!Array.isArray(art.frames)||art.frames.length!==1||art.animatedClips!==0||
  !record(art.clips)||Object.keys(art.clips).length!==1||!record(art.clips.idle)||
  !Array.isArray(art.clips.idle.frames)||art.clips.idle.frames.length!==1||art.clips.idle.frames[0]!==0||
  art.clips.idle.loop!==false||art.clips.idle.ticksPerFrame!==1)return false;
 const frame=art.frames[0];
 return record(frame)&&safeArtifact(frame.path)&&/^assets\/sprites\/[a-z0-9_.-]+\.png$/.test(frame.path)&&
  frame.path.startsWith('assets/sprites/'+id+'.')&&typeof frame.sha256==='string'&&/^[a-f0-9]{64}$/.test(frame.sha256)&&
  frame.path.includes('.'+frame.sha256.slice(0,12)+'.')&&Number.isSafeInteger(frame.bytes)&&frame.bytes>0&&
  [frame.width,frame.height].every(n=>Number.isSafeInteger(n)&&n>0&&n<=4096);
}

function matchingFrame(a,b){
 return ['path','sha256','bytes','width','height','facing','bodyHeight'].every(key=>a[key]===b[key])&&JSON.stringify(a.anchor)===JSON.stringify(b.anchor);
}

function validDeliveredRaster(id,frame){
 return record(frame)&&typeof frame.path==='string'&&frame.path.startsWith('assets/sprites/'+id+'.')&&
  /^assets\/sprites\/[a-z0-9_.-]+\.(png|webp)$/.test(frame.path)&&typeof frame.sha256==='string'&&/^[a-f0-9]{64}$/.test(frame.sha256)&&
  frame.path.includes('.'+frame.sha256.slice(0,12)+'.')&&Number.isSafeInteger(frame.bytes)&&frame.bytes>0&&
  [frame.width,frame.height].every(n=>Number.isSafeInteger(n)&&n>0&&n<=4096);
}

/** Later journals add image presence without rewriting an old idle disposition.
 * The November 17 illustrations were explicitly reassigned to selection by the user.
 */
export function readPurposeDeliveries(root){
 const deliveries=[];
 for(const [path,fields] of [
  ['docs/production/sprite-generation-2026-11-17.json',[['generated','selection',false]]],
  ['docs/production/combat-generation-2026-11-17.json',[['selectionOutputs','selection',true],['outputs','combat',true]]]
 ]){
  let journal;try{journal=JSON.parse(readFileSync(resolve(root,path),'utf8'));}catch(error){if(error.code==='ENOENT')continue;throw error;}
  if(!record(journal))throw Error('Invalid artwork delivery journal '+path);
  for(const [field,purpose,requireIntegrated] of fields){
   const rows=journal[field]??[];if(!Array.isArray(rows))throw Error('Invalid artwork delivery list '+path+':'+field);
   for(const row of rows){
    if(requireIntegrated&&row?.status!=='integrated-candidate')continue;
    if(!record(row)||typeof row.id!=='string'||!/^[a-z0-9_]+$/.test(row.id)||!safeArtifact(row.file)||
     !row.file.startsWith('assets/sprites/'+row.id+'.')||!/^assets\/sprites\/[a-z0-9_.-]+\.(png|webp)$/.test(row.file)||
     row.sha256!==undefined&&(typeof row.sha256!=='string'||!/^[a-f0-9]{64}$/.test(row.sha256)))throw Error('Invalid exact artwork delivery '+path+':'+field);
    deliveries.push({id:row.id,file:row.file,sha256:row.sha256,purpose,journal:path});
   }
  }
 }
 // The independent continuation used a per-import journal and legacy frame indices.
 // Bind the immutable file and digest; the current registry owns the normalized index.
 for(const path of ['docs/production/sprite-continuation-imports-2026-11-17.json','docs/production/sprite-next-imports-2026-11-17.json']){
  let journal;try{journal=JSON.parse(readFileSync(resolve(root,path),'utf8'));}catch(error){if(error.code==='ENOENT')continue;throw error;}
  if(!record(journal)||journal.schema!==1||!Array.isArray(journal.imports))throw Error('Invalid artwork delivery journal '+path);
  for(const row of journal.imports){
   const purpose=row?.kind==='selection-base'?'selection':row?.kind==='distinct-combat-idle'?'combat':null;
   if(!record(row)||!purpose||typeof row.fighterId!=='string'||!/^[a-z0-9_]+$/.test(row.fighterId)||
    !nonempty(row.source)||!safeArtifact(row.path)||!row.path.startsWith('assets/sprites/'+row.fighterId+'.')||
    !/^assets\/sprites\/[a-z0-9_.-]+\.png$/.test(row.path)||typeof row.sha256!=='string'||!/^[a-f0-9]{64}$/.test(row.sha256)||
    !row.path.includes('.'+row.sha256.slice(0,12)+'.'))throw Error('Invalid exact artwork delivery '+path+':imports');
   deliveries.push({id:row.fighterId,source:row.source,file:row.path,sha256:row.sha256,purpose,journal:path});
  }
 }
 return deliveries;
}

function deliveredUse(art,continuation,purpose){
 if(!Array.isArray(continuation.purposeDeliveries))return false;
 const frames=purpose==='selection'?[art.portrait]:art.combatView==='side-view-candidate'&&hasCombatSprite(art)&&validDeliveredRaster(art.fighterId,art.portrait)?
  art.frames.filter(frame=>frame.purpose==='combat'&&frame.view==='side-view'&&frame.path!==art.portrait.path):[];
 return frames.some(frame=>validDeliveredRaster(art.fighterId,frame)&&continuation.purposeDeliveries.some(delivery=>
  record(delivery)&&delivery.id===art.fighterId&&delivery.purpose===purpose&&delivery.file===frame.path&&
  (delivery.source===undefined||delivery.source===art.source)&&
  (delivery.sha256===undefined||delivery.sha256===frame.sha256)));
}

function validateIntake(intake){
 if(!record(intake)||intake.schema!==1||intake.campaign!=='art92'||intake.baseCommit!==ART_CONTINUATION_BASE||
  intake.requested!==92||intake.baselineProfiles!==138||intake.baselineImages!==173||!Array.isArray(intake.entries)||intake.entries.length!==92)
  throw Error('Exact ART92 continuation intake required.');
 const seen=new Set(),groups={};
 for(const entry of intake.entries){
  const id=entry?.fighter?.id;
  if(!record(entry)||!record(entry.fighter)||!nonempty(id)||!nonempty(entry.fighter.source)||seen.has(id)||
   !Object.hasOwn(ART_CONTINUATION_GROUP_SIZES,entry.group)||entry.workbookRowId!==id+':pose:idle'||
   entry.previousCampaign!=='art144'||entry.previousStatus!=='blocked'||typeof entry.generationExcluded!=='boolean')
   throw Error('Invalid or duplicate ART92 intake identity.');
  seen.add(id);groups[entry.group]=(groups[entry.group]||0)+1;
 }
 if(Object.entries(ART_CONTINUATION_GROUP_SIZES).some(([group,size])=>groups[group]!==size)||intake.entries.filter(entry=>entry.generationExcluded).length!==24)
  throw Error('Original ART92 group allocation and 24 generation exclusions required.');
}

/** Returns null before the continuation exists, otherwise only complete bound ledgers/fragments. */
export async function readArtContinuation(root){
 const groups=Object.keys(ART_CONTINUATION_GROUP_SIZES);
 const readJSON=async path=>JSON.parse(await readFile(resolve(root,path),'utf8'));
 const ledgers=await Promise.all(groups.map(async group=>{
  try{return await readJSON(`docs/production/batches/art92-${group}.json`);}
  catch(error){if(error.code==='ENOENT')return null;throw error;}
 }));
 if(ledgers.every(row=>row===null))return null;
 if(ledgers.some(row=>row===null))throw Error('All five ART92 review ledgers are required.');
 const intake=await readJSON('docs/production/art92-intake.json');validateIntake(intake);
 const assigned=new Map(intake.entries.map(entry=>[entry.fighter.id,entry])),seen=new Set(),assets={},pixels=new Map(),paths=new Set();
 for(const [i,group] of groups.entries()){
  const ledger=ledgers[i],size=ART_CONTINUATION_GROUP_SIZES[group];
  if(!record(ledger)||ledger.schema!==1||ledger.campaign!=='art92'||ledger.group!==group||ledger.baseCommit!==ART_CONTINUATION_BASE||
   ledger.requestedItems!==size||!Array.isArray(ledger.items)||ledger.items.length!==size)throw Error('Invalid ART92 review ledger '+group);
  const fragment=await readJSON(`art/fragments/art92-${group}.json`);
  if(!record(fragment)||fragment.schema!==1||fragment.campaign!=='art92'||fragment.group!==group||fragment.baseCommit!==ART_CONTINUATION_BASE||!record(fragment.assets))
   throw Error('Invalid ART92 review fragment '+group);
  const delivered=new Set();
  for(const row of ledger.items){
   const id=row?.entityId,entry=assigned.get(id),art=fragment.assets[id];
   if(!entry||entry.group!==group||!exactRow(row,id)||(row.group!==undefined&&row.group!==group)||seen.has(id)||!nonempty(row.limits)||!evidence(row.evidence)||!artifacts(row.artifacts))
    throw Error('Invalid, reassigned or duplicated ART92 review row '+id);
   seen.add(id);
   if(row.status==='blocked'){
    if(!nonempty(row.reason)||art)throw Error('ART92 blocked review row must remain without artwork: '+id);
   }else if(row.status==='implemented-candidate'){
    if(entry.generationExcluded!==false||!staticCandidate(id,entry.fighter.source,art)||!row.artifacts.includes(art.frames[0].path))
     throw Error('ART92 review candidate requires eligible exact-source static artwork: '+id);
    const frame=art.frames[0];
    if(paths.has(frame.path)||pixels.has(frame.sha256)||(nonempty(frame.pixelSHA256)&&pixels.has(frame.pixelSHA256)))throw Error('Duplicate ART92 review candidate pixels: '+id);
    paths.add(frame.path);pixels.set(frame.sha256,id);if(nonempty(frame.pixelSHA256))pixels.set(frame.pixelSHA256,id);
    assets[id]=art;delivered.add(id);
   }else throw Error('ART92 review row requires an explicit disposition: '+id);
  }
  if(Object.keys(fragment.assets).length!==delivered.size||Object.keys(fragment.assets).some(id=>!delivered.has(id)))
   throw Error('Undeclared or reassigned ART92 fragment artwork: '+group);
 }
 if(seen.size!==92)throw Error('Exactly 92 unique ART92 review identities are required.');
 return {intake,rows:ledgers.flatMap(ledger=>ledger.items.map(row=>({...row,group:ledger.group}))),assets,purposeDeliveries:readPurposeDeliveries(root)};
}

/** `any` resolves only historical absence of artwork, never both purposes.
 * Call with purpose:'combat' when a combat image is required. Pixels are audited by import/build/HTTP QA.
 */
export function resolvedHistoricalArtwork(row,art,continuation,{purpose='any'}={}){
 if(!['any','selection','combat'].includes(purpose))return false;
 if(!record(row)||row.status!=='blocked'||!exactRow(row,row.entityId)||!nonempty(row.entityId)||!record(continuation)||
  !Array.isArray(continuation.rows)||!record(continuation.intake)||continuation.intake.campaign!=='art92'||
  continuation.intake.baseCommit!==ART_CONTINUATION_BASE||!Array.isArray(continuation.intake.entries)||!record(continuation.assets))return false;
 const matches=continuation.rows.filter(item=>item?.rowId===row.rowId),entries=continuation.intake.entries.filter(entry=>entry?.fighter?.id===row.entityId);
 if(matches.length!==1||entries.length!==1)return false;
 const item=matches[0],entry=entries[0],fragment=continuation.assets[row.entityId];
 if(record(entry)&&record(entry.fighter)&&nonempty(entry.fighter.source)&&entry.generationExcluded===false&&entry.workbookRowId===row.rowId&&
  Object.hasOwn(ART_CONTINUATION_GROUP_SIZES,entry.group)&&exactRow(item,row.entityId)&&item.group===entry.group&&record(art)&&art.fighterId===row.entityId&&art.source===entry.fighter.source&&
  art.singleSubjectReviewed===true&&art.fidelity==='unverified'&&art.status==='integrated-candidate'&&
  ((purpose!=='combat'&&deliveredUse(art,continuation,'selection'))||(purpose!=='selection'&&deliveredUse(art,continuation,'combat'))))return true;
 if(!record(entry)||!record(entry.fighter)||!nonempty(entry.fighter.source)||!Object.hasOwn(ART_CONTINUATION_GROUP_SIZES,entry.group)||
  !exactRow(item,row.entityId)||item.status!=='implemented-candidate'||item.group!==entry.group||entry.workbookRowId!==row.rowId||
  entry.generationExcluded!==false||!nonempty(item.limits)||!evidence(item.evidence)||!artifacts(item.artifacts)||
  !staticCandidate(row.entityId,entry.fighter.source,art)||!staticCandidate(row.entityId,entry.fighter.source,fragment)||
  !item.artifacts.includes(art.frames[0].path)||!matchingFrame(art.frames[0],fragment.frames[0]))return false;
 if(purpose==='selection'&&!validDeliveredRaster(row.entityId,art.portrait))return false;
 if(purpose==='combat'&&!hasCombatSprite(art))return false;
 return true;
}
