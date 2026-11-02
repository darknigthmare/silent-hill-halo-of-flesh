import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {resolvedHistoricalArtwork,readArtContinuation} from '../scripts/art-campaign-review.mjs';
import {ART_CONTINUATION_BASE,ART_CONTINUATION_GROUP_SIZES} from '../scripts/art-campaign-tracking.mjs';

function artwork(id='subject',source='sh3'){
 const sha256='a'.repeat(64);
 return {fighterId:id,source,status:'integrated-candidate',fidelity:'unverified',animatedClips:0,singleSubjectReviewed:true,
  frames:[{path:`assets/sprites/${id}.${sha256.slice(0,12)}.png`,sha256,bytes:256,width:256,height:256,pixelSHA256:'b'.repeat(64),facing:1,bodyHeight:.8,anchor:[.5,.9]}],
  clips:{idle:{frames:[0],loop:false,ticksPerFrame:1}}};
}

function fixture(){
 const row={rowId:'subject:pose:idle',entityId:'subject',collection:'poses',status:'blocked',reason:'Earlier crop.'};
 const art=artwork();
 const item={...row,group:'a',status:'implemented-candidate',evidence:['https://example.com/full-model'],limits:'Unverified still, no source animation.',artifacts:[art.frames[0].path]};
 const entry={fighter:{id:'subject',source:'sh3'},group:'a',workbookRowId:row.rowId,generationExcluded:false};
 return {row,art,continuation:{rows:[item],intake:{campaign:'art92',baseCommit:ART_CONTINUATION_BASE,entries:[entry]},assets:{subject:structuredClone(art)}}};
}
const inspect=f=>resolvedHistoricalArtwork(f.row,f.art,f.continuation);
test('historical source blocker can have a later exact-ID candidate while history stays unchanged',()=>{
 const f=fixture(),before=JSON.stringify(f.row);assert.equal(inspect(f),true);assert.equal(JSON.stringify(f.row),before);
});
test('no later ledger or imported image leaves the historical blocker unresolved',()=>{
 const f=fixture();assert.equal(resolvedHistoricalArtwork(f.row,f.art,null),false);
 assert.equal(resolvedHistoricalArtwork(f.row,null,f.continuation),false);
});
test('review rejects missing evidence, wrong source, false animation and excluded generation identities',()=>{
 for(const mutate of [f=>{f.continuation.rows[0].evidence=[];},f=>{f.continuation.rows[0].evidence=['http://example.com'];},
  f=>{f.continuation.rows[0].limits='';},f=>{f.continuation.rows[0].entityId='other';},
  f=>{f.continuation.rows[0].artifacts=[];},f=>{f.continuation.intake.entries[0].generationExcluded=true;},
  f=>{f.art.source='sh1';},f=>{f.art.fidelity='verified';},f=>{f.art.animatedClips=1;},
  f=>{f.art.clips.idle.loop=true;},f=>{f.art.frames.push({...f.art.frames[0]});},
  f=>{f.art.clips.walk={frames:[0],loop:false,ticksPerFrame:1};},f=>{f.art.singleSubjectReviewed=false;},
  f=>{f.art.frames[0].path='../borrowed.png';},f=>{f.art.frames[0].sha256=123;},
  f=>{f.continuation.rows[0].group='b';},f=>{f.continuation.intake.entries[0].workbookRowId='other:pose:idle';},
  f=>{f.continuation.assets.subject.frames[0].bytes++;},f=>{f.continuation.assets.subject.source='sh1';}]){
  const f=fixture();mutate(f);assert.equal(inspect(f),false);
 }
});

test('malformed review arrays and missing eligibility fail closed without throwing',()=>{
 for(const mutate of [f=>{f.continuation.rows={length:1};},f=>{f.continuation.rows.push({...f.continuation.rows[0]});},
  f=>{f.continuation.intake.entries='invalid';},f=>{f.continuation.intake.entries.push({...f.continuation.intake.entries[0]});},
  f=>{f.continuation.intake.entries[0].generationExcluded=undefined;},f=>{f.continuation.intake.entries[0].fighter.source=undefined;},
  f=>{f.continuation.rows[0].evidence='https://example.com';},f=>{f.continuation.rows[0].evidence={length:1};},
  f=>{f.continuation.rows[0].artifacts=f.art.frames[0].path;},f=>{f.continuation.rows[0].artifacts={length:1};},
  f=>{f.art.frames={0:f.art.frames[0],length:1};},f=>{f.art.clips.idle.frames={0:0,length:1};},
  f=>{f.continuation.assets=null;},f=>{f.continuation.intake.baseCommit='0'.repeat(40);},
  f=>{f.continuation.rows[0].evidence=[{}];},f=>{f.continuation.rows[0].artifacts=[null];}]){
  const f=fixture();mutate(f);assert.equal(inspect(f),false);
 }
});

