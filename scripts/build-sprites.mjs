import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve,relative} from 'node:path';
import {ROSTER,VERSION} from '../src/data.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const registry=JSON.parse(await readFile(resolve(root,'art/registry.json'),'utf8'));
const fail=message=>{throw Error('Sprite manifest: '+message);};
if(registry.schema!==1||!registry.assets||typeof registry.assets!=='object')fail('unsupported schema');
const signatures=new Map();
const origins=new Set(['conversation-image-generation','external-unspecified','artist-created','scan']);
function dimensions(bytes){
  if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))){
    if(bytes.length<33||bytes.subarray(12,16).toString()!=='IHDR'||bytes.readUInt32BE(8)!==13)fail('invalid PNG header');
    let animated=false;for(let offset=8;offset+12<=bytes.length;){const n=bytes.readUInt32BE(offset);if(n>bytes.length-offset-12)fail('invalid PNG chunk');if(bytes.subarray(offset+4,offset+8).toString()==='acTL')animated=true;offset+=n+12;}
    return [bytes.readUInt32BE(16),bytes.readUInt32BE(20),[4,6].includes(bytes[25]),animated];
  }
  if(bytes.subarray(0,4).toString()!=='RIFF'||bytes.subarray(8,12).toString()!=='WEBP')fail('expected PNG/WebP');
  if(bytes.readUInt32LE(4)+8!==bytes.length)fail('invalid RIFF length');
  for(let offset=12;offset+8<=bytes.length;){const type=bytes.subarray(offset,offset+4).toString(),size=bytes.readUInt32LE(offset+4),at=offset+8;
    if(at+size>bytes.length)fail('invalid WebP chunk');
    if(type==='VP8X'){if(size<10)fail('short VP8X');return [1+bytes.readUIntLE(at+4,3),1+bytes.readUIntLE(at+7,3),!!(bytes[at]&16),!!(bytes[at]&2)];}
    if(type==='VP8L'){if(size<5||bytes[at]!==47)fail('invalid VP8L');const bits=bytes.readUInt32LE(at+1);return [(bits&16383)+1,((bits>>>14)&16383)+1,!!(bits&(1<<28)),false];}
    offset=at+size+(size%2);
  }fail('transparent raster header missing');
}
for(const [id,art] of Object.entries(registry.assets)){
  const fighter=ROSTER.find(f=>f.id===id);
  if(!fighter||art.fighterId!==id||fighter.source!==art.source)fail('identity/source mismatch '+id);
  if(art.singleSubjectReviewed!==true||(!origins.has(art.origin)&&art.origin!=='mixed')||art.fidelity!=='unverified'||art.status!=='integrated-candidate')fail('unsupported/unreviewed provenance '+id);
  if(!Array.isArray(art.frames)||!art.frames.length||art.frames.length>256||!art.clips?.idle)fail('frames/idle absent '+id);
  for(const [i,frame] of [...art.frames,art.portrait].entries()){
    if(!frame||!/^assets\/sprites\/[a-z0-9_.-]+\.(?:png|webp)$/.test(frame.path))fail('unsafe raster path '+id);
    const path=resolve(root,frame.path);if(relative(root,path).startsWith('..'))fail('outside source root');
    const bytes=await readFile(path),sha=createHash('sha256').update(bytes).digest('hex'),[w,h,alpha,animated]=dimensions(bytes);
    if(sha!==frame.sha256||bytes.length!==frame.bytes||w!==frame.width||h!==frame.height)fail('file metadata mismatch '+frame.path);
    if(!alpha||animated||w<128||h<64||w>4096||h>4096)fail('must be one transparent frame '+frame.path);
    if(!frame.path.includes(sha.slice(0,12)))fail('unversioned asset filename '+frame.path);
    if(frame.facing!==undefined&&![-1,1].includes(frame.facing))fail('invalid native facing '+id);
    if(i<art.frames.length){
      if(!origins.has(frame.origin??art.origin))fail('missing frame provenance '+id);
      if(![-1,1].includes(frame.facing)||!Array.isArray(frame.anchor)||frame.anchor.length!==2||!frame.anchor.every(n=>Number.isFinite(n)&&n>=0&&n<=1)||!Number.isFinite(frame.bodyHeight)||frame.bodyHeight<.05||frame.bodyHeight>1)fail('invalid anchor/scale '+id);
      if(signatures.has(sha)&&signatures.get(sha)!==id)fail('cross-profile raster clone '+id);
      signatures.set(sha,id);
    }
  }
  const frameOrigins=new Set(art.frames.map(f=>f.origin??art.origin));
  if((frameOrigins.size>1?'mixed':[...frameOrigins][0])!==art.origin)fail('inconsistent aggregate provenance '+id);
  let animated=0;
  for(const clip of Object.values(art.clips)){
    if(!Array.isArray(clip.frames)||!clip.frames.length||clip.frames.some(n=>!Number.isInteger(n)||!art.frames[n])||!Number.isInteger(clip.ticksPerFrame)||clip.ticksPerFrame<1||typeof clip.loop!=='boolean')fail('invalid clip '+id);
    if(new Set(clip.frames.map(i=>art.frames[i].sha256)).size>1)animated++;
  }
  if(art.animatedClips!==animated)fail('false animation count '+id);
}
const entries=ROSTER.map(f=>({id:f.id,name:f.name,source:f.source,game:f.game,status:registry.assets[f.id]?.status||'missing',frames:registry.assets[f.id]?.frames.length||0,animatedClips:registry.assets[f.id]?.animatedClips||0,fidelity:registry.assets[f.id]?.fidelity||'not-assessed'}));
const report={schema:1,version:VERSION,total:entries.length,integrated:entries.filter(e=>e.frames>0).length,missing:entries.filter(e=>e.frames===0).length,certified:entries.filter(e=>e.fidelity==='verified').length,animatedClips:entries.reduce((n,e)=>n+e.animatedClips,0),entries};
await mkdir(resolve(root,'data'),{recursive:true});
await writeFile(resolve(root,'src/sprite-manifest.js'),'// Generated by scripts/build-sprites.mjs; edit art/registry.json instead.\nexport const SPRITES = '+JSON.stringify(registry.assets,null,2)+';\n');
await writeFile(resolve(root,'data/sprite-coverage.json'),JSON.stringify(report,null,2)+'\n');
console.log(`Raster audit: ${report.integrated}/${report.total} integrated candidates; ${report.missing} missing; ${report.certified} certified; ${report.animatedClips} animated clips.`);

const workerPath=resolve(root,'service-worker.js');
const worker=await readFile(workerPath,'utf8');
const paths=[...new Set(Object.values(registry.assets).flatMap(a=>[...a.frames,a.portrait]).map(f=>'/'+f.path))].sort();
if(!worker.includes('// SPRITE_ASSETS_BEGIN')||!worker.includes('// SPRITE_ASSETS_END'))fail('service worker asset markers missing');
await writeFile(workerPath,worker.replace(/  \/\/ SPRITE_ASSETS_BEGIN[\s\S]*?  \/\/ SPRITE_ASSETS_END/,
  '  // SPRITE_ASSETS_BEGIN\n'+paths.map(p=>'  '+JSON.stringify(p)+',').join('\n')+'\n  // SPRITE_ASSETS_END'));
