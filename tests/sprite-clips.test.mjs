import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {POSE_KEYS,validateClip,clipSummary,clipPacket,moveTiming,createClipDraft,presentationClipCoverage} from '../src/sprite-clips.js';
import {BASE_POSE_KEYS,PRESENTATION_KEYS,isOneShotPose,poseLabel} from '../src/sprite-poses.js';
import {previewSpriteState} from '../src/sprite-inspector.js';
import {sampleSpriteClip} from '../src/sprite-animation.js';
import {getFighter,MOVESET_KEYS,createCombatProfile} from '../src/data.js';
import {spriteFor} from '../src/sprite-system.js';
import {SPRITES} from '../src/sprite-manifest.js';
const fighter=getFighter('sh1_air_screamer_001');
const art=()=>({fighterId:fighter.id,source:fighter.source,frames:[{path:'a.png',sha256:'a',pixelSHA256:'1'},{path:'b.png',sha256:'b',pixelSHA256:'2'}],clips:{idle:{frames:[0],ticksPerFrame:1,loop:false}}});
const clip=(patch={})=>({frames:[0,1,0],ticksPerFrame:1,frameTicks:[3,5,2],loop:true,...patch});
test('clip contract keeps thirty old indices and appends nine presentation states',()=>{
 assert.equal(new Set(POSE_KEYS).size,39);assert.equal(BASE_POSE_KEYS.length,10);
 assert.deepEqual(POSE_KEYS.slice(0,10),BASE_POSE_KEYS);assert.deepEqual(POSE_KEYS.slice(10,30),MOVESET_KEYS);assert.deepEqual(POSE_KEYS.slice(30),PRESENTATION_KEYS);
});
test('native raster is not altered by local timeline editing',()=>{const a=spriteFor(fighter),before=structuredClone(a),draft=structuredClone(a);draft.clips.idle=clip({frames:[0,0],frameTicks:[4,7]});clipPacket(fighter,a,draft,'idle');assert.deepEqual(a,before);});
test('timeline order reuses images without manufacturing files',()=>{const a=art(),s=clipSummary(a,clip());assert.equal(s.steps,3);assert.equal(s.distinct,2);assert.equal(s.total,10);assert.equal(a.frames.length,2);});
test('repeating a static image is not an animation',()=>assert.equal(clipSummary(art(),clip({frames:[0,0],frameTicks:[2,4]})).animated,false));
test('re-encoded identical pixels do not count as different animation images',()=>{const a=art();a.frames[1].pixelSHA256='1';assert.equal(clipSummary(a,clip()).distinct,1);});
test('authored variable durations run with the exact live sampler',()=>{const a=art();a.clips.idle=validateClip(a,'idle',clip());assert.deepEqual([0,2,3,7,8,9,10].map(frame=>sampleSpriteClip(a,{frame}).frameIndex),[0,0,1,1,0,0,0]);});
test('non-looping clips hold their last frame after all steps',()=>{const a=art();a.clips.walk=validateClip(a,'walk',clip({loop:false}));assert.equal(sampleSpriteClip(a,{moving:true,frame:100}).frameIndex,0);});
test('attack clips cannot loop independently of collision timing',()=>assert.throws(()=>validateClip(art(),'neutralLight',clip()),/attaque/));
test('move timing displayed to authors comes from the actual combat profile',()=>{const m=createCombatProfile(fighter).moves.neutralHeavy,s=moveTiming(fighter,'neutralHeavy');assert.equal(s.total,m.startup+m.active+m.recovery);assert.equal(s.name,m.name);assert.equal(moveTiming(fighter,'walk'),null);});
for(const [name,patch] of [
 ['negative index',{frames:[-1]}],['outside index',{frames:[2]}],['fractional index',{frames:[.5]}],['boolean index',{frames:[true]}],
 ['empty timeline',{frames:[]}],['too many steps',{frames:Array(257).fill(0)}],['noninteger ticks',{ticksPerFrame:1.2}],
 ['unbounded ticks',{ticksPerFrame:601}],['null duration list',{frameTicks:null}],['null durations',{frameTicks:[null,2,3]}],['missing duration',{frameTicks:[2]}],
 ['zero duration',{frameTicks:[0,2,3]}],['NaN duration',{frameTicks:[NaN,2,3]}],['loop coercion',{loop:'true'}],
 ['total duration overflow',{frames:Array(61).fill(0),frameTicks:Array(61).fill(600)}],['injected stat',{damage:9000}]
])test('timeline rejects '+name,()=>assert.throws(()=>validateClip(art(),'idle',clip(patch))));
test('unknown and inherited pose names are rejected',()=>{for(const p of ['__proto__','constructor','notAState'])assert.throws(()=>validateClip(art(),p,clip()));});
test('packet captures the previous clip and ordered immutable identities',()=>{const a=art(),draft=structuredClone(a);draft.clips.idle=clip();const p=clipPacket(fighter,a,draft,'idle');assert.deepEqual(p.previousClip,a.clips.idle);assert.deepEqual(p.frameSet,a.frames.map(({path,sha256})=>({path,sha256})));draft.clips.idle.frames[0]=1;assert.equal(p.clip.frames[0],0);});
test('idle reuse alone cannot be exported as a new attack pose',()=>{const a=art(),draft=structuredClone(a);draft.clips.neutralLight={frames:[0],ticksPerFrame:1,loop:false};assert.throws(()=>clipPacket(fighter,a,draft,'neutralLight'),/image dédiée/);});
test('a dedicated action frame can share a recovery image with idle',()=>{const a=art(),draft=structuredClone(a);draft.clips.neutralLight=clip({loop:false});assert.equal(clipPacket(fighter,a,draft,'neutralLight').previousClip,null);});
test('draft normalization does not mutate the source clip',()=>{const a=art();const d=createClipDraft(a,'idle');d.frames[0]=1;assert.equal(a.clips.idle.frames[0],0);assert.deepEqual(d.frameTicks,[1]);});
test('the Python publication contract lists the same pose keys',()=>{
 const source=readFileSync(new URL('../scripts/import-sprite.py',import.meta.url),'utf8');
 const strings=text=>[...text.matchAll(/'([^']+)'/g)].map(m=>m[1]);
 const keys=name=>strings(source.match(new RegExp(name+' = \\(([^)]*)\\)'))[1]);
 assert.deepEqual([...keys('BASE_POSE_KEYS'),...keys('MOVE_KEYS'),...keys('PRESENTATION_KEYS')],POSE_KEYS);
});

