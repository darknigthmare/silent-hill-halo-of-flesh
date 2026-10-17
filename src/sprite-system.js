/** Raster-only monster presentation. Combat geometry is deliberately unchanged. */
import { SPRITES } from './sprite-manifest.js';
import {poseFromState,sampleSpriteClip} from './sprite-animation.js';
import { bodyProfile } from './combat-geometry.js';
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,Number.isFinite(v)?v:lo));
export const assetURL=path=>new URL('../'+path,import.meta.url).href;
export function spriteFor(fighter,registry=SPRITES){
  const id=typeof fighter==='string'?fighter: fighter?.id;
  const art=typeof id==='string'&&own(registry,id)?registry[id]:null;
  if(!art||art.fighterId!==id||typeof fighter==='object'&&fighter.source!==art.source)return null;
  return art;
}
export function spriteStatus(fighter){
  const art=spriteFor(fighter);
  return art?{kind:'candidate',label:'IMAGE INTÉGRÉE · FIDÉLITÉ À VALIDER',frames:art.frames.length,animatedClips:art.animatedClips||0}
    :{kind:'missing',label:'SPRITE À PRODUIRE',frames:0,animatedClips:0};
}
export function spriteCoverage(fighters){
  const missing=fighters.filter(f=>!spriteFor(f));
  return {total:fighters.length,integrated:fighters.length-missing.length,missing:missing.map(f=>f.id),
    certified:fighters.filter(f=>spriteFor(f)?.fidelity==='verified').length,
    animatedClips:fighters.reduce((n,f)=>n+(spriteFor(f)?.animatedClips||0),0)};
}
export const poseKey=poseFromState;
export function frameFor(art,state={}){return sampleSpriteClip(art,state)?.frame||null;}
export function rasterPlacement(fighter,frame,x,y,facing=1){
  const body=bodyProfile(fighter),scale=body.height*body.scale/(frame.height*frame.bodyHeight);
  const width=frame.width*scale,height=frame.height*scale,flip=(facing<0?-1:1)*frame.facing;
  const localX=-frame.anchor[0]*width,localY=-frame.anchor[1]*height-(body.bottom||0)*body.scale;
  return {x:flip>0?x+localX:x-localX-width,y:y+localY,width,height,flip,localX,localY,scale};
}
/** Small concurrency/decoded-memory budget. No DOM objects or network at module evaluation. */
export class SpriteCache{
  constructor({createImage=()=>new Image(),url=assetURL,concurrency=4,maxBytes=64*1024*1024,timeout=12000}={}){
    this.createImage=createImage;this.url=url;this.concurrency=concurrency;this.maxBytes=maxBytes;this.timeout=timeout;
    this.entries=new Map();this.queue=[];this.active=0;this.clock=0;this.bytes=0;this.reservedBytes=0;this.pins=new Set();this.pumping=false;
  }
  peek(path){const e=this.entries.get(path);if(e?.status==='ready'){e.used=++this.clock;return e.image;}return null;}
  status(path){return this.entries.get(path)?.status||'absent';}
  pin(frames=[]){
    const unique=new Map(frames.map(frame=>{const f=typeof frame==='string'?this.entries.get(frame)?.frame:frame;
      if(!f)throw new RangeError('Pinning requires frame dimensions.');return [f.path,f];}));
    const required=[...unique.values()].reduce((n,frame)=>n+frame.width*frame.height*4,0);
    if(!Number.isSafeInteger(required)||required<0||required>this.maxBytes)
      throw new RangeError('Combat sprite set exceeds the decoded-memory budget.');
    // Validate the entire set before replacing the previous lease; mirrored fighters share one image.
    this.pins=new Set(unique.keys());this.evict();this.pump();
  }
  evict(extra=0){for(const [key,e] of [...this.entries].sort((a,b)=>a[1].used-b[1].used)){
    if(this.bytes+this.reservedBytes+extra<=this.maxBytes)break;
    if(e.status==='ready'&&!this.pins.has(key)){this.bytes-=e.bytes;this.entries.delete(key);}
  }}
  load(frame,{retry=false}={}){
    if(!frame)return Promise.resolve(null);
    let e=this.entries.get(frame.path);
    if(e&&!(retry&&e.status==='error')){e.used=++this.clock;return e.promise;}
    e={status:'queued',image:null,bytes:0,used:++this.clock,error:null,frame};
    e.promise=new Promise(resolve=>{e.resolve=resolve;});this.entries.set(frame.path,e);
    const bytes=frame.width*frame.height*4;
    if(!Number.isSafeInteger(bytes)||bytes<=0||bytes>this.maxBytes){e.status='error';e.error='memory-budget';e.resolve(null);return e.promise;}
    this.queue.push({frame,e});this.pump();return e.promise;
  }
  pump(){if(this.pumping)return;this.pumping=true;
   try{while(this.active<this.concurrency&&this.queue.length){
    const {frame,e}=this.queue[0],bytes=frame.width*frame.height*4;this.evict(bytes);
    if(this.bytes+this.reservedBytes+bytes>this.maxBytes){
      // Wait for active decoders; if only pins prevent progress, fail explicitly instead of deadlocking.
      if(this.active)break;
      this.queue.shift();e.status='error';e.error='memory-budget';e.resolve(null);continue;
    }
    this.queue.shift();this.active++;this.reservedBytes+=bytes;e.status='loading';
    let image,timer,done=false;
    const finish=(ok,error=null)=>{if(done)return;done=true;clearTimeout(timer);
      if(image){image.onload=null;image.onerror=null;}
      e.status=ok?'ready':'error';e.error=error;e.image=ok?image:null;e.bytes=ok?frame.width*frame.height*4:0;
      this.bytes+=e.bytes;this.reservedBytes-=bytes;this.active--;e.resolve(e.image);this.evict();this.pump();};
    try{image=this.createImage();image.decoding='async';
      timer=setTimeout(()=>finish(false,'timeout'),this.timeout);
      image.onerror=()=>finish(false,'load-error');
      image.onload=async()=>{try{
        if(typeof image.decode==='function')await image.decode();
        const w=image.naturalWidth||image.width,h=image.naturalHeight||image.height;
        if(w!==frame.width||h!==frame.height)return finish(false,'dimension-mismatch');
        finish(true);
      }catch{finish(false,'decode-error');}};
      image.src=this.url(frame.path);
    }catch{finish(false,'image-unavailable');}
   }}finally{this.pumping=false;}
  }
  async prepare(fighters,{retry=true,diagnostic=false}={}){
    const unique=[...new Map(fighters.filter(Boolean).map(f=>[f.id,f])).values()];
    const missing=unique.filter(f=>!spriteFor(f));
    if(missing.length&&!diagnostic)return {ok:false,missing:missing.map(f=>f.id),failed:[]};
    const descriptors=unique.flatMap(f=>spriteFor(f)?.frames||[]);
    // Keep booleans, never a long-lived array of decoded images: a run may exceed the LRU budget.
    // Only its current pair is pinned and loaded again immediately before the engine starts.
    const decoded=await Promise.all(descriptors.map(f=>this.load(f,{retry}).then(Boolean)));
    const failed=descriptors.filter((f,i)=>!decoded[i]).map(f=>f.path);
    return {ok:diagnostic||(!missing.length&&!failed.length),missing:missing.map(f=>f.id),failed};
  }
}
export const spriteCache=new SpriteCache();
export function pinCombatSprites(fighters){spriteCache.pin(fighters.flatMap(f=>spriteFor(f)?.frames||[]));}
function drawMissing(ctx,x,y,width,height,text){
  ctx.save();ctx.fillStyle='rgba(12,15,13,.88)';ctx.fillRect(x,y,width,height);
  ctx.strokeStyle='rgba(153,126,103,.5)';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,width-1,height-1);
  ctx.textAlign='center';ctx.fillStyle='#c6beb0';ctx.font=`600 ${Math.max(9,Math.min(14,width/13))}px system-ui`;
  ctx.fillText(text,x+width/2,y+height*.5,width-12);ctx.restore();
}
export function drawRasterMonster(ctx,fighter,x,y,{facing=1,state={},alpha=1,shadow=true,diagnostic=false,cache=spriteCache,registry=SPRITES}={}){
  if(!fighter)return {kind:'missing'};
  const art=spriteFor(fighter,registry),sample=sampleSpriteClip(art,state),frame=sample?.frame,image=frame&&cache.peek(frame.path);
  if(!image){const p=bodyProfile(fighter),w=Math.max(74,p.width*p.scale),h=p.height*p.scale;
    drawMissing(ctx,x-w/2,y-h,w,h,!art?'VISUEL À PRODUIRE':cache.status(frame.path)==='error'?'IMAGE INDISPONIBLE':'CHARGEMENT IMAGE');
    // Request only once. A failed file is retried by preflight, not every render frame.
    if(frame&&cache.status(frame.path)==='absent')void cache.load(frame);
    return {kind:!art?'missing':cache.status(frame.path)==='error'?'error':'loading'};
  }
  const p=rasterPlacement(fighter,frame,x,y,facing);
  ctx.save();ctx.globalAlpha=clamp(alpha,0,1);
  if(shadow){ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(x,y+3,bodyProfile(fighter).push*bodyProfile(fighter).scale*.55,8,0,0,Math.PI*2);ctx.fill();}
  ctx.translate(x,y);ctx.scale(p.flip,1);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  // No squash/stretch, polygon limbs, hue-swapped clones, or rotating a standing image into a fake death frame.
  if(state.hitFlash){ctx.shadowColor='#ddd8c7';ctx.shadowBlur=10;}
  ctx.drawImage(image,p.localX,p.localY,p.width,p.height);ctx.restore();
  if(diagnostic&&sample.fallback){ctx.save();ctx.fillStyle='#d2c9b8';ctx.textAlign='center';ctx.font='11px system-ui';ctx.fillText('POSE '+sample.requested.toUpperCase()+' À PRODUIRE',x,y+22);ctx.restore();}
  return {kind:'raster',path:frame.path,pose:sample.pose,requestedClipKey:sample.requested,fallback:sample.fallback,...p};
}
const portraitRequests=new WeakMap();
export function paintRasterPortrait(canvas,fighter,{background=true,facing=1,cache=spriteCache,registry=SPRITES}={}){
  if(!fighter||!canvas)return;
  const token={},art=spriteFor(fighter,registry),frame=art?.portrait||frameFor(art),ctx=canvas.getContext('2d');
  portraitRequests.set(canvas,token);
  const paint=()=>{if(portraitRequests.get(canvas)!==token)return;
    const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);
    if(background){const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,'#272b25');g.addColorStop(1,'#080b09');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);}
    const image=frame&&cache.peek(frame.path);
    if(image){const b=frame.visibleBounds||[0,0,frame.width,frame.height],sw=b[2]-b[0],sh=b[3]-b[1],scale=Math.max(.01,Math.min((w-12)/sw,(h-12)/sh)),dw=sw*scale,dh=sh*scale;
      ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.translate(w/2,h/2);ctx.scale((facing<0?-1:1)*(frame.facing??art.frames.find(f=>f.path===frame.path)?.facing??1),1);ctx.drawImage(image,b[0],b[1],sw,sh,-dw/2,-dh/2,dw,dh);ctx.restore();
    }else drawMissing(ctx,5,5,Math.max(20,w-10),Math.max(20,h-10),!art?'SPRITE À PRODUIRE':cache.status(frame.path)==='error'?'IMAGE INDISPONIBLE':'CHARGEMENT');
    if(canvas.dataset){canvas.dataset.spriteId=fighter.id;canvas.dataset.artStatus=!art?'missing':image?'raster':cache.status(frame.path);}
    canvas.setAttribute?.('role','img');canvas.setAttribute?.('aria-label',fighter.name+' — '+spriteStatus(fighter).label);
  };
  paint();if(frame&&cache.status(frame.path)!=='ready')void cache.load(frame).then(paint);
}
