/** Verify a source-capture timing packet. Never certifies a gesture or fills the workbook. */
import {readFile,lstat,realpath,writeFile,open,mkdtemp,chmod,rm,mkdir,readdir} from 'node:fs/promises';
import {constants} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {dirname,isAbsolute,relative,resolve,join} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {isDeepStrictEqual} from 'node:util';
import {ROSTER,createCombatProfile} from '../src/data.js';
import {FIGHTER_REFERENCES} from '../src/production-reference.js';

export const SOURCE_TIMING_SCHEMA=1;
export const SOURCE_TIMING_BATCH_SCHEMA=1;
export const SOURCE_TIMING_REVIEW_SCHEMA=1;
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
function selectedVideoStream(capture){
  const ordinal=own(capture,'videoStreamOrdinal')?capture.videoStreamOrdinal:0;
  if(!Number.isSafeInteger(ordinal)||ordinal<0||ordinal>15)fail('video stream ordinal must be an integer from 0 to 15');
  return ordinal;
}

export function validateSourceTiming(packet,{roster=ROSTER,references=FIGHTER_REFERENCES}={}){
  keys(packet,['schema','fighterId','source','edition','moveKey','observedAction','capture','measurement'],'packet');
  if(packet.schema!==SOURCE_TIMING_SCHEMA)fail('unsupported schema');
  const fighter=roster.find(f=>f.id===packet.fighterId),ref=own(references,packet.fighterId)?references[packet.fighterId]:null;
  if(!fighter||!ref||ref.id!==fighter.id||packet.source!==fighter.source||ref.source!==fighter.source)fail('exact fighter identity/source required');
  if(!nonempty(ref.referenceEdition)||packet.edition!==ref.referenceEdition)fail('exact researched edition required');
  if(!createCombatProfile(fighter).moveset.order.includes(packet.moveKey))fail('unknown move slot');
  if(!nonempty(packet.observedAction))fail('observed action is required');
  keys(packet.capture,['path','sha256','sourceUrl','frameRate','totalFrames','videoStreamOrdinal'],'capture');
  const capture=packet.capture;
  const videoStreamOrdinal=selectedVideoStream(capture);
  if(!nonempty(capture.path)||isAbsolute(capture.path)||capture.path.includes('\\')||capture.path.split('/').some(part=>!part||part==='.'||part==='..'))fail('capture path must remain relative to the packet');
  if(!/^[a-f0-9]{64}$/.test(capture.sha256))fail('capture SHA256 required');
  const fps=frameRate(capture.frameRate);
  if(!Number.isSafeInteger(capture.totalFrames)||capture.totalFrames<1||capture.totalFrames>MAX_CAPTURE_FRAMES)fail('capture frame count outside 1..18000');
  keys(packet.measurement,['unit','startFrame','impactFrame','endFrame','measuredBy','measuredAt','notes'],'measurement');
  const m=packet.measurement,frames=[m.startFrame,m.impactFrame,m.endFrame];
  if(m.unit!=='capture-frames'||!frames.every(Number.isSafeInteger)||m.startFrame<0||m.startFrame>m.impactFrame||m.impactFrame>m.endFrame||m.endFrame>=capture.totalFrames)fail('start/impact/end must be ordered capture frames within the file');
  if(!nonempty(m.measuredBy)||!nonempty(m.notes))fail('measurer and observation notes required');
  return {schema:SOURCE_TIMING_SCHEMA,fighterId:fighter.id,source:fighter.source,edition:packet.edition,moveKey:packet.moveKey,
    observedAction:packet.observedAction.trim(),capture:{path:capture.path,sha256:capture.sha256,sourceUrl:sourceUrl(capture.sourceUrl),frameRate:fps,totalFrames:capture.totalFrames,
      ...(own(capture,'videoStreamOrdinal')?{videoStreamOrdinal}:{})},
    measurement:{unit:m.unit,startFrame:m.startFrame,impactFrame:m.impactFrame,endFrame:m.endFrame,measuredBy:m.measuredBy.trim(),measuredAt:date(m.measuredAt),notes:m.notes.trim()}};
}

