import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {FIGHTER_REFERENCES} from '../src/production-reference.js';
import {validateSourceTiming,verifySourceTiming,sourceTimingCommand} from '../scripts/source-timing.mjs';

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
