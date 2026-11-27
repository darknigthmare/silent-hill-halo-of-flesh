/** Real FightEngine projectile rendering with native Canvas and original PNG bytes.
 * node docs/production/vague27/projectiles/qa-native.mjs --out=/fresh/evidence/directory
 * Uses normal training configuration and original keyboard callbacks; no actor/shot injection.
 */
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const root=fileURLToPath(new URL('../../../../',import.meta.url));
const output=process.argv.find(arg=>arg.startsWith('--out='))?.slice(6);
if(!output)throw Error('A fresh --out directory is required.');
const out=resolve(output),sha=bytes=>createHash('sha256').update(bytes).digest('hex');
try{await access(join(out,'report.json'));throw Error('Preserve existing evidence; select another output directory.');}catch(error){if(error.code!=='ENOENT')throw error;}
const require=createRequire(import.meta.url),dependency=name=>{
  try{return require(name);}catch(first){
    for(const location of [process.env.HALO_QA_NODE_MODULES,process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES].filter(Boolean)){
      try{return createRequire(join(location,'__halo_projectile_native_loader.cjs'))(name);}catch{}
    }throw first;
  }
};
const {createCanvas,Image}=dependency('@napi-rs/canvas'),sharp=dependency('sharp');
const report={schema:1,generatedAt:new Date().toISOString(),label:'wave27-native-projectiles',
  browserTest:false,httpTest:false,actorStateInjected:false,projectileStateInjected:false,
  method:'Actual FightEngine.update/render with ordinary local training/freeMeter options and original key callbacks. Native Canvas is not Chromium.',
  decoder:'Original file hashes verified; PNG encoding normalized only in memory for native Canvas, with decoded RGBA equality checked. Project files remain byte-identical.',
  limits:['Static PNG candidates only; no native animation or 1:1 visual fidelity is certified.',
    'Source observations establish attack kind; original texture, timing and trajectory are not reproduced by these images.',
    'The six scenes exercise normal emission and artwork in both player slots; they are not a complete hit/guard gameplay matrix.'],
  checks:[],captures:[],assets:[],scenes:[],sourceHashes:{}};