export function probeSourceCapture(path,options={}){
  const ordinal=selectedVideoStream(options);
  const result=spawnSync('ffprobe',['-v','error','-select_streams',`v:${ordinal}`,'-count_frames','-show_frames','-show_entries',
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
async function verifyCapture(capture,{baseDirectory,probe,consume}){
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
    const metadata=await probe(snapshot,{videoStreamOrdinal:selectedVideoStream(capture)}),streams=metadata?.streams,frames=metadata?.frames;
    if(!Array.isArray(streams)||streams.length!==1||!Array.isArray(frames))fail('one decoded video stream and frame timestamps required');
    const stream=streams[0];
    if(stream.codec_type!=='video'||![stream.width,stream.height].every(n=>Number.isSafeInteger(n)&&n>0&&n<=4096)||
      Number(stream.nb_read_frames)!==capture.totalFrames||frames.length!==capture.totalFrames||
      !sameRate(stream.r_frame_rate,capture.frameRate)||!sameRate(stream.avg_frame_rate,capture.frameRate))fail('capture dimensions, FPS or frame count mismatch');
    const step=capture.frameRate.denominator/capture.frameRate.numerator,tolerance=Math.max(0.000002,step*.005);
    const timestamps=frames.map(frame=>typeof frame.best_effort_timestamp_time==='string'&&/^-?\d+(?:\.\d+)?$/.test(frame.best_effort_timestamp_time)?Number(frame.best_effort_timestamp_time):NaN);
    if(timestamps.some((time,index)=>!Number.isFinite(time)||index>0&&Math.abs(time-timestamps[index-1]-step)>tolerance))fail('constant capture frame spacing required; variable or missing timestamps refused');
    const verified={...capture,bytes:size,width:stream.width,height:stream.height};
    return consume?await consume(verified,snapshot):verified;
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
  return verifiedTimingBatch(normalized,capture,catalogue);
}
function verifiedTimingBatch(normalized,capture,catalogue){
  const entries=normalized.entries.map(entry=>({...entry,
    annotationSHA256:sourceTimingAnnotationDigest({schema:SOURCE_TIMING_SCHEMA,fighterId:normalized.fighterId,source:normalized.source,
      edition:normalized.edition,capture:normalized.capture,moveKey:entry.moveKey,observedAction:entry.observedAction,measurement:entry.measurement},catalogue),
    reviewStatus:entry.review?'attested-candidate':'pending-review'}));
  return {...normalized,status:'capture-verified-batch-candidate',capture,entries,
    summary:{captureVerifiedEntries:entries.length,reviewAttestedCandidates:entries.filter(entry=>entry.review).length},
    timingUnit:'recording frames, not inferred original-engine frames',certifiedOneToOne:false,
    limits:'One capture checked for all entries. Named reviews are self-reported attestations bound to annotation digests, not authenticated identities or gesture certification. No workbook timing is filled or certified.'};
}

export function extractSourceReviewFrames(snapshot,indices,directory,options={}){
  const ordinal=selectedVideoStream(options);
  const select=indices.map(index=>`eq(n\\,${index})`).join('+');
  const filter=`select=${select},scale=w=min(640\\,iw):h=min(640\\,ih):force_original_aspect_ratio=decrease,setsar=1`;
  const result=spawnSync('ffmpeg',['-nostdin','-v','error','-n','-i',snapshot,'-map',`0:v:${ordinal}`,'-vf',filter,
    '-fps_mode','passthrough','-frames:v',String(indices.length),'-an','-sn','-dn','-start_number','0',join(directory,'frame-%05d.png')],
    {encoding:'utf8',timeout:60000,maxBuffer:1024*1024,windowsHide:true});
  if(result.error||result.status!==0)fail('ffmpeg could not extract review frames (ffmpeg is required)');
}
const html=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function reviewHtml(manifest){
  const frames=new Map(manifest.frames.map(frame=>[frame.index,frame]));
  const sections=manifest.entries.map(entry=>`<section><h2>${html(entry.moveKey)} — ${html(entry.observedAction)}</h2>
<p>Annotation : ${html(entry.measurement.measuredBy)} · ${html(entry.measurement.measuredAt)}</p><p>${html(entry.measurement.notes)}</p>
<p>${entry.review?`Relecture candidate déclarée : ${html(entry.review.reviewedBy)} · ${html(entry.review.reviewedAt)} · ${html(entry.review.notes)}`:'Relecture à faire.'}</p>
<div class="frames">${[['Début','startFrame'],['Impact','impactFrame'],['Fin','endFrame']].map(([label,key])=>{
    const frame=frames.get(entry.measurement[key]);return `<figure><img src="${frame.path}" alt="${label} — image ${frame.index}"><figcaption>${label} · image ${frame.index} · ${frame.recordingTime.numerator}/${frame.recordingTime.denominator} s depuis la première image</figcaption></figure>`;
  }).join('')}</div><p>SHA256 des annotations : <code>${entry.annotationSHA256}</code></p></section>`).join('\n');
  return `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Relecture candidate de capture</title>
<style>body{font:16px system-ui;background:#17191b;color:#eee;margin:2rem auto;padding:0 1rem;max-width:1200px}a{color:#90c8ff}section{border-top:1px solid #777;margin-top:2rem}.frames{display:flex;flex-wrap:wrap;gap:1rem}figure{margin:0;flex:1 1 240px}img{display:block;max-width:100%;height:auto;image-rendering:auto}code{overflow-wrap:anywhere}p{line-height:1.5}</style>
<h1>Relecture candidate de capture</h1><p>${html(manifest.fighterId)} · ${html(manifest.edition)}</p>
<p>Images de consultation, réduites à 640 pixels au maximum par côté. Les indices désignent les images de cette capture, à partir de zéro ; ils ne sont pas des mesures du moteur d’origine. Comparer aussi la capture originale. Aucune fidélité 1:1 certifiée ; aucun timing Excel rempli.</p>
<p>Source déclarée : ${html(manifest.capture.sourceUrl)}<br>Capture SHA256 : <code>${manifest.capture.sha256}</code><br>Fichier relatif au dossier du paquet d’entrée : ${html(manifest.capture.path)}${own(manifest.capture,'videoStreamOrdinal')?'<br>Piste vidéo sélectionnée (numérotation à partir de zéro) : '+manifest.capture.videoStreamOrdinal:''}</p>
<p>Les relectures éventuelles sont déclaratives et liées aux annotations. Ces aperçus n’ajoutent aucune attestation. Métadonnées et empreintes des images : <a href="review-manifest.json">manifeste JSON</a>.</p>${sections}</html>\n`;
}
function reviewFrameIndices(verified){
  return [...new Set(verified.entries.flatMap(entry=>['startFrame','impactFrame','endFrame'].map(key=>entry.measurement[key])))].sort((a,b)=>a-b);
}
async function readReviewFile(file,maximumBytes,label){
  const info=await lstat(file);
  if(!info.isFile()||info.isSymbolicLink()||info.size<1||info.size>maximumBytes)fail(label+' must be a regular bounded file');
  return readFile(file);
}
async function readReviewFrames(directory,indices,capture){
  const info=await lstat(directory);
  if(!info.isDirectory()||info.isSymbolicLink())fail('review frames must be a regular directory');
  const names=indices.map((index,position)=>`frame-${String(position).padStart(5,'0')}.png`);
  if(JSON.stringify((await readdir(directory)).sort())!==JSON.stringify(names))fail('review frame output count or filenames mismatch');
  const frames=[];
  for(const [position,index] of indices.entries()){
    const name=names[position],bytes=await readReviewFile(join(directory,name),4*1024*1024,'review PNG');
    if(bytes.length<24||!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))||bytes.subarray(12,16).toString('ascii')!=='IHDR')fail('review frame must be PNG');
    const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
    if(![width,height].every(value=>value>0&&value<=640))fail('review frame dimensions exceed preview bounds');
    frames.push({index,path:'frames/'+name,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,width,height,
      recordingTime:{numerator:index*capture.frameRate.denominator,denominator:capture.frameRate.numerator}});
  }
  return frames;
}
function sourceReviewManifest(verified,frames){
  return {...verified,schema:SOURCE_TIMING_REVIEW_SCHEMA,type:'source-timing-review',status:'source-timing-review-candidate',
    preview:{maximumDimension:640,frameIndexBase:0,capturePathRelativeTo:'input-packet-directory'},frames,
    limits:verified.limits+' Extracted still previews may be reduced; they add no measurements or review attestations.'};
}
export async function exportSourceTimingReview(batch,{outputDirectory,baseDirectory=process.cwd(),probe=probeSourceCapture,extract=extractSourceReviewFrames,...catalogue}={}){
  if(!nonempty(outputDirectory))fail('a new review output directory is required');
  const normalized=validateSourceTimingBatch(batch,catalogue),destination=resolve(outputDirectory);
  return verifyCapture(normalized.capture,{baseDirectory,probe,consume:async(capture,snapshot)=>{
    const verified=verifiedTimingBatch(normalized,capture,catalogue);
    const indices=reviewFrameIndices(verified);
    // mkdir is deliberately exclusive: never replace an existing review package.
    await mkdir(destination);let complete=false;
    try{
      const frameDirectory=join(destination,'frames');await mkdir(frameDirectory);
      await extract(snapshot,indices,frameDirectory,{videoStreamOrdinal:selectedVideoStream(capture)});
      const manifest=sourceReviewManifest(verified,await readReviewFrames(frameDirectory,indices,capture));
      await writeFile(join(destination,'review-manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
      await writeFile(join(destination,'index.html'),reviewHtml(manifest),{flag:'wx'});
      complete=true;return manifest;
    }finally{if(!complete)await rm(destination,{recursive:true,force:true});}
  }});
}
/** Re-extract from the source instead of trusting a possibly edited PNG/hash pair. */
export async function verifySourceTimingReview(batch,{reviewDirectory,baseDirectory=process.cwd(),probe=probeSourceCapture,extract=extractSourceReviewFrames,...catalogue}={}){
  if(!nonempty(reviewDirectory))fail('a review directory is required');
  const normalized=validateSourceTimingBatch(batch,catalogue),directory=resolve(reviewDirectory),info=await lstat(directory);
  if(!info.isDirectory()||info.isSymbolicLink())fail('review must be a regular directory');
  return verifyCapture(normalized.capture,{baseDirectory,probe,consume:async(capture,snapshot)=>{
    const verified=verifiedTimingBatch(normalized,capture,catalogue),indices=reviewFrameIndices(verified);
    const freshDirectory=join(dirname(snapshot),'review-frames');await mkdir(freshDirectory,{mode:0o700});
    await extract(snapshot,indices,freshDirectory,{videoStreamOrdinal:selectedVideoStream(capture)});
    const expected=sourceReviewManifest(verified,await readReviewFrames(freshDirectory,indices,capture));
    const manifest=JSON.parse((await readReviewFile(join(directory,'review-manifest.json'),2*1024*1024,'review manifest')).toString('utf8'));
    if(!isDeepStrictEqual(manifest,expected))fail('review manifest differs from exact annotations or freshly extracted capture frames; regenerate the preview');
    if(!isDeepStrictEqual(await readReviewFrames(join(directory,'frames'),indices,capture),expected.frames))fail('review PNG bytes differ from freshly extracted capture frames');
    const page=await readReviewFile(join(directory,'index.html'),2*1024*1024,'review HTML');
    if(page.toString('utf8')!==reviewHtml(expected))fail('review HTML differs from the candidate manifest; regenerate the preview');
    return {schema:1,status:'source-timing-review-integrity-checked',captureSHA256:capture.sha256,
      framesChecked:indices.length,entriesChecked:verified.entries.length,certifiedOneToOne:false,
      limits:'Read-only comparison with freshly extracted PNG bytes using the current ffmpeg/tool version. No observer identity or gesture certification, new review attestation or workbook timing is added.'};
  }});
}

export async function sourceTimingCommand(args){
  if(args.length===1&&args[0]==='--help'){
    console.log('Usage: node scripts/source-timing.mjs validate PACKET.json [--output VERIFIED.json]\n       node scripts/source-timing.mjs validate-batch BATCH.json [--output VERIFIED.json]\n       node scripts/source-timing.mjs annotation-digest PACKET.json [--output DIGEST.json]\n       node scripts/source-timing.mjs review-preview BATCH.json --output-dir NEW_DIRECTORY\n       node scripts/source-timing.mjs verify-review BATCH.json --review-dir REVIEW_DIRECTORY\nOptional capture.videoStreamOrdinal selects video track 0..15 (zero-based among video streams, default 0); the selection is bound to annotation/review digests. validate commands require ffprobe; preview commands also require ffmpeg. verify-review checks existing PNG/HTML/annotations against a fresh extraction with the current tool version. annotation-digest checks annotations only. Named batch reviews remain candidate attestations, never 1:1 certification or workbook edits.');
    return;
  }
  const preview=args[0]==='review-preview',review=args[0]==='verify-review';
  if(!['validate','validate-batch','annotation-digest','review-preview','verify-review'].includes(args[0])||!args[1]||
    (preview||review?args.length!==4||args[2]!== (preview?'--output-dir':'--review-dir')||!args[3]:args.length!==2&&(args.length!==4||args[2]!=='--output'||!args[3])))fail('usage: validate|validate-batch|annotation-digest PACKET.json [--output RESULT.json], review-preview BATCH.json --output-dir NEW_DIRECTORY or verify-review BATCH.json --review-dir REVIEW_DIRECTORY');
  const input=resolve(args[1]),info=await lstat(input);
  const maxBytes=(args[0]==='validate-batch'||preview||review?256:64)*1024;
  if(!info.isFile()||info.isSymbolicLink()||info.size>maxBytes)fail('packet must be a regular bounded JSON file');
  const packet=JSON.parse(await readFile(input,'utf8'));
  if(review){
    const result=await verifySourceTimingReview(packet,{baseDirectory:dirname(input),reviewDirectory:args[3]});
    process.stdout.write(JSON.stringify(result)+'\n');return;
  }
  if(preview){
    const result=await exportSourceTimingReview(packet,{baseDirectory:dirname(input),outputDirectory:args[3]});
    process.stdout.write(JSON.stringify({status:result.status,frames:result.frames.length,entries:result.entries.length,certifiedOneToOne:false})+'\n');return;
  }
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
