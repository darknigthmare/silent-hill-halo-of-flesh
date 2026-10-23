import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,lstat,rm,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {FIGHTER_REFERENCES} from '../src/production-reference.js';
import {validateSourceTiming,verifySourceTiming,sourceTimingAnnotationDigest,validateSourceTimingBatch,verifySourceTimingBatch,sourceTimingCommand} from '../scripts/source-timing.mjs';

// A container-header fixture and injected decoder output exercise validation;
// these bytes and timestamps are not a source-game capture or measured action.
const bytes=Buffer.from([0,0,0,24,0x66,0x74,0x79,0x70,0x69,0x73,0x6f,0x6d,0,0,0,0]);
const sha256=createHash('sha256').update(bytes).digest('hex');
function packet(){return {schema:1,fighterId:'sh1_air_screamer_001',source:'sh1',edition:FIGHTER_REFERENCES.sh1_air_screamer_001.referenceEdition,
 moveKey:'neutralSpecial',observedAction:'Fixture only: one visible contact',
 capture:{path:'capture.mp4',sha256,sourceUrl:'https://example.invalid/original-capture',frameRate:{numerator:60000,denominator:2002},totalFrames:3},
 measurement:{unit:'capture-frames',startFrame:0,impactFrame:1,endFrame:2,measuredBy:'QA fixture',measuredAt:'2026-10-23',notes:'Synthetic timestamps; no source measurement.'}};}
function metadata(){return {streams:[{codec_type:'video',width:16,height:16,r_frame_rate:'30000/1001',avg_frame_rate:'30000/1001',nb_read_frames:'3'}],
 frames:[{best_effort_timestamp_time:'0.000000'},{best_effort_timestamp_time:'0.033367'},{best_effort_timestamp_time:'0.066733'}]};}
async function fixture(context){
 const directory=await mkdtemp(join(tmpdir(),'halo-source-timing-'));
 context.after(()=>rm(directory,{recursive:true,force:true}));
 await writeFile(join(directory,'capture.mp4'),bytes);return directory;
}
function batch(){
 const p=packet();return {schema:1,type:'source-timing-batch',fighterId:p.fighterId,source:p.source,edition:p.edition,capture:p.capture,
  entries:[{moveKey:p.moveKey,observedAction:p.observedAction,measurement:p.measurement},
   {moveKey:'forwardLight',observedAction:'Fixture only: a second annotation',measurement:{...p.measurement}}]};
}
function entryPacket(b,entry=b.entries[0]){return {schema:1,fighterId:b.fighterId,source:b.source,edition:b.edition,capture:b.capture,
 moveKey:entry.moveKey,observedAction:entry.observedAction,measurement:entry.measurement};}
function review(b){
 b.entries[0].review={status:'attested-candidate',reviewedBy:'Separate QA observer',reviewedAt:'2026-10-23',
  notes:'Synthetic annotation review, no source-game observation.',annotationSHA256:sourceTimingAnnotationDigest(entryPacket(b))};return b;
}

