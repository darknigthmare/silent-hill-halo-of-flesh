/**
 * Wave29: actual FightEngine projectile emission and raster rendering in native Canvas.
 * Explicit fighter IDs select their registered effects; every effect is tested in both
 * player slots. All actions go through the engine's ordinary keyboard callbacks.
 * No actor positions, facing, attacks, projectiles, health or gameplay clocks are patched.
 *
 * node docs/production/vague29/qa-native-projectiles.mjs \
 *   --ids=sh1_floatstinger_016,homecoming_asphyxia_096 --out=/fresh/evidence
 * Optional: --effects=exact_effect_id,exact_effect_id --slot=neutralSpecial
 *           --stage=midwich --opponent=sh2_creeper_025 --flight-ticks=12
 *
 * This is native Canvas, not a browser or HTTP test. Original PNG bytes are checked
 * before a lossless in-memory decoder adapter; no project image is rewritten.
 */
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {resolve,join,dirname,relative} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const self=fileURLToPath(import.meta.url),root=resolve(dirname(self),'../../..');
const option=name=>process.argv.find(value=>value.startsWith('--'+name+'='))?.slice(name.length+3);
const parseIds=value=>(value||'').split(',').filter(Boolean);
const ids=parseIds(option('ids')),effectIds=parseIds(option('effects'));
if(!ids.length||!option('out'))throw Error('Explicit --ids=fighter_id,... and a fresh --out directory are required.');
for(const list of [ids,effectIds])if(new Set(list).size!==list.length||list.some(id=>!/^[a-z0-9][a-z0-9_.-]*$/.test(id)))throw Error('Invalid or repeated ID.');
const forcedSlot=option('slot'),supportedSlots=['neutralSpecial','downSpecial','forwardSpecial','backSpecial','airSpecial','super'];
if(forcedSlot&&!supportedSlots.includes(forcedSlot))throw Error('Unsupported requested slot. Desperation is not synthesized by changing health.');
const stageId=option('stage')||'midwich',opponentId=option('opponent')||'sh2_creeper_025';
const flightTicks=Number(option('flight-ticks')||12);
if(!Number.isInteger(flightTicks)||flightTicks<1||flightTicks>60)throw Error('flight-ticks must be an integer from 1 to 60.');
const out=resolve(option('out')),sha=bytes=>createHash('sha256').update(bytes).digest('hex');
try{await access(out);throw Error('Preserve existing evidence; use a fresh output directory.');}catch(error){if(error.code!=='ENOENT')throw error;}
await mkdir(out,{recursive:true});
const report={schema:1,wave:29,label:'wave29-native-projectiles',startedAt:new Date().toISOString(),
  browserTest:false,httpTest:false,actorStateInjected:false,projectileStateInjected:false,assetSubstitution:false,
  requested:{ids,effectIds,slot:forcedSlot??null,stageId,opponentId,flightTicks},
  method:'Actual FightEngine.update/render, local training/freeMeter settings, and the registered keydown/keyup callbacks using each actor’s live input bindings. No gameplay state or camera injection.',
  decoder:'PNG file hashes/dimensions verified. An in-memory re-encoding is checked for decoded RGBA equality before native Canvas decoding; source files stay untouched.',
  limits:['Native Canvas is not Chromium; there is no HTTP, DOM, browser-event or service-worker claim.',
    'One ordinary reachable projectile command is exercised for each selected effect in each player slot. Other mapped slots are not claimed as played.',
    'Both orientations use the existing runtime mirror, not independently drawn or source-certified opposite views.',
    'Static candidates; no original timing, complete animation, full hit/guard matrix or 1:1 fidelity certification.'],
  checks:[],scenes:[],captures:[],assets:[],sourceHashes:{},errors:[]};
