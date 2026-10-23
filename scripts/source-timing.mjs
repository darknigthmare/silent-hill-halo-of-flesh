/** Verify a source-capture timing packet. Never certifies a gesture or fills the workbook. */
import {readFile,lstat,realpath,writeFile,open,mkdtemp,chmod,rm} from 'node:fs/promises';
import {constants} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {dirname,isAbsolute,relative,resolve,join} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {ROSTER,createCombatProfile} from '../src/data.js';
import {FIGHTER_REFERENCES} from '../src/production-reference.js';

export const SOURCE_TIMING_SCHEMA=1;
export const SOURCE_TIMING_BATCH_SCHEMA=1;
const MAX_CAPTURE_BYTES=256*1024*1024,MAX_CAPTURE_FRAMES=18000;
const fail=message=>{throw new Error('Source timing: '+message);};
const own=(object,key)=>Object.prototype.hasOwnProperty.call(object,key);
const plain=value=>value&&typeof value==='object'&&!Array.isArray(value)&&[Object.prototype,null].includes(Object.getPrototypeOf(value));
function keys(object,allowed,label){
  if(!plain(object)||Object.keys(object).some(key=>!allowed.includes(key)))fail(label+' has unsupported fields');
}
const nonempty=value=>typeof value==='string'&&value.trim().length>0;
function date(value){
  if(!nonempty(value)||!/^\d{4}-\d{2}-\d{2}$/.test(value)||Number.isNaN(Date.parse(value+'T00:00:00Z'))||new Date(value+'T00:00:00Z').toISOString().slice(0,10)!==value)fail('measurement date must be a calendar date');
  return value;
}
const gcd=(a,b)=>b?gcd(b,a%b):a;
function frameRate(rate){
  keys(rate,['numerator','denominator'],'frame rate');
  const {numerator:n,denominator:d}=rate;
  if(![n,d].every(value=>Number.isSafeInteger(value)&&value>0&&value<=1000000)||n/d<1||n/d>240)fail('frame rate must be a positive rational from 1 to 240 FPS');
  const divisor=gcd(n,d);return {numerator:n/divisor,denominator:d/divisor};
}
function sourceUrl(value){
  let url;try{url=new URL(value);}catch{fail('capture source URL is required');}
  if(url.protocol!=='https:'||url.username||url.password||!url.hostname)fail('capture source URL must be HTTPS without credentials');
  return url.href;
}

export function validateSourceTiming(packet,{roster=ROSTER,references=FIGHTER_REFERENCES}={}){
  keys(packet,['schema','fighterId','source','edition','moveKey','observedAction','capture','measurement'],'packet');
  if(packet.schema!==SOURCE_TIMING_SCHEMA)fail('unsupported schema');
  const fighter=roster.find(f=>f.id===packet.fighterId),ref=own(references,packet.fighterId)?references[packet.fighterId]:null;
  if(!fighter||!ref||ref.id!==fighter.id||packet.source!==fighter.source||ref.source!==fighter.source)fail('exact fighter identity/source required');
  if(!nonempty(ref.referenceEdition)||packet.edition!==ref.referenceEdition)fail('exact researched edition required');
  if(!createCombatProfile(fighter).moveset.order.includes(packet.moveKey))fail('unknown move slot');
  if(!nonempty(packet.observedAction))fail('observed action is required');
  keys(packet.capture,['path','sha256','sourceUrl','frameRate','totalFrames'],'capture');
  const capture=packet.capture;
  if(!nonempty(capture.path)||isAbsolute(capture.path)||capture.path.includes('\\')||capture.path.split('/').some(part=>!part||part==='.'||part==='..'))fail('capture path must remain relative to the packet');
  if(!/^[a-f0-9]{64}$/.test(capture.sha256))fail('capture SHA256 required');
  const fps=frameRate(capture.frameRate);
  if(!Number.isSafeInteger(capture.totalFrames)||capture.totalFrames<1||capture.totalFrames>MAX_CAPTURE_FRAMES)fail('capture frame count outside 1..18000');
  keys(packet.measurement,['unit','startFrame','impactFrame','endFrame','measuredBy','measuredAt','notes'],'measurement');
  const m=packet.measurement,frames=[m.startFrame,m.impactFrame,m.endFrame];
  if(m.unit!=='capture-frames'||!frames.every(Number.isSafeInteger)||m.startFrame<0||m.startFrame>m.impactFrame||m.impactFrame>m.endFrame||m.endFrame>=capture.totalFrames)fail('start/impact/end must be ordered capture frames within the file');
  if(!nonempty(m.measuredBy)||!nonempty(m.notes))fail('measurer and observation notes required');
  return {schema:SOURCE_TIMING_SCHEMA,fighterId:fighter.id,source:fighter.source,edition:packet.edition,moveKey:packet.moveKey,
    observedAction:packet.observedAction.trim(),capture:{path:capture.path,sha256:capture.sha256,sourceUrl:sourceUrl(capture.sourceUrl),frameRate:fps,totalFrames:capture.totalFrames},
    measurement:{unit:m.unit,startFrame:m.startFrame,impactFrame:m.impactFrame,endFrame:m.endFrame,measuredBy:m.measuredBy.trim(),measuredAt:date(m.measuredAt),notes:m.notes.trim()}};
}

