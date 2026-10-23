import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {deflateSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {STAGES} from '../src/data.js';
import {crc32} from '../scripts/raster-validation.mjs';
import {auditStagePng,auditStageBitmaps,buildStageBitmaps,bitmapRevision} from '../scripts/build-stage-bitmaps.mjs';

const png=()=>{
  const width=64,height=32,header=Buffer.alloc(13),rows=Buffer.alloc(height*(1+width*3));
  header.writeUInt32BE(width);header.writeUInt32BE(height,4);header[8]=8;header[9]=2;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const at=y*(1+width*3)+1+x*3;rows[at]=x*3;rows[at+1]=y*5;rows[at+2]=43;
  }
  const chunk=(type,data)=>{
    const name=Buffer.from(type),size=Buffer.alloc(4),tail=Buffer.alloc(4);
    size.writeUInt32BE(data.length);tail.writeUInt32BE(crc32(Buffer.concat([name,data])));
    return Buffer.concat([size,name,data,tail]);
  };
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]);
};
const worker=`const VERSION = 'fixture';
const CACHE_REVISION = 'manual-kept';
// BITMAP_REVISION_BEGIN
const BITMAP_REVISION = 'old';
// BITMAP_REVISION_END
const CACHE_PREFIX = 'fixture';
const STATIC_CACHE = \`\${CACHE_PREFIX}-static-v\${VERSION}-\${CACHE_REVISION}-\${BITMAP_REVISION}\`;
const RUNTIME_CACHE = \`\${CACHE_PREFIX}-runtime-v\${VERSION}-\${CACHE_REVISION}-\${BITMAP_REVISION}\`;
const ESSENTIAL_SHELL = [
  // STAGE_BITMAP_ASSETS_BEGIN
  // STAGE_BITMAP_ASSETS_END
  '/custom-customer-path'
];
`;
const outsideBlocks=text=>text.replace(/\/\/ BITMAP_REVISION_BEGIN[\s\S]*?\/\/ BITMAP_REVISION_END/,'REVISION').replace(/  \/\/ STAGE_BITMAP_ASSETS_BEGIN[\s\S]*?  \/\/ STAGE_BITMAP_ASSETS_END/,'ASSETS');

async function fixture(context){
  const root=await mkdtemp(join(tmpdir(),'halo-stage-build-'));
  context.after(()=>rm(root,{recursive:true,force:true}));
  await mkdir(join(root,'assets/stages'),{recursive:true});await mkdir(join(root,'src'));
  const stage=STAGES.find(item=>!item.reference?.blocked),bytes=png(),sha=createHash('sha256').update(bytes).digest('hex');
  const path=`assets/stages/${stage.id}.${sha.slice(0,12)}.png`;
  await writeFile(join(root,path),bytes);await writeFile(join(root,'service-worker.js'),worker);
  const registry={[stage.id]:{stageId:stage.id,source:stage.source,status:'integrated-candidate',fidelity:'unverified',mode:'replace',layers:[{id:'background',rect:[0,0,1,1],frames:[{path,sha256:sha,bytes:bytes.length,width:64,height:32}],ticksPerFrame:1,loop:false}]}};
  const actors={sample:{clips:{idle:{frames:[0],ticksPerFrame:1}},frames:[{anchor:[.5,.9]}]}};
  const manifests=async()=>{
    await writeFile(join(root,'src/sprite-manifest.js'),'export const SPRITES = '+JSON.stringify(actors)+';\n');
    await writeFile(join(root,'src/stage-bitmap-manifest.js'),'export const STAGE_BITMAPS = '+JSON.stringify(registry)+';\n');
  };
  await manifests();return {root,stage,bytes,path,registry,actors,manifests};
}

test('stage builder decodes opaque PNG and preserves service-worker content outside its two blocks',async context=>{
  const f=await fixture(context),report=await buildStageBitmaps(f),updated=await readFile(join(f.root,'service-worker.js'),'utf8');
  assert.equal(report.files,1);assert.match(report.revision,/^[a-f0-9]{64}$/);
  assert.equal(outsideBlocks(updated),outsideBlocks(worker));
  assert.ok(updated.includes('/'+f.path));assert.ok(updated.includes(report.revision));
  assert.equal(auditStagePng(f.bytes).width,64);
  const second=await buildStageBitmaps(f);
  assert.equal(second.revision,report.revision);
  assert.equal(await readFile(join(f.root,'service-worker.js'),'utf8'),updated,'second build is byte-identical');
});

test('stage descriptor changes invalidate caches even when image paths and bytes stay identical',async context=>{
  const f=await fixture(context),paths=(await auditStageBitmaps(f)).paths;
  let previous=(await buildStageBitmaps(f)).revision;
  const art=f.registry[f.stage.id],layer=art.layers[0];
  for(const change of [()=>art.mode='overlay',()=>layer.rect=[0,.1,1,.9],()=>layer.ticksPerFrame=5]){
    change();await f.manifests();
    const report=await buildStageBitmaps(f);
    assert.notEqual(report.revision,previous);assert.deepEqual(report.paths,paths);previous=report.revision;
  }
});

test('actor clips and calibration invalidate bitmap revision without changing raster paths',async context=>{
  const f=await fixture(context);let previous=await bitmapRevision(f.root);
  for(const change of [()=>f.actors.sample.clips.idle.ticksPerFrame=7,()=>f.actors.sample.frames[0].anchor=[.4,.85]]){
    change();await f.manifests();
    const report=await buildStageBitmaps(f);assert.notEqual(report.revision,previous);previous=report.revision;
  }
});

test('stage bitmap metadata and exact identity/source fail closed before service-worker writes',async context=>{
  const f=await fixture(context),frame=f.registry[f.stage.id].layers[0].frames[0];
  frame.width=63;
  await assert.rejects(auditStageBitmaps(f),/dimensions mismatch/);frame.width=64;
  frame.bytes++;
  await assert.rejects(auditStageBitmaps(f),/metadata mismatch/);frame.bytes--;
  const changed=Buffer.from(f.bytes);changed[changed.length-1]^=1;
  await writeFile(join(f.root,f.path),changed);
  await assert.rejects(auditStageBitmaps(f),/metadata mismatch/);
  await writeFile(join(f.root,f.path),f.bytes);
  f.registry[f.stage.id].source='another-edition';
  await assert.rejects(buildStageBitmaps(f),/identity\/source mismatch/);
  assert.equal(await readFile(join(f.root,'service-worker.js'),'utf8'),worker);
});

test('stage assets reject symlinks, truncated pixels and unversioned filenames',async context=>{
  const f=await fixture(context),frame=f.registry[f.stage.id].layers[0].frames[0];
  const original=join(f.root,f.path),linked=join(f.root,'opaque-reference.png');
  await writeFile(linked,f.bytes);await rm(original);await symlink(linked,original);
  await assert.rejects(auditStageBitmaps(f),/unsafe/);
  assert.throws(()=>auditStagePng(f.bytes.subarray(0,-8)),/PNG decode failed/);
  assert.throws(()=>auditStagePng(Buffer.concat([f.bytes,Buffer.from('extra')])),/PNG decode failed/);
  await rm(original);await writeFile(original,f.bytes);
  frame.path=`assets/stages/${f.stage.id}.not-versioned.png`;
  await assert.rejects(auditStageBitmaps(f),/unsafe\/unversioned/);
});
