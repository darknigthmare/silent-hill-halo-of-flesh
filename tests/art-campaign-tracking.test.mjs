import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {deflateSync} from 'node:zlib';
import {crc32} from '../scripts/raster-validation.mjs';
import {applyArtCampaignProgress,ART_CAMPAIGN_GROUP_SIZES,ART_CONTINUATION_ID,ART_CONTINUATION_BASE,
  ART_CONTINUATION_GROUP_SIZES,latestArtContinuationDelivery} from '../scripts/art-campaign-tracking.mjs';

function fixture(){
  const id='subject',rowId=id+':pose:idle';
  const plan={poses:[{id:rowId,fighterId:id,source:'sh1',pose:'idle',existing:'Aucun clip dédié',productionStatus:'Rôle à décider'}],
    tasks:[{id:id+':art',reason:'PNG à produire',status:'À faire'},{id:id+':role',reason:'Keep original role',status:'Validé'}]};
  const delivery={batch:'art144',group:'a',workstream:'art',collection:'poses',rowId,entityId:id,
    status:'implemented-candidate',limits:'Static candidate; original animation unmeasured.',evidence:['https://example.org/exact-source']};
  const assets={[id]:{fighterId:id,source:'sh1',frames:[{path:'assets/sprites/subject.png'}],clips:{idle:{frames:[0],loop:false,ticksPerFrame:1}}}};
  return {id,rowId,plan,delivery,assets};
}

test('ART144 covers its exact 30/30/30/30/24 allocation without padding',()=>{
  assert.deepEqual(Object.values(ART_CAMPAIGN_GROUP_SIZES),[30,30,30,30,24]);
  assert.equal(Object.values(ART_CAMPAIGN_GROUP_SIZES).reduce((a,b)=>a+b,0),144);
});

test('a static candidate is recorded without closing art or changing a resolved noncombat role',()=>{
  const f=fixture(),role=structuredClone(f.plan.tasks[1]);
  const progress=applyArtCampaignProgress(f.plan,[f.delivery],f.assets);
  assert.equal(progress.assessed,1);assert.equal(progress.candidates,1);assert.equal(progress.blocked,0);assert.equal(progress.pending,143);
  assert.equal(progress.certifiedOneToOne,false);assert.match(f.plan.poses[0].existing,/image idle fixe importée/);
  assert.equal(f.plan.poses[0].productionStatus,'Rôle à décider');assert.equal(f.plan.tasks[0].status,'À faire');
  assert.equal(f.plan.tasks[0].delivery,'art144-static-candidate-2026-11-01');
  assert.deepEqual(f.plan.tasks[1],role);assert.match(f.plan.tasks[0].reason,/rôle et les capacités restent inchangés/);
});

test('new artwork cannot erase the exact old source limitation from the row or parent action',()=>{
  const f=fixture(),old={...f.delivery,batch:'lot12',status:'blocked',reason:'Original full body was not visible.',limits:'No native timing was measured.'};
  applyArtCampaignProgress(f.plan,[old,f.delivery],f.assets);
  for(const value of [f.plan.poses[0].existing,f.plan.tasks[0].reason]){
    assert.ok(value.includes(old.reason));assert.ok(value.includes(old.limits));
    assert.match(value,/ne la déclare pas automatiquement résolue/);assert.match(value,/ni certification 1:1/);
  }
});

test('current blockers retain both earlier and current reasons without borrowing an existing image',()=>{
  const f=fixture(),old={...f.delivery,batch:'lot9',status:'blocked',reason:'Earlier tool refusal.'};
  f.delivery.status='blocked';f.delivery.reason='The earlier refusal remains respected.';
  const progress=applyArtCampaignProgress(f.plan,[old,f.delivery],{});
  assert.equal(progress.candidates,0);assert.equal(progress.blocked,1);
  for(const value of [f.plan.poses[0].existing,f.plan.tasks[0].reason]){
    assert.ok(value.includes(old.reason));assert.ok(value.includes(f.delivery.reason));
  }
  assert.throws(()=>applyArtCampaignProgress(fixture().plan,[f.delivery],f.assets),/blocked row requires/);
});