export function probeSourceCapture(path){
  const result=spawnSync('ffprobe',['-v','error','-select_streams','v:0','-count_frames','-show_frames','-show_entries',
    'stream=codec_type,width,height,r_frame_rate,avg_frame_rate,nb_read_frames:frame=best_effort_timestamp_time','-of','json',path],
    {encoding:'utf8',timeout:60000,maxBuffer:8*1024*1024,windowsHide:true});
  if(result.error||result.status!==0)fail('ffprobe could not verify the capture (ffprobe is required)');
  try{return JSON.parse(result.stdout);}catch{fail('ffprobe returned invalid metadata');}
}
function sameRate(text,expected){
  if(typeof text!=='string'||!/^\d+\/\d+$/.test(text))return false;
  const [n,d]=text.split('/').map(Number);
  return n>0&&d>0&&n*expected.denominator===d*expected.numerator;
}
async function verifyCapture(capture,{baseDirectory,probe}){
  const base=await realpath(baseDirectory),path=resolve(base,capture.path);
  if(relative(base,path).startsWith('..')||isAbsolute(relative(base,path)))fail('capture outside packet directory');
  const info=await lstat(path);
  if(!info.isFile()||info.isSymbolicLink()||await realpath(path)!==path||info.size<12||info.size>MAX_CAPTURE_BYTES)fail('capture must be a regular, bounded video file');
  // Hash and decode one private, read-only snapshot. Reopening the source path
  // after hashing could otherwise decode a different concurrently replaced file.
  const source=await open(path,constants.O_RDONLY|(constants.O_NOFOLLOW||0));let directory;
  try{
    const opened=await source.stat();
    if(!opened.isFile()||opened.size<12||opened.size>MAX_CAPTURE_BYTES)fail('capture must be a regular, bounded video file');
    directory=await mkdtemp(join(tmpdir(),'halo-source-timing-'));
    const snapshot=join(directory,'capture'),output=await open(snapshot,'wx',0o600),hash=createHash('sha256');
    const chunk=Buffer.alloc(64*1024),header=Buffer.alloc(12);let size=0,headerLength=0;
    try{
      while(true){
        const {bytesRead}=await source.read(chunk,0,chunk.length,null);if(!bytesRead)break;
        size+=bytesRead;if(size>MAX_CAPTURE_BYTES)fail('capture exceeds bounded video file size');
        const bytes=chunk.subarray(0,bytesRead);hash.update(bytes);
        if(headerLength<header.length)headerLength+=bytes.copy(header,headerLength,0,Math.min(bytesRead,header.length-headerLength));
        await output.writeFile(bytes);
      }
    }finally{await output.close();}
    if(size<12)fail('capture must be a regular, bounded video file');
    if(hash.digest('hex')!==capture.sha256)fail('capture SHA256 mismatch');
    const mp4=header.subarray(4,8).toString('ascii')==='ftyp',matroska=header.subarray(0,4).equals(Buffer.from([0x1a,0x45,0xdf,0xa3]));
    if(!mp4&&!matroska)fail('capture must be MP4/MOV or Matroska/WebM');
    await chmod(snapshot,0o400);
    const metadata=await probe(snapshot),streams=metadata?.streams,frames=metadata?.frames;
    if(!Array.isArray(streams)||streams.length!==1||!Array.isArray(frames))fail('one decoded video stream and frame timestamps required');
    const stream=streams[0];
    if(stream.codec_type!=='video'||![stream.width,stream.height].every(n=>Number.isSafeInteger(n)&&n>0&&n<=4096)||
      Number(stream.nb_read_frames)!==capture.totalFrames||frames.length!==capture.totalFrames||
      !sameRate(stream.r_frame_rate,capture.frameRate)||!sameRate(stream.avg_frame_rate,capture.frameRate))fail('capture dimensions, FPS or frame count mismatch');
    const step=capture.frameRate.denominator/capture.frameRate.numerator,tolerance=Math.max(0.000002,step*.005);
    const timestamps=frames.map(frame=>typeof frame.best_effort_timestamp_time==='string'&&/^-?\d+(?:\.\d+)?$/.test(frame.best_effort_timestamp_time)?Number(frame.best_effort_timestamp_time):NaN);
    if(timestamps.some((time,index)=>!Number.isFinite(time)||index>0&&Math.abs(time-timestamps[index-1]-step)>tolerance))fail('constant capture frame spacing required; variable or missing timestamps refused');
    return {...capture,bytes:size,width:stream.width,height:stream.height};
  }finally{
    try{await source.close();}finally{if(directory)await rm(directory,{recursive:true,force:true});}
  }
}
export async function verifySourceTiming(packet,{baseDirectory=process.cwd(),probe=probeSourceCapture,...catalogue}={}){
  const normalized=validateSourceTiming(packet,catalogue),capture=await verifyCapture(normalized.capture,{baseDirectory,probe});
  return {...normalized,status:'capture-verified-candidate',capture,
    timingUnit:'recording frames, not inferred original-engine frames',certifiedOneToOne:false,
    limits:'Identity and capture metadata checked; the observer still must review the visible action and original edition. This packet does not fill or certify workbook timings.'};
}