test('clip export refuses frames inserted without image import',()=>{const a=art(),draft=structuredClone(a);draft.frames.push({path:'fake',sha256:'f'});assert.throws(()=>clipPacket(fighter,a,draft,'idle'),/changer les images/);});

for(const pose of PRESENTATION_KEYS){
 test(pose+' requires a one-shot timeline and has a French label',()=>{
  assert.equal(isOneShotPose(pose),true);assert.notEqual(poseLabel(pose),pose);
  assert.throws(()=>validateClip(art(),pose,clip()),/une seule fois/);
  assert.equal(validateClip(art(),pose,clip({loop:false})).loop,false);
 });
 test(pose+' preview uses the actor presentation clock, not an attack alias',()=>{
  const state=previewSpriteState(pose,3),a=art();a.clips[pose]=clip({loop:false});
  assert.equal(state.presentation.key,pose);assert.equal(state.presentation.frame,3);assert.equal(state.moveKey,undefined);
  const sample=sampleSpriteClip(a,state);assert.equal(sample.requested,pose);assert.equal(sample.frameIndex,1);assert.equal(sample.fallback,false);
  assert.equal(sampleSpriteClip(a,previewSpriteState(pose,999)).frameIndex,0);
 });
 test(pose+' cannot turn idle reuse into a new presentation',()=>{
  const a=art(),draft=structuredClone(a);draft.clips[pose]={frames:[0,0],ticksPerFrame:1,loop:false};
  assert.throws(()=>clipPacket(fighter,a,draft,pose),/image dédiée/);
  draft.clips[pose]=clip({loop:false});const packet=clipPacket(fighter,a,draft,pose);
  assert.equal(packet.pose,pose);assert.equal(packet.previousClip,null);assert.equal(packet.source,fighter.source);
 });
}
test('missing presentation preview explicitly reports idle fallback',()=>{
 const sample=sampleSpriteClip(art(),previewSpriteState('finished',44));
 assert.equal(sample.requested,'finished');assert.equal(sample.pose,'idle');assert.equal(sample.fallback,true);
});
test('preview clocks remain integer and non-negative for all presentation states',()=>{
 for(const value of [-1,NaN,Infinity,1.9]){
  const state=previewSpriteState('intro',value);assert.ok(Number.isInteger(state.presentation.frame));assert.ok(state.presentation.frame>=0);
 }
 assert.deepEqual(previewSpriteState('walk',2),{moving:true,frame:2});
 assert.deepEqual(previewSpriteState('neutralLight',4),{moveKey:'neutralLight',frame:4});
});
test('new presentation cannot bypass idle protection by changing a draft pixel digest',()=>{
 const a=art(),draft=structuredClone(a);draft.frames[0].pixelSHA256='forged';draft.clips.intro={frames:[0],ticksPerFrame:1,loop:false};
 assert.throws(()=>clipPacket(fighter,a,draft,'intro'),/image dédiée/);
});
test('clip export keeps the exact profile and media identity',()=>{
 const a=art(),draft=structuredClone(a);draft.clips.intro=clip({loop:false});
 assert.throws(()=>clipPacket({...fighter,source:'film'},a,draft,'intro'),/exactement/);
 draft.fighterId='sh2_other_version';assert.throws(()=>clipPacket(fighter,a,draft,'intro'),/exactement/);
});
test('presentation coverage separates imported static scenes, animation and absent scenes',()=>{
 const a=art();a.clips.intro={frames:[1,1],ticksPerFrame:1,loop:false};a.clips.finisher=clip({loop:false});
 const c=presentationClipCoverage(a);assert.deepEqual(c.present,['intro','finisher']);assert.equal(c.animated,1);assert.equal(c.missing.length,PRESENTATION_KEYS.length-2);
 assert.deepEqual(presentationClipCoverage(null),{present:[],missing:[...PRESENTATION_KEYS],animated:0});
});
test('actual Twin Victim exact static taunt covers its own slot without claiming animation or unrelated presentations',()=>{
 const a=SPRITES.sh4_twin_victim_059,c=presentationClipCoverage(a);
 assert.deepEqual(c.present,['taunt@sh4_twin_victim_059:taunt']);assert.equal(c.missing.includes('taunt'),false);
 assert.equal(c.missing.length,PRESENTATION_KEYS.length-1);assert.equal(c.animated,0);
 for(const key of ['intro','winRound','loseRound','winMatch','loseMatch','outro','finisher','finished'])assert.ok(c.missing.includes(key));
 const forged={...a,fighterId:'sh1_air_screamer_001',source:'sh1'};assert.ok(presentationClipCoverage(forged).missing.includes('taunt'));
 assert.ok(presentationClipCoverage({...a,source:'sh1'}).missing.includes('taunt'));
});
test('owned round contexts map workbook round-one names and an individual finisher never covers the whole finisher slot',()=>{
 const a=art();a.clips['winRound@'+fighter.id+':winRound1']={frames:[1],ticksPerFrame:1,loop:false};
 a.clips['loseRound@'+fighter.id+':loseRound1']={frames:[1],ticksPerFrame:1,loop:false};
 a.clips['finisher@'+fighter.id+'_signature']={frames:[1],ticksPerFrame:1,loop:false};
 const c=presentationClipCoverage(a);assert.ok(!c.missing.includes('winRound')&&!c.missing.includes('loseRound'));
 assert.ok(c.missing.includes('finisher')&&c.missing.includes('finished'));
 a.clips['taunt@'+fighter.id+':taunt']={frames:[1],ticksPerFrame:1,loop:true};assert.ok(presentationClipCoverage(a).missing.includes('taunt'),'invalid looping contextual presentations are not available');
});