async function continuationFixture(t,mutate=()=>{}){
 const root=await mkdtemp(join(tmpdir(),'halo-art92-review-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const intake=JSON.parse(await readFile(new URL('../docs/production/art92-intake.json',import.meta.url),'utf8'));
 const candidate=intake.entries.find(entry=>!entry.generationExcluded),ledgers={},fragments={};
 for(const [group,size] of Object.entries(ART_CONTINUATION_GROUP_SIZES)){
  const items=intake.entries.filter(entry=>entry.group===group).map(entry=>({rowId:entry.workbookRowId,entityId:entry.fighter.id,
   collection:'poses',status:'blocked',reason:'The whole exterior is not established by the cited view.',evidence:['https://example.com/reference'],
   limits:'No image, animation or fidelity certification.',artifacts:[]}));
  ledgers[group]={schema:1,campaign:'art92',group,baseCommit:ART_CONTINUATION_BASE,requestedItems:size,items};
  fragments[group]={schema:1,campaign:'art92',group,baseCommit:ART_CONTINUATION_BASE,assets:{}};
 }
 const art=artwork(candidate.fighter.id,candidate.fighter.source),row=ledgers[candidate.group].items.find(row=>row.entityId===candidate.fighter.id);
 row.status='implemented-candidate';row.artifacts=[art.frames[0].path];delete row.reason;
 fragments[candidate.group].assets[candidate.fighter.id]=art;
 mutate({intake,ledgers,fragments,candidate,row,art});
 const write=async(path,value)=>{const full=join(root,path);await mkdir(dirname(full),{recursive:true});await writeFile(full,JSON.stringify(value));};
 await write('docs/production/art92-intake.json',intake);
 for(const group of Object.keys(ART_CONTINUATION_GROUP_SIZES)){
  if(ledgers[group])await write(`docs/production/batches/art92-${group}.json`,ledgers[group]);
  if(fragments[group])await write(`art/fragments/art92-${group}.json`,fragments[group]);
 }
 return {root,candidate};
}

test('continuation reader accepts five exact ledger/fragment bindings without editing historical rows',async t=>{
 const {root,candidate}=await continuationFixture(t),result=await readArtContinuation(root);
 assert.equal(result.rows.length,92);assert.equal(result.intake.entries.filter(entry=>entry.generationExcluded).length,24);
 assert.deepEqual(Object.keys(result.assets),[candidate.fighter.id]);
 const historical={rowId:candidate.workbookRowId,entityId:candidate.fighter.id,collection:'poses',status:'blocked'};
 assert.equal(resolvedHistoricalArtwork(historical,result.assets[candidate.fighter.id],result),true);
});

test('continuation reader returns null before any ledger exists and rejects partial campaigns',async t=>{
 const root=await mkdtemp(join(tmpdir(),'halo-art92-empty-'));t.after(()=>rm(root,{recursive:true,force:true}));
 assert.equal(await readArtContinuation(root),null);
 const partial=await continuationFixture(t,({ledgers})=>{delete ledgers.e;});
 await assert.rejects(readArtContinuation(partial.root),/All five/);
});

test('continuation reader rejects forged groups, source, exclusions, evidence and undeclared fragments',async t=>{
 for(const mutate of [
  ({ledgers})=>{ledgers.a.items={length:18};},
  ({intake})=>{intake.entries={length:92};},
  ({intake})=>{intake.entries[0].generationExcluded=false;},
  ({ledgers})=>{ledgers.a.items[0].evidence='https://example.com';},
  ({ledgers})=>{ledgers.a.items[0].artifacts='docs/borrowed.json';},
  ({ledgers})=>{[ledgers.a.items[0],ledgers.b.items[0]]=[ledgers.b.items[0],ledgers.a.items[0]];},
  ({fragments,candidate})=>{fragments[candidate.group].group='invalid';},
  ({art})=>{art.source='wrong-edition';},
  ({row})=>{row.artifacts=[];},
  ({fragments,candidate,art})=>{fragments[candidate.group].assets.undeclared=structuredClone(art);},
  ({fragments,candidate})=>{delete fragments[candidate.group].assets[candidate.fighter.id];},
  ({fragments,intake})=>{const excluded=intake.entries.find(entry=>entry.generationExcluded);fragments[excluded.group].assets[excluded.fighter.id]=artwork(excluded.fighter.id,excluded.fighter.source);},
  ({ledgers,fragments,intake,candidate})=>{
   const second=intake.entries.find(entry=>!entry.generationExcluded&&entry.fighter.id!==candidate.fighter.id),art=artwork(second.fighter.id,second.fighter.source);
   const row=ledgers[second.group].items.find(row=>row.entityId===second.fighter.id);row.status='implemented-candidate';row.artifacts=[art.frames[0].path];
   fragments[second.group].assets[second.fighter.id]=art;
  }
 ]){
  const {root}=await continuationFixture(t,mutate);await assert.rejects(readArtContinuation(root));
 }
});