/** A digest binds review to these exact annotations, not to the observer's identity. */
export function sourceTimingAnnotationDigest(packet,catalogue={}){
  return createHash('sha256').update(JSON.stringify(validateSourceTiming(packet,catalogue))).digest('hex');
}
export function validateSourceTimingBatch(batch,catalogue={}){
  keys(batch,['schema','type','fighterId','source','edition','capture','entries'],'batch');
  if(batch.schema!==SOURCE_TIMING_BATCH_SCHEMA||batch.type!=='source-timing-batch')fail('unsupported batch schema/type');
  if(!Array.isArray(batch.entries)||batch.entries.length<1||batch.entries.length>20)fail('batch requires 1..20 move entries');
  const seen=new Set(),entries=[];let subject,capture;
  for(const entry of batch.entries){
    keys(entry,['moveKey','observedAction','measurement','review'],'batch entry');
    const packet=validateSourceTiming({schema:SOURCE_TIMING_SCHEMA,fighterId:batch.fighterId,source:batch.source,edition:batch.edition,
      capture:batch.capture,moveKey:entry.moveKey,observedAction:entry.observedAction,measurement:entry.measurement},catalogue);
    if(seen.has(packet.moveKey))fail('batch move slots must be unique');seen.add(packet.moveKey);
    subject={fighterId:packet.fighterId,source:packet.source,edition:packet.edition};capture=packet.capture;
    const normalized={moveKey:packet.moveKey,observedAction:packet.observedAction,measurement:packet.measurement};
    if(entry.review!==undefined){
      keys(entry.review,['status','reviewedBy','reviewedAt','notes','annotationSHA256'],'review');
      const r=entry.review;
      if(r.status!=='attested-candidate'||!nonempty(r.reviewedBy)||!nonempty(r.notes))fail('review requires named reviewer, notes and candidate status');
      if(r.reviewedBy.trim().toLowerCase()===packet.measurement.measuredBy.toLowerCase())fail('review must name a separate observer');
      const reviewedAt=date(r.reviewedAt);
      if(reviewedAt<packet.measurement.measuredAt)fail('review date precedes measurement');
      if(!/^[a-f0-9]{64}$/.test(r.annotationSHA256)||r.annotationSHA256!==sourceTimingAnnotationDigest(packet,catalogue))fail('review annotation SHA256 mismatch');
      normalized.review={status:r.status,reviewedBy:r.reviewedBy.trim(),reviewedAt,notes:r.notes.trim(),annotationSHA256:r.annotationSHA256};
    }
    entries.push(normalized);
  }
  return {schema:SOURCE_TIMING_BATCH_SCHEMA,type:'source-timing-batch',...subject,capture,entries};
}
export async function verifySourceTimingBatch(batch,{baseDirectory=process.cwd(),probe=probeSourceCapture,...catalogue}={}){
  const normalized=validateSourceTimingBatch(batch,catalogue),capture=await verifyCapture(normalized.capture,{baseDirectory,probe});
  const entries=normalized.entries.map(entry=>({...entry,
    annotationSHA256:sourceTimingAnnotationDigest({schema:SOURCE_TIMING_SCHEMA,fighterId:normalized.fighterId,source:normalized.source,
      edition:normalized.edition,capture:normalized.capture,moveKey:entry.moveKey,observedAction:entry.observedAction,measurement:entry.measurement},catalogue),
    reviewStatus:entry.review?'attested-candidate':'pending-review'}));
  return {...normalized,status:'capture-verified-batch-candidate',capture,entries,
    summary:{captureVerifiedEntries:entries.length,reviewAttestedCandidates:entries.filter(entry=>entry.review).length},
    timingUnit:'recording frames, not inferred original-engine frames',certifiedOneToOne:false,
    limits:'One capture checked for all entries. Named reviews are self-reported attestations bound to annotation digests, not authenticated identities or gesture certification. No workbook timing is filled or certified.'};
}

