import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleSpriteClip,requestedSpriteClipKey,advanceSpriteClock} from '../src/sprite-animation.js';
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

test('runtime rejects malformed and oversized authored clip durations',()=>{
 const a=art();
 a.clips.walk.frameTicks=[2,0];
 assert.equal(sampleSpriteClip(a,{moving:true,frame:0}),null);
 a.clips.walk.frameTicks=[2,601];
 assert.equal(sampleSpriteClip(a,{moving:true,frame:0}),null);
 a.clips.walk.frameTicks=[2,3];
 a.clips.walk.ticksPerFrame=1;
 assert.equal(sampleSpriteClip(a,{moving:true,frame:2}).frameIndex,1);
});

test('combat pose priority never lets stale movement hide hurt or knockdown',()=>{
 const a=art();
 a.clips.knockdown={frames:[1],ticksPerFrame:1,loop:false};
 const hurt=sampleSpriteClip(a,{hurt:true,moving:true,moveKey:'light',frame:0});
 assert.equal(hurt.pose,'hurt');
 const down=sampleSpriteClip(a,{knockdown:true,hurt:true,moving:true,frame:0});
 assert.equal(down.pose,'knockdown');
});

test('attack clip cannot borrow its obsolete animation clock after an interruption',()=>{
 const a=art();
 a.clips.light={frames:[0,1],frameTicks:[1,1],ticksPerFrame:1,loop:false};
 assert.equal(sampleSpriteClip(a,{moveKey:'light',frame:1}).frameIndex,1);
 const interrupted=sampleSpriteClip(a,{hurt:true,frame:1});
 assert.equal(interrupted.pose,'hurt');
 assert.equal(interrupted.frameIndex,1);
});

test('sprite clock resets on pose changes and sanitizes invalid legacy ticks',()=>{
 const actor={ko:false,hurtFrames:0,phaseLock:0,knockdownTimer:0,dodgeFrames:0,blocking:false,crouching:false,grounded:true,state:'walk',spriteClock:{identity:'walk::',pose:'walk',tick:NaN}};
 advanceSpriteClock(actor);
 assert.equal(actor.spriteClock.tick,1);
 actor.hurtFrames=3;
 advanceSpriteClock(actor);
 assert.equal(actor.spriteClock.pose,'hurt');
 assert.equal(actor.spriteClock.tick,0);
 actor.hurtFrames=0;
 advanceSpriteClock(actor);
 assert.equal(actor.spriteClock.pose,'walk');
 assert.equal(actor.spriteClock.tick,0);
});

test('presentation clock uses its own sequence frame and resets after it ends',()=>{
 const actor={ko:false,hurtFrames:0,phaseLock:0,knockdownTimer:0,dodgeFrames:0,blocking:false,crouching:false,grounded:true,state:'walk',spriteClock:{identity:'walk::',pose:'walk',tick:12}};
 actor.presentation={key:'winRound',id:'round-1',frame:4};
 advanceSpriteClock(actor);
 assert.equal(actor.spriteClock.pose,'winRound');
 assert.equal(actor.spriteClock.tick,4);
 actor.presentation.frame=7;
 advanceSpriteClock(actor);
 assert.equal(actor.spriteClock.tick,7);
 actor.presentation=null;
 advanceSpriteClock(actor);
 assert.equal(actor.spriteClock.pose,'walk');
 assert.equal(actor.spriteClock.tick,0);
});

test('changing attack identity resets the pose clock even for the same move',()=>{
 const actor={ko:false,hurtFrames:0,phaseLock:0,knockdownTimer:0,dodgeFrames:0,blocking:false,crouching:false,grounded:true,state:'attack',attack:{id:'attack-1',key:'light',frame:1},spriteClock:{identity:'light:attack-1:',pose:'light',tick:4}};
 advanceSpriteClock(actor);
 assert.equal(actor.spriteClock.tick,5);
 actor.attack={id:'attack-2',key:'light',frame:0};
 advanceSpriteClock(actor);
 assert.equal(actor.spriteClock.tick,0);
});

test('runtime refuses missing ticksPerFrame rather than silently inventing timing',()=>{
 const a=art();
 a.clips.walk={frames:[0,1],loop:true};
 assert.equal(sampleSpriteClip(a,{moving:true,frame:1}),null);
 a.clips.walk={frames:[0,1],ticksPerFrame:2,loop:true};
 assert.equal(sampleSpriteClip(a,{moving:true,frame:2}).frameIndex,1);
});

test('malformed runtime clip arrays fail safely without throwing',()=>{
 const a=art();
 a.clips.walk.frameTicks='not-an-array';
 assert.equal(sampleSpriteClip(a,{moving:true,frame:0}),null);
 a.clips.walk={frames:'broken',ticksPerFrame:2,loop:true};
 assert.equal(sampleSpriteClip(a,{moving:true,frame:0}),null);
 a.clips.walk={frames:[999],ticksPerFrame:2,loop:true};
 assert.equal(sampleSpriteClip(a,{moving:true,frame:0}),null);
});
