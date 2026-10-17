/** Per-actor presentation clock. No random numbers, wall time or physics writes. */
import {PRESENTATION_KEYS} from './sprite-poses.js';
const presentationOf=state=>PRESENTATION_KEYS.includes(state?.presentation?.key)?state.presentation:null;
const frameTick=value=>Number.isFinite(value)?Math.max(0,Math.floor(value)):0;
export function actorSpriteState(actor){
 const state={ko:!!actor.ko,hurt:actor.hurtFrames>0,phase:actor.phaseLock>0,
  knockdown:actor.knockdownTimer>0,dodging:actor.state==='dodge'||actor.dodgeFrames>0,
  blocking:!!actor.blocking,crouching:!!actor.crouching,airborne:!actor.grounded,
  moving:actor.state==='walk',moveKey:actor.attack?.key||actor.attack?.move?.key,
  frame:actor.spriteClock?.tick??0,hitFlash:actor.hitFlash>0};
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
 const pose=poseFromState(actorSpriteState(actor));
 const presentation=presentationOf(actor);
 const identity=presentation?`${pose}:presentation:${presentation.id??presentation.sequenceId??''}`:pose+':'+(actor.attack?.id??'');
 actor.spriteClock={identity,pose,tick:presentation?frameTick(presentation.frame):actor.spriteClock?.identity===identity?actor.spriteClock.tick+1:0};
}
export function sampleSpriteClip(art,state={}){
 if(!art)return null;
 const requested=poseFromState(state),has=key=>Object.prototype.hasOwnProperty.call(art.clips||{},key);
 const pose=has(requested)?requested:'idle',clip=has(pose)?art.clips[pose]:null;
 if(!clip?.frames?.length)return null;
 const durations=clip.frameTicks||clip.frames.map(()=>clip.ticksPerFrame||1);
 const total=durations.reduce((n,t)=>n+t,0);
 if(!Number.isSafeInteger(total)||total<1)return null;
 // The engine's shared sequence tick also drives direct inspector samples.
 // No clip may read an obsolete attack clock after a round/finisher transition.
 let tick=frameTick(presentationOf(state)?.frame??state.frame);
 tick=clip.loop?tick%total:Math.min(tick,total-1);
 let index=0,elapsed=0;while(index<durations.length-1&&tick>=elapsed+durations[index])elapsed+=durations[index++];
 const frameIndex=clip.frames[index],frame=art.frames[frameIndex];
 return frame?{requested,pose,fallback:pose!==requested,frame,frameIndex,index,tick,total,ticks:durations[index]}:null;
}
