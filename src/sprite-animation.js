/** Per-actor presentation clock. No random numbers, wall time or physics writes. */
export function actorSpriteState(actor){
 const state={ko:!!actor.ko,hurt:actor.hurtFrames>0,phase:actor.phaseLock>0,
  knockdown:actor.knockdownTimer>0,dodging:actor.state==='dodge'||actor.dodgeFrames>0,
  blocking:!!actor.blocking,crouching:!!actor.crouching,airborne:!actor.grounded,
  moving:actor.state==='walk',moveKey:actor.attack?.key||actor.attack?.move?.key,
  frame:actor.spriteClock?.tick??0,hitFlash:actor.hitFlash>0};
 if(actor.attack&&poseFromState(state)===state.moveKey)state.frame=actor.attack.frame;
 return state;
}
export function poseFromState(s={}){
 if(s.ko)return 'ko';if(s.phase)return 'phase';if(s.knockdown)return 'knockdown';if(s.hurt)return 'hurt';
 if(s.moveKey)return s.moveKey;if(s.dodging)return 'dodge';if(s.blocking)return 'guard';
 if(s.crouching)return 'crouch';if(s.airborne)return 'jump';if(s.moving)return 'walk';return 'idle';
}
export function advanceSpriteClock(actor){
 const pose=poseFromState(actorSpriteState(actor));
 const identity=pose+':'+(actor.attack?.id??'');
 actor.spriteClock={identity,pose,tick:actor.spriteClock?.identity===identity?actor.spriteClock.tick+1:0};
}
export function sampleSpriteClip(art,state={}){
 if(!art)return null;
 const requested=poseFromState(state),has=key=>Object.prototype.hasOwnProperty.call(art.clips||{},key);
 const pose=has(requested)?requested:'idle',clip=has(pose)?art.clips[pose]:null;
 if(!clip?.frames?.length)return null;
 const durations=clip.frameTicks||clip.frames.map(()=>clip.ticksPerFrame||1);
 const total=durations.reduce((n,t)=>n+t,0);
 if(!Number.isSafeInteger(total)||total<1)return null;
 let tick=Number.isFinite(state.frame)?Math.max(0,Math.floor(state.frame)):0;
 tick=clip.loop?tick%total:Math.min(tick,total-1);
 let index=0,elapsed=0;while(index<durations.length-1&&tick>=elapsed+durations[index])elapsed+=durations[index++];
 const frameIndex=clip.frames[index],frame=art.frames[frameIndex];
 return frame?{requested,pose,fallback:pose!==requested,frame,frameIndex,index,tick,total,ticks:durations[index]}:null;
}