test('timing packets retain exact identity and rational recording FPS without invented source-engine timing',()=>{
 const input=packet(),before=structuredClone(input),result=validateSourceTiming(input);
 assert.deepEqual(input,before);assert.deepEqual(result.capture.frameRate,{numerator:30000,denominator:1001});
 assert.equal(result.edition,input.edition);assert.equal(result.measurement.unit,'capture-frames');
 assert.equal(result.measurement.impactFrame,1);assert.equal('sourceFrameRate' in result,false);
});
test('timing refuses unknown subjects, editions, slots and privileged certification fields',()=>{
 for(const change of [p=>p.fighterId='__proto__',p=>p.fighterId='SH1_AIR_SCREAMER_001',p=>p.source='bom',p=>p.edition='Silent Hill 2 remake 2024',
  p=>p.moveKey='constructor',p=>p.certifiedOneToOne=true,p=>p.capture.originalEngineFPS=30,p=>p.measurement.sourceStart='00:00:00']){
  const p=packet();change(p);assert.throws(()=>validateSourceTiming(p),/Source timing/);
 }
 const p=packet(),refs=structuredClone(FIGHTER_REFERENCES);delete refs[p.fighterId].referenceEdition;
 assert.throws(()=>validateSourceTiming(p,{references:refs}),/exact researched edition/);
});
test('timing requires source provenance, observer notes and a valid measurement date',()=>{
 for(const change of [p=>p.capture.sourceUrl='http://example.invalid/video',p=>p.capture.sourceUrl='https://user:secret@example.invalid/video',
  p=>p.capture.sha256='',p=>p.capture.path='../capture.mp4',p=>p.capture.path='/capture.mp4',p=>p.capture.path='nested/../capture.mp4',
  p=>p.measurement.measuredBy='',p=>p.measurement.notes='',p=>p.measurement.measuredAt='2026-02-30']){
  const p=packet();change(p);assert.throws(()=>validateSourceTiming(p),/Source timing/);
 }
});
test('frame ranges and fractional rates are bounded and cannot be silently corrected',()=>{
 for(const change of [p=>p.capture.frameRate.denominator=0,p=>p.capture.frameRate.numerator=30.5,p=>p.capture.frameRate={numerator:241,denominator:1},
  p=>p.capture.totalFrames=18001,p=>p.measurement.unit='game-frames',p=>p.measurement.startFrame=-1,p=>p.measurement.startFrame=2,
  p=>p.measurement.impactFrame=3,p=>p.measurement.endFrame=3,p=>p.measurement.endFrame=0,p=>p.measurement.impactFrame=1.5]){
  const p=packet();change(p);assert.throws(()=>validateSourceTiming(p),/Source timing/);
 }
});
test('capture verification binds decoded metadata to the actual local file digest',async context=>{
 const directory=await fixture(context),input=packet(),result=await verifySourceTiming(input,{baseDirectory:directory,probe:()=>metadata()});
 assert.equal(result.status,'capture-verified-candidate');assert.equal(result.capture.bytes,bytes.length);
 assert.equal(result.capture.width,16);assert.equal(result.certifiedOneToOne,false);
 assert.match(result.timingUnit,/recording frames.*not inferred/);assert.match(result.limits,/does not fill or certify workbook/);
 const changed=packet();changed.capture.sha256='0'.repeat(64);
 await assert.rejects(verifySourceTiming(changed,{baseDirectory:directory,probe:()=>{throw Error('must not decode a changed capture');}}),/SHA256 mismatch/);
});
test('single and batch probes read the hashed snapshot despite replacement of the source path',async context=>{
 const directory=await fixture(context);
 for(const input of [packet(),review(batch())]){
  await writeFile(join(directory,'capture.mp4'),bytes);let snapshot;
  const result=await (input.type?verifySourceTimingBatch:verifySourceTiming)(input,{baseDirectory:directory,probe:async path=>{
   snapshot=path;assert.notEqual(path,join(directory,'capture.mp4'));
   assert.equal((await lstat(path)).mode&0o222,0,'decoder snapshot is read-only');
   await writeFile(join(directory,'capture.mp4'),'concurrently replaced original source file');
   assert.deepEqual(await readFile(path),bytes,'decode the exact bytes hashed for review');return metadata();
  }});
  assert.equal(result.capture.sha256,sha256);assert.equal(result.capture.bytes,bytes.length);
  if(input.type)assert.equal(result.entries[0].reviewStatus,'attested-candidate');
  await assert.rejects(lstat(snapshot),error=>error.code==='ENOENT');
  await assert.rejects(lstat(dirname(snapshot)),error=>error.code==='ENOENT');
 }
});
test('decoder failure removes the temporary capture and private directory',async context=>{
 const directory=await fixture(context);let snapshot;
 await assert.rejects(verifySourceTimingBatch(batch(),{baseDirectory:directory,probe:async path=>{snapshot=path;throw new Error('fixture decoder failure');}}),/fixture decoder failure/);
 await assert.rejects(lstat(snapshot),error=>error.code==='ENOENT');
 await assert.rejects(lstat(dirname(snapshot)),error=>error.code==='ENOENT');
});
test('snapshot hashing and copying retains all bytes across bounded read chunks',async context=>{
 const directory=await fixture(context),large=Buffer.concat([bytes,Buffer.alloc(160000,0x5a)]),p=packet();
 await writeFile(join(directory,'capture.mp4'),large);p.capture.sha256=createHash('sha256').update(large).digest('hex');
 const result=await verifySourceTiming(p,{baseDirectory:directory,probe:async path=>{
  assert.deepEqual(await readFile(path),large);return metadata();
 }});
 assert.equal(result.capture.bytes,large.length);assert.equal(result.capture.sha256,p.capture.sha256);
});
test('decoder frame count, dimensions, rate and constant spacing must match the claim',async context=>{
 const directory=await fixture(context);
 for(const change of [m=>m.streams[0].nb_read_frames='4',m=>m.frames.pop(),m=>m.streams[0].width=8192,
  m=>m.streams[0].r_frame_rate='30/1',m=>m.streams[0].avg_frame_rate='25/1',m=>m.frames[1].best_effort_timestamp_time='0.050000',
  m=>delete m.frames[0].best_effort_timestamp_time,m=>m.frames[0].best_effort_timestamp_time='',m=>m.streams=[]]){
  const m=metadata();change(m);
  await assert.rejects(verifySourceTiming(packet(),{baseDirectory:directory,probe:()=>m}),/Source timing/);
 }
});
test('unreadable containers and symlinked captures cannot produce a verified packet',async context=>{
 const directory=await fixture(context);
 await assert.rejects(verifySourceTiming(packet(),{baseDirectory:directory}),/ffprobe could not verify/);
 const link=join(directory,'linked.mp4');await symlink(join(directory,'capture.mp4'),link);
 const p=packet();p.capture.path='linked.mp4';
 await assert.rejects(verifySourceTiming(p,{baseDirectory:directory,probe:()=>metadata()}),/regular, bounded/);
 await writeFile(join(directory,'capture.mp4'),'plain text is not a video');
 p.capture.path='capture.mp4';p.capture.sha256=createHash('sha256').update('plain text is not a video').digest('hex');
 await assert.rejects(verifySourceTiming(p,{baseDirectory:directory,probe:()=>metadata()}),/MP4\/MOV or Matroska/);
});
test('CLI refuses malformed arguments and rejects an invalid packet before producing any output',async context=>{
 for(const args of [[],['validate'],['validate','input.json','--overwrite'],['measure','input.json']])await assert.rejects(sourceTimingCommand(args),/usage:/);
 const directory=await fixture(context),input=join(directory,'packet.json');
 await writeFile(input,JSON.stringify({...packet(),certifiedOneToOne:true}));
 await assert.rejects(sourceTimingCommand(['validate',input,'--output',input]),/unsupported fields/);
});
test('a shared capture is decoded once for distinct slots with separately bound review status',async context=>{
 const directory=await fixture(context),input=review(batch()),before=structuredClone(input);let decoded=0;
 const result=await verifySourceTimingBatch(input,{baseDirectory:directory,probe:()=>{decoded++;return metadata();}});
 assert.equal(decoded,1);assert.deepEqual(input,before);assert.equal(result.status,'capture-verified-batch-candidate');
 assert.deepEqual(result.summary,{captureVerifiedEntries:2,reviewAttestedCandidates:1});
 assert.equal(result.entries[0].reviewStatus,'attested-candidate');assert.equal(result.entries[1].reviewStatus,'pending-review');
 assert.equal(result.entries[0].annotationSHA256,input.entries[0].review.annotationSHA256);
 assert.equal(result.certifiedOneToOne,false);assert.match(result.limits,/self-reported.*not authenticated.*No workbook/);
 assert.deepEqual(result.capture.frameRate,{numerator:30000,denominator:1001});
});
test('batch scope is one exact subject and recording with unique bounded move slots',()=>{
 for(const change of [b=>b.entries=[],b=>b.entries=Array(21).fill(b.entries[0]),b=>b.entries[1].moveKey=b.entries[0].moveKey,
  b=>b.type='certified-batch',b=>b.source='sh2',b=>b.edition='remake',b=>b.certifiedOneToOne=true,
  b=>b.entries[1].source='sh2',b=>b.entries[1].capture={...b.capture},b=>b.entries[1].moveKey='constructor']){
  const input=batch();change(input);assert.throws(()=>validateSourceTimingBatch(input),/Source timing/);
 }
});
test('review attestations are invalidated by changed action, frames, observer or provenance',()=>{
 for(const change of [b=>b.entries[0].measurement.impactFrame=0,b=>b.entries[0].observedAction+=' changed',
  b=>b.capture.sourceUrl='https://example.invalid/other-recording',b=>b.capture.sha256='1'.repeat(64),
  b=>b.entries[0].measurement.measuredBy='Another measurer',b=>b.entries[0].review.annotationSHA256='f'.repeat(64)]){
  const input=review(batch());change(input);assert.throws(()=>validateSourceTimingBatch(input),/review annotation SHA256 mismatch/);
 }
});
test('review remains a dated named candidate attestation and cannot self-certify',()=>{
 for(const change of [b=>b.entries[0].review.reviewedBy=' QA fixture ',b=>b.entries[0].review.reviewedBy='',
  b=>b.entries[0].review.reviewedAt='2026-10-22',b=>b.entries[0].review.reviewedAt='2026-02-30',
  b=>b.entries[0].review.notes='',b=>b.entries[0].review.status='certified',b=>b.entries[0].review.certifiedOneToOne=true]){
  const input=review(batch());change(input);assert.throws(()=>validateSourceTimingBatch(input),/Source timing/);
 }
});
test('one invalid batch annotation refuses the complete result before any capture decode',async context=>{
 const directory=await fixture(context),input=batch();input.entries[1].measurement.endFrame=3;let decoded=0;
 await assert.rejects(verifySourceTimingBatch(input,{baseDirectory:directory,probe:()=>{decoded++;return metadata();}}),/within the file/);
 assert.equal(decoded,0);
});
test('batch verification still checks actual capture bytes and refuses variable spacing',async context=>{
 const directory=await fixture(context),input=batch();input.capture.sha256='0'.repeat(64);
 await assert.rejects(verifySourceTimingBatch(input,{baseDirectory:directory,probe:()=>metadata()}),/SHA256 mismatch/);
 const m=metadata();m.frames[1].best_effort_timestamp_time='0.05';
 await assert.rejects(verifySourceTimingBatch(batch(),{baseDirectory:directory,probe:()=>m}),/constant capture frame spacing/);
});
test('annotation-only CLI writes a bound digest without pretending to verify capture or overwrite output',async context=>{
 const directory=await fixture(context),input=join(directory,'packet.json'),output=join(directory,'annotation.json');
 await writeFile(input,JSON.stringify(packet()));await sourceTimingCommand(['annotation-digest',input,'--output',output]);
 const result=JSON.parse(await readFile(output,'utf8'));
 assert.equal(result.annotationSHA256,sourceTimingAnnotationDigest(packet()));assert.equal(result.captureVerified,false);
 assert.equal(result.certifiedOneToOne,false);assert.equal(result.status,'annotation-only');
 await assert.rejects(sourceTimingCommand(['annotation-digest',input,'--output',output]),/EEXIST/);
 assert.equal(JSON.parse(await readFile(input,'utf8')).fighterId,packet().fighterId);
});
test('batch CLI rejects extra certification fields before producing an output',async context=>{
 const directory=await fixture(context),input=join(directory,'batch.json'),output=join(directory,'verified.json');
 await writeFile(input,JSON.stringify({...batch(),certifiedOneToOne:true}));
 await assert.rejects(sourceTimingCommand(['validate-batch',input,'--output',output]),/unsupported fields/);
 await assert.rejects(readFile(output),/ENOENT/);
});
