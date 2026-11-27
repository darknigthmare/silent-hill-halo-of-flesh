/**
 * Wave31 visual QA: actual FightEngine with native Canvas, no browser or HTTP.
 * Adapted from scripts/qa-sprite-candidates-native.mjs and the wave28 native
 * attack/stage harnesses. Only original registered InputState callbacks receive
 * synthetic events. No actor, attack, pose, position, facing or clock assignment.
 *
 * node --expose-gc docs/production/vague31/qa-native.mjs --only=stages
 * node --expose-gc docs/production/vague31/qa-native.mjs --only=characters
 * Optional --out=/fresh/evidence. Existing section reports are preserved.
 * Native adapters are confined to event/storage/gamepad stubs and PNG caches.
 * Sharp normalization is memory-only and decoded RGBA equality is checked.
 */
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const require=createRequire(import.meta.url);
const option=(key,fallback)=>process.argv.find(a=>a.startsWith('--'+key+'='))?.slice(key.length+3)||fallback;
const root=resolve(process.env.HALO_QA_ROOT||fileURLToPath(new URL('../../../',import.meta.url)));
const section=option('only','all');
if(!['all','stages','characters'].includes(section))throw Error('--only must be all, stages or characters.');
const out=resolve(root,option('out','docs/production/vague31/qa-native'));
const reportFile=join(out,section==='all'?'report.json':section+'-report.json');
const digest=value=>createHash('sha256').update(value).digest('hex');
try{await access(reportFile);throw Error('Existing evidence preserved: '+reportFile);}catch(error){if(error.code!=='ENOENT')throw error;}
await mkdir(out,{recursive:true});
function dependency(name){
 try{return require(name);}catch(original){
  for(const dir of [process.env.HALO_QA_NODE_MODULES,process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES].filter(Boolean)){
   try{return createRequire(join(dir,'__halo_wave31_native_loader.cjs'))(name);}catch{}
  }
  throw original;
 }
}
const report={schema:1,wave:31,section,generatedAt:new Date().toISOString(),browserTest:false,httpTest:false,actorStateInjected:false,
 method:{renderer:'Actual FightEngine.update/render with @napi-rs/canvas; ordinary duel descriptors and natural intros.',
  inputs:'Synthetic keydown/keyup events delivered only to the original registered InputState callbacks. Bindings read from engine.bindings.',
  scheduling:'Manual logical update ticks; engine.frame and actor clocks are never assigned. Native rendering receives the current tick time.',
  decoder:'Exact local PNG bytes verified against manifest; memory-only sharp PNG normalization with full decoded RGBA equality.',
  environment:'Minimal window/document/storage/event/gamepad adapters; requestAnimationFrame does not schedule a browser loop.'},
 limits:['No Chromium, browser DOM/CSS, HTTP delivery, physical keyboard, service worker or offline behavior is tested.',
  'One static attack image is not an animated clip; source timing and fidelity 1:1 remain unverified.',
  'Opposite orientation uses the existing engine mirror, not a separately sourced view.',
  'This is rendering, input route, natural recovery and stage composition QA; not a complete damage, guard, collision or finisher matrix.',
  'Nurse dark-matte sheets are diagnostic renderings of unchanged source pixels, separate from gameplay captures.'],
 checks:[],errors:[],assets:[],cases:[],stageCases:[],captures:[],sourceHashes:{},catalogueHashes:{}};
