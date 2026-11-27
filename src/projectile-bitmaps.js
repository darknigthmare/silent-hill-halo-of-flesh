/** Optional projectile artwork; never changes combat timing, physics or collision. */
import {PROJECTILE_BITMAPS} from './projectile-bitmap-manifest.js';
import {SpriteCache} from './sprite-system.js';

export const PROJECTILE_BITMAP_BUDGET=32*1024*1024;
const own=(object,key)=>Object.prototype.hasOwnProperty.call(object,key);
const fail=message=>{throw new Error('Projectile bitmap: '+message);};
const idPattern=/^[a-z0-9][a-z0-9_.-]{0,119}$/;

export function validateProjectileBitmap(art){
  if(!art||![art.id,art.fighterId,art.source].every(value=>typeof value==='string'&&idPattern.test(value)))fail('invalid identity');
  if(art.status!=='integrated-candidate'||art.fidelity!=='unverified')fail('unsupported provenance');
  if(!Array.isArray(art.slots)||!art.slots.length||art.slots.length>20||new Set(art.slots).size!==art.slots.length||
    art.slots.some(slot=>typeof slot!=='string'||!/^[a-zA-Z][a-zA-Z0-9]{0,39}$/.test(slot)))fail('invalid exact slots');
  if(!Array.isArray(art.referenceIds)||!art.referenceIds.length||art.referenceIds.some(id=>typeof id!=='string'||!id))fail('missing source references');
  const frame=art.frame;
  if(!frame||!/^assets\/projectiles\/[a-z0-9_.-]+\.png$/.test(frame.path)||
    !frame.path.startsWith('assets/projectiles/'+art.id+'.')||!/^[a-f0-9]{64}$/.test(frame.sha256)||
    !frame.path.endsWith('.'+frame.sha256.slice(0,12)+'.png'))fail('unsafe/unversioned PNG');
  if(!Number.isSafeInteger(frame.bytes)||frame.bytes<1||frame.bytes>24*1024*1024||
    ![frame.width,frame.height].every(n=>Number.isSafeInteger(n)&&n>0&&n<=4096)||
    frame.width*frame.height*4>PROJECTILE_BITMAP_BUDGET)fail('invalid or oversized frame');
  const bounds=frame.framingBounds;
  if(bounds!==undefined&&(!Array.isArray(bounds)||bounds.length!==4||!bounds.every(Number.isSafeInteger)||
    bounds[0]<0||bounds[1]<0||bounds[2]>frame.width||bounds[3]>frame.height||
    bounds[2]<=bounds[0]||bounds[3]<=bounds[1]))fail('invalid framing bounds');
  const p=art.presentation;
  if(!p||!Number.isFinite(p.heightInRadii)||p.heightInRadii<1||p.heightInRadii>8||
    !['center','ground'].includes(p.anchor)||![-1,1].includes(p.facing)||
    !['source-over','screen'].includes(p.composite))fail('invalid presentation');
  if(p.groundBaseline!==undefined&&(p.anchor!=='ground'||!Number.isFinite(p.groundBaseline)||p.groundBaseline<=0||p.groundBaseline>1||
    bounds&&(p.groundBaseline*frame.height<bounds[1]||p.groundBaseline*frame.height>bounds[3])))fail('invalid native floor baseline');
  return art;
}

/** Reject duplicate owner/slot routes instead of choosing an arbitrary effect. */
export function validateProjectileRegistry(registry=PROJECTILE_BITMAPS){
  if(!registry||typeof registry!=='object'||Array.isArray(registry))fail('invalid registry');
  const routes=new Set(),paths=new Map();
  for(const [id,art] of Object.entries(registry)){
    validateProjectileBitmap(art);
    if(art.id!==id)fail('registry identity mismatch');
    for(const slot of art.slots){
      const route=JSON.stringify([art.fighterId,art.source,slot]);
      if(routes.has(route))fail('ambiguous owner/source/slot');routes.add(route);
    }
    const signature=JSON.stringify([art.frame.sha256,art.frame.bytes,art.frame.width,art.frame.height]);
    if(paths.has(art.frame.path)&&paths.get(art.frame.path)!==signature)fail('conflicting frame descriptors');
    paths.set(art.frame.path,signature);
  }
  return registry;
}