test('a declared import needs its own exact-source static idle rather than a placeholder or animated stand-in',()=>{
  for(const corrupt of [f=>delete f.assets[f.id],f=>f.assets[f.id].source='sh2',
    f=>f.assets[f.id].fighterId='borrowed',f=>f.assets[f.id].clips.idle.frames=[0,0],
    f=>f.assets[f.id].clips.idle.loop=true,f=>f.assets[f.id].frames=[]]){
    const f=fixture();corrupt(f);
    assert.throws(()=>applyArtCampaignProgress(f.plan,[f.delivery],f.assets),/own imported static idle/);
  }
});

test('duplicate, wrong-owner and non-idle deliveries cannot inflate the campaign',()=>{
  const f=fixture();assert.throws(()=>applyArtCampaignProgress(f.plan,[f.delivery,{...f.delivery,group:'b'}],f.assets),/Duplicate/);
  for(const corrupt of [d=>d.rowId='test:case',d=>d.entityId='another',d=>d.collection='moves',
    d=>d.limits='',d=>d.evidence=[],d=>d.status='certified']){
    const g=fixture();corrupt(g.delivery);
    assert.throws(()=>applyArtCampaignProgress(g.plan,[g.delivery],g.assets),/Invalid ART144/);
  }
});

function continuationFixture(context){
  const f=fixture(),root=mkdtempSync(join(tmpdir(),'halo-art92-tracking-'));
  context.after(()=>rmSync(root,{recursive:true,force:true}));
  const previous={...f.delivery,status:'blocked',reason:'Earlier exact-source full-body evidence was insufficient.',limits:'Earlier tool and source limits remain historical.'};
  const next={...f.delivery,batch:ART_CONTINUATION_ID,limits:'New static image candidate only; native source timing is unmeasured.',artifacts:['assets/sprites/subject.png']};
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==','base64');
  const asset=f.assets[f.id];Object.assign(asset,{fidelity:'unverified',animatedClips:0});
  Object.assign(asset.frames[0],{bytes:png.length,sha256:createHash('sha256').update(png).digest('hex')});
  mkdirSync(join(root,'assets/sprites'),{recursive:true});writeFileSync(join(root,next.artifacts[0]),png);
  mkdirSync(join(root,'docs/production'),{recursive:true});
  const intake={schema:1,campaign:ART_CONTINUATION_ID,baseCommit:ART_CONTINUATION_BASE,requested:92,
    entries:[{group:'a',fighter:{id:f.id,source:'sh1'},generationExcluded:false}]};
  const saveIntake=()=>writeFileSync(join(root,'docs/production/art92-intake.json'),JSON.stringify(intake));saveIntake();
  return {...f,root,previous,next,intake,saveIntake,options:{root}};
}

function laterCombatFixture(context){
  const f=continuationFixture(context);
  Object.assign(f.next,{status:'blocked',reason:'No accepted lateral idle at the time of ART92.',artifacts:[]});
  f.intake.entries[0].workbookRowId=f.rowId;f.saveIntake();
  function raster(color,purpose){
    const chunk=(type,data)=>{const name=Buffer.from(type),size=Buffer.alloc(4),crc=Buffer.alloc(4);size.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([name,data])));return Buffer.concat([size,name,data,crc]);};
    const header=Buffer.alloc(13);header.writeUInt32BE(1,0);header.writeUInt32BE(1,4);header[8]=8;header[9]=6;
    const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(Buffer.from([0,...color,255]))),chunk('IEND',Buffer.alloc(0))]);
    const sha256=createHash('sha256').update(png).digest('hex'),path=`assets/sprites/${f.id}.${sha256.slice(0,12)}.png`;
    writeFileSync(join(f.root,path),png);return {path,sha256,bytes:png.length,width:1,height:1,purpose,facing:1};
  }
  const portrait=raster([130,60,40],'selection'),frame={...raster([80,120,160],'combat'),view:'side-view'};
  Object.assign(f.assets[f.id],{frames:[frame],portrait,combatView:'side-view-candidate',status:'integrated-candidate',singleSubjectReviewed:true});
  const journal={outputs:[{id:f.id,file:frame.path,sha256:frame.sha256,status:'integrated-candidate'}],selectionOutputs:[{id:f.id,file:portrait.path,sha256:portrait.sha256,status:'integrated-candidate'}]};
  const saveJournal=()=>writeFileSync(join(f.root,'docs/production/combat-generation-2026-11-17.json'),JSON.stringify(journal));saveJournal();
  return {...f,journal,saveJournal};
}

