/** Wave32: actual native FightEngine inputs and eight new-pose captures.
 * Derived from the wave31 native harness. No actor, attack, image, camera or
 * clock state is assigned. Walk and neutral attacks use only the original input callbacks.
 * Native Canvas adapters are not a browser or HTTP execution.
 * Usage: node --expose-gc docs/production/vague32/qa-characters-native.mjs
 */
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {reviewedGroundContact} from './characters/qa-ground-contact.mjs';

const require=createRequire(import.meta.url);
const option=(key,fallback)=>process.argv.find(a=>a.startsWith('--'+key+'='))?.slice(key.length+3)||fallback;
const root=resolve(process.env.HALO_QA_ROOT||fileURLToPath(new URL('../../../',import.meta.url)));
const section='characters';
const out=resolve(root,option('out','docs/production/vague32/qa-native-characters'));
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
const report={schema:1,wave:32,section,generatedAt:new Date().toISOString(),browserTest:false,httpTest:false,actorStateInjected:false,
 method:{renderer:'Actual FightEngine.update/render with @napi-rs/canvas; ordinary duel descriptors and natural intros.',
  inputs:'Synthetic keydown/keyup events delivered only to the original registered InputState callbacks. Bindings read from engine.bindings.',
  scheduling:'Manual logical update ticks; engine.frame and actor clocks are never assigned. Native rendering receives the current tick time.',
  decoder:'Exact local PNG bytes verified against manifest; memory-only sharp PNG normalization with full decoded RGBA equality.',
  environment:'Minimal window/document/storage/event/gamepad adapters; requestAnimationFrame does not schedule a browser loop.'},
 limits:['No Chromium, browser DOM/CSS, HTTP delivery, physical keyboard, service worker or offline behavior is tested.',
  'One static attack image is not an animated clip; source timing and fidelity 1:1 remain unverified.',
  'Opposite orientation uses the existing engine mirror, not a separately sourced view.',
  'This is rendering, input route, natural recovery and stage composition QA; not a complete damage, guard, collision or finisher matrix.',
  'Historical frames and calibration remain unchanged; new poses are reviewed candidates, not 1:1-certified animation.'],
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
 for(const path of ['src/fight.js','src/sprite-animation.js','src/sprite-system.js','src/stage-bitmaps.js','src/renderers.js','src/stage-bitmap-compositions.js','src/projectile-bitmaps.js','src/projectile-origin.js'])report.sourceHashes[path]={before:digest(await readFile(resolve(root,path)))};
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
 const characterPlan=JSON.parse(await readFile(resolve(root,'docs/production/vague32/characters/import-plan.json'),'utf8'));
 const baseline=JSON.parse(await readFile(resolve(root,'docs/production/vague32/characters/baseline-owners.json'),'utf8')).assets;
 const samples=characterPlan.plans,stageIds=[];
 check('Requested character plans are exact',JSON.stringify(samples.map(s=>[s.id,s.pose,s.frameIndex]))===JSON.stringify([['sh1_groaner_003','neutralLight',5],['sh1_groaner_003','neutralSpecial',6],['sh4_sniffer_dog_male_053','walk',2],['sh4_sniffer_dog_male_053','neutralLight',3]]));
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

 for(const sample of samples)for(const player of [0,1]){
  const fighter=getFighter(sample.id),stage=getStage('midwich_nightmare'),art=SPRITES[sample.id],clip=art.clips[sample.pose],facing=player===0?1:-1;
  const actionFrame=art.frames[clip.frames[0]],idleFrame=art.frames[art.clips.idle.frames[0]],label=sample.id+'-'+sample.pose+(player===0?'-right':'-left');
  const groundContact=reviewedGroundContact(sample,actionFrame);
  const row={label,fighterId:sample.id,source:sample.source,pose:sample.pose,player,facing,groundContact,stageId:stage.id,commands:[],attackFrames:[],captures:[]};report.cases.push(row);
  check(label+': exact static action clip',clip.frames.length===1&&clip.frames[0]===sample.frameIndex&&clip.ticksPerFrame===1&&clip.loop===false&&actionFrame.path===sample.path&&actionFrame.sha256===sample.sha256);
  check(label+': original idle and portrait preserved',idleFrame.path===baseline[sample.id].frames[0].path&&art.portrait.path===baseline[sample.id].portrait.path);
  pinCombatAssets([fighter,opponent],[stage]);const ready=await prepareCombatAssets([fighter,opponent],[stage]);check(label+': ordinary combat preflight',ready.ok,ready);
  const effects=await prepareProjectileBitmaps([fighter,opponent]);check(label+': existing projectile preflight',effects.ok,effects);
  check(label+': combat pins resident',spriteCache.pinnedFrames().every(f=>spriteCache.status(f.path)==='ready'));
  const canvas=createCanvas(1280,720),ctx=canvas.getContext('2d'),nativeDraw=ctx.drawImage.bind(ctx);let draws=[];
  ctx.drawImage=(image,...args)=>{const result=nativeDraw(image,...args),path=imagePaths.get(image);if(path){const m=ctx.getTransform();draws.push({path,args,matrix:[m.a,m.b,m.c,m.d,m.e,m.f],frame:engine?.frame});}return result;};
  engine=new FightEngine(canvas,options(player===0?fighter:opponent,player===1?fighter:opponent,stage));row.introTicks=intro(label);
  const ownPaths=new Set(art.frames.map(f=>f.path)),ownDraw=()=>draws.findLast(d=>ownPaths.has(d.path));
  const step=()=>{engine.update();draws=[];engine.render(engine.frame*1000/60);return{state:actorState(player),draw:ownDraw()};};
  step();check(label+': original idle initially painted',ownDraw()?.path===idleFrame.path);
  const startX=engine.actors[player].x,action=sample.pose==='walk'?(player===0?'right':'left'):sample.pose==='neutralLight'?'light':'special';
  emit(row,'keydown',player,action);const begun=step();
  if(sample.pose!=='walk')emit(row,'keyup',player,action);
  check(label+': ordinary command selects intended pose',begun.draw?.path===actionFrame.path&&
    (sample.pose==='walk'?begun.state.state==='walk'&&begun.state.grounded&&!begun.state.attack:begun.state.attack?.key===sample.pose),begun);
  let capturedActive=false,capturedIdle=false;
  for(let tick=0;tick<240;tick++){
   const current=step(),attack=current.state.attack;
   const actionState=sample.pose==='walk'?current.state.state==='walk'&&current.state.grounded&&!attack:attack?.key===sample.pose;
   if(actionState){
    const g=geometry(current.draw),[,dy,,dh]=current.draw.args;
    g.reviewedContactOffsetPixels=(dy+groundContact.pixels[1]/actionFrame.height*dh)*current.draw.matrix[3];
    row.attackFrames.push({frame:engine.frame,...current,geometry:g});
    const active=sample.pose==='walk'||attack.frame>=attack.startup&&attack.frame<attack.startup+attack.active;
    if(!capturedActive&&active){
     if(sample.pose==='walk')check(label+': walk advances toward the opponent',(current.state.x-startX)*facing>0,{startX,x:current.state.x});
     const shot=await capture(canvas,label+'-action-active.png','actual-native-FightEngine-'+sample.pose,{fighterId:sample.id,player,pose:sample.pose,frame:engine.frame,state:current.state,draw:current.draw,geometry:g});
     row.captures.push(shot.file);capturedActive=true;
     if(sample.pose==='walk')emit(row,'keyup',player,action);
    }
   }else if(capturedActive&&current.state.state==='idle'&&current.state.grounded&&current.draw?.path===idleFrame.path){
    row.recovered={fighterId:sample.id,player,frame:engine.frame,state:current.state,draw:current.draw,geometry:geometry(current.draw)};
    capturedIdle=true;break;
   }
  }
  check(label+': active pose and natural recovery captured',capturedActive&&capturedIdle);
  check(label+': every observed action uses exact pose image',row.attackFrames.length>0&&row.attackFrames.every(r=>r.draw?.path===actionFrame.path&&r.draw.frame===r.frame));
  check(label+': complete framing in viewport',row.attackFrames.every(r=>r.geometry?.complete));
  check(label+': correct natural orientation',row.attackFrames.every(r=>r.state.facing===facing&&Math.sign(r.draw.matrix[0])===facing*(actionFrame.facing||1)));
  check(label+': reviewed support point stays within one pixel of actor origin',row.attackFrames.every(r=>Math.abs(r.geometry.reviewedContactOffsetPixels)<1),row.attackFrames.map(r=>({grounded:r.state.grounded,contact:r.geometry.reviewedContactOffsetPixels,lowestVisible:r.geometry.footOffsetPixels})));
  if(groundContact.kind==='measured-claw')check(label+': exact Sniffer tongue overflow is bounded separately',row.attackFrames.every(r=>
    r.geometry.footOffsetPixels>r.geometry.reviewedContactOffsetPixels&&
    r.geometry.footOffsetPixels<=groundContact.maxTongueOverflowWorldPixels*Math.abs(r.draw.matrix[3])),groundContact);
  check(label+': no input held after recovery',engine.input.held.size===0);
  check(label+': portrait never substituted for combat',!draws.some(d=>d.path===art.portrait.path));
  destroy(label);console.log(JSON.stringify({case:label,passed:true,captures:row.captures.length}));
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
