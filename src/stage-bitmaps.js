/** Stage rasters share the bounded decoder, but own a separate lease and budget. */
import {STAGE_BITMAPS} from './stage-bitmap-manifest.js';
import {SpriteCache,spriteCache,spriteFor} from './sprite-system.js';
const own=(object,key)=>Object.prototype.hasOwnProperty.call(object,key);
const uniqueStages=stages=>{
  const result=new Map();
  for(const stage of stages.filter(Boolean)){
    if(result.has(stage.id)&&result.get(stage.id).source!==stage.source)throw new Error('Stage bitmap: conflicting stage source');
    result.set(stage.id,stage);
  }
  return [...result.values()];
};
const asStages=stages=>Array.isArray(stages)?stages:stages?[stages]:[];

export function validateStageBitmap(stage,art){
  const fail=message=>{throw new Error('Stage bitmap: '+message);};
  if(!stage||typeof stage.id!=='string'||art?.stageId!==stage.id||art.source!==stage.source)fail('identity/source mismatch');
  if(art.status!=='integrated-candidate'||art.fidelity!=='unverified'||!['replace','overlay'].includes(art.mode))fail('unsupported provenance/mode');
  if(art.geometry!==undefined&&(!art.geometry||typeof art.geometry!=='object'||Array.isArray(art.geometry)||
    Object.keys(art.geometry).some(key=>key!=='ceiling')||typeof art.geometry.ceiling!=='boolean'))fail('invalid scene geometry');
  if(!Array.isArray(art.layers)||!art.layers.length||art.layers.length>8)fail('invalid layer count');
  const ids=new Set(),paths=new Map();
  for(const layer of art.layers){
    if(!layer||!/^[a-z0-9_-]{1,64}$/.test(layer.id)||ids.has(layer.id))fail('invalid/duplicate layer');ids.add(layer.id);
    if(layer.fit!==undefined&&!['stretch','cover','contain'].includes(layer.fit))fail('invalid layer fit');
    if(!Array.isArray(layer.frames)||!layer.frames.length||layer.frames.length>120||!Number.isSafeInteger(layer.ticksPerFrame)||layer.ticksPerFrame<1||layer.ticksPerFrame>600||typeof layer.loop!=='boolean')fail('invalid frame clock');
    if(!Array.isArray(layer.rect)||layer.rect.length!==4||!layer.rect.every(Number.isFinite)||layer.rect[0]<0||layer.rect[1]<0||layer.rect[2]<=0||layer.rect[3]<=0||layer.rect[0]+layer.rect[2]>1||layer.rect[1]+layer.rect[3]>1)fail('invalid layer rectangle');
    for(const frame of layer.frames){
      if(!frame||!/^assets\/stages\/[a-z0-9_.-]+\.png$/.test(frame.path)||!frame.path.startsWith('assets/stages/'+stage.id+'.')||!/^[a-f0-9]{64}$/.test(frame.sha256)||!frame.path.includes('.'+frame.sha256.slice(0,12)+'.'))fail('unsafe/unversioned frame path');
      if(!Number.isSafeInteger(frame.bytes)||frame.bytes<1||frame.bytes>24*1024*1024||![frame.width,frame.height].every(n=>Number.isSafeInteger(n)&&n>0&&n<=4096))fail('invalid frame metadata');
      const signature=JSON.stringify([frame.sha256,frame.bytes,frame.width,frame.height]);
      if(paths.has(frame.path)&&paths.get(frame.path)!==signature)fail('conflicting frame descriptors');paths.set(frame.path,signature);
    }
  }
  return art;
}
export function stageBitmapFor(stage,registry=STAGE_BITMAPS){
  if(!stage||!own(registry,stage.id))return null;
  const art=validateStageBitmap(stage,registry[stage.id]);
  if(stage.reference?.blocked)throw new Error('Stage bitmap: unresolved stage');
  return art;
}
export function stageBitmapFrames(stages,registry=STAGE_BITMAPS){
  const frames=new Map();
  for(const stage of uniqueStages(asStages(stages))){
    const art=stageBitmapFor(stage,registry);
    for(const frame of art?.layers.flatMap(layer=>layer.frames)||[]){
      const existing=frames.get(frame.path);
      if(existing&&(existing.sha256!==frame.sha256||existing.width!==frame.width||existing.height!==frame.height))throw new Error('Stage bitmap: cross-stage descriptor conflict');
      frames.set(frame.path,frame);
    }
  }
  return [...frames.values()];
}
export class StageBitmapCache extends SpriteCache{
  constructor({registry=STAGE_BITMAPS,...options}={}){super(options);this.registry=registry;}
  async prepare(stages,{retry=true}={}){
    let frames;
    try{frames=stageBitmapFrames(stages,this.registry);}catch(error){return {ok:false,missing:[],failed:['stage-descriptor'],error:String(error.message)};}
    const decoded=await Promise.all(frames.map(frame=>this.load(frame,{retry}).then(Boolean)));
    const failed=frames.filter((frame,index)=>!decoded[index]).map(frame=>frame.path);
    return {ok:failed.length===0,missing:[],failed};
  }
}
export const stageBitmapCache=new StageBitmapCache();
export async function prepareCombatAssets(fighters,stages,{fighterCache=spriteCache,stageCache=stageBitmapCache,diagnostic=false,retry=true}={}){
  // The existing fighter diagnostic remains explicit. A declared stage image
  // must still decode successfully; diagnostic never bypasses stage failures.
  const [actors,decor]=await Promise.all([fighterCache.prepare(fighters,{retry,diagnostic}),stageCache.prepare(asStages(stages),{retry})]);
  return {ok:actors.ok&&decor.ok,missing:actors.missing,failed:[...actors.failed,...decor.failed],stageFailed:!decor.ok};
}
export function pinCombatAssets(fighters,stages,{fighterCache=spriteCache,stageCache=stageBitmapCache}={}){
  const actors=fighters.flatMap(fighter=>spriteFor(fighter)?.frames||[]),decor=stageBitmapFrames(asStages(stages),stageCache.registry);
  // Validate both leases before replacing either one.
  fighterCache.validatePins(actors);stageCache.validatePins(decor);
  fighterCache.pin(actors);stageCache.pin(decor);
}
export function captureCombatAssetPins({fighterCache=spriteCache,stageCache=stageBitmapCache}={}){
  const actors=fighterCache.pinnedFrames(),decor=stageCache.pinnedFrames();
  return ()=>{fighterCache.validatePins(actors);stageCache.validatePins(decor);fighterCache.pin(actors);stageCache.pin(decor);};
}
export function drawStageBitmaps(context,stage,time,{width=1280,height=720,cache=stageBitmapCache,registry=cache.registry,paint=true}={}){
  let art,frames;
  try{art=stageBitmapFor(stage,registry);if(!art)return {kind:'unregistered'};frames=stageBitmapFrames([stage],registry);}
  catch(error){return {kind:'error',error:String(error.message)};}
  const missing=frames.filter(frame=>!cache.peek(frame.path));
  if(missing.length){
    for(const frame of missing)if(cache.status(frame.path)==='absent')void cache.load(frame);
    return {kind:missing.some(frame=>cache.status(frame.path)==='error')?'error':'loading',mode:art.mode};
  }
  if(!paint)return {kind:'raster',mode:art.mode,layers:art.layers.length};
  const tick=Number.isFinite(time)?Math.max(0,Math.floor(time*60/1000+1e-7)):0;
  context.save();
  for(const layer of art.layers){
    const index=layer.loop?Math.floor(tick/layer.ticksPerFrame)%layer.frames.length:Math.min(layer.frames.length-1,Math.floor(tick/layer.ticksPerFrame));
    const frame=layer.frames[index],image=cache.peek(frame.path),[x,y,w,h]=layer.rect;
    const destination=[x*width,y*height,w*width,h*height];
    if(!layer.fit||layer.fit==='stretch')context.drawImage(image,...destination);
    else{
      const [dx,dy,dw,dh]=destination,scale=Math[layer.fit==='cover'?'max':'min'](dw/frame.width,dh/frame.height);
      if(layer.fit==='cover'){
        const sw=dw/scale,sh=dh/scale;
        context.drawImage(image,(frame.width-sw)/2,(frame.height-sh)/2,sw,sh,dx,dy,dw,dh);
      }else{
        const rw=frame.width*scale,rh=frame.height*scale;
        context.drawImage(image,dx+(dw-rw)/2,dy+(dh-rh)/2,rw,rh);
      }
    }
  }
  context.restore();return {kind:'raster',mode:art.mode,layers:art.layers.length};
}
