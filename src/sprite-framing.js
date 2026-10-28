import {bodyBox} from './combat-geometry.js';
import {spriteFor,rasterPlacement} from './sprite-system.js';
import {actorSpriteState} from './sprite-animation.js';
export function visibleSpriteBox(fighter,frame,x,y,facing=1,state){
 return spriteBox(fighter,frame,x,y,facing,state,frame.visibleBounds);
}
/** Include faint tips connected to the readable subject, without distant
 * low-alpha noise driving the zoom. This cannot attest absent source anatomy.
 */
export function completeSpriteBox(fighter,frame,x,y,facing=1,state){
 return spriteBox(fighter,frame,x,y,facing,state,frame.framingBounds||frame.visibleBounds);
}
function spriteBox(fighter,frame,x,y,facing,state,bounds){
 const p=rasterPlacement(fighter,frame,x,y,facing,state),b=bounds||[0,0,frame.width,frame.height];
 const local=p.localX+b[0]*p.scale,width=(b[2]-b[0])*p.scale;
 return {x:p.flip>0?x+local:x-local-width,y:p.y+b[1]*p.scale,w:width,h:(b[3]-b[1])*p.scale};
}
/** Fit the entire clip envelope, not just the current pose, to avoid frame-by-frame zoom pumping.
 * The same matrix must be applied to scenery, actors, hitboxes, projectiles and hazard geometry.
 * HUD stays in screen space. Physical actor coordinates and collision boxes never change.
 */
export function combatFraming(actors,{width=1280,floor=594,top=132,bottom=694,margin=18,screenMargin=10,registry}={}){
 let left=0,right=width,upper=top,lower=floor;
 for(const actor of actors){
  const art=spriteFor(actor.data||actor,registry),boxes=art?.frames?.length?
   art.frames.map(f=>completeSpriteBox(actor.data||actor,f,actor.x,actor.y,actor.facing,actorSpriteState(actor))):[bodyBox(actor)];
  for(const b of boxes){if(![b.x,b.y,b.w,b.h].every(Number.isFinite))continue;
   left=Math.min(left,b.x-margin);right=Math.max(right,b.x+b.w+margin);
   upper=Math.min(upper,b.y-margin);lower=Math.max(lower,b.y+b.h+margin);
  }
 }
 // A fixed screen-space reserve also contains the engine's largest shake
 // (9px horizontally, 4.5px vertically) when very large bodies force a zoom-out.
 const scale=Math.min(1,(width-screenMargin*2)/(right-left),(floor-top-screenMargin)/Math.max(1,floor-upper),(bottom-floor-screenMargin)/Math.max(1,lower-floor));
 return {scale,x:width/2-(left+right)*scale/2,y:floor*(1-scale),bounds:{left,right,upper,lower}};
}
export function toScreen(box,camera){return {x:box.x*camera.scale+camera.x,y:box.y*camera.scale+camera.y,w:box.w*camera.scale,h:box.h*camera.scale};}
