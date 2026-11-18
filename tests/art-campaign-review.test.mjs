import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {matchesCampaignCandidate,resolvedHistoricalArtwork,readArtContinuation,readBrowserCampaignSubjects} from '../scripts/art-campaign-review.mjs';
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

test('campaign review binds a retained portrait to its original fragment and its distinct idle to the combat import',async t=>{
 const {root,candidate}=await continuationFixture(t);
 const id=candidate.fighter.id,source=candidate.fighter.source,art=artwork(id,source);
 const portrait={...art.frames[0]},sha256='c'.repeat(64);
 const combat={...portrait,path:`assets/sprites/${id}.${sha256.slice(0,12)}.png`,sha256,bytes:512,purpose:'combat',view:'side-view'};
 art.portrait=portrait;
 const journal={schema:1,imports:[{fighterId:id,source,kind:'distinct-combat-idle',path:combat.path,sha256,bytes:combat.bytes,existingSelectionReference:portrait}]};
 await writeFile(join(root,'docs/production/sprite-wave5-imports-2026-11-18.json'),JSON.stringify(journal));
 const continuation=await readArtContinuation(root),row=continuation.rows.find(row=>row.entityId===id),fragment=continuation.assets[id];
 const check=f=>matchesCampaignCandidate(f.row,source,f.fragment,f.art,f.continuation);
 const f={row,fragment,art,continuation};
 assert.equal(check(f),true); // Originally shared static idle.
 art.frames=[combat];art.combatView='side-view-candidate';
 assert.equal(check(f),true);
 assert.equal(resolvedHistoricalArtwork({...row,status:'blocked'},art,continuation,{purpose:'selection'}),true);
 assert.deepEqual(row.artifacts,[portrait.path]);
 for(const [label,mutate] of Object.entries({
  'missing journal':f=>{f.continuation.purposeDeliveries=[];},
  'wrong owner':f=>{f.continuation.purposeDeliveries[0].id='other';},
  'missing edition':f=>{delete f.continuation.purposeDeliveries[0].source;},
  'incorrect edition':f=>{f.continuation.purposeDeliveries[0].source='other';},
  'wrong purpose':f=>{f.continuation.purposeDeliveries[0].purpose='selection';},
  'wrong digest':f=>{f.continuation.purposeDeliveries[0].sha256='d'.repeat(64);},
  'missing digest':f=>{delete f.continuation.purposeDeliveries[0].sha256;},
  'wrong byte count':f=>{f.continuation.purposeDeliveries[0].bytes++;},
  'wrong path':f=>{f.continuation.purposeDeliveries[0].file=portrait.path;},
  'wrong earlier selection':f=>{f.continuation.purposeDeliveries[0].existingSelectionReference={...portrait,bytes:10};},
  'unbound portrait':f=>{f.art.portrait={...combat};},
  'changed portrait digest':f=>{f.art.portrait.sha256='d'.repeat(64);},
  'altered fragment':f=>{f.fragment.frames[0].bytes++;},
  'rewritten historical row':f=>{f.row.artifacts=[combat.path];},
  'unqualified combat frame':f=>{delete f.art.frames[0].view;},
  'shared frame presented as a revision':f=>{f.art.frames=[{...portrait,purpose:'combat',view:'side-view'}];}
 })){
  const changed=structuredClone(f);mutate(changed);assert.equal(check(changed),false,label);
  assert.equal(resolvedHistoricalArtwork({...row,status:'blocked'},changed.art,changed.continuation,{purpose:'combat'}),false,label);
 }
});

test('browser campaign review handles selection-only dossiers and detects shared combat paths and pixels',async()=>{
 const combat=artwork('combat');
 const frame=combat.frames[0];
 const selection={portrait:{...frame},frames:[],clips:{}};
 const SPRITES={selection,combat,
  samePath:{frames:[{...frame,pixelSHA256:'c'.repeat(64)}]},
  samePixels:{frames:[{...frame,path:'different.png'}]}};
 const ROSTER=['selection','combat','missing'].map(id=>({id}));
 const createCombatProfile=fighter=>({referencePolicy:{id:fighter.id}});
 const [portrait,owned,missing]=await readBrowserCampaignSubjects(ROSTER.map(fighter=>fighter.id),[{SPRITES},{ROSTER,createCombatProfile}]);
 assert.equal(portrait.art,selection);assert.deepEqual(portrait.owners,[]);
 assert.deepEqual(portrait.policy,{id:'selection'});
 assert.deepEqual(owned.owners,['combat','samePath','samePixels']);
 assert.equal(missing.art,undefined);assert.deepEqual(missing.owners,[]);
});
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

