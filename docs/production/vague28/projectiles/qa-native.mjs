/** Real FightEngine projectile rendering with native Canvas and original PNG bytes.
 * node docs/production/vague28/projectiles/qa-native.mjs --out=/fresh/evidence/directory
 * Uses normal training configuration and original keyboard callbacks; no actor/shot injection.
 */
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {resolve,join,dirname,relative} from 'node:path';
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
const report={schema:1,generatedAt:new Date().toISOString(),label:'wave28-native-projectiles',
  browserTest:false,httpTest:false,actorStateInjected:false,projectileStateInjected:false,flightTicks:20,
  method:'Actual FightEngine.update/render with ordinary local training/freeMeter options and original key callbacks. Native Canvas is not Chromium.',
  decoder:'Original file hashes verified; PNG encoding normalized only in memory for native Canvas, with decoded RGBA equality checked. Project files remain byte-identical.',
  limits:['Static PNG candidates only; no native animation or 1:1 visual fidelity is certified.',
    'Source observations establish attack kind; original texture, timing and trajectory are not reproduced by these images.',
    'The four scenes exercise normal emission and artwork in both player slots; they are not a complete hit/guard gameplay matrix.'],
  checks:[],captures:[],assets:[],scenes:[],sourceHashes:{}};
const check=(name,passed,detail)=>{report.checks.push({name,passed:!!passed,...(detail===undefined?{}:{detail})});if(!passed)throw Error(name);};
const nativePointAtDraw=(draw,point,width,height)=>{
  const [sx,sy,sw,sh,dx,dy,dw,dh]=draw.args.length===8?draw.args:[0,0,width,height,...draw.args];
  const x=dx+(point[0]-sx)/sw*dw,y=dy+(point[1]-sy)/sh*dh,[a,b,c,d,e,f]=draw.matrix;
  return {x:a*x+c*y+e,y:b*x+d*y+f};
};
const fireEmissionReference={
  fighterId:'bom_fire_guardian_137',posePath:'assets/sprites/bom_fire_guardian_137.00774213127e.png',
  poseWidth:1670,poseHeight:941,handNativePoint:[985,490],handNativeBounds:[875,470,1100,575],
  plumeNativePoint:[174,467],
  method:'Approximate points visually identified on the unchanged native PNGs. World positions use the actual drawImage arguments and Canvas matrices. No distance threshold or source-fidelity assertion.'
};
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
  const moduleNames=['data.js','sprite-manifest.js','sprite-system.js','stage-bitmaps.js','projectile-bitmap-manifest.js','projectile-bitmaps.js','fight.js'];
  const mod=name=>import(pathToFileURL(join(root,'src',name)).href);
  const [{getFighter,getStage},{SPRITES},{spriteCache},{prepareCombatAssets,pinCombatAssets,stageBitmapFrames,stageBitmapCache},
    {PROJECTILE_BITMAPS},{projectileBitmapCache,prepareProjectileBitmaps,projectileBitmapPlacement},{FightEngine}]=
    await Promise.all(moduleNames.map(mod));
  report.runtime={node:process.version,platform:process.platform,arch:process.arch,sharpVersions:sharp.versions};
  report.cacheBudgets={combat:spriteCache.maxBytes,stages:stageBitmapCache.maxBytes,projectiles:projectileBitmapCache.maxBytes};
  check('final combat cache is72MiB',spriteCache.maxBytes===72*1024*1024);
  const expectedArtIds={bom_earth_guardian_142:'bom_earth_guardian_rock',bom_fire_guardian_137:'bom_fire_guardian_hand_flame'};
  const ids=Object.keys(expectedArtIds),opponent=getFighter('sh2_creeper_025'),stage=getStage('midwich');
  const descriptors=[...new Map([...ids,opponent.id].flatMap(id=>SPRITES[id].frames).concat(stageBitmapFrames([stage]),Object.values(PROJECTILE_BITMAPS).map(art=>art.frame)).map(frame=>[frame.path,frame])).values()];
  const data=new Map(),imagePaths=new WeakMap(),renderedPaths=new Set();
  for(const frame of descriptors){
    const bytes=await readFile(join(root,frame.path));check('native bytes '+frame.path,bytes.length===frame.bytes&&sha(bytes)===frame.sha256);
    const normalized=await sharp(bytes).png().toBuffer(),before=await sharp(bytes).ensureAlpha().raw().toBuffer(),after=await sharp(normalized).ensureAlpha().raw().toBuffer();
    check('lossless native decoder adapter '+frame.path,before.equals(after));
    data.set(frame.path,normalized);report.assets.push({path:frame.path,sha256:sha(bytes),bytes:bytes.length,width:frame.width,height:frame.height,rawRGBAHash:sha(before),adapterLossless:true});
  }
  const moduleRoots=moduleNames.map(name=>'src/'+name).concat('docs/production/vague28/projectiles/qa-native.mjs');
  const captureModule=async name=>{
    if(report.sourceHashes[name])return;
    const file=resolve(root,name),bytes=await readFile(file),source=bytes.toString('utf8');
    report.sourceHashes[name]=sha(bytes);
    const imports=[...source.matchAll(/^\s*(?:import|export)\s+(?:[^;]*?\s+from\s*)?['"]([^'"]+)['"]/gm),...source.matchAll(/\bimport\(\s*['"]([^'"]+)['"]\s*\)/g)];
    for(const item of imports)if(item[1].startsWith('.')){
      const child=relative(root,resolve(dirname(file),item[1])).replaceAll('\\','/');
      if(child.startsWith('../'))throw Error('Unexpected import outside project '+item[1]);
      await captureModule(child);
    }
  };
  for(const name of moduleRoots)await captureModule(name);
  report.moduleProvenance={method:'Transitive local ESM import/re-export closure and literal dynamic imports from the actual seven harness import roots, plus the harness itself.',roots:moduleRoots,count:Object.keys(report.sourceHashes).length};
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
    const art=PROJECTILE_BITMAPS[expectedArtIds[fighterId]],label=fighterId+'-'+(playerIndex===0?'right':'left');
    check(label+' exact source and slot registered',art?.fighterId===fighterId&&art.source===fighter.source&&art.slots.includes('neutralSpecial'));
    pinCombatAssets(pair,[stage]);const ready=await prepareCombatAssets(pair,[stage]);check(label+' actor/stage preflight',ready.ok,ready);
    check(label+' projectile prewarm',(await prepareProjectileBitmaps(pair)).ok);
    const canvas=createCanvas(1280,720),ctx=canvas.getContext('2d'),nativeDraw=ctx.drawImage.bind(ctx),draws=[],actorDraws=[];
    const actorPaths=new Set(SPRITES[fighterId].frames.map(frame=>frame.path));
    ctx.drawImage=(image,...args)=>{const result=nativeDraw(image,...args),path=imagePaths.get(image);if(path)renderedPaths.add(path);if(path===art.frame.path||actorPaths.has(path)){const m=ctx.getTransform(),draw={path,args,matrix:[m.a,m.b,m.c,m.d,m.e,m.f],frame:engine.frame};if(path===art.frame.path)draws.push(draw);else actorDraws.push(draw);}return result;};
    engine=new FightEngine(canvas,{p1:pair[0],p2:pair[1],stage,mode:'local',training:true,freeMeter:true,timeLimit:0,seed:281124,
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
    let emissionObservation=null;
    if(fighterId===fireEmissionReference.fighterId){
      engine.render(engine.frame*1000/60);
      const actorDraw=actorDraws.at(-1),projectileDraw=draws.at(-1);
      check(label+' emission uses final hand pose',actorDraw?.path===fireEmissionReference.posePath);
      check(label+' emission paints exact projectile',projectileDraw?.path===art.frame.path&&projectileDraw.frame===engine.frame);
      const hand=nativePointAtDraw(actorDraw,fireEmissionReference.handNativePoint,fireEmissionReference.poseWidth,fireEmissionReference.poseHeight);
      const plume=nativePointAtDraw(projectileDraw,fireEmissionReference.plumeNativePoint,art.frame.width,art.frame.height);
      check(label+' passive emission coordinates finite',[hand.x,hand.y,plume.x,plume.y].every(Number.isFinite));
      const emissionFile=label+'-emission.png',emissionBytes=canvas.toBuffer('image/png');await writeFile(join(out,emissionFile),emissionBytes);
      report.captures.push({file:emissionFile,sha256:sha(emissionBytes),bytes:emissionBytes.length,width:1280,height:720,phase:'first-rendered-projectile'});
      emissionObservation={reference:fireEmissionReference,frame:engine.frame,actorDraw,projectileDraw,handWorld:hand,plumeOriginWorld:plume,
        delta:{x:plume.x-hand.x,y:plume.y-hand.y,distance:Math.hypot(plume.x-hand.x,plume.y-hand.y)},capture:emissionFile};
    }
    for(let tick=0;tick<report.flightTicks;tick++)engine.update();
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
    report.scenes.push({fighterId,playerIndex,key,sourceId:art.id,initialShot:start,finalShot:after,placement,draw,capture:file,emissionObservation,
      cacheBytes:projectileBitmapCache.bytes,cacheReservedBytes:projectileBitmapCache.reservedBytes});
    check(label+' cache budget respected',projectileBitmapCache.bytes+projectileBitmapCache.reservedBytes<=projectileBitmapCache.maxBytes);
    engine.destroy();engine=null;
  }
  report.renderedImagePaths=[...renderedPaths].sort();
  report.success=true;
}catch(error){report.success=false;report.error=String(error.stack||error);process.exitCode=1;}
finally{engine?.destroy();await writeFile(join(out,'report.json'),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({success:report.success,checks:report.checks.length,captures:report.captures.length,report:join(out,'report.json'),error:report.error||null}));
