import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,lstat,rm,symlink,cp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {FIGHTER_REFERENCES} from '../src/production-reference.js';
import {validateSourceTiming,verifySourceTiming,sourceTimingAnnotationDigest,validateSourceTimingBatch,verifySourceTimingBatch,exportSourceTimingReview,verifySourceTimingReview,sourceTimingCommand} from '../scripts/source-timing.mjs';

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
const previewPNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64');
async function fixtureFrames(snapshot,indices,directory){
 for(const [position] of indices.entries())await writeFile(join(directory,`frame-${String(position).padStart(5,'0')}.png`),previewPNG);
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
test('review previews bind shared start/impact/end stills to exact annotations and the hashed snapshot',async context=>{
 const directory=await fixture(context),input=review(batch()),before=structuredClone(input),outputDirectory=join(directory,'review');let calls=0,snapshot;
 const result=await exportSourceTimingReview(input,{baseDirectory:directory,outputDirectory,probe:()=>metadata(),extract:async(path,indices,output)=>{
  snapshot=path;calls++;assert.deepEqual(indices,[0,1,2]);
  await writeFile(join(directory,'capture.mp4'),'changed original after validation');
  assert.deepEqual(await readFile(path),bytes);await fixtureFrames(path,indices,output);
 }});
 assert.deepEqual(input,before);assert.equal(calls,1);assert.equal(result.status,'source-timing-review-candidate');
 assert.equal(result.certifiedOneToOne,false);assert.equal(result.frames.length,3);assert.equal(result.capture.sha256,sha256);
 assert.deepEqual(result.frames[1].recordingTime,{numerator:1001,denominator:30000});
 assert.equal(result.frames[0].sha256,createHash('sha256').update(previewPNG).digest('hex'));
 assert.equal(result.entries[0].reviewStatus,'attested-candidate');assert.equal(result.entries[1].reviewStatus,'pending-review');
 assert.equal(result.entries[0].annotationSHA256,input.entries[0].review.annotationSHA256);
 assert.deepEqual(JSON.parse(await readFile(join(outputDirectory,'review-manifest.json'),'utf8')),result);
 const page=await readFile(join(outputDirectory,'index.html'),'utf8');
 for(const text of ['image 0','image 1','image 2','640 pixels','aucun timing Excel rempli','frames/frame-00001.png',input.edition])assert.ok(page.includes(text),text);
 await assert.rejects(lstat(snapshot),error=>error.code==='ENOENT');
});
test('review HTML treats observer annotations and declared source provenance as text',async context=>{
 const directory=await fixture(context),input=batch(),outputDirectory=join(directory,'review');
 input.entries[0].observedAction='<script>alert("annotation")</script>';
 input.entries[0].measurement.notes='<img src=x onerror=alert(1)>';
 input.capture.sourceUrl='https://example.invalid/capture?a=1&b=2';
 const result=await exportSourceTimingReview(input,{baseDirectory:directory,outputDirectory,probe:()=>metadata(),extract:fixtureFrames});
 const page=await readFile(join(outputDirectory,'index.html'),'utf8');
 assert.ok(page.includes('&lt;script&gt;alert(&quot;annotation&quot;)&lt;/script&gt;'));
 assert.ok(page.includes('&lt;img src=x onerror=alert(1)&gt;'));assert.equal(page.includes('<script>'),false);
 assert.ok(page.includes('capture?a=1&amp;b=2'));
 assert.equal(result.entries[0].observedAction,input.entries[0].observedAction);
});
test('a review output directory is exclusive and invalid capture or review cannot create it',async context=>{
 const directory=await fixture(context),outputDirectory=join(directory,'review');
 await exportSourceTimingReview(batch(),{baseDirectory:directory,outputDirectory,probe:()=>metadata(),extract:fixtureFrames});
 const before=await readFile(join(outputDirectory,'index.html'));
 await assert.rejects(exportSourceTimingReview(batch(),{baseDirectory:directory,outputDirectory,probe:()=>metadata(),extract:()=>{throw Error('must not extract');}}),/EEXIST/);
 assert.deepEqual(await readFile(join(outputDirectory,'index.html')),before);
 for(const change of [b=>b.entries[0].measurement.endFrame=99,b=>b.capture.sha256='0'.repeat(64),b=>b.entries[0].review.annotationSHA256='f'.repeat(64)]){
  const invalid=review(batch());change(invalid);const absent=join(directory,'must-not-exist');
  await assert.rejects(exportSourceTimingReview(invalid,{baseDirectory:directory,outputDirectory:absent,probe:()=>metadata(),extract:()=>{throw Error('must not extract invalid batch');}}),/Source timing/);
  await assert.rejects(lstat(absent),error=>error.code==='ENOENT');
 }
});
test('failed, missing or malformed extracted stills leave no partial review or snapshot',async context=>{
 const directory=await fixture(context);
 for(const extract of [async()=>{throw Error('fixture extraction failure');},async()=>{},
  async(path,indices,output)=>{await fixtureFrames(path,indices,output);await writeFile(join(output,'frame-00000.png'),'not png');},
  async(path,indices,output)=>{await fixtureFrames(path,indices,output);const png=Buffer.from(previewPNG);png.writeUInt32BE(641,16);await writeFile(join(output,'frame-00000.png'),png);}]){
  const outputDirectory=join(directory,'partial');let snapshot;
  await assert.rejects(exportSourceTimingReview(batch(),{baseDirectory:directory,outputDirectory,probe:()=>metadata(),extract:async(...args)=>{snapshot=args[0];await extract(...args);}}),/fixture extraction failure|Source timing/);
  await assert.rejects(lstat(outputDirectory),error=>error.code==='ENOENT');
  await assert.rejects(lstat(dirname(snapshot)),error=>error.code==='ENOENT');
 }
});
test('review CLI requires a new directory and rejects malformed input before any outputs',async context=>{
 for(const args of [['review-preview','batch.json'],['review-preview','batch.json','--output','out'],['review-preview','batch.json','--output-dir']])await assert.rejects(sourceTimingCommand(args),/usage:/);
 const directory=await fixture(context),input=join(directory,'batch.json'),outputDirectory=join(directory,'review');
 await writeFile(input,JSON.stringify({...batch(),certifiedOneToOne:true}));
 await assert.rejects(sourceTimingCommand(['review-preview',input,'--output-dir',outputDirectory]),/unsupported fields/);
 await assert.rejects(lstat(outputDirectory),error=>error.code==='ENOENT');
});
test('a relocated review is checked against freshly extracted source frames without modifying the package',async context=>{
 const directory=await fixture(context),input=review(batch()),original=join(directory,'original'),reviewDirectory=join(directory,'relocated');
 await exportSourceTimingReview(input,{baseDirectory:directory,outputDirectory:original,probe:()=>metadata(),extract:fixtureFrames});await cp(original,reviewDirectory,{recursive:true});
 const before=await readFile(join(reviewDirectory,'review-manifest.json'));let snapshot;
 const result=await verifySourceTimingReview(input,{baseDirectory:directory,reviewDirectory,probe:()=>metadata(),extract:async(path,indices,output)=>{
  snapshot=path;await writeFile(join(directory,'capture.mp4'),'input replaced after hashing');
  assert.deepEqual(await readFile(path),bytes);await fixtureFrames(path,indices,output);
 }});
 assert.equal(result.status,'source-timing-review-integrity-checked');assert.equal(result.framesChecked,3);assert.equal(result.entriesChecked,2);
 assert.equal(result.captureSHA256,sha256);assert.equal(result.certifiedOneToOne,false);assert.match(result.limits,/current ffmpeg.*No observer identity.*new review attestation/);
 assert.deepEqual(await readFile(join(reviewDirectory,'review-manifest.json')),before);
 await assert.rejects(lstat(dirname(snapshot)),error=>error.code==='ENOENT');
});
test('review integrity rejects edited annotations, provenance, candidate status, HTML and PNG files',async context=>{
 const directory=await fixture(context),original=join(directory,'original'),input=batch();
 await exportSourceTimingReview(input,{baseDirectory:directory,outputDirectory:original,probe:()=>metadata(),extract:fixtureFrames});
 const mutations=[
  async path=>{const file=join(path,'review-manifest.json'),m=JSON.parse(await readFile(file));m.entries[0].measurement.impactFrame=0;await writeFile(file,JSON.stringify(m));},
  async path=>{const file=join(path,'review-manifest.json'),m=JSON.parse(await readFile(file));m.capture.sourceUrl='https://example.invalid/other-edition';await writeFile(file,JSON.stringify(m));},
  async path=>{const file=join(path,'review-manifest.json'),m=JSON.parse(await readFile(file));m.certifiedOneToOne=true;await writeFile(file,JSON.stringify(m));},
  async path=>{const file=join(path,'review-manifest.json'),m=JSON.parse(await readFile(file));m.frames[0].index=2;await writeFile(file,JSON.stringify(m));},
  async path=>{await writeFile(join(path,'index.html'),'<img src="https://example.invalid/remote.png">');},
  async path=>{await writeFile(join(path,'frames/frame-00000.png'),Buffer.concat([previewPNG,Buffer.from('changed fixture')]));},
  async path=>{await rm(join(path,'frames/frame-00001.png'));},
  async path=>{await writeFile(join(path,'frames/unexpected.png'),previewPNG);}
 ];
 for(const [index,mutate] of mutations.entries()){
  const reviewDirectory=join(directory,'tampered-'+index);await cp(original,reviewDirectory,{recursive:true});await mutate(reviewDirectory);let snapshot;
  await assert.rejects(verifySourceTimingReview(input,{baseDirectory:directory,reviewDirectory,probe:()=>metadata(),extract:async(...args)=>{snapshot=args[0];await fixtureFrames(...args);}}),/Source timing/);
  await assert.rejects(lstat(dirname(snapshot)),error=>error.code==='ENOENT');
 }
});
test('recomputed manifest hashes cannot disguise a replaced PNG as a true source frame',async context=>{
 const directory=await fixture(context),input=batch(),reviewDirectory=join(directory,'review');
 await exportSourceTimingReview(input,{baseDirectory:directory,outputDirectory:reviewDirectory,probe:()=>metadata(),extract:fixtureFrames});
 const file=join(reviewDirectory,'review-manifest.json'),manifest=JSON.parse(await readFile(file));
 const changed=Buffer.concat([previewPNG,Buffer.from('replacement frame fixture')]);await writeFile(join(reviewDirectory,manifest.frames[0].path),changed);
 manifest.frames[0].bytes=changed.length;manifest.frames[0].sha256=createHash('sha256').update(changed).digest('hex');await writeFile(file,JSON.stringify(manifest));
 await assert.rejects(verifySourceTimingReview(input,{baseDirectory:directory,reviewDirectory,probe:()=>metadata(),extract:fixtureFrames}),/manifest differs.*freshly extracted/);
});
test('integrity checking refuses a different source packet and symlinked review files',async context=>{
 const directory=await fixture(context),input=batch(),reviewDirectory=join(directory,'review');
 await exportSourceTimingReview(input,{baseDirectory:directory,outputDirectory:reviewDirectory,probe:()=>metadata(),extract:fixtureFrames});
 const other=batch();other.entries[0].observedAction+=' unrelated action';
 await assert.rejects(verifySourceTimingReview(other,{baseDirectory:directory,reviewDirectory,probe:()=>metadata(),extract:fixtureFrames}),/manifest differs/);
 const page=join(reviewDirectory,'index.html'),original=join(directory,'outside.html');await writeFile(original,await readFile(page));await rm(page);await symlink(original,page);
 await assert.rejects(verifySourceTimingReview(input,{baseDirectory:directory,reviewDirectory,probe:()=>metadata(),extract:fixtureFrames}),/regular bounded file/);
 const linked=join(directory,'linked-review');await symlink(reviewDirectory,linked);
 await assert.rejects(verifySourceTimingReview(input,{baseDirectory:directory,reviewDirectory:linked,probe:()=>metadata(),extract:fixtureFrames}),/regular directory/);
});
test('review integrity CLI requires exact flags and rejects an invalid packet without writing output',async context=>{
 for(const args of [['verify-review','batch.json'],['verify-review','batch.json','--output','out'],['verify-review','batch.json','--review-dir']])await assert.rejects(sourceTimingCommand(args),/usage:/);
 const directory=await fixture(context),input=join(directory,'batch.json');await writeFile(input,JSON.stringify({...batch(),certifiedOneToOne:true}));
 await assert.rejects(sourceTimingCommand(['verify-review',input,'--review-dir',join(directory,'none')]),/unsupported fields/);
});
