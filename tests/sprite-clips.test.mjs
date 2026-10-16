import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {POSE_KEYS,validateClip,clipSummary,clipPacket,moveTiming,createClipDraft} from '../src/sprite-clips.js';
import {sampleSpriteClip} from '../src/sprite-animation.js';
import {getFighter,MOVESET_KEYS,createCombatProfile} from '../src/data.js';
import {spriteFor} from '../src/sprite-system.js';
const fighter=getFighter('sh1_air_screamer_001');
const art=()=>({fighterId:fighter.id,source:fighter.source,frames:[{path:'a.png',sha256:'a',pixelSHA256:'1'},{path:'b.png',sha256:'b',pixelSHA256:'2'}],clips:{idle:{frames:[0],ticksPerFrame:1,loop:false}}});
const clip=(patch={})=>({frames:[0,1,0],ticksPerFrame:1,frameTicks:[3,5,2],loop:true,...patch});
test('clip contract includes exactly the 10 presentation states and 20 engine actions',()=>{assert.equal(new Set(POSE_KEYS).size,30);assert.deepEqual(POSE_KEYS.slice(10),MOVESET_KEYS);});
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
 const source=readFileSync(new URL('../scripts/apply-sprite-clip.py',import.meta.url),'utf8');
 const strings=text=>[...text.matchAll(/'([^']+)'/g)].map(m=>m[1]);
 const base=source.match(/POSE_KEYS = \(([^)]*)\)/)[1],moves=source.match(/MOVE_KEYS = \(([^)]*)\)/)[1];
 assert.deepEqual([...strings(base),...strings(moves)],POSE_KEYS);
});

test('clip export refuses frames inserted without image import',()=>{const a=art(),draft=structuredClone(a);draft.frames.push({path:'fake',sha256:'f'});assert.throws(()=>clipPacket(fighter,a,draft,'idle'),/changer les images/);});
