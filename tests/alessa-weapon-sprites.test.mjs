import test from 'node:test';
import assert from 'node:assert/strict';
import {getFighter,createCombatProfile} from '../src/data.js';
import {ALESSA_FIGHTER_ID,ALESSA_WEAPON_PHASES} from '../src/weapon-phases.js';
import {POSE_KEYS,weaponIdleClipKeys,validSpriteClipKey} from '../src/sprite-poses.js';
import {actorSpriteState,advanceSpriteClock,requestedSpriteClipKey,sampleSpriteClip} from '../src/sprite-animation.js';
import {validateClip,clipPacket,clipSummary} from '../src/sprite-clips.js';
import {drawRasterMonster} from '../src/sprite-system.js';
import {previewSpriteState} from '../src/sprite-inspector.js';

const fighter=getFighter(ALESSA_FIGHTER_ID),keys=weaponIdleClipKeys(fighter);
const clip=index=>({frames:[index],ticksPerFrame:6,loop:false});
function asset(){return {fighterId:fighter.id,source:fighter.source,fidelity:'unverified',frames:ALESSA_WEAPON_PHASES.map((weapon,index)=>({path:`fixture-${weapon.id}.png`,sha256:String(index).repeat(64),pixelSHA256:String(index).repeat(64),width:300,height:400,anchor:[.5,1],bodyHeight:.9,facing:1})),clips:{idle:clip(0),...Object.fromEntries(keys.map((key,index)=>[key,clip(index)]))}};}
const actor=()=>({data:fighter,profile:createCombatProfile(fighter),weaponPhaseIndex:0,grounded:true,state:'idle',health:100,ko:false,phaseLock:0,hurtFrames:0});
const context=()=>{const calls=[];return new Proxy({calls},{get:(object,key)=>key in object?object[key]:(...args)=>calls.push([key,...args])});};