const check=(name,passed,detail)=>{report.checks.push({name,passed:!!passed,...(detail===undefined?{}:{detail})});if(!passed)throw Error(name);};
const require=createRequire(import.meta.url),dependency=name=>{
  try{return require(name);}catch(first){
    for(const location of [process.env.HALO_QA_NODE_MODULES,process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES].filter(Boolean)){
      try{return createRequire(join(location,'__halo_wave29_native_loader.cjs'))(name);}catch{}
    }throw first;
  }
};
let engine;
try{
  const {createCanvas,Image}=dependency('@napi-rs/canvas'),sharp=dependency('sharp');
  const listeners=new Map(),storage=new Map();
  globalThis.window={};globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
  globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key)};
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{getGamepads:()=>[],vibrate:()=>false,userActivation:{hasBeenActive:false}}});
  globalThis.addEventListener=(type,fn)=>{if(!listeners.has(type))listeners.set(type,new Set());listeners.get(type).add(fn);};
  globalThis.removeEventListener=(type,fn)=>listeners.get(type)?.delete(fn);
  globalThis.requestAnimationFrame=()=>0;globalThis.cancelAnimationFrame=()=>{};
  const moduleNames=['data.js','sprite-manifest.js','sprite-system.js','stage-bitmaps.js','projectile-bitmap-manifest.js','projectile-bitmaps.js','fight.js'];
  const captureSource=async path=>{
    if(report.sourceHashes[path])return;
    const file=resolve(root,path),bytes=await readFile(file);report.sourceHashes[path]={before:sha(bytes)};
    if(path.endsWith('.js')||path.endsWith('.mjs'))for(const match of bytes.toString().matchAll(/(?:import|export)\s+(?:[^;]*?\s+from\s+)?['"]([^'"]+)['"]/g)){
      if(match[1].startsWith('.')){
        const child=relative(root,resolve(dirname(file),match[1])).replaceAll('\\','/');
        if(child.startsWith('../'))throw Error('Unexpected source import outside repository: '+child);
        await captureSource(child);
      }
    }
  };
  for(const path of moduleNames.map(name=>'src/'+name).concat(relative(root,self).replaceAll('\\','/'),'art/registry.json'))await captureSource(path);
  const mod=name=>import(pathToFileURL(join(root,'src',name)).href);
  const [{getFighter,getStage,createCombatProfile},{SPRITES},{spriteCache},
    {prepareCombatAssets,pinCombatAssets,stageBitmapFrames,stageBitmapCache},
    {PROJECTILE_BITMAPS},{projectileBitmapCache,prepareProjectileBitmaps,projectileBitmapPlacement,projectileBitmapFor,validateProjectileRegistry},
    {FightEngine}]=await Promise.all(moduleNames.map(mod));
  validateProjectileRegistry();
  report.runtime={node:process.version,platform:process.platform,arch:process.arch,sharpVersions:sharp.versions};
  report.cacheBudgets={combat:spriteCache.maxBytes,stages:stageBitmapCache.maxBytes,projectiles:projectileBitmapCache.maxBytes};
  const selectedEffects=Object.values(PROJECTILE_BITMAPS).filter(art=>ids.includes(art.fighterId)&&(!effectIds.length||effectIds.includes(art.id)));
  for(const id of ids)check(id+': at least one selected registered effect',selectedEffects.some(art=>art.fighterId===id));
  for(const id of effectIds)check(id+': requested effect belongs to a requested fighter',selectedEffects.some(art=>art.id===id));
  const cases=selectedEffects.map(art=>{
    const fighter=getFighter(art.fighterId),profile=createCombatProfile(fighter);
    check(art.id+': exact fighter/source identity',fighter?.id===art.fighterId&&fighter.source===art.source);
    check(art.id+': source role permits combat',profile.referencePolicy.combatEnabled===true);
    check(art.id+': dedicated combat art exists',!!SPRITES[fighter.id]?.clips?.idle);
    const choices=forcedSlot?[forcedSlot]:supportedSlots;
    const slot=choices.find(key=>art.slots.includes(key)&&profile.moves[key]?.enabled===true&&profile.moves[key].projectile&&!profile.moves[key].trap&&
      (key!=='airSpecial'||profile.referencePolicy.canJump!==false)&&projectileBitmapFor(fighter,profile.moves[key])?.id===art.id);
    check(art.id+': ordinary reachable command available',!!slot,{registeredSlots:art.slots,requested:forcedSlot??'automatic'});
    return {fighterId:fighter.id,effectId:art.id,source:art.source,slot};
  });
  report.plannedCases=cases;
  const opponent=getFighter(opponentId),stage=getStage(stageId);
  check('Opponent has a permitted combat role and imported art',!!opponent&&createCombatProfile(opponent).referencePolicy.combatEnabled&&!!SPRITES[opponent.id]?.clips?.idle);
  check('Stage exists and is not blocked',!!stage&&!stage.reference?.blocked);
  const relevantOwners=new Set([...ids,opponentId]);
  const descriptors=[...new Map([...relevantOwners].flatMap(id=>SPRITES[id]?.frames||[])
    .concat(stageBitmapFrames([stage]),Object.values(PROJECTILE_BITMAPS).filter(art=>relevantOwners.has(art.fighterId)).map(art=>art.frame))
    .map(frame=>[frame.path,frame])).values()];
  const data=new Map(),imagePaths=new WeakMap(),renderedPaths=new Set();
  for(const frame of descriptors){
    const bytes=await readFile(join(root,frame.path));
    check('Native bytes '+frame.path,bytes.length===frame.bytes&&sha(bytes)===frame.sha256);
    const metadata=await sharp(bytes).metadata();
    check('Native dimensions '+frame.path,metadata.width===frame.width&&metadata.height===frame.height);
    const normalized=await sharp(bytes).png().toBuffer(),before=await sharp(bytes).ensureAlpha().raw().toBuffer(),after=await sharp(normalized).ensureAlpha().raw().toBuffer();
    check('Lossless native decoder adapter '+frame.path,before.equals(after));
    data.set(frame.path,normalized);report.assets.push({path:frame.path,sha256:sha(bytes),bytes:bytes.length,width:frame.width,height:frame.height,rawRGBAHash:sha(before),adapterLossless:true});
  }
  for(const cache of [spriteCache,stageBitmapCache,projectileBitmapCache]){
    let latest;
    cache.createImage=()=>{
      const image=new Image();latest=image;image.decode=undefined;
      for(const property of ['onload','onerror']){let callback;Object.defineProperty(image,property,{get:()=>callback,set:value=>{callback=typeof value==='function'?(...args)=>{void value(...args);}:undefined;}});}
      return image;
    };
    cache.url=path=>{if(!data.has(path))throw Error('Unexpected image request: '+path);imagePaths.set(latest,path);return data.get(path);};
  }
  const saveCapture=async(canvas,file,detail)=>{
    const bytes=canvas.toBuffer('image/png');await writeFile(join(out,file),bytes);
    const capture={file,sha256:sha(bytes),bytes:bytes.length,width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),...detail};
    report.captures.push(capture);return capture;
  };
  for(const test of cases)for(const playerIndex of [0,1]){
    const fighter=getFighter(test.fighterId),pair=playerIndex===0?[fighter,opponent]:[opponent,fighter];
    const art=PROJECTILE_BITMAPS[test.effectId],label=art.id+'-'+(playerIndex===0?'right':'left');
    pinCombatAssets(pair,[stage]);const ready=await prepareCombatAssets(pair,[stage]);
    check(label+': actor/stage preflight',ready.ok,ready);
    const effectReady=await prepareProjectileBitmaps(pair);check(label+': projectile prewarm',effectReady.ok,effectReady);
    const canvas=createCanvas(1280,720),ctx=canvas.getContext('2d'),nativeDraw=ctx.drawImage.bind(ctx),draws=[];
    ctx.drawImage=(image,...args)=>{
      const result=nativeDraw(image,...args),path=imagePaths.get(image);if(path)renderedPaths.add(path);
      if(path===art.frame.path){const m=ctx.getTransform();draws.push({path,args,matrix:[m.a,m.b,m.c,m.d,m.e,m.f],frame:engine.frame});}
      return result;
    };
    engine=new FightEngine(canvas,{p1:pair[0],p2:pair[1],stage,mode:'local',training:true,freeMeter:true,timeLimit:0,seed:291125,
      stageHazards:false,stageDirector:false,stageTerrain:false,otherworldShift:false,fatalities:false,stageFatalities:false,radioWarning:false});
    const actor=engine.actors[playerIndex],bindings=engine.bindings.players[playerIndex],inputEvents=[];
    let introTicks=0;
    while((engine.phase!=='fight'||actor.presentation||engine.texts.some(text=>['intro','round','fight'].includes(text.kind)))&&introTicks<1200){engine.update();introTicks++;}
    check(label+': intro ends normally',engine.phase==='fight'&&!actor.presentation);
    check(label+': intended fighter and natural player-facing',actor.data.id===fighter.id&&actor.facing===(playerIndex===0?1:-1));
    const emit=(type,action)=>{
      const code=bindings[action];if(!code)throw Error('No live binding for '+action);
      const event={type,code,repeat:false,isComposing:false,defaultPrevented:false,ctrlKey:false,metaKey:false,altKey:false,
        target:{isContentEditable:false,closest:()=>null},preventDefault(){this.defaultPrevented=true;}};
      for(const callback of listeners.get(type)||[])callback(event);
      inputEvents.push({type,action,code,engineFrame:engine.frame});
      check(label+': normal '+type+' '+action,type==='keydown'?engine.input.isDown(code):!engine.input.isDown(code));
    };
    let direction=null;
    if(test.slot==='forwardSpecial')direction=actor.facing>0?'right':'left';
    if(test.slot==='backSpecial')direction=actor.facing>0?'left':'right';
    if(test.slot==='downSpecial')direction='down';
    if(test.slot==='airSpecial'){
      emit('keydown','jump');engine.update();emit('keyup','jump');
      let jumpTicks=0;while(actor.grounded&&jumpTicks<60){engine.update();jumpTicks++;}
      check(label+': ordinary jump establishes aerial state',!actor.grounded);
    }
    if(direction)emit('keydown',direction);
    const button=test.slot==='super'?'super':'special';
    emit('keydown',button);engine.update();emit('keyup',button);if(direction)emit('keyup',direction);
    check(label+': exact command accepted from bindings',actor.attack?.key===test.slot,{attack:actor.attack?.key??null,lastMove:actor.lastMoveKey});
    const owned=()=>engine.projectiles.filter(shot=>shot.owner===actor&&shot.move.key===test.slot);
    let emissionTicks=0;while(!owned().length&&emissionTicks<180){engine.update();emissionTicks++;}
    check(label+': original engine emits the selected projectile',owned().length>0);
    const shot=owned()[0];
    const shotState=()=>({x:shot.x,y:shot.y,life:shot.life,vx:shot.vx,vy:shot.vy,groundY:shot.groundY??null,radius:shot.radius,health:engine.actors.map(a=>a.health)});
    const start=shotState();
    check(label+': emitted direction matches player orientation',Math.sign(shot.vx)===(playerIndex===0?1:-1));
    const observeRender=()=>{
      const before=shotState();draws.length=0;engine.render(engine.frame*1000/60);const after=shotState();
      check(label+': rendering preserves flight and health at '+engine.frame,JSON.stringify(before)===JSON.stringify(after));
      const draw=draws.find(d=>d.frame===engine.frame),placement=projectileBitmapPlacement(shot,art);
      check(label+': exact registered image painted at '+engine.frame,!!draw&&draw.path===art.frame.path);
      check(label+': raster direction matches emitted motion at '+engine.frame,Math.sign(draw.matrix[0])===Math.sign(shot.vx)*art.presentation.facing);
      check(label+': finite raster placement at '+engine.frame,!!placement&&[placement.x,placement.y,placement.width,placement.height].every(Number.isFinite));
      return {frame:engine.frame,shot:after,placement,draw};
    };
    const emission=observeRender();
    const emissionCapture=await saveCapture(canvas,label+'-emission.png',{fighterId:fighter.id,effectId:art.id,playerIndex,slot:test.slot,engineFrame:engine.frame,phase:'emission'});
    let elapsed=0;while(elapsed<flightTicks&&engine.projectiles.includes(shot)){engine.update();elapsed++;}
    check(label+': live projectile survives requested short flight',engine.projectiles.includes(shot),{elapsed,requested:flightTicks});
    check(label+': engine flight advances position and life',shot.x!==start.x&&shot.life<start.life);
    const flight=observeRender();
    const flightCapture=await saveCapture(canvas,label+'-flight.png',{fighterId:fighter.id,effectId:art.id,playerIndex,slot:test.slot,engineFrame:engine.frame,phase:'flight'});
    check(label+': decoded cache stays within its configured budget',projectileBitmapCache.bytes+projectileBitmapCache.reservedBytes<=projectileBitmapCache.maxBytes);
    report.scenes.push({label,...test,playerIndex,bindings,inputEvents,stageId,opponentId,introTicks,emissionTicks,flightTicks:elapsed,
      registryEntrySHA256:sha(JSON.stringify(art)),initialShot:start,emission,flight,captures:[emissionCapture.file,flightCapture.file],
      cacheBytes:projectileBitmapCache.bytes,cacheReservedBytes:projectileBitmapCache.reservedBytes});
    engine.destroy();engine=null;
  }
  for(const [path,entry]of Object.entries(report.sourceHashes)){
    entry.after=sha(await readFile(resolve(root,path)));check('Source unchanged '+path,entry.before===entry.after);
  }
  for(const descriptor of report.assets){const bytes=await readFile(resolve(root,descriptor.path));check('Asset bytes preserved '+descriptor.path,bytes.length===descriptor.bytes&&sha(bytes)===descriptor.sha256);}
  report.renderedImagePaths=[...renderedPaths].sort();report.success=true;
}catch(error){report.success=false;report.error=String(error.stack||error);process.exitCode=1;}
finally{engine?.destroy();report.completedAt=new Date().toISOString();await writeFile(join(out,'report.json'),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({success:report.success,checks:report.checks.length,scenes:report.scenes.length,captures:report.captures.length,report:join(out,'report.json'),error:report.error??null}));
