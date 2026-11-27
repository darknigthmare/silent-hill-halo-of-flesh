/**
 * Reviewed muzzle points on two exact static candidate PNGs.
 * These are versus placement measurements, not original-game geometry or VFX.
 * Physics and rendering consume the same origin; image decoding/network state
 * never participates in projectile simulation.
 */
import {SPRITES} from './sprite-manifest.js';
import {actorSpriteState,sampleSpriteClip} from './sprite-animation.js';
import {combatSpriteFor,rasterPlacement,validSpriteCalibration} from './sprite-system.js';
import {bodyBox} from './combat-geometry.js';

export const PROJECTILE_ORIGIN_REFERENCES=Object.freeze({
  sh4_man_with_the_coat_067:Object.freeze({
    source:'sh4',moveKey:'neutralSpecial',frameIndex:1,width:1024,height:1536,facing:1,
    path:'assets/sprites/sh4_man_with_the_coat_067.d0c7d825135e.png',
    sha256:'d0c7d825135ea5f9d6f05f5e23a94d21fd933abfe7621d74a7eb6d438a64c089',
    muzzlePixels:Object.freeze([986,300])
  }),
  sh2_eddie_dombrowski_032:Object.freeze({
    source:'sh2',moveKey:'neutralSpecial',frameIndex:1,width:1024,height:1536,facing:1,
    path:'assets/sprites/sh2_eddie_dombrowski_032.e691299ab326.png',
    sha256:'e691299ab326b510f72029062963aaf3cacbff7fbad2bd78fb97d5e2a4297321',
    muzzlePixels:Object.freeze([997,261])
  })
});

export function spriteProjectileOrigin(actor,move,{registry=SPRITES}={}){
  const id=actor?.data?.id,reference=Object.hasOwn(PROJECTILE_ORIGIN_REFERENCES,id||'')?PROJECTILE_ORIGIN_REFERENCES[id]:null;
  const attack=actor?.attack;
  if(!reference||actor.data.source!==reference.source||move?.key!==reference.moveKey||
    move.enabled!==true||move.projectile!==true||move.trap||move.projectileCount!==1||
    actor.profile?.moves?.[move.key]!==move||attack?.move!==move||attack.key!==move.key||
    !Number.isFinite(attack.frame)||attack.frame<move.startup||attack.frame>=move.startup+move.active||
    actor.grounded!==true||actor.crouching===true||![1,-1].includes(actor.facing)||
    ![actor.x,actor.y].every(Number.isFinite))return null;
  const art=combatSpriteFor(actor.data,registry),clip=art?.clips?.[move.key];
  if(!clip||clip.loop!==false||clip.frames?.length!==1||clip.frames[0]!==reference.frameIndex)return null;
  const state=actorSpriteState(actor),sample=sampleSpriteClip(art,state),frame=sample?.frame;
  if(!sample||sample.fallback||sample.pose!==move.key||sample.frameIndex!==reference.frameIndex||
    frame.path!==reference.path||frame.sha256!==reference.sha256||
    frame.width!==reference.width||frame.height!==reference.height||frame.facing!==reference.facing||
    !validSpriteCalibration(frame))return null;

  const placement=rasterPlacement(actor.data,frame,actor.x,actor.y,actor.facing,state);
  const [mx,my]=reference.muzzlePixels;
  const x=actor.x+placement.flip*(placement.localX+mx*placement.scale);
  const y=actor.y+placement.localY+my*placement.scale;
  const body=bodyBox(actor),forward=(x-actor.x)*actor.facing;
  if(![x,y,body.w,forward].every(Number.isFinite)||body.w<=0||forward<=0)return null;
  // At point blank the gun may overlap a hurtbox. Sweep this emission segment
  // once so a shot cannot appear beyond that target without contact. Afterwards
  // only the actual moving projectile is tested. The same height is used for
  // both segments: a short/crouching target can still be below the barrel.
  const emissionSweepFrom={x:actor.x+actor.facing*Math.min(body.w*.45,forward),y};
  return {x,y,emissionSweepFrom,launchOrigin:{
    kind:'reviewed-sprite-muzzle',fighterId:id,source:reference.source,moveKey:move.key,
    framePath:frame.path,frameSHA256:frame.sha256,muzzlePixels:[mx,my],x,y
  }};
}