test('a later selection delivery resolves artwork presence without completing combat',()=>{
 const f=fixture(),portrait={...f.art.frames[0]};
 f.art={...f.art,portrait,frames:[],clips:{},combatView:'selection-only'};
 f.continuation.rows[0].status='blocked';f.continuation.assets={};
 f.continuation.purposeDeliveries=[{id:'subject',file:portrait.path,sha256:portrait.sha256,purpose:'selection'}];
 const history=JSON.stringify(f.continuation.rows);
 assert.equal(inspect(f),true);assert.equal(resolvedHistoricalArtwork(f.row,f.art,f.continuation,{purpose:'selection'}),true);
 assert.equal(resolvedHistoricalArtwork(f.row,f.art,f.continuation,{purpose:'combat'}),false);
 assert.equal(JSON.stringify(f.continuation.rows),history);
 for(const mutate of [g=>{g.art.source='sh1';},g=>{g.continuation.intake.entries[0].generationExcluded=true;},
  g=>{g.continuation.purposeDeliveries[0].sha256='b'.repeat(64);},g=>{g.continuation.purposeDeliveries[0].id='other';},
  g=>{g.continuation.purposeDeliveries[0].file='../borrowed.png';},g=>{g.art.singleSubjectReviewed=false;}]){
  const changed=structuredClone(f);mutate(changed);assert.equal(inspect(changed),false);
 }
});