export async function sourceTimingCommand(args){
  if(args.length===1&&args[0]==='--help'){
    console.log('Usage: node scripts/source-timing.mjs validate PACKET.json [--output VERIFIED.json]\n       node scripts/source-timing.mjs validate-batch BATCH.json [--output VERIFIED.json]\n       node scripts/source-timing.mjs annotation-digest PACKET.json [--output DIGEST.json]\nvalidate commands require ffprobe; annotation-digest checks annotations only. Named batch reviews remain candidate attestations, never 1:1 certification or workbook edits.');
    return;
  }
  if(!['validate','validate-batch','annotation-digest'].includes(args[0])||!args[1]||args.length!==2&&(args.length!==4||args[2]!=='--output'||!args[3]))fail('usage: validate|validate-batch|annotation-digest PACKET.json [--output RESULT.json]');
  const input=resolve(args[1]),info=await lstat(input);
  const maxBytes=(args[0]==='validate-batch'?256:64)*1024;
  if(!info.isFile()||info.isSymbolicLink()||info.size>maxBytes)fail('packet must be a regular bounded JSON file');
  const packet=JSON.parse(await readFile(input,'utf8'));
  const verified=args[0]==='validate'?await verifySourceTiming(packet,{baseDirectory:dirname(input)}):args[0]==='validate-batch'?
    await verifySourceTimingBatch(packet,{baseDirectory:dirname(input)}):
    {annotationSHA256:sourceTimingAnnotationDigest(packet),status:'annotation-only',captureVerified:false,certifiedOneToOne:false};
  const payload=JSON.stringify(verified,null,2)+'\n';
  if(args[3])await writeFile(resolve(args[3]),payload,{flag:'wx'});
  else process.stdout.write(payload);
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{await sourceTimingCommand(process.argv.slice(2));}catch(error){console.error(String(error.message));process.exitCode=1;}
}