const check=(name,passed,detail)=>{report.checks.push({name,passed:!!passed,...(detail===undefined?{}:{detail})});if(!passed)throw Error(name);};
await mkdir(out,{recursive:true});
let engine;
try{
  const listeners=new Map(),storage=new Map();
  globalThis.window={};globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
  globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key)};
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{getGamepads:()=>[],vibrate:()=>false,userActivation:{hasBeenActive:false}}});
  globalThis.addEventListener=(type,fn)=>{if(!listeners.has(type))listeners.set(type,new Set());listeners.get(type).add(fn);};
  globalThis.removeEventListener=(type,fn)=>listeners.get(type)?.delete(fn);
  globalThis.requestAnimationFrame=()=>0;globalThis.cancelAnimationFrame=()=>{};
  const mod=name=>import(pathToFileURL(join(root,'src',name)).href);
  const [{getFighter,getStage},{SPRITES},{spriteCache},{prepareCombatAssets,pinCombatAssets,stageBitmapFrames,stageBitmapCache},
    {PROJECTILE_BITMAPS},{projectileBitmapCache,prepareProjectileBitmaps,projectileBitmapPlacement},{FightEngine}]=
    await Promise.all(['data.js','sprite-manifest.js','sprite-system.js','stage-bitmaps.js','projectile-bitmap-manifest.js','projectile-bitmaps.js','fight.js'].map(mod));
  const ids=['sh1_incubator_018','sh2_lying_figure_020','sh3_god_050'],opponent=getFighter('sh2_creeper_025'),stage=getStage('midwich');
  const descriptors=[...new Map([...ids,opponent.id].flatMap(id=>SPRITES[id].frames).concat(stageBitmapFrames([stage]),Object.values(PROJECTILE_BITMAPS).map(art=>art.frame)).map(frame=>[frame.path,frame])).values()];
  const data=new Map(),imagePaths=new WeakMap();
  for(const frame of descriptors){
    const bytes=await readFile(join(root,frame.path));check('native bytes '+frame.path,bytes.length===frame.bytes&&sha(bytes)===frame.sha256);
    const normalized=await sharp(bytes).png().toBuffer(),before=await sharp(bytes).ensureAlpha().raw().toBuffer(),after=await sharp(normalized).ensureAlpha().raw().toBuffer();
    check('lossless native decoder adapter '+frame.path,before.equals(after));
    data.set(frame.path,normalized);report.assets.push({path:frame.path,sha256:sha(bytes),bytes:bytes.length,width:frame.width,height:frame.height,rawRGBAHash:sha(before),adapterLossless:true});
  }
  for(const name of ['src/fight.js','src/projectile-bitmaps.js','src/projectile-bitmap-manifest.js','src/sprite-manifest.js','src/stage-bitmap-manifest.js'])
    report.sourceHashes[name]=sha(await readFile(join(root,name)));
  for(const cache of [spriteCache,stageBitmapCache,projectileBitmapCache]){
    let latest;
    cache.createImage=()=>{
      const image=new Image();latest=image;image.decode=undefined;
      for(const property of ['onload','onerror']){let callback;Object.defineProperty(image,property,{get:()=>callback,set:value=>{callback=typeof value==='function'?(...args)=>{void value(...args);}:undefined;}});}
      return image;
    };
    cache.url=path=>{if(!data.has(path))throw Error('Unexpected image '+path);imagePaths.set(latest,path);return data.get(path);};
  }
  for(const fighterId of ids)for(const playerIndex of [0,1]){
    const fighter=getFighter(fighterId),pair=playerIndex===0?[fighter,opponent]:[opponent,fighter];
    const art=Object.values(PROJECTILE_BITMAPS).find(entry=>entry.fighterId===fighterId),label=fighterId+'-'+(playerIndex===0?'right':'left');
    pinCombatAssets(pair,[stage]);const ready=await prepareCombatAssets(pair,[stage]);check(label+' actor/stage preflight',ready.ok,ready);
    check(label+' projectile prewarm',(await prepareProjectileBitmaps(pair)).ok);
    const canvas=createCanvas(1280,720),ctx=canvas.getContext('2d'),nativeDraw=ctx.drawImage.bind(ctx),draws=[];
    ctx.drawImage=(image,...args)=>{const result=nativeDraw(image,...args),path=imagePaths.get(image);if(path===art.frame.path){const matrix=ctx.getTransform();draws.push({path,args,matrix:[matrix.a,matrix.b,matrix.c,matrix.d,matrix.e,matrix.f],frame:engine.frame});}return result;};
    engine=new FightEngine(canvas,{p1:pair[0],p2:pair[1],stage,mode:'local',training:true,freeMeter:true,timeLimit:0,seed:271124,
      stageHazards:false,stageDirector:false,stageTerrain:false,otherworldShift:false,fatalities:false,stageFatalities:false,radioWarning:false});
    let introTicks=0;while((engine.phase!=='fight'||engine.actors[playerIndex].presentation||engine.texts.some(text=>['intro','round','fight'].includes(text.kind)))&&introTicks<1200){engine.update();introTicks++;}
    check(label+' intro ended normally',engine.phase==='fight'&&!engine.actors[playerIndex].presentation);
    const key=engine.bindings.players[playerIndex].special;
    const emit=type=>{const event={type,code:key,repeat:false,isComposing:false,defaultPrevented:false,ctrlKey:false,metaKey:false,altKey:false,
      target:{isContentEditable:false,closest:()=>null},preventDefault(){this.defaultPrevented=true;}};
      for(const callback of listeners.get(type)||[])callback(event);
      check(label+' normal '+type,type==='keydown'?engine.input.isDown(key):!engine.input.isDown(key));};
    emit('keydown');engine.update();emit('keyup');
    check(label+' special accepted',engine.actors[playerIndex].attack?.key==='neutralSpecial');
    let ticks=0;while(!engine.projectiles.length&&ticks<100){engine.update();ticks++;}
    check(label+' real shot emitted',engine.projectiles.length===1&&engine.projectiles[0].owner===engine.actors[playerIndex]);
    const emitted=engine.projectiles[0],start={x:emitted.x,y:emitted.y,life:emitted.life,vx:emitted.vx,groundY:emitted.groundY??null,radius:emitted.radius};
    for(let tick=0;tick<5;tick++)engine.update();
    check(label+' actual flight advances',engine.projectiles.includes(emitted)&&emitted.x!==start.x&&emitted.life<start.life);
    const before={x:emitted.x,y:emitted.y,life:emitted.life,vx:emitted.vx,vy:emitted.vy,health:engine.actors.map(actor=>actor.health)};
    engine.render(engine.frame*1000/60);
    const after={x:emitted.x,y:emitted.y,life:emitted.life,vx:emitted.vx,vy:emitted.vy,health:engine.actors.map(actor=>actor.health)};
    check(label+' drawing leaves flight and health unchanged',JSON.stringify(before)===JSON.stringify(after));
    const draw=draws.at(-1),placement=projectileBitmapPlacement(emitted,art);
    check(label+' exact PNG painted by engine',draw?.path===art.frame.path&&draw.frame===engine.frame);
    check(label+' bitmap follows emitted direction',Math.sign(draw.matrix[0])===Math.sign(emitted.vx));
    if(art.presentation.anchor==='ground'){
      const nativeBaseline=art.presentation.groundBaseline*art.frame.height;
      const baselineOffset=(nativeBaseline-placement.source[1])*placement.height/placement.source[3];
      check(label+' flame bright baseline touches real floor',Math.abs(placement.y+placement.localY+baselineOffset-594)<1e-8&&emitted.y+emitted.radius===594);
    }
    const file=label+'.png',bytes=canvas.toBuffer('image/png');await writeFile(join(out,file),bytes);
    report.captures.push({file,sha256:sha(bytes),bytes:bytes.length,width:1280,height:720});
    report.scenes.push({fighterId,playerIndex,key,sourceId:art.id,initialShot:start,finalShot:after,placement,draw,capture:file,
      cacheBytes:projectileBitmapCache.bytes,cacheReservedBytes:projectileBitmapCache.reservedBytes});
    check(label+' cache budget respected',projectileBitmapCache.bytes+projectileBitmapCache.reservedBytes<=projectileBitmapCache.maxBytes);
    engine.destroy();engine=null;
  }
  report.success=true;
}catch(error){report.success=false;report.error=String(error.stack||error);process.exitCode=1;}
finally{engine?.destroy();await writeFile(join(out,'report.json'),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({success:report.success,checks:report.checks.length,captures:report.captures.length,report:join(out,'report.json'),error:report.error||null}));