test('only four exact SH3 Alessa idle weapon contexts extend the stable 39 pose keys',()=>{
 assert.equal(fighter.id,ALESSA_FIGHTER_ID);assert.equal(POSE_KEYS.length,39);
 assert.deepEqual(keys,ALESSA_WEAPON_PHASES.map(phase=>`idle@${fighter.id}:weapon:${phase.id}`));
 for(const key of keys)assert.equal(validSpriteClipKey(key,asset()),true);
 const closer=getFighter('sh3_closer_036');assert.equal(closer.id,'sh3_closer_036');
 for(const other of [{...fighter,source:'film'},closer,{id:fighter.id.toUpperCase(),source:'sh3'}])assert.deepEqual(weaponIdleClipKeys(other),[]);
 for(const key of [keys[0]+'@extra',keys[0].toUpperCase(),keys[0].replace(':knife',':shotgun'),keys[0].replace('idle@','ko@'),keys[0].replace(fighter.id,'sh1_alessa_015')])assert.equal(validSpriteClipKey(key,asset()),false);
 assert.equal(validSpriteClipKey(keys[0],{...asset(),source:'sh2'}),false);
 for(const forged of [{...asset(),fighterId:'sh3_closer_036',id:fighter.id},{...asset(),id:'sh3_closer_036'}]){
  assert.equal(validSpriteClipKey(keys[0],forged),false);assert.throws(()=>validateClip(forged,keys[0],clip(0)),/inconnu|invalide/);
 }
});
test('the active documented weapon chooses its own image without mutating combat data',()=>{
 const art=asset(),subject=actor();
 for(let index=0;index<4;index++){
  subject.weaponPhaseIndex=index;const before=structuredClone(subject),state=actorSpriteState(subject);
  assert.equal(state.weaponContext,`${fighter.id}:weapon:${ALESSA_WEAPON_PHASES[index].id}`);
  assert.equal(requestedSpriteClipKey(state),keys[index]);assert.equal(sampleSpriteClip(art,state).frameIndex,index);assert.deepEqual(subject,before);
 }
 assert.equal(sampleSpriteClip(art,{}).frameIndex,0,'generic idle remains available for portrait/authoring');
});
test('weapon changes reset the presentation clock even when the ordinary pose stays idle',()=>{
 const subject=actor();advanceSpriteClock(subject);advanceSpriteClock(subject);assert.equal(subject.spriteClock.tick,1);
 subject.weaponPhaseIndex=1;advanceSpriteClock(subject);assert.equal(subject.spriteClock.tick,0);assert.equal(sampleSpriteClip(asset(),actorSpriteState(subject)).frameIndex,1);
});
test('missing SMG idle displays a labelled card without borrowing knife or handgun imagery',()=>{
 const art=asset(),state=previewSpriteState(keys[3],100);delete art.clips[keys[3]];
 assert.equal(sampleSpriteClip(art,state),null);
 const ctx=context(),cache={peek(){throw new Error('No unrelated image may be requested');},status(){throw new Error('No absent frame path may be accessed');}};
 const rendered=drawRasterMonster(ctx,fighter,0,0,{state,cache,registry:{[fighter.id]:art}});
 assert.equal(rendered.kind,'missing');assert.ok(ctx.calls.some(call=>call[0]==='fillText'&&call[1]==='POSE D’ARME À PRODUIRE'));assert.ok(!ctx.calls.some(call=>call[0]==='drawImage'));
});
test('a missing weapon idle blocks every state even when unscoped attack, KO and intro clips exist',()=>{
 const art=asset();delete art.clips[keys[3]];for(const key of ['neutralLight','ko','intro'])art.clips[key]=clip(0);
 const weaponContext=`${fighter.id}:weapon:smg`;
 for(const state of [{},{moveKey:'neutralLight'},{ko:true},{presentation:{key:'intro',frame:20}}])assert.equal(sampleSpriteClip(art,{weaponContext,...state,frame:20}),null);
});
test('unscoped knife action and KO clips cannot replace another equipped weapon idle',()=>{
 const art=asset();for(const key of ['neutralLight','ko','intro'])art.clips[key]=clip(0);
 const weaponContext=`${fighter.id}:weapon:handgun`;
 for(const state of [{moveKey:'neutralLight'},{ko:true},{presentation:{key:'intro',frame:20}}]){
  const sample=sampleSpriteClip(art,{weaponContext,...state,frame:20});assert.equal(sample.clipKey,keys[1]);assert.equal(sample.frameIndex,1);assert.equal(sample.tick,0);assert.equal(sample.fallback,true);
 }
});
test('missing actions and KO freeze the current weapon idle first image, never its animation',()=>{
 const art=asset();art.frames.push({...art.frames[3],path:'fixture-smg-second.png',sha256:'f'.repeat(64),pixelSHA256:'f'.repeat(64)});
 art.clips[keys[3]]={frames:[3,4],ticksPerFrame:6,loop:true};
 const weaponContext=`${fighter.id}:weapon:smg`;
 assert.equal(sampleSpriteClip(art,{weaponContext,frame:7}).frameIndex,4);
 for(const state of [{ko:true},{hurt:true},{phase:true},{moveKey:'neutralLight'},{presentation:{key:'loseMatch',frame:70}}]){
  const sample=sampleSpriteClip(art,{weaponContext,...state,frame:70});
  assert.equal(sample.clipKey,keys[3]);assert.equal(sample.frameIndex,3);assert.equal(sample.tick,0);assert.equal(sample.fallback,true);
  assert.equal(sample.fallbackReason,'missing-weapon-pose');
 }
 assert.equal(clipSummary(art,art.clips[keys[0]]).animated,false);
});
test('normal weapon rendering visibly marks a frozen missing attack without requiring diagnostic mode',()=>{
 const art=asset(),ctx=context(),image={fixture:true},cache={peek:()=>image};
 const rendered=drawRasterMonster(ctx,fighter,0,0,{state:{weaponContext:`${fighter.id}:weapon:smg`,moveKey:'neutralLight',frame:90},cache,registry:{[fighter.id]:art},shadow:false});
 assert.equal(rendered.kind,'raster');assert.equal(rendered.fallback,true);assert.equal(rendered.path,art.frames[3].path);
 assert.ok(ctx.calls.some(call=>call[0]==='fillText'&&call[1]==='POSE NEUTRALLIGHT À PRODUIRE'));
});
test('unknown phase identity or wrong edition cannot use the generic portrait as an armed actor',()=>{
 const subject=actor();subject.weaponPhaseIndex=99;
 assert.equal(sampleSpriteClip(asset(),actorSpriteState(subject)),null);
 assert.equal(sampleSpriteClip({...asset(),source:'film'},previewSpriteState(keys[0],0)),null);
 assert.equal(sampleSpriteClip(asset(),previewSpriteState(keys[0].replace(':knife',':invented'),0)),null);
 const other=actor();other.data={...fighter,source:'film'};assert.equal(actorSpriteState(other).weaponContext,undefined);
});
test('inspector preview round-trips the exact key without disguising it as an attack',()=>{
 for(const key of keys){const state=previewSpriteState(key,6.9);assert.equal(state.frame,6);assert.equal(state.moveKey,undefined);assert.equal(state.presentation,undefined);assert.equal(requestedSpriteClipKey(state),key);}
});
test('knife explicitly aliases generic idle while other weapons require distinct imported pixels',()=>{
 const original=asset();delete original.clips[keys[0]];const draft=structuredClone(original);draft.clips[keys[0]]=clip(0);
 const packet=clipPacket(fighter,original,draft,keys[0]);assert.equal(packet.previousClip,null);assert.deepEqual(packet.clip.frames,[0]);
 assert.equal(packet.source,'sh3');assert.equal(draft.fidelity,'unverified');
 for(const key of keys.slice(1))assert.throws(()=>validateClip(asset(),key,clip(0)),/image dédiée|partagée/);
 assert.throws(()=>validateClip(asset(),keys[2],clip(1)),/partagée/);
 assert.throws(()=>validateClip(asset(),'idle',clip(1)),/image dédiée/,'the generic portrait cannot be rewritten as a handgun alias');
});
test('re-encoded identical pixels and forged local pixel hashes cannot bypass weapon separation',()=>{
 const art=asset();art.frames[2].pixelSHA256=art.frames[1].pixelSHA256;
 assert.throws(()=>validateClip(art,keys[2],clip(2)),/partagée/);
 const original=asset(),draft=structuredClone(original);draft.frames[1].pixelSHA256='forged';draft.clips[keys[2]]=clip(1);
 assert.throws(()=>clipPacket(fighter,original,draft,keys[2]),/partagée/);
});
test('weapon clip exports retain immutable frame identities and the exact previous timeline',()=>{
 const original=asset(),draft=structuredClone(original);draft.clips[keys[2]].ticksPerFrame=9;
 const packet=clipPacket(fighter,original,draft,keys[2]);assert.deepEqual(packet.previousClip,original.clips[keys[2]]);packet.previousClip.frames[0]=0;
 assert.deepEqual(original.clips[keys[2]].frames,[2]);assert.deepEqual(packet.frameSet,original.frames.map(frame=>({path:frame.path,sha256:frame.sha256})));
 assert.throws(()=>clipPacket({...fighter,source:'film'},original,draft,keys[2]),/exactement/);
});
