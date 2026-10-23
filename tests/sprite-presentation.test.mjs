import test from 'node:test';
import assert from 'node:assert/strict';
import {actorSpriteState,advanceSpriteClock,sampleSpriteClip,poseFromState} from '../src/sprite-animation.js';
import {combatFraming,visibleSpriteBox,toScreen} from '../src/sprite-framing.js';
import {calibrationPacket} from '../src/sprite-inspector.js';
import {getFighter} from '../src/data.js';
import {spriteFor} from '../src/sprite-system.js';
import {PRESENTATION_KEYS} from '../src/sprite-poses.js';
const film=getFighter('film_red_pyramid_film_175'),air=getFighter('sh1_air_screamer_001');
const actor=()=>({data:film,x:310,y:594,facing:1,state:'idle',grounded:true});
test('pose clock starts at zero and resets on entering a new state',()=>{const a=actor();advanceSpriteClock(a);assert.equal(a.spriteClock.tick,0);advanceSpriteClock(a);assert.equal(a.spriteClock.tick,1);a.state='walk';advanceSpriteClock(a);assert.equal(a.spriteClock.tick,0);});
test('guard/dodge/knockdown/phase use distinct actual pose slots',()=>{for(const [flag,pose] of [['blocking','guard'],['dodging','dodge'],['knockdown','knockdown'],['phase','phase']])assert.equal(poseFromState({[flag]:true}),pose);});
test('a repeated move resets the state clock by attack identity',()=>{const a=actor();a.attack={key:'neutralLight',id:1,frame:7};advanceSpriteClock(a);advanceSpriteClock(a);a.attack={key:'neutralLight',id:2,frame:0};advanceSpriteClock(a);assert.equal(a.spriteClock.tick,0);assert.equal(actorSpriteState(a).frame,0);});
test('KO and hurt cannot inherit an interrupted attack frame clock',()=>{const a=actor();a.attack={key:'neutralLight',id:2,frame:40};a.ko=true;advanceSpriteClock(a);assert.equal(actorSpriteState(a).frame,0);assert.equal(poseFromState(actorSpriteState(a)),'ko');});
test('per-frame durations sample correct frame boundaries',()=>{const a={frames:[{},{}],clips:{idle:{frames:[0,1],ticksPerFrame:1,frameTicks:[2,5],loop:true}}};assert.equal(sampleSpriteClip(a,{frame:1}).index,0);assert.equal(sampleSpriteClip(a,{frame:2}).index,1);assert.equal(sampleSpriteClip(a,{frame:6}).index,1);assert.equal(sampleSpriteClip(a,{frame:7}).index,0);});
test('missing move reports fallback rather than pretending it was animated',()=>{const a=spriteFor(film),s=sampleSpriteClip(a,{moveKey:'neutralHeavy',frame:18});assert.equal(s.requested,'neutralHeavy');assert.equal(s.pose,'idle');assert.equal(s.fallback,true);});
test('the authored flight loop advances only for idle and cannot animate a missing KO, hit or attack',()=>{
 const art=spriteFor(air);
 assert.equal(sampleSpriteClip(art,{frame:6}).frameIndex,1);
 assert.equal(sampleSpriteClip(art,{frame:18}).frameIndex,2);
 for(const state of [{ko:true},{hurt:true},{phase:true},{moveKey:'neutralHeavy'},
  {presentation:{key:'loseMatch',frame:18}}]){
  const sample=sampleSpriteClip(art,{...state,frame:18});
  assert.equal(sample.pose,'idle');assert.equal(sample.fallback,true);
  assert.equal(sample.frameIndex,0);assert.equal(sample.tick,0);
 }
});
test('inherited clip names never resolve as a real pose',()=>assert.equal(sampleSpriteClip(spriteFor(film),{moveKey:'constructor'}).pose,'idle'));
test('calibration export preserves exact original image identities',()=>{const a=spriteFor(film),draft=structuredClone(a);draft.frames[0].anchor=[.6,.91];const p=calibrationPacket(film,a,draft);assert.equal(p.kind,'halo-sprite-calibration');assert.equal(p.frames[0].sha256,a.frames[0].sha256);assert.deepEqual(p.frames[0].anchor,[.6,.91]);assert.notDeepEqual(a.frames[0].anchor,p.frames[0].anchor);});
for(const data of [film,air])for(const facing of [-1,1])for(const x of [80,1200])test(`camera fits entire ${data.id} at ${x} facing ${facing}`,()=>{
 const a={data,x,y:594,facing,grounded:true},before=structuredClone(a),cam=combatFraming([a]);
 for(const f of spriteFor(data).frames){const b=toScreen(visibleSpriteBox(data,f,x,594,facing),cam);assert.ok(b.x>=-1e-8&&b.x+b.w<=1280+1e-8);assert.ok(b.y>=132-1e-8&&b.y+b.h<=694+1e-8);}
 assert.deepEqual(a,before);assert.ok(cam.scale<=1&&cam.scale>0);
});
test('camera preserves all stage and actor coordinates through one shared matrix',()=>{const a=actor(),c=combatFraming([a]);const box={x:100,y:300,w:50,h:20};const s=toScreen(box,c);assert.equal((s.x-c.x)/c.scale,box.x);assert.equal((s.y-c.y)/c.scale,box.y);});
test('camera is deterministic and contains future clip extents, not only the current frame',()=>{const a=actor(),art=structuredClone(spriteFor(film));const second={...art.frames[0],anchor:[.95,.95]};art.frames.push(second);const r={[film.id]:art};assert.deepEqual(combatFraming([a],{registry:r}),combatFraming([a],{registry:r}));for(const f of art.frames){const b=toScreen(visibleSpriteBox(film,f,a.x,a.y),combatFraming([a],{registry:r}));assert.ok(b.x>=0&&b.x+b.w<=1280);}});
test('calibration v2 records original calibration to reject stale exports',()=>{
 const art=spriteFor(film),draft=structuredClone(art);draft.frames[0].anchor=[.25,.9];
 const packet=calibrationPacket(film,art,draft);assert.equal(packet.schema,2);
 assert.deepEqual(packet.previousFrames[0].anchor,art.frames[0].anchor);packet.previousFrames[0].anchor[0]=0;
 assert.notEqual(art.frames[0].anchor[0],0);assert.deepEqual(packet.frames[0].anchor,[.25,.9]);
});

