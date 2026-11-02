/** Review later artwork without rewriting the historical ART144 dispositions. */
import {readFile} from 'node:fs/promises';
import {resolve,isAbsolute} from 'node:path';
import {ART_CONTINUATION_BASE,ART_CONTINUATION_GROUP_SIZES} from './art-campaign-tracking.mjs';

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
 return {intake,rows:ledgers.flatMap(ledger=>ledger.items.map(row=>({...row,group:ledger.group}))),assets};
}

/** A malformed documentary claim fails closed; image bytes are validated by the importer/HTTP QA. */
export function resolvedHistoricalArtwork(row,art,continuation){
 if(!record(row)||row.status!=='blocked'||!exactRow(row,row.entityId)||!nonempty(row.entityId)||!record(continuation)||
  !Array.isArray(continuation.rows)||!record(continuation.intake)||continuation.intake.campaign!=='art92'||
  continuation.intake.baseCommit!==ART_CONTINUATION_BASE||!Array.isArray(continuation.intake.entries)||!record(continuation.assets))return false;
 const matches=continuation.rows.filter(item=>item?.rowId===row.rowId),entries=continuation.intake.entries.filter(entry=>entry?.fighter?.id===row.entityId);
 if(matches.length!==1||entries.length!==1)return false;
 const item=matches[0],entry=entries[0],fragment=continuation.assets[row.entityId];
 if(!record(entry)||!record(entry.fighter)||!nonempty(entry.fighter.source)||!Object.hasOwn(ART_CONTINUATION_GROUP_SIZES,entry.group)||
  !exactRow(item,row.entityId)||item.status!=='implemented-candidate'||item.group!==entry.group||entry.workbookRowId!==row.rowId||
  entry.generationExcluded!==false||!nonempty(item.limits)||!evidence(item.evidence)||!artifacts(item.artifacts)||
  !staticCandidate(row.entityId,entry.fighter.source,art)||!staticCandidate(row.entityId,entry.fighter.source,fragment)||
  !item.artifacts.includes(art.frames[0].path)||!matchingFrame(art.frames[0],fragment.frames[0]))return false;
 return true;
}
