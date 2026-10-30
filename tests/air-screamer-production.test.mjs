import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {getFighter} from '../src/data.js';
import {SPRITES} from '../src/sprite-manifest.js';
import {spriteFor,rasterPlacement} from '../src/sprite-system.js';
import {sampleSpriteClip} from '../src/sprite-animation.js';
import {clipSummary} from '../src/sprite-clips.js';

const id='sh1_air_screamer_001';
const registry=JSON.parse(readFileSync(new URL('../art/registry.json',import.meta.url),'utf8'));
test('Air Screamer production registry and generated runtime agree on actual image identities',()=>{
 const source=registry.assets[id],runtime=SPRITES[id],fighter=getFighter(id);
 assert.ok(source&&runtime&&fighter);
 assert.equal(spriteFor(fighter),runtime);
 assert.deepEqual(runtime.frames.map(f=>f.path),source.frames.map(f=>f.path));
 assert.deepEqual(runtime.frames.map(f=>f.sha256),source.frames.map(f=>f.sha256));
 assert.deepEqual(runtime.clips,source.clips);
 assert.equal(source.fidelity,'unverified');
});

test('Air Screamer idle uses distinct pixels and repeats at the registered cadence',()=>{
 const a=SPRITES[id],clip=a.clips.idle;
 assert.equal(clipSummary(a,clip).animated,true);
 assert.equal(clipSummary(a,clip).distinct,3);
 assert.deepEqual([0,5,6,11,12,17,18,23,24].map(frame=>sampleSpriteClip(a,{frame}).frameIndex),[0,0,1,1,0,0,2,2,0]);
});

test('Air Screamer missing attack pose remains an explicit fallback, not a completed attack animation',()=>{
 const a=SPRITES[id],sample=sampleSpriteClip(a,{moveKey:'light',frame:12});
 assert.ok(sample);
 assert.equal(sample.requested,'light');
 assert.equal(sample.pose,'idle');
 assert.equal(sample.fallback,true);
 assert.equal(sample.frameIndex,0);
});

test('Air Screamer frame placements are finite with both facing directions',()=>{
 const fighter=getFighter(id);
 for(const frame of SPRITES[id].frames){
  for(const facing of [-1,1]){
   const p=rasterPlacement(fighter,frame,320,480,facing);
   for(const key of ['x','y','width','height','scale'])assert.ok(Number.isFinite(p[key]),key);
   assert.ok(p.width>0&&p.height>0);
  }
 }
});