test('ART92 retains the exact unpadded 18/21/18/15/20 allocation and its own baseline',()=>{
  assert.equal(ART_CONTINUATION_ID,'art92');assert.equal(ART_CONTINUATION_BASE,'82e5f413300ca1112d153ee407dd988b70efd313');
  assert.deepEqual(Object.values(ART_CONTINUATION_GROUP_SIZES),[18,21,18,15,20]);
  assert.equal(Object.values(ART_CONTINUATION_GROUP_SIZES).reduce((sum,n)=>sum+n,0),92);
});

test('an exact ART92 import preserves the historical ART144 blocker and cannot close role or art work',context=>{
  const f=continuationFixture(context),role=structuredClone(f.plan.tasks[1]);
  const historical=applyArtCampaignProgress(f.plan,[f.previous,f.next],f.assets,f.options);
  assert.equal(historical.blocked,1);assert.equal(historical.candidates,0);assert.equal(historical.assessed,1);
  assert.deepEqual(f.plan.tasks[1],role);assert.equal(f.plan.tasks[0].status,'À faire');
  assert.equal(f.plan.poses[0].productionStatus,'Rôle à décider');assert.equal(f.plan.tasks[0].delivery,'art92-static-candidate-2026-11-02');
  assert.equal(f.plan.artContinuation.assessed,1);assert.equal(f.plan.artContinuation.candidates,1);assert.equal(f.plan.artContinuation.blocked,0);
  assert.equal(f.plan.artContinuation.pending,91);assert.equal(f.plan.artContinuation.certifiedOneToOne,false);
  for(const text of [f.plan.poses[0].existing,f.plan.tasks[0].reason]){
    assert.ok(text.includes(f.previous.reason));assert.ok(text.includes(f.previous.limits));assert.ok(text.includes(f.next.limits));
    assert.match(text,/Campagne ART144/);assert.match(text,/Campagne ART92/);assert.match(text,/blocage ART144 reste archivé/);
  }
});

test('a renewed ART92 blocker keeps both old and new diagnostics without pretending to import a PNG',context=>{
  const f=continuationFixture(context);Object.assign(f.next,{status:'blocked',reason:'No newly attested full body is available.',artifacts:[]});
  applyArtCampaignProgress(f.plan,[f.previous,f.next],{},f.options);
  assert.equal(f.plan.artCampaign.blocked,1);assert.equal(f.plan.artContinuation.blocked,1);assert.equal(f.plan.artContinuation.candidates,0);
  for(const text of [f.plan.poses[0].existing,f.plan.tasks[0].reason]){
    assert.ok(text.includes(f.previous.reason));assert.ok(text.includes(f.next.reason));assert.match(text,/Blocage de reprise/);
  }
  assert.throws(()=>applyArtCampaignProgress(fixture().plan,[f.previous,f.next],f.assets,f.options),/ART92 blocked row/);
});