export function projectileBitmapFor(fighter,move,registry=PROJECTILE_BITMAPS){
  if(!fighter||!move?.projectile||move.trap||move.enabled===false)return null;
  const matches=Object.entries(registry).filter(([,art])=>art?.fighterId===fighter.id&&art.source===fighter.source&&art.slots?.includes(move.key));
  if(matches.length>1)fail('ambiguous owner/source/slot');
  if(!matches.length)return null;
  const [id,art]=matches[0];
  if(!own(registry,id)||art.id!==id)fail('registry identity mismatch');
  return validateProjectileBitmap(art);
}

export function projectileBitmapFrames(fighters,registry=PROJECTILE_BITMAPS){
  validateProjectileRegistry(registry);
  const owners=new Set(fighters.filter(Boolean).map(f=>JSON.stringify([f.id,f.source])));
  return [...new Map(Object.values(registry).filter(art=>owners.has(JSON.stringify([art.fighterId,art.source])))
    .map(art=>[art.frame.path,art.frame])).values()];
}

/** A separate unpinned LRU cannot evict fighter/stage leases or grow without bound. */
export const projectileBitmapCache=new SpriteCache({maxBytes:PROJECTILE_BITMAP_BUDGET,concurrency:2});
export async function prepareProjectileBitmaps(fighters,{cache=projectileBitmapCache,registry=PROJECTILE_BITMAPS,retry=true}={}){
  let frames;
  try{frames=projectileBitmapFrames(fighters,registry);}catch(error){return {ok:false,failed:['projectile-descriptor'],error:String(error.message)};}
  const decoded=await Promise.all(frames.map(frame=>cache.load(frame,{retry}).then(Boolean)));
  const failed=frames.filter((frame,index)=>!decoded[index]).map(frame=>frame.path);
  return {ok:failed.length===0,failed};
}

/** Position against the projectile that actually exists, never against the current caster. */
export function projectileBitmapPlacement(projectile,art){
  const {x,y,radius,vx}=projectile;
  if(![x,y,radius,vx].every(Number.isFinite)||radius<=0)return null;
  const {frame,presentation:p}=art;
  const [left,top,right,bottom]=frame.framingBounds||[0,0,frame.width,frame.height];
  const sw=right-left,sh=bottom-top;
  // Long effects retain their aspect ratio and a bounded visual footprint.
  const scale=Math.min(radius*p.heightInRadii/sh,radius*12/sw),width=sw*scale,height=sh*scale;
  if(p.anchor==='ground'&&!Number.isFinite(projectile.groundY))return null;
  const baseY=p.anchor==='ground'?projectile.groundY+radius:y;
  // A flame's bright contact line can sit above its translucent glow.
  const floorOffset=p.groundBaseline===undefined?sh:p.groundBaseline*frame.height-top;
  const direction=Math.sign(vx)||Math.sign(projectile.owner?.facing)||1;
  return {x,y:baseY,width,height,flip:direction*p.facing,
    source:[left,top,sw,sh],localX:-width/2,localY:p.anchor==='ground'?-floorOffset*scale:-height/2};
}

/** Return non-raster status for the engine's existing visible fallback. */
export function drawProjectileBitmap(context,projectile,{cache=projectileBitmapCache,registry=PROJECTILE_BITMAPS}={}){
  let art;
  try{art=projectileBitmapFor(projectile?.owner?.data,projectile?.move,registry);}
  catch(error){return {kind:'error',error:String(error.message)};}
  if(!art)return {kind:'unregistered'};
  const placement=projectileBitmapPlacement(projectile,art);
  if(!placement)return {kind:'error',error:'invalid projectile placement'};
  const image=cache.peek(art.frame.path);
  if(!image){
    // One attempt only during rendering. A new match explicitly permits a retry.
    if(cache.status(art.frame.path)==='absent')void cache.load(art.frame);
    return {kind:cache.status(art.frame.path)==='error'?'error':'loading',path:art.frame.path};
  }
  context.save();
  try{
    context.translate(placement.x,placement.y);context.scale(placement.flip,1);
    context.globalCompositeOperation=art.presentation.composite;
    context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';
    context.drawImage(image,...placement.source,placement.localX,placement.localY,placement.width,placement.height);
  }catch(error){
    return {kind:'error',path:art.frame.path,error:String(error.message)};
  }finally{context.restore();}
  return {kind:'raster',id:art.id,path:art.frame.path,...placement};
}
