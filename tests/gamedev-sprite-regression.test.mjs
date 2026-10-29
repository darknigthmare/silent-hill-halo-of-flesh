import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleSpriteClip,requestedSpriteClipKey} from '../src/sprite-animation.js';
import {clipSummary} from '../src/sprite-clips.js';

const art=()=>({
 fighterId:'test',
 frames:[{path:'a.png',sha256:'a',pixelSHA256:'pixel-a'},{path:'b.png',sha256:'b',pixelSHA256:'pixel-b'}],
 clips:{
  idle:{frames:[0],ticksPerFrame:1,loop:true},
  walk:{frames:[0,1],frameTicks:[2,3],ticksPerFrame:1,loop:true},
  hurt:{frames:[1],ticksPerFrame:2,loop:false}
 }
});

test('walking samples actual distinct frames at authored durations',()=>{
 const a=art();
 assert.equal(clipSummary(a,a.clips.walk).animated,true);
 assert.deepEqual([0,1,2,4,5,6].map(frame=>sampleSpriteClip(a,{moving:true,frame}).frameIndex),[0,0,1,1,0,0]);
});

test('missing attack art is disclosed as fallback, never counted as animated attack',()=>{
 const a=art(),sample=sampleSpriteClip(a,{moveKey:'light',frame:90});
 assert.equal(sample.pose,'idle');
 assert.equal(sample.requested,'light');
 assert.equal(sample.fallback,true);
 assert.equal(sample.frameIndex,0);
 assert.equal(sample.tick,0);
});

test('non-looping hurt image stays on final frame',()=>{
 const a=art();
 for(const tick of [0,1,2,1000]){
  const sample=sampleSpriteClip(a,{hurt:true,frame:tick});
  assert.equal(sample.pose,'hurt');
  assert.equal(sample.frameIndex,1);
 }
});

test('weapon-specific idle must not borrow generic weapon image',()=>{
 const a=art();
 const state={weaponContext:'test:weapon:pistol',frame:1};
 assert.equal(requestedSpriteClipKey(state),'idle@test:weapon:pistol');
 assert.equal(sampleSpriteClip(a,state),null);
});

test('repeated pixels do not qualify as animation',()=>{
 const a=art();
 a.frames[1].pixelSHA256='pixel-a';
 assert.equal(clipSummary(a,a.clips.walk).animated,false);
});