test('round presentation overrides interrupted KO, phase and attack poses without changing combat state',()=>{
 const a={...actor(),ko:true,hurtFrames:20,phaseLock:8,knockdownTimer:40,
  attack:{key:'neutralHeavy',id:7,frame:90},presentation:{key:'loseRound',id:'round-1',frame:3,reversible:true}};
 const before=structuredClone(a),state=actorSpriteState(a);
 assert.equal(poseFromState(state),'loseRound');assert.equal(state.frame,3);
 assert.deepEqual(a,before);
 state.presentation.frame=99;assert.equal(a.presentation.frame,3);
});

test('all eight authored presentation slots are sampled through the engine state contract',()=>{
 const art={frames:[{name:'idle'},{name:'preparation'},{name:'conclusion'}],clips:{idle:{frames:[0],ticksPerFrame:1,loop:false}}};
 for(const key of PRESENTATION_KEYS){
  art.clips[key]={frames:[1,2],frameTicks:[3,5],ticksPerFrame:1,loop:false};
  const a={...actor(),ko:true,attack:{key:'super',id:9,frame:70},presentation:{key,id:key,frame:2}};
  let sample=sampleSpriteClip(art,actorSpriteState(a));
  assert.equal(sample.pose,key);assert.equal(sample.fallback,false);assert.equal(sample.frame.name,'preparation');
  a.presentation.frame=3;sample=sampleSpriteClip(art,actorSpriteState(a));
  assert.equal(sample.frame.name,'conclusion');
  a.presentation.frame=1000;assert.equal(sampleSpriteClip(art,actorSpriteState(a)).tick,7);
 }
});

test('paired finisher tracks share the authoritative tick despite unrelated earlier sprite and attack clocks',()=>{
 const a={...actor(),spriteClock:{identity:'idle:',tick:712},presentation:{key:'finisher',id:'sequence:0',sequenceId:'sequence',frame:46}},
  b={...actor(),attack:{key:'neutralLight',id:88,frame:12},spriteClock:{tick:5},presentation:{key:'finished',id:'sequence:1',sequenceId:'sequence',frame:46}};
 for(const target of [a,b]){advanceSpriteClock(target);advanceSpriteClock(target);assert.equal(actorSpriteState(target).frame,46);assert.equal(target.spriteClock.tick,46);}
 a.presentation.frame=b.presentation.frame=47;
 for(const target of [a,b]){advanceSpriteClock(target);assert.equal(actorSpriteState(target).frame,47);}
});

test('restarting or leaving a cinematic resets the presentation identity without carrying its last frame into idle',()=>{
 const a={...actor(),presentation:{key:'intro',id:'first-intro',frame:100}};
 advanceSpriteClock(a);const previous=a.spriteClock.identity;
 a.presentation={key:'intro',id:'retry-intro',frame:0};advanceSpriteClock(a);
 assert.notEqual(a.spriteClock.identity,previous);assert.equal(actorSpriteState(a).frame,0);
 a.presentation=null;advanceSpriteClock(a);assert.equal(poseFromState(actorSpriteState(a)),'idle');assert.equal(actorSpriteState(a).frame,0);
});

test('missing cinematic art reports its actual fallback and does not invent a dedicated clip',()=>{
 const art=spriteFor(film),before=structuredClone(art);
 for(const key of PRESENTATION_KEYS){
  const sample=sampleSpriteClip(art,{presentation:{key,frame:7},ko:true});
  assert.equal(sample.requested,key);assert.equal(sample.pose,'idle');assert.equal(sample.fallback,true);
 }
 assert.deepEqual(art,before);
});

test('only supported presentation keys override gameplay poses and invalid ticks cannot escape clip bounds',()=>{
 for(const key of ['constructor','__proto__','not-a-sequence',''])assert.equal(poseFromState({presentation:{key,frame:0},ko:true}),'ko');
 const art={frames:[{},{}],clips:{intro:{frames:[0,1],frameTicks:[3,5],ticksPerFrame:1,loop:false},idle:{frames:[0],ticksPerFrame:1,loop:false}}};
 for(const frame of [-1,NaN,Infinity,'4'])assert.equal(sampleSpriteClip(art,{presentation:{key:'intro',frame},frame:900}).tick,0);
 assert.equal(sampleSpriteClip(art,{presentation:{key:'intro',frame:4.9},frame:900}).tick,4);
});