test('a later combat revision keeps the original ART92 candidate and checks both actual PNG files',context=>{
  function setup(){
    const f=laterCombatFixture(context),art=f.assets[f.id],frame=art.frames[0];
    Object.assign(f.next,{status:'implemented-candidate',artifacts:[art.portrait.path]});delete f.next.reason;
    const archived={...art,frames:[{...art.portrait}],combatView:'legacy-unreviewed'};
    const fragment={schema:1,campaign:'art92',baseCommit:ART_CONTINUATION_BASE,group:'a',assets:{[f.id]:archived}};
    const folder=join(f.root,'art/fragments');mkdirSync(folder,{recursive:true});
    const fragmentPath=join(folder,'art92-a.json');writeFileSync(fragmentPath,JSON.stringify(fragment));
    const journalPath=join(f.root,'docs/production/sprite-wave5-imports-2026-11-18.json');
    writeFileSync(journalPath,JSON.stringify({schema:1,imports:[{fighterId:f.id,source:art.source,kind:'distinct-combat-idle',
      path:frame.path,sha256:frame.sha256,bytes:frame.bytes,existingSelectionReference:art.portrait}]}));
    return {...f,art,frame,fragmentPath,journalPath};
  }
  const f=setup(),original=structuredClone(f.next);
  applyArtCampaignProgress(f.plan,[f.previous,f.next],f.assets,f.options);
  assert.deepEqual(f.next,original);assert.equal(f.plan.artContinuation.candidates,1);assert.equal(f.plan.artContinuation.blocked,0);
  assert.equal(f.plan.tasks[0].delivery,'art92-static-candidate-2026-11-02');
  for(const corrupt of [g=>rmSync(g.fragmentPath),g=>rmSync(g.journalPath),
    g=>writeFileSync(join(g.root,g.art.portrait.path),'bad old PNG'),g=>writeFileSync(join(g.root,g.frame.path),'bad new PNG'),
    g=>{g.next.artifacts=[g.frame.path];}]){
    const changed=setup();corrupt(changed);
    assert.throws(()=>applyArtCampaignProgress(changed.plan,[changed.previous,changed.next],changed.assets,changed.options),/matching artifact file/);
  }
});

test('a later exact combat delivery coexists with both immutable blocked campaigns without approving work',context=>{
  const f=laterCombatFixture(context),before=structuredClone([f.previous,f.next,f.assets,f.plan.tasks[1]]);
  applyArtCampaignProgress(f.plan,[f.previous,f.next],f.assets,f.options);
  assert.equal(f.plan.artCampaign.blocked,1);assert.equal(f.plan.artCampaign.candidates,0);
  assert.equal(f.plan.artContinuation.blocked,1);assert.equal(f.plan.artContinuation.candidates,0);
  assert.equal(f.plan.artContinuation.laterCombatImages,1);assert.equal(f.plan.artContinuation.certifiedOneToOne,false);
  assert.equal(f.plan.tasks[0].status,'À faire');assert.equal(f.plan.poses[0].productionStatus,'Rôle à décider');
  assert.deepEqual([f.previous,f.next,f.assets,f.plan.tasks[1]],before);
  for(const text of [f.plan.poses[0].existing,f.plan.tasks[0].reason]){
    assert.ok(text.includes(f.previous.reason));assert.ok(text.includes(f.next.reason));
    assert.match(text,/image de combat latérale candidate documentée/);assert.ok(text.includes(f.assets[f.id].frames[0].path));
    assert.match(text,/Ni animation, ni fidélité 1:1, ni approbation de production, ni rôle/);
  }
});

test('a later selection portrait leaves the historical combat action unresolved',context=>{
  const f=laterCombatFixture(context);f.journal.outputs=[];f.saveJournal();
  Object.assign(f.assets[f.id],{frames:[],clips:{},combatView:'selection-only'});
  applyArtCampaignProgress(f.plan,[f.previous,f.next],f.assets,f.options);
  assert.equal(f.plan.artContinuation.laterCombatImages,0);assert.equal(f.plan.artContinuation.blocked,1);
  assert.equal(f.plan.tasks[0].status,'À faire');assert.equal(f.plan.poses[0].productionStatus,'Rôle à décider');
  assert.doesNotMatch(f.plan.poses[0].existing,/image de combat latérale candidate documentée/);
});

test('later combat resolution rejects selection-only claims, wrong identity or source, exclusions and missing exact bytes',context=>{
  for(const corrupt of [f=>f.journal.outputs=[],f=>f.journal.outputs[0].status='pending',
    f=>f.journal.outputs[0].file=f.assets[f.id].portrait.path,f=>f.journal.outputs[0].sha256='0'.repeat(64),
    f=>{f.journal.outputs[0].id='other';f.journal.outputs[0].file=f.journal.outputs[0].file.replace('subject.','other.');},
    f=>f.assets[f.id].source='film',f=>f.assets[f.id].combatView='selection-only',f=>f.assets[f.id].fidelity='verified',
    f=>f.intake.entries[0].generationExcluded=true,f=>delete f.intake.entries[0].workbookRowId,
    f=>rmSync(join(f.root,f.assets[f.id].frames[0].path)),f=>rmSync(join(f.root,f.assets[f.id].portrait.path)),
    f=>writeFileSync(join(f.root,f.assets[f.id].frames[0].path),'not the registered PNG')]){
    const f=laterCombatFixture(context);corrupt(f);f.saveIntake();f.saveJournal();
    assert.throws(()=>applyArtCampaignProgress(f.plan,[f.previous,f.next],f.assets,f.options),/ART92 blocked row/);
  }
});