test('a separate combat journal must bind an actual side-view frame, not its portrait',()=>{
 const f=fixture();f.continuation.rows[0].status='blocked';f.continuation.assets={};f.art.combatView='side-view-candidate';
 f.art.portrait={...f.art.frames[0],path:'assets/sprites/subject.'+'c'.repeat(12)+'.png',sha256:'c'.repeat(64)};
 f.art.frames[0].purpose='combat';f.art.frames[0].view='side-view';
 f.continuation.purposeDeliveries=[{id:'subject',file:f.art.frames[0].path,purpose:'combat'}];
 assert.equal(resolvedHistoricalArtwork(f.row,f.art,f.continuation,{purpose:'combat'}),true);
 assert.equal(resolvedHistoricalArtwork(f.row,f.art,f.continuation,{purpose:'selection'}),false);
 f.art.combatView='selection-only';assert.equal(inspect(f),false);
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

test('continuation reader binds the two explicit purpose journals and ignores unfinished outputs',async t=>{
 const {root,candidate}=await continuationFixture(t),art=artwork(candidate.fighter.id,candidate.fighter.source);
 await writeFile(join(root,'docs/production/sprite-generation-2026-11-17.json'),JSON.stringify({generated:[{id:candidate.fighter.id,file:art.frames[0].path,sha256:art.frames[0].sha256}]}));
 await writeFile(join(root,'docs/production/combat-generation-2026-11-17.json'),JSON.stringify({selectionOutputs:[],outputs:[
  {id:candidate.fighter.id,file:art.frames[0].path,status:'integrated-candidate'},
  {id:'unfinished',status:'generated-not-imported'}]}));
 const result=await readArtContinuation(root);
 assert.deepEqual(result.purposeDeliveries.map(d=>d.purpose),['selection','combat']);
 assert.ok(result.purposeDeliveries.every(d=>d.id===candidate.fighter.id));
 await writeFile(join(root,'docs/production/combat-generation-2026-11-17.json'),JSON.stringify({outputs:[{id:candidate.fighter.id,file:'../borrowed.png',status:'integrated-candidate'}]}));
 await assert.rejects(readArtContinuation(root),/Invalid exact artwork delivery/);
});

for(const journalName of ['sprite-continuation-imports-2026-11-17.json','sprite-next-imports-2026-11-17.json','sprite-suite-imports-2026-11-17.json','sprite-following-imports-2026-11-17.json','sprite-resume-imports-2026-11-18.json','sprite-complement-imports-2026-11-18.json','sprite-wave3-imports-2026-11-18.json','sprite-wave4-imports-2026-11-18.json','sprite-wave5-imports-2026-11-18.json','sprite-wave6-imports-2026-11-18.json','sprite-wave14-imports-2026-11-18.json'])
test(`${journalName} resolves archived blockers by exact bytes after combat index normalization`,async t=>{
 let originalRow;
 const {root,candidate}=await continuationFixture(t,({row,fragments,candidate})=>{
  row.status='blocked';row.reason='Historical incomplete source.';row.artifacts=[];
  delete fragments[candidate.group].assets[candidate.fighter.id];originalRow=structuredClone(row);
 });
 const id=candidate.fighter.id,source=candidate.fighter.source,art=artwork(id,source),combat=art.frames[0];
 art.combatView='side-view-candidate';combat.purpose='combat';combat.view='side-view';
 art.portrait={...combat,path:`assets/sprites/${id}.`+'c'.repeat(12)+'.png',sha256:'c'.repeat(64)};
 const imports=[
  {fighterId:id,source,kind:'selection-base',path:art.portrait.path,sha256:art.portrait.sha256,frameIndex:0},
  {fighterId:id,source,kind:'distinct-combat-idle',path:combat.path,sha256:combat.sha256,frameIndex:1}
 ];
 const file=join(root,'docs/production',journalName);
 await writeFile(file,JSON.stringify({schema:1,imports}));
 const result=await readArtContinuation(root);
 assert.deepEqual(result.purposeDeliveries.map(d=>d.purpose),['selection','combat']);
 assert.equal(resolvedHistoricalArtwork(originalRow,art,result,{purpose:'combat'}),true);
 assert.equal(resolvedHistoricalArtwork(originalRow,art,result,{purpose:'selection'}),true);
 assert.deepEqual(result.rows.find(row=>row.entityId===id),{...originalRow,group:candidate.group});
 for(const mutate of [r=>{r.purposeDeliveries[1].sha256='b'.repeat(64);},r=>{r.purposeDeliveries[1].source='wrong-edition';},
  r=>{r.purposeDeliveries[1].id='borrowed';},r=>{r.intake.entries.find(e=>e.fighter.id===id).generationExcluded=true;}]){
  const changed=structuredClone(result);mutate(changed);
  assert.equal(resolvedHistoricalArtwork(originalRow,art,changed,{purpose:'combat'}),false);
 }
 for(const mutate of [r=>{r.kind='pending';},r=>{r.path='../borrowed.png';},r=>{delete r.sha256;},r=>{r.sha256='b'.repeat(64);}]){
  const changed=structuredClone(imports);mutate(changed[1]);await writeFile(file,JSON.stringify({schema:1,imports:changed}));
  await assert.rejects(readArtContinuation(root),/Invalid exact artwork delivery/);
 }
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

test('later source-reviewed images for Cybil and Curtis preserve their original ART92 exclusion', async () => {
 const root = new URL('../', import.meta.url);
 const review = await readArtContinuation(fileURLToPath(root));
 const {assets} = JSON.parse(await readFile(new URL('art/registry.json', root)));
 for (const id of ['sh1_monster_cybil_017', 'homecoming_curtis_ackers']) {
  const intake = review.intake.entries.find(entry => entry.fighter.id === id);
  const row = review.rows.find(entry => entry.entityId === id);
  assert.equal(intake.generationExcluded, true);
  assert.equal(row.status, 'blocked');
  for (const purpose of ['selection', 'combat']) {
   const delivery = review.purposeDeliveries.find(item => item.id === id && item.purpose === purpose);
   assert.equal(delivery.source, intake.fighter.source);
   assert.equal(delivery.reviewedWithSource, true);
   assert.equal(resolvedHistoricalArtwork(row, assets[id], review, {purpose}), true);
   const unreviewed = {...review, purposeDeliveries: [{...delivery, reviewedWithSource: false}]};
   assert.equal(resolvedHistoricalArtwork(row, assets[id], unreviewed, {purpose}), false);
  }
 }
});