function check(name,passed,detail){report.checks.push({name,passed:!!passed,...(detail===undefined?{}:{detail})});if(!passed)throw Error(name);}
let engine;
try{
 const {createCanvas,Image}=dependency('@napi-rs/canvas'),sharp=dependency('sharp');
 report.dependencies={node:process.version,canvas:dependency('@napi-rs/canvas/package.json').version,sharp:sharp.versions.sharp};
 report.harnessSHA256=digest(await readFile(fileURLToPath(import.meta.url)));
 let chromiumBinaryExists=true;try{await access('/usr/lib/chromium/chromium');}catch{chromiumBinaryExists=false;}
 report.browserAvailability={wrapper:'/usr/bin/chromium',expectedBinary:'/usr/lib/chromium/chromium',binaryExists:chromiumBinaryExists,launchAttempted:false,
  note:'Observed wrapper without the underlying Chromium binary in this environment. No browser capture is claimed.'};
 for(const path of ['src/fight.js','src/sprite-animation.js','src/sprite-system.js','src/stage-bitmaps.js','src/renderers.js','src/stage-bitmap-compositions.js','src/projectile-bitmaps.js'])report.sourceHashes[path]={before:digest(await readFile(resolve(root,path)))};
 for(const path of ['art/registry.json','src/sprite-manifest.js','src/stage-bitmap-manifest.js'])report.catalogueHashes[path]={before:digest(await readFile(resolve(root,path)))};
 const events=new Map(),documentEvents=new Map(),storage=new Map();
 const listen=(map,type,callback)=>{if(!map.has(type))map.set(type,new Set());map.get(type).add(callback);};
 globalThis.window={};globalThis.document={hidden:false,addEventListener:(t,f)=>listen(documentEvents,t,f),removeEventListener:(t,f)=>documentEvents.get(t)?.delete(f)};
 globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{getGamepads:()=>[],vibrate:()=>false,userActivation:{hasBeenActive:false}}});
 globalThis.addEventListener=(t,f)=>listen(events,t,f);globalThis.removeEventListener=(t,f)=>events.get(t)?.delete(f);
 globalThis.requestAnimationFrame=()=>0;globalThis.cancelAnimationFrame=()=>{};
 const mod=name=>import(pathToFileURL(resolve(root,'src',name)).href);
 const [{getFighter,getStage,createCombatProfile,VERSION},{SPRITES},{spriteCache},
  {stageBitmapCache,stageBitmapFrames,pinCombatAssets,prepareCombatAssets,stageBitmapFor},
  {projectileBitmapCache,projectileBitmapFrames,prepareProjectileBitmaps},{FightEngine}]=await Promise.all([
   mod('data.js'),mod('sprite-manifest.js'),mod('sprite-system.js'),mod('stage-bitmaps.js'),mod('projectile-bitmaps.js'),mod('fight.js')]);
 report.version=VERSION;
 const characterPlan=JSON.parse(await readFile(resolve(root,'docs/production/vague31/characters/import-plan.json'),'utf8'));
 const stagePlan=JSON.parse(await readFile(resolve(root,'docs/production/vague31/stages/import-plan.json'),'utf8'));
 const samples=section==='stages'?[]:characterPlan.plans;
 const stageIds=section==='characters'?[]:[...new Set(stagePlan.delivered.map(row=>row.owner))];
 check('Requested character plans are exact',section==='stages'||samples.length===3&&samples.every(row=>['neutralSpecial','neutralLight'].includes(row.pose)));
 check('Requested stage plans are exact',section==='characters'||stageIds.length===2&&stageIds.includes('cedar_grove')&&stageIds.includes('wish_house'));
 const opponent=getFighter('bom_butcher_123'),stageFighters=['bom_pyramid_head_129','bom_butcher_123'].map(getFighter);
 const fighterIds=[...new Set(samples.map(row=>row.id).concat(stageIds.length?stageFighters.map(f=>f.id):[],samples.length?[opponent.id]:[]))];
 const fighters=fighterIds.map(getFighter),stages=[...new Set(stageIds.concat(samples.length?['midwich_nightmare']:[]))].map(getStage);
 check('Exact fighters and combat eligibility',fighters.every((f,i)=>f.id===fighterIds[i]&&createCombatProfile(f).referencePolicy.combatEnabled));
 report.testedSpriteEntryHashes=Object.fromEntries(fighters.map(f=>[f.id,digest(JSON.stringify(SPRITES[f.id]))]));
 report.testedStageEntryHashes=Object.fromEntries(stages.map(s=>[s.id,digest(JSON.stringify(stageBitmapFor(s)))]));
 report.runtimeCacheBudgets={sprites:spriteCache.maxBytes,stages:stageBitmapCache.maxBytes};
 const descriptors=[...new Map(fighters.flatMap(f=>[...SPRITES[f.id].frames,SPRITES[f.id].portrait].filter(Boolean))
  .concat(stageBitmapFrames(stages),projectileBitmapFrames(fighters)).map(frame=>[frame.path,frame])).values()];
 const frameByPath=new Map(descriptors.map(f=>[f.path,f])),bytesByPath=new Map(),imagePaths=new WeakMap();
 for(const frame of descriptors){
  const bytes=await readFile(resolve(root,frame.path));check('Exact original PNG '+frame.path,bytes.length===frame.bytes&&digest(bytes)===frame.sha256);
  const normalized=await sharp(bytes).png().toBuffer(),before=await sharp(bytes).ensureAlpha().raw().toBuffer(),after=await sharp(normalized).ensureAlpha().raw().toBuffer();
  check('Lossless native decoder adapter '+frame.path,before.equals(after));bytesByPath.set(frame.path,normalized);
  report.assets.push({path:frame.path,sha256:frame.sha256,bytes:bytes.length,width:frame.width,height:frame.height,rgbaSHA256:digest(before)});
 }
 globalThis.gc?.();
 for(const cache of [spriteCache,stageBitmapCache,projectileBitmapCache]){
  let latest;
  cache.createImage=()=>{const image=new Image();latest=image;image.decode=undefined;
   for(const property of ['onload','onerror']){let callback;Object.defineProperty(image,property,{get:()=>callback,set:value=>{callback=typeof value==='function'?(...args)=>{void value(...args);}:undefined;}});}
   return image;
  };
  cache.url=path=>{imagePaths.set(latest,path);return bytesByPath.get(path);};
 }
 function geometry(draw){
  const frame=draw&&frameByPath.get(draw.path);if(!frame||draw.args.length!==4)return null;
  const [dx,dy,dw,dh]=draw.args,[a,b,c,d,tx,ty]=draw.matrix;
  const box=bounds=>{const [l,t,r,bt]=bounds,points=[[l,t],[r,t],[l,bt],[r,bt]].map(([u,v])=>{
   const x=dx+u/frame.width*dw,y=dy+v/frame.height*dh;return[a*x+c*y+tx,b*x+d*y+ty];});
   return[Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))];};
  const exterior=box(frame.framingBounds||frame.visibleBounds),visible=box(frame.visibleBounds);
  return{exterior,visible,complete:exterior.every(Number.isFinite)&&exterior[0]>=0&&exterior[1]>=0&&exterior[2]<=1280&&exterior[3]<=720,
   footOffsetPixels:(dy+frame.visibleBounds[3]/frame.height*dh)*d};
 }
 const actorState=player=>{const a=engine.actors[player];return{id:a.data.id,x:a.x,y:a.y,state:a.state,grounded:a.grounded,facing:a.facing,
  spritePose:a.spriteClock?.pose,lastMoveKey:a.lastMoveKey,attack:a.attack?{key:a.attack.key,frame:a.attack.frame,startup:a.attack.move.startup,active:a.attack.move.active,recovery:a.attack.move.recovery}:null};};
 function emit(row,type,player,action){
  const code=engine.bindings.players[player][action],event={type,code,repeat:false,defaultPrevented:false,isComposing:false,ctrlKey:false,metaKey:false,altKey:false,
   target:{isContentEditable:false,closest:()=>null},preventDefault(){this.defaultPrevented=true;}};
  const callbacks=[...(events.get(type)||[])];
  check(row.label+': original callback registered '+type+' '+action,callbacks.includes(type==='keydown'?engine.input.onDown:engine.input.onUp));
  for(const callback of callbacks)callback(event);
  const accepted=type==='keydown'?engine.input.isDown(code)&&event.defaultPrevented:!engine.input.isDown(code);
  row.commands.push({type,code,player,action,engineFrame:engine.frame,accepted});check(row.label+': ordinary binding accepted '+type+' '+action,accepted);
 }
 function intro(label){let ticks=0;while((engine.phase!=='fight'||engine.texts.some(t=>['intro','round','fight'].includes(t.kind))||engine.actors.some(a=>a.presentation))&&ticks<1200){engine.update();ticks++;}
  check(label+': intro completes naturally',engine.phase==='fight'&&!engine.paused&&!engine.actors.some(a=>a.presentation),{ticks});return ticks;}
 function destroy(label){const old=engine;old.destroy();check(label+': teardown removes original listeners',!events.get('keydown')?.has(old.input.onDown)&&!events.get('keyup')?.has(old.input.onUp));engine=null;globalThis.gc?.();}
 const options=(p1,p2,stage)=>({p1,p2,stage,mode:'local',timeLimit:0,seed:71131,artDiagnostic:false,ritualId:'none',stageHazards:false,
  stageDirector:false,otherworldShift:false,fatalities:false,stageFatalities:false,stageTerrain:false,stageAnimations:true,radioWarning:false});
 async function capture(canvas,file,purpose,extra={}){
  const bytes=canvas.toBuffer('image/png');await writeFile(join(out,file),bytes);
  const record={file,purpose,width:canvas.width,height:canvas.height,sha256:digest(bytes),bytes:bytes.length,...extra};report.captures.push(record);return record;
 }

 for(const stageId of stageIds){
  const stage=getStage(stageId),art=stageBitmapFor(stage),row={label:stageId,stageId,source:stage.source,scene:art?.scene,commands:[],parallax:[]};report.stageCases.push(row);
  check(stageId+': exact independent stage planes',art?.stageId===stageId&&art.layers.length===2&&art.mode==='replace'&&art.scene===stage.referencePolicy.sceneId);
  check(stageId+': static phase and no ceiling affordance',art.geometry?.ceiling===false&&stage.referencePolicy.worldState==='fixed-normal'&&!stage.shift.enabled);
  for(const delivery of stagePlan.delivered.filter(d=>d.owner===stageId))check(stageId+': delivered plane '+delivery.layer,art.layers.some(l=>l.id===delivery.layer&&l.frames[0].path===delivery.path&&l.frames[0].sha256===delivery.sha256));
  pinCombatAssets(stageFighters,[stage]);const ready=await prepareCombatAssets(stageFighters,[stage]);check(stageId+': ordinary stage preflight',ready.ok,ready);
  const canvas=createCanvas(1280,720),ctx=canvas.getContext('2d'),nativeDraw=ctx.drawImage.bind(ctx);let draws=[];
  ctx.drawImage=(image,...args)=>{const result=nativeDraw(image,...args),path=imagePaths.get(image);if(path){const m=ctx.getTransform();draws.push({path,args,matrix:[m.a,m.b,m.c,m.d,m.e,m.f],frame:engine?.frame,actorX:engine?.actors.map(a=>a.x)});}return result;};
  engine=new FightEngine(canvas,{...options(stageFighters[0],stageFighters[1],stage),stageTerrain:true});row.introTicks=intro(stageId);
  row.terrain=engine.currentTerrain();
  check(stageId+': ordinary HUD uses exact terrain presentation',engine.config.stageTerrain===true&&row.terrain.name===stage.referencePolicy.terrainPresentation.name,{actual:row.terrain.name,expected:stage.referencePolicy.terrainPresentation.name});
  check(stageId+': source policy keeps terrain rules neutral',stage.referencePolicy.terrainRules===false);
  const step=()=>{engine.update();draws=[];engine.render(engine.frame*1000/60);};step();
  const scenery=()=>art.layers.map(layer=>draws.findLast(d=>d.path===layer.frames[0].path));
  check(stageId+': both exact planes drawn',scenery().every(d=>d?.frame===engine.frame));
  check(stageId+': only selected stage images drawn',draws.filter(d=>d.path.startsWith('assets/stages/')).every(d=>art.layers.some(l=>l.frames[0].path===d.path)));
  check(stageId+': ordinary fighters drawn',stageFighters.every(f=>draws.some(d=>d.path===SPRITES[f.id].frames[SPRITES[f.id].clips.idle.frames[0]].path)));
  row.initial={frame:engine.frame,actors:engine.actors.map((_,i)=>actorState(i)),planes:scenery()};
  const shot=await capture(canvas,'stage-'+stageId+'.png','actual-native-FightEngine-stage',{stageId,frame:engine.frame,actors:row.initial.actors});row.capture=shot.file;
  for(const direction of ['right','left']){
   const before=scenery(),start=actorState(0);emit(row,'keydown',0,direction);try{for(let tick=0;tick<18;tick++)step();}finally{emit(row,'keyup',0,direction);}
   const after=scenery(),end=actorState(0),delta=after.map((d,i)=>d.args.at(-4)-before[i].args.at(-4));
   const expected=after.map((d,i)=>-(d.actorX.reduce((s,x)=>s+x,0)-before[i].actorX.reduce((s,x)=>s+x,0))*(art.layers[i].parallaxX||0));
   check(stageId+': natural '+direction+' movement',direction==='right'?end.x>start.x+1:end.x<start.x-1,{start,end});
   check(stageId+': live '+direction+' parallax',delta.every((v,i)=>Math.abs(v-expected[i])<.03)&&Math.abs(delta[0])<.001&&Math.abs(delta[1])>.05,{delta,expected});
   row.parallax.push({direction,start,end,delta,expected});for(let tick=0;tick<10;tick++)step();
   check(stageId+': release returns to idle',actorState(0).state==='idle'&&actorState(0).grounded);
  }
  check(stageId+': no keys remain held',engine.input.held.size===0);destroy(stageId);console.log(JSON.stringify({stageId,passed:true,capture:row.capture}));
 }

 for(const sample of samples)for(const player of [0,1]){
  const fighter=getFighter(sample.id),stage=getStage('midwich_nightmare'),art=SPRITES[sample.id],clip=art.clips[sample.pose],facing=player===0?1:-1;
  const actionFrame=art.frames[clip.frames[0]],idleFrame=art.frames[art.clips.idle.frames[0]],label=sample.id+(player===0?'-right':'-left');
  const row={label,fighterId:sample.id,source:sample.source,pose:sample.pose,player,facing,stageId:stage.id,commands:[],attackFrames:[],captures:[]};report.cases.push(row);
  check(label+': exact static action clip',clip.frames.length===1&&clip.loop===false&&actionFrame.path===sample.path&&actionFrame.sha256===sample.sha256);
  check(label+': original idle and portrait preserved',idleFrame.path===sample.baselineIdlePath&&art.portrait.path===sample.baselinePortraitPath);
  pinCombatAssets([fighter,opponent],[stage]);const ready=await prepareCombatAssets([fighter,opponent],[stage]);check(label+': ordinary combat preflight',ready.ok,ready);
  const effects=await prepareProjectileBitmaps([fighter,opponent]);check(label+': existing projectile preflight',effects.ok,effects);
  check(label+': combat pins resident',spriteCache.pinnedFrames().every(f=>spriteCache.status(f.path)==='ready'));
  const canvas=createCanvas(1280,720),ctx=canvas.getContext('2d'),nativeDraw=ctx.drawImage.bind(ctx);let draws=[];
  ctx.drawImage=(image,...args)=>{const result=nativeDraw(image,...args),path=imagePaths.get(image);if(path){const m=ctx.getTransform();draws.push({path,args,matrix:[m.a,m.b,m.c,m.d,m.e,m.f],frame:engine?.frame});}return result;};
  engine=new FightEngine(canvas,options(player===0?fighter:opponent,player===1?fighter:opponent,stage));row.introTicks=intro(label);
  const ownPaths=new Set(art.frames.map(f=>f.path)),ownDraw=()=>draws.findLast(d=>ownPaths.has(d.path));
  const step=()=>{engine.update();draws=[];engine.render(engine.frame*1000/60);return{state:actorState(player),draw:ownDraw()};};
  step();check(label+': original idle initially painted',ownDraw()?.path===idleFrame.path);
  const action=sample.pose==='neutralLight'?'light':'special';emit(row,'keydown',player,action);const begun=step();emit(row,'keyup',player,action);
  check(label+': neutral command selects intended attack',begun.state.attack?.key===sample.pose&&begun.draw?.path===actionFrame.path,begun);
  let capturedActive=false,capturedIdle=false;
  for(let tick=0;tick<240;tick++){
   const current=step(),attack=current.state.attack;
   if(attack?.key===sample.pose){
    const g=geometry(current.draw);row.attackFrames.push({frame:engine.frame,...current,geometry:g});
    if(!capturedActive&&attack.frame>=attack.startup&&attack.frame<attack.startup+attack.active){
     const shot=await capture(canvas,label+'-action-active.png','actual-native-FightEngine-active-attack',{fighterId:sample.id,player,pose:sample.pose,frame:engine.frame,state:current.state,draw:current.draw,geometry:g});
     row.captures.push(shot.file);capturedActive=true;
    }
   }else if(capturedActive&&current.state.state==='idle'&&current.state.grounded&&current.draw?.path===idleFrame.path){
    const shot=await capture(canvas,label+'-recovered-idle.png','actual-native-FightEngine-natural-recovery',{fighterId:sample.id,player,frame:engine.frame,state:current.state,draw:current.draw,geometry:geometry(current.draw)});
    row.captures.push(shot.file);capturedIdle=true;break;
   }
  }
  check(label+': active attack and natural recovery captured',capturedActive&&capturedIdle);
  check(label+': every observed attack uses exact action image',row.attackFrames.length>0&&row.attackFrames.every(r=>r.draw?.path===actionFrame.path&&r.draw.frame===r.frame));
  check(label+': complete framing in viewport',row.attackFrames.every(r=>r.geometry?.complete));
  check(label+': correct natural orientation',row.attackFrames.every(r=>r.state.facing===facing&&Math.sign(r.draw.matrix[0])===facing*(actionFrame.facing||1)));
  check(label+': grounded action and calibrated feet',row.attackFrames.every(r=>r.state.grounded&&Math.abs(r.geometry.footOffsetPixels)<1),row.attackFrames.map(r=>r.geometry.footOffsetPixels));
  check(label+': no input held after recovery',engine.input.held.size===0);
  check(label+': portrait never substituted for combat',!draws.some(d=>d.path===art.portrait.path));
  destroy(label);console.log(JSON.stringify({case:label,passed:true,captures:row.captures.length}));
 }

 if(samples.length){
  const nurse=samples.find(s=>s.id==='sh3_nurse_revolver_044'),frame=frameByPath.get(nurse.path),raw=await sharp(bytesByPath.get(nurse.path)).ensureAlpha().raw().toBuffer();
  const visible=frame.visibleBounds,framing=frame.framingBounds||visible;
  const scan=predicate=>{let count=0,maxAlpha=0,sumAlpha=0,bounds=[frame.width,frame.height,0,0],aboveOne=0,aboveEight=0;
   for(let y=0;y<frame.height;y++)for(let x=0;x<frame.width;x++)if(predicate(x,y)){
    const alpha=raw[(y*frame.width+x)*4+3];if(alpha){count++;sumAlpha+=alpha;maxAlpha=Math.max(maxAlpha,alpha);bounds=[Math.min(bounds[0],x),Math.min(bounds[1],y),Math.max(bounds[2],x+1),Math.max(bounds[3],y+1)];if(alpha>1)aboveOne++;if(alpha>8)aboveEight++;}}
   return{nonzeroPixels:count,maxAlpha,sumAlpha,alphaAboveOne:aboveOne,alphaAboveEight:aboveEight,bounds:count?bounds:null};};
  report.nurseAlpha={path:nurse.path,sha256:nurse.sha256,visibleBounds:visible,framingBounds:framing,
   aboveVisibleSilhouette:scan((x,y)=>y<visible[1]),outsideVisibleBounds:scan((x,y)=>x<visible[0]||x>=visible[2]||y<visible[1]||y>=visible[3]),
   outsideFramingBounds:scan((x,y)=>x<framing[0]||x>=framing[2]||y<framing[1]||y>=framing[3]),
   note:'Measured outside bounding rectangles, not a semantic silhouette segmentation. Native alpha is unchanged; visual review still required.'};
  const image=await spriteCache.load(frame);check('Nurse diagnostic image decodes',!!image);
  const matte=createCanvas(frame.width,frame.height),matteCtx=matte.getContext('2d');matteCtx.fillStyle='#080808';matteCtx.fillRect(0,0,matte.width,matte.height);matteCtx.drawImage(image,0,0);
  await capture(matte,'nurse-alpha-dark-native.png','diagnostic-original-RGBA-on-dark-matte',{sourcePath:nurse.path,sourceSHA256:nurse.sha256,sourcePixelScale:1,matte:'#080808',gameplayCapture:false});
 }
 for(const [path,hashes] of Object.entries(report.sourceHashes)){hashes.after=digest(await readFile(resolve(root,path)));check('Renderer or engine source unchanged '+path,hashes.before===hashes.after);}
 for(const [path,hashes] of Object.entries(report.catalogueHashes)){hashes.after=digest(await readFile(resolve(root,path)));hashes.unchanged=hashes.before===hashes.after;}
 const freshSprites=(await import(pathToFileURL(resolve(root,'src/sprite-manifest.js')).href+'?qa_after='+Date.now())).SPRITES;
 const freshStages=(await import(pathToFileURL(resolve(root,'src/stage-bitmap-manifest.js')).href+'?qa_after='+Date.now())).STAGE_BITMAPS;
 for(const fighter of fighters)check('Tested sprite entry unchanged '+fighter.id,digest(JSON.stringify(freshSprites[fighter.id]))===report.testedSpriteEntryHashes[fighter.id]);
 for(const stage of stages)check('Tested stage entry unchanged '+stage.id,digest(JSON.stringify(stageBitmapFor(stage,freshStages)))===report.testedStageEntryHashes[stage.id]);
 for(const frame of descriptors)check('Source PNG unchanged '+frame.path,digest(await readFile(resolve(root,frame.path)))===frame.sha256);
 report.cataloguePolicy='Whole catalogue hashes are recorded. Unrelated parallel imports may change them; exact tested entries, original image bytes and renderer/engine source must remain unchanged.';
}catch(error){report.failure=String(error.stack||error);report.errors.push(String(error.message||error));process.exitCode=1;}
finally{
 engine?.destroy();report.passed=report.errors.length===0;report.completedAt=new Date().toISOString();
 await writeFile(reportFile,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({passed:report.passed,section,checks:report.checks.length,characters:report.cases.length,stages:report.stageCases.length,captures:report.captures.length,report:reportFile,failure:report.failure}));
 if(!report.passed)process.exitCode=1;
}