test('a later campaign cannot override an absent, borrowed, or previously implemented ART144 identity',context=>{
  for(const corrupt of [f=>f.previous.status='implemented-candidate',f=>f.previous.entityId='another',
    f=>f.previous.collection='moves',f=>f.next.rowId='another:pose:idle',f=>f.next.entityId='another',f=>f.next.collection='moves']){
    const f=continuationFixture(context);corrupt(f);
    assert.throws(()=>applyArtCampaignProgress(f.plan,[f.previous,f.next],f.assets,f.options),/Invalid ART92/);
  }
  const f=continuationFixture(context);
  assert.throws(()=>applyArtCampaignProgress(f.plan,[f.next],f.assets,f.options),/Invalid ART92/);
  assert.throws(()=>applyArtCampaignProgress(f.plan,[f.previous],f.assets,f.options),/ART144 blocked row/);
});

test('ART92 rejects missing source evidence, forged groups, duplicate rows and undeclared artwork',context=>{
  for(const corrupt of [f=>f.next.evidence=[],f=>f.next.evidence=['EXT58'],f=>f.next.evidence=['http://example.org/source'],
    f=>f.next.limits='',f=>f.next.group='b',f=>f.next.status='certified',f=>f.next.artifacts=[],
    f=>f.next.artifacts=['../outside.png'],f=>f.assets[f.id].source='film',f=>f.assets[f.id].fighterId='borrowed',
    f=>f.assets[f.id].fidelity='verified',f=>f.assets[f.id].clips.idle.frames=[0,0],f=>f.assets[f.id].animatedClips=1]){
    const f=continuationFixture(context);corrupt(f);
    assert.throws(()=>applyArtCampaignProgress(f.plan,[f.previous,f.next],f.assets,f.options),/ART92/);
  }
  const f=continuationFixture(context),duplicate={...f.next};
  assert.throws(()=>latestArtContinuationDelivery([f.next,duplicate],f.rowId),/Duplicate ART92/);
  assert.throws(()=>applyArtCampaignProgress(f.plan,[f.previous,f.next,duplicate],f.assets,f.options),/Duplicate ART92/);
  assert.equal(latestArtContinuationDelivery([f.previous,f.next],f.rowId),f.next);
  assert.equal(latestArtContinuationDelivery([f.previous],'absent'),null);
});

test('ART92 requires the actual declared PNG bytes, not a missing path, symbolic link or mismatched hash',context=>{
  for(const corrupt of [f=>rmSync(join(f.root,f.next.artifacts[0])),
    f=>{const path=join(f.root,f.next.artifacts[0]),copy=join(f.root,'copy.png');writeFileSync(copy,readFileSync(path));rmSync(path);symlinkSync(copy,path);},
    f=>writeFileSync(join(f.root,f.next.artifacts[0]),'not a PNG'),
    f=>f.assets[f.id].frames[0].sha256='0'.repeat(64),f=>f.assets[f.id].frames[0].bytes=0]){
    const f=continuationFixture(context);corrupt(f);
    assert.throws(()=>applyArtCampaignProgress(f.plan,[f.previous,f.next],f.assets,f.options),/matching artifact file/);
  }
});

test('immutable intake exclusions cannot be removed by a candidate ledger or a different source label',context=>{
  for(const corrupt of [f=>f.intake.entries[0].generationExcluded=true,f=>delete f.intake.entries[0].generationExcluded,
    f=>f.intake.entries[0].fighter.source='film',f=>f.intake.baseCommit='0'.repeat(40)]){
    const f=continuationFixture(context);corrupt(f);f.next.generationExcluded=false;f.saveIntake();
    assert.throws(()=>applyArtCampaignProgress(f.plan,[f.previous,f.next],f.assets,f.options),/ART92/);
  }
});
