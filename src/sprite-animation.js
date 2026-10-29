/** Per-actor presentation clock. No random numbers, wall time or physics writes. */
import {PRESENTATION_KEYS,validSpriteClipKey} from './sprite-poses.js';
import {ALESSA_FIGHTER_ID,weaponPhase} from './weapon-phases.js';
const presentationOf=state=>PRESENTATION_KEYS.includes(state?.presentation?.key)?state.presentation:null;
const frameTick=value=>Number.isFinite(value)?Math.max(0,Math.floor(value)):0;
export function actorSpriteState(actor){
 const state={ko:!!actor.ko,hurt:actor.hurtFrames>0,phase:actor.phaseLock>0,
  knockdown:actor.knockdownTimer>0,dodging:actor.state==='dodge'||actor.dodgeFrames>0,
  blocking:!!actor.blocking,crouching:!!actor.crouching,airborne:!actor.grounded,
  moving:actor.state==='walk',moveKey:actor.attack?.key||actor.attack?.move?.key,
  frame:actor.spriteClock?.tick??0,hitFlash:actor.hitFlash>0};
 if(actor.data?.id===ALESSA_FIGHTER_ID&&actor.data.source==='sh3')state.weaponContext=`${ALESSA_FIGHTER_ID}:weapon:${weaponPhase(actor)?.id||'unavailable'}`;
 const presentation=presentationOf(actor);
 if(presentation){
  state.presentation={...presentation};
  state.frame=frameTick(presentation.frame);
 }else if(actor.attack&&poseFromState(state)===state.moveKey)state.frame=actor.attack.frame;
 return state;
}
export function poseFromState(s={}){
 const presentation=presentationOf(s);if(presentation)return presentation.key;
 if(s.ko)return 'ko';if(s.phase)return 'phase';if(s.knockdown)return 'knockdown';if(s.hurt)return 'hurt';
 if(s.moveKey)return s.moveKey;if(s.dodging)return 'dodge';if(s.blocking)return 'guard';
 if(s.crouching)return 'crouch';if(s.airborne)return 'jump';if(s.moving)return 'walk';return 'idle';
}
export function advanceSpriteClock(actor){
 const state=actorSpriteState(actor),pose=poseFromState(state);
 const presentation=presentationOf(actor);
 const identity=presentation?`${pose}:presentation:${presentation.id??presentation.sequenceId??''}`:pose+':'+(actor.attack?.id??'')+':'+(state.weaponContext||'');
 actor.spriteClock={identity,pose,tick:presentation?frameTick(presentation.frame):actor.spriteClock?.identity===identity?frameTick(actor.spriteClock.tick)+1:0};
}
export function requestedSpriteClipKey(state={}){
 const pose=poseFromState(state),presentation=presentationOf(state);
 return presentation?.clipKey||(presentation?.contextId?`${pose}@${presentation.contextId}`:pose==='idle'&&state.weaponContext!==undefined?`idle@${state.weaponContext}`:pose);
}
export function sampleSpriteClip(art,state={}){
 if(!art)return null;
 const requestedPose=poseFromState(state),requested=requestedSpriteClipKey(state),presentation=presentationOf(state);
 const has=key=>Object.prototype.hasOwnProperty.call(art.clips||{},key)&&(!presentation||art.clips[key]?.loop===false);
 const idle=state.weaponContext!==undefined?`idle@${state.weaponContext}`:'idle';
 // An exact weapon context can never borrow the portrait's generic knife.
 if(state.weaponContext!==undefined&&(!validSpriteClipKey(idle,art)||!Object.prototype.hasOwnProperty.call(art.clips||{},idle)||!art.clips[idle]?.frames?.length))return null;
 const validContext=!requested.includes('@')||validSpriteClipKey(requested,art);
 const strictContext=Boolean(presentation?.contextId||requested.includes('@'))&&['finisher','finished'].includes(requestedPose);
 // A genuine final KO may show its dedicated core image while its composed
 // loss presentation is still missing. TIME, reversible rounds and finishers
 // retain their own image contracts and never acquire a death pose this way.
 const finalKo=state.ko===true&&state.airborne===false&&presentation?.key==='loseMatch'&&validContext&&
  (!presentation.contextId||presentation.contextId===`${art.fighterId}:loseMatch`)&&has('ko');
 // This SH3 contract currently provides four weapon idles only. Generic attack,
 // KO or presentation art has no weapon identity and cannot dress another phase.
 const pose=state.weaponContext!==undefined?idle:validContext&&has(requested)?requested:!strictContext&&requestedPose!=='idle'&&has(requestedPose)?requestedPose:finalKo?'ko':idle;
 const clip=Object.prototype.hasOwnProperty.call(art.clips||{},pose)?art.clips[pose]:null;
 if(!Array.isArray(clip?.frames)||!clip.frames.length)return null;
 if(typeof clip.loop!=='boolean')return null;
 const durations=clip.frameTicks??clip.frames.map(()=>clip.ticksPerFrame);
 if(!Array.isArray(durations)||durations.length!==clip.frames.length||durations.some(t=>!Number.isSafeInteger(t)||t<1||t>600))return null;
 const total=durations.reduce((n,t)=>n+t,0);
 if(!Number.isSafeInteger(total)||total<1||total>36000)return null;
 // The engine's shared sequence tick also drives direct inspector samples.
 // No clip may read an obsolete attack clock after a round/finisher transition.
 let tick=frameTick(presentationOf(state)?.frame??state.frame);
 // A newly animated idle must not masquerade as a missing death, hit or attack.
 // Hold its first image while preserving the explicit missing-pose result.
 if(pose===idle&&pose!==requested)tick=0;
 tick=clip.loop?tick%total:Math.min(tick,total-1);
 let index=0,elapsed=0;while(index<durations.length-1&&tick>=elapsed+durations[index])elapsed+=durations[index++];
 const frameIndex=clip.frames[index],frame=Array.isArray(art.frames)&&Number.isSafeInteger(frameIndex)&&frameIndex>=0?art.frames[frameIndex]:null;
 return frame?{requested,pose,requestedPose,requestedClipKey:requested,clipKey:pose,fallback:pose!==requested,
  fallbackReason:pose===requested?null:state.weaponContext!==undefined&&pose===idle?'missing-weapon-pose':strictContext?'missing-contextual-finisher':pose==='ko'&&finalKo?'core-ko-final-defeat':pose===requestedPose?'generic-presentation':'missing-presentation',
  frame,frameIndex,index,tick,total,ticks:durations[index]}:null;
}
