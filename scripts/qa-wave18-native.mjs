/** Read-only wave18 art/input QA. All generated evidence stays beside this harness.
 * No source edits, HTTP/browser launch, actor-state injection or registry mutation.
 * HALO_QA_ROOT=/checkout node qa-wave18-native.mjs --out=/new/evidence/directory
 */
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const require=createRequire(import.meta.url);
const option=(name,fallback='')=>process.argv.find(x=>x.startsWith('--'+name+'='))?.slice(name.length+3)||fallback;
if(process.argv.includes('--help')){console.log('Read-only wave18 native Canvas/FightEngine QA. Set HALO_QA_ROOT and --out=/new/output. Requires @napi-rs/canvas and sharp.');process.exit(0);}
const root=resolve(process.env.HALO_QA_ROOT||fileURLToPath(new URL('../',import.meta.url)));
const output=option('out');if(!output)throw Error('A fresh --out directory is required.');
const out=resolve(output),digest=bytes=>createHash('sha256').update(bytes).digest('hex');
try{await access(join(out,'report.json'));throw Error('Existing evidence is preserved. Choose a new --out.');}catch(e){if(e.code!=='ENOENT')throw e;}
const loadDependency=name=>{
  try{return require(name);}catch(original){
    for(const folder of [process.env.HALO_QA_NODE_MODULES,process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES].filter(Boolean)){
      try{return createRequire(join(folder,'__halo_wave18_native_loader.cjs'))(name);}catch{}
    }
    throw Error('Missing '+name+': '+original.message);
  }
};
const report={schema:1,label:'wave18-native-art-and-inputs',generatedAt:new Date().toISOString(),root,
  browserTest:false,httpTest:false,browserLaunches:0,httpServersStarted:0,actorStateInjected:false,
  checks:[],errors:[],cases:[],captures:[],assets:[],roles:[],sourceHashes:{},rendererPreviews:[],
  method:{engine:'Actual FightEngine.update/render; native Canvas drawImage observed after executing its real draw.',
    inputs:'Only original InputState keydown/keyup callbacks receive synthetic events. No held/pressed sets or actor positions, facing, health, phase, clocks or attack objects are assigned.',
    oppositeSides:'Separate ordinary local duels put each controlled fighter in the real player1 or player2 spawn. No teleport, actor swap or pose injection.',
    decoder:'Exact source bytes verified. Sharp normalizes PNG encoding only in memory for native decoding; all decoded RGBA bytes compared.',
    blockedRole:'Return Lying Figure is renderer-only art preview, clearly separate from eligible FightEngine duels; combat policy is never changed.'},
  limits:['Native Canvas is not Chromium; DOM/CSS, actual browser keyboard delivery, HTTP, service worker and CI browser behavior are not tested.',
    'Timing and mirrored left views are authored versus presentation; no original film/game animation timing or 1:1 fidelity is certified.',
    'Attacks are exercised as ordinary whiffs at the normal spawn, not a complete hit/guard/recovery gameplay matrix.',
    'Skull/torso size, foot contacts and limb identity still require visual review of the native captures.']};
function check(name,passed,detail){report.checks.push({name,passed:!!passed,...(detail===undefined?{}:{detail})});if(!passed){report.errors.push(name);throw Error(name);}}
const files=['art/registry.json','art/stage-registry.json','src/sprite-manifest.js','src/stage-bitmap-manifest.js','src/fight.js','src/sprite-system.js','src/sprite-animation.js','src/renderers.js','src/stage-bitmap-compositions.js'];
const ids=['origins_faceless_nurse','arcade_scraper_arcade','homecoming_scarlet_doll_form_094','film_mannequin_monster_176','film_lying_figure_return_to_silent_hill'];
const stages=['midwich_nightmare','building_world'],opponentId='sh2_creeper_025';
let engine;
await mkdir(out,{recursive:true});
try{
  const {createCanvas,Image}=loadDependency('@napi-rs/canvas'),sharp=loadDependency('sharp');
  report.dependencies={node:process.version,canvas:loadDependency('@napi-rs/canvas/package.json').version,sharp:sharp.versions.sharp};
  report.harnessSHA256=digest(await readFile(fileURLToPath(import.meta.url)));
  for(const path of files){try{report.sourceHashes[path]={before:digest(await readFile(resolve(root,path)))};}catch(e){if(e.code!=='ENOENT')throw e;}}
  const events=new Map(),documentEvents=new Map(),storage=new Map();
  const listen=(map,type,fn)=>{if(!map.has(type))map.set(type,new Set());map.get(type).add(fn);};
  globalThis.window={};globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
  globalThis.document={hidden:false,addEventListener:(t,f)=>listen(documentEvents,t,f),removeEventListener:(t,f)=>documentEvents.get(t)?.delete(f)};
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{getGamepads:()=>[],vibrate:()=>false,userActivation:{hasBeenActive:false}}});
  globalThis.addEventListener=(t,f)=>listen(events,t,f);globalThis.removeEventListener=(t,f)=>events.get(t)?.delete(f);
  globalThis.requestAnimationFrame=()=>0;globalThis.cancelAnimationFrame=()=>{};
  const mod=name=>import(pathToFileURL(resolve(root,'src',name)).href);
  const [{getFighter,getStage,createCombatProfile,VERSION},{SPRITES},
    {spriteCache,paintRasterPortrait,drawRasterMonster},{stageBitmapCache,stageBitmapFrames,pinCombatAssets,prepareCombatAssets,stageBitmapFor},
    {FightEngine},{drawStage}]=await Promise.all([mod('data.js'),mod('sprite-manifest.js'),mod('sprite-system.js'),mod('stage-bitmaps.js'),mod('fight.js'),mod('renderers.js')]);
  report.version=VERSION;
  for(const id of [...ids,opponentId])report.roles.push({id,...createCombatProfile(getFighter(id)).referencePolicy});
  check('Return remains combat-disabled',report.roles.find(x=>x.id===ids[4]).combatEnabled===false);
  check('Mannequin retains its eligible scripted-encounter role',report.roles.find(x=>x.id===ids[3]).role==='scripted-encounter'&&report.roles.find(x=>x.id===ids[3]).combatEnabled===true);
  const preserved={film_mannequin_monster_176:'dc9b92150b37cd46b6fa633bfd02b635ff98d71349f0b078f83c96119a9e8eb7',film_lying_figure_return_to_silent_hill:'03b36f63842238bd56c10ed99665ea4535a3096fdd39eebc3d6f6ca5c2741014'};
  for(const [id,hash] of Object.entries(preserved))check('Historical portrait preserved and separated: '+id,SPRITES[id].portrait.sha256===hash&&SPRITES[id].frames.every(f=>f.path!==SPRITES[id].portrait.path));
  const descriptors=[...new Map([...ids,opponentId].flatMap(id=>[...SPRITES[id].frames,SPRITES[id].portrait]).concat(stageBitmapFrames(stages.map(getStage))).filter(Boolean).map(f=>[f.path,f])).values()];
  const bytesByPath=new Map(),imagePaths=new WeakMap(),frameByPath=new Map(descriptors.map(f=>[f.path,f]));
  for(const frame of descriptors){
    const bytes=await readFile(resolve(root,frame.path));
    check('Exact original bytes: '+frame.path,bytes.length===frame.bytes&&digest(bytes)===frame.sha256);
    const normalized=await sharp(bytes).png().toBuffer();
    const before=await sharp(bytes).ensureAlpha().raw().toBuffer(),after=await sharp(normalized).ensureAlpha().raw().toBuffer();
    check('In-memory decoder adapter preserves RGBA: '+frame.path,before.equals(after));
    bytesByPath.set(frame.path,normalized);report.assets.push({path:frame.path,sha256:frame.sha256,bytes:bytes.length,width:frame.width,height:frame.height,rawRGBAHash:digest(before),adapterLossless:true});
  }
  for(const cache of [spriteCache,stageBitmapCache]){
    let latest;
    cache.createImage=()=>{const image=new Image();latest=image;image.decode=undefined;
      for(const property of ['onload','onerror']){let callback;Object.defineProperty(image,property,{get:()=>callback,set:value=>{callback=typeof value==='function'?(...args)=>{void value(...args);}:undefined;}});}
      return image;
    };
    cache.url=path=>{imagePaths.set(latest,path);return bytesByPath.get(path);};
  }
  const capture=async(canvas,file,detail={})=>{const bytes=canvas.toBuffer('image/png');await writeFile(join(out,file),bytes);const row={file,sha256:digest(bytes),bytes:bytes.length,width:canvas.width,height:canvas.height,...detail};report.captures.push(row);return row;};
  for(const id of ids){
    spriteCache.pin([]);await spriteCache.load(SPRITES[id].portrait);
    const canvas=createCanvas(500,500);canvas.dataset={};paintRasterPortrait(canvas,getFighter(id));
    check('Native historical selection decodes: '+id,canvas.dataset.artStatus==='raster');
    await capture(canvas,'selection-'+id+'.png',{purpose:'preserved-selection',fighterId:id,path:SPRITES[id].portrait.path});
  }
  function geometry(row){
    const frame=row&&frameByPath.get(row.path);if(!frame||row.args.length!==4)return {complete:false};
    const [dx,dy,dw,dh]=row.args,[a,b,c,d,tx,ty]=row.matrix;
    const transform=bounds=>{const [l,t,r,bt]=bounds;const points=[[l,t],[r,t],[l,bt],[r,bt]].map(([u,v])=>{const x=dx+u/frame.width*dw,y=dy+v/frame.height*dh;return [a*x+c*y+tx,b*x+d*y+ty];});return [Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))];};
    const exterior=transform(frame.framingBounds||frame.visibleBounds),visible=transform(frame.visibleBounds);
    return {complete:exterior.every(Number.isFinite)&&exterior[0]>=0&&exterior[1]>=0&&exterior[2]<=1280&&exterior[3]<=720,exterior,visible,
      pixelScale:Math.abs(dw/frame.width*a),anchor:frame.anchor,bodyHeight:frame.bodyHeight,soleOffsetFromActor:row.actor?visible[3]-row.actor.y:null};
  }
  for(const [fighterIndex,fighterId] of ids.slice(0,4).entries())for(const playerIndex of [0,1]){
    const facing=playerIndex===0?1:-1,stageId=stages[playerIndex],fighter=getFighter(fighterId),opponent=getFighter(opponentId),stage=getStage(stageId),art=SPRITES[fighterId],stageArt=stageBitmapFor(stage);
    const label=fighterId+'-'+(facing===1?'right':'left'),caseReport={label,fighterId,playerIndex,facing,stageId,clips:art.clips,commands:[],walks:[],attacks:[],guards:[],captures:[],draws:[]};report.cases.push(caseReport);
    console.log(JSON.stringify({progress:'starting',case:label,stageId}));
    check(label+': role remains combat-enabled',createCombatProfile(fighter).referencePolicy.combatEnabled===true);
    pinCombatAssets([fighter,opponent],[stage]);const preflight=await prepareCombatAssets([fighter,opponent],[stage]);check(label+': actual preflight succeeds',preflight.ok,preflight);
    const canvas=createCanvas(1280,720),ctx=canvas.getContext('2d'),nativeDraw=ctx.drawImage.bind(ctx),last=new Map(),owned=new Set(art.frames.map(f=>f.path));let segment='intro';
    const actorState=()=>{const a=engine.actors[playerIndex];return {id:a.data.id,x:a.x,y:a.y,vx:a.vx,vy:a.vy,facing:a.facing,state:a.state,grounded:a.grounded,blocking:a.blocking,spriteTick:a.spriteClock?.tick,spritePose:a.spriteClock?.pose,attack:a.attack?{key:a.attack.key,frame:a.attack.frame}:null};};
    ctx.drawImage=(image,...args)=>{const result=nativeDraw(image,...args),path=imagePaths.get(image);if(path){const m=ctx.getTransform(),row={segment,engineFrame:engine?.frame??null,path,args,matrix:[m.a,m.b,m.c,m.d,m.e,m.f],actor:engine?actorState():null,actorX:engine?.actors.map(a=>a.x)||null};last.set(path,row);caseReport.draws.push(row);}return result;};
    engine=new FightEngine(canvas,{p1:playerIndex===0?fighter:opponent,p2:playerIndex===1?fighter:opponent,stage,mode:'local',timeLimit:0,seed:71119+fighterIndex,
      artDiagnostic:false,ritualId:'none',stageHazards:false,stageDirector:false,otherworldShift:false,fatalities:false,stageFatalities:false,stageTerrain:false,stageAnimations:true,radioWarning:false});
    check(label+': original InputState callbacks registered',events.get('keydown')?.has(engine.input.onDown)&&events.get('keyup')?.has(engine.input.onUp));
    const input=action=>engine.bindings.players[playerIndex][action];
    function emit(type,code){const event={type,code,repeat:false,defaultPrevented:false,isComposing:false,ctrlKey:false,metaKey:false,altKey:false,target:{isContentEditable:false,closest:()=>null},preventDefault(){this.defaultPrevented=true;}};
      const callbacks=[...(events.get(type)||[])];check(label+': original callback available '+type+' '+code,callbacks.includes(type==='keydown'?engine.input.onDown:engine.input.onUp));
      for(const callback of callbacks)callback(event);const accepted=type==='keydown'?engine.input.isDown(code):!engine.input.isDown(code);
      caseReport.commands.push({type,code,frame:engine.frame,accepted,prevented:event.defaultPrevented,syntheticNativeEvent:true,originalCallback:true});check(label+': input accepted '+type+' '+code,accepted&&(type!=='keydown'||event.defaultPrevented));}
    const gameRow=()=>caseReport.draws.findLast(r=>r.engineFrame===engine.frame&&owned.has(r.path));
    const step=label=>{segment=label;engine.update();engine.render(engine.frame*1000/60);return gameRow();};
    async function gameCapture(name,detail={}){const row=gameRow(),record=await capture(canvas,label+'-'+name+'.png',{purpose:'actual-native-FightEngine',fighterId,stageId,playerIndex,state:actorState(),draw:row,geometry:geometry(row),camera:{...engine.presentationCamera},...detail});caseReport.captures.push(record.file);return record;}
    let introTicks=0;while((engine.phase!=='fight'||engine.texts.some(t=>['intro','round','fight'].includes(t.kind))||engine.actors[playerIndex].presentation)&&introTicks<1200){engine.update();introTicks++;}
    check(label+': intro ends naturally',engine.phase==='fight'&&!engine.paused&&!engine.actors[playerIndex].presentation,{introTicks});
    step('idle');check(label+': native idle selected',gameRow()?.path===art.frames[art.clips.idle.frames[0]].path&&actorState().spritePose==='idle');
    check(label+': complete initial silhouette',geometry(gameRow()).complete,geometry(gameRow()));await gameCapture('idle');
    const stageBefore=stageArt.layers.map(layer=>last.get(layer.frames[0].path));
    check(label+': both scenery planes painted',stageBefore.length===2&&stageBefore.every(Boolean));
    if(fighterId==='origins_faceless_nurse'){
      const clip=art.clips.neutralSpecial,expected=[4,5,4,0];check(label+': authored attack clip retained',JSON.stringify(clip.frames)===JSON.stringify(expected)&&JSON.stringify(clip.frameTicks)==='[15,6,13,13]'&&!clip.loop);
      const rows=[],captured=new Set();emit('keydown',input('special'));
      try{rows.push(step('neutralSpecial'));}finally{emit('keyup',input('special'));}
      check(label+': normal special button starts exact move',actorState().attack?.key==='neutralSpecial');
      for(let i=0;i<90;i++){
        const row=gameRow(),key=(row?.path||'')+':'+(actorState().attack?.frame===0?'initial':'');
        if(row&&actorState().attack){if(!captured.has(row.path)){await gameCapture('attack-frame'+art.frames.findIndex(f=>f.path===row.path),{attackFrame:actorState().attack.frame});captured.add(row.path);}}
        if(!actorState().attack)break;rows.push(step('neutralSpecial'));
      }
      const attackRows=rows.filter(r=>r?.actor.attack?.key==='neutralSpecial'),transitions=[];
      for(const row of attackRows){const index=art.frames.findIndex(f=>f.path===row.path),lastStep=transitions.at(-1);if(lastStep?.frameIndex===index){lastStep.ticks++;lastStep.lastAttackTick=row.actor.attack.frame;}else transitions.push({frameIndex:index,ticks:1,firstAttackTick:row.actor.attack.frame,lastAttackTick:row.actor.attack.frame});}
      check(label+': actual attack PNG order is preparation/contact/recovery/idle',JSON.stringify(transitions.map(x=>x.frameIndex))===JSON.stringify(expected),transitions);
      check(label+': every attack silhouette fits',attackRows.every(row=>geometry(row).complete));
      check(label+': normal attack returns to idle',!actorState().attack&&actorState().state==='idle');
      caseReport.attacks.push({move:'neutralSpecial',transitions,rows:attackRows});step('attack-released-idle');await gameCapture('attack-released-idle');
    }
    if(art.clips.walk){
      const clip=art.clips.walk,durations=clip.frameTicks||clip.frames.map(()=>clip.ticksPerFrame),total=durations.reduce((a,b)=>a+b,0),rows=[],start=actorState(),captureTicks=new Set();let elapsed=0;for(const d of durations){captureTicks.add(elapsed);elapsed+=d;}
      check(label+': walk has distinct images and loops',clip.loop===true&&new Set(clip.frames).size>=3);
      const walkCode=input(facing===1?'right':'left');emit('keydown',walkCode);
      try{for(let tick=0;tick<2*total;tick++){const row=step('walk');rows.push(row);if(captureTicks.has(tick))await gameCapture('walk-tick'+tick+'-frame'+art.frames.findIndex(f=>f.path===row?.path),{expectedWalkTick:tick});}}
      finally{emit('keyup',walkCode);}
      const expectedIndex=tick=>{let t=tick%total;for(let i=0;i<durations.length;i++){if(t<durations[i])return clip.frames[i];t-=durations[i];}return clip.frames.at(-1);};
      check(label+': two walk cycles use actual expected PNGs',rows.every((row,tick)=>row?.path===art.frames[expectedIndex(tick)].path&&row.actor.state==='walk'&&row.actor.spritePose==='walk'&&row.actor.spriteTick===tick));
      check(label+': whole walk silhouettes fit',rows.every(row=>geometry(row).complete),rows.filter(row=>!geometry(row).complete).map(row=>({tick:row.actor.spriteTick,geometry:geometry(row)})));
      check(label+': actual facing and Canvas mirroring agree',rows.every(row=>row.actor.facing===facing&&Math.sign(row.matrix[0])===facing*(frameByPath.get(row.path).facing||1)));
      const end=actorState();check(label+': ordinary movement changes position',facing===1?end.x>start.x+1:end.x<start.x-1,{start,end});
      caseReport.walks.push({cycles:2,totalTicks:2*total,start,end,rows:rows.map(row=>({...row,geometry:geometry(row)}))});
      const after=stageArt.layers.map(layer=>last.get(layer.frames[0].path)),delta=after.map((row,i)=>row.args.at(-4)-stageBefore[i].args.at(-4)),expected=after.map((row,i)=>-(row.actorX.reduce((s,x)=>s+x,0)-stageBefore[i].actorX.reduce((s,x)=>s+x,0))*(stageArt.layers[i].parallaxX||0));
      check(label+': actual two-plane parallax matches authored values',Math.abs(delta[0]-delta[1])>.1&&delta.every((x,i)=>Math.abs(x-expected[i])<.03),{delta,expected});caseReport.stageParallax={before:stageBefore,after,delta,expected};
      const released=[];for(let t=0;t<10;t++)released.push(step('walk-released-idle'));
      check(label+': release restores idle',released.every(row=>row.path===art.frames[art.clips.idle.frames[0]].path&&row.actor.spritePose==='idle'));await gameCapture('walk-released-idle');
    }
    if(art.clips.guard){
      const rows=[];emit('keydown',input('guard'));try{for(let t=0;t<14;t++){rows.push(step('guard'));if(t===0)await gameCapture('guard');}}finally{emit('keyup',input('guard'));}
      check(label+': held guard uses its own native PNG',rows.every(row=>row.path===art.frames[art.clips.guard.frames[0]].path&&row.actor.blocking&&row.actor.spritePose==='guard'));
      check(label+': whole guard silhouette fits',rows.every(row=>geometry(row).complete));caseReport.guards.push({ticks:14,first:rows[0],last:rows.at(-1)});
      for(let t=0;t<10;t++)step('guard-released-idle');await gameCapture('guard-released-idle');
    }
    check(label+': game never substitutes preserved selection',!caseReport.draws.some(row=>row.path===art.portrait.path));
    check(label+': no input remains held',engine.input.held.size===0);caseReport.finalState=actorState();caseReport.frameCount=engine.frame;
    engine.destroy();check(label+': callbacks removed by teardown',!events.get('keydown')?.has(engine.input.onDown)&&!events.get('keyup')?.has(engine.input.onUp));engine=null;
    console.log(JSON.stringify({progress:'completed',case:label,captures:caseReport.captures.length}));
  }
  // A source-role-disabled candidate is inspected with the real raster renderer only.
  const blocked=getFighter(ids[4]),stage=getStage(stages[1]);
  pinCombatAssets([blocked],[stage]);check('Blocked-role renderer preview assets prepare', (await prepareCombatAssets([blocked],[stage])).ok);
  for(const facing of [1,-1]){
    const canvas=createCanvas(1280,720),ctx=canvas.getContext('2d');drawStage(ctx,stage,0,{width:1280,height:720,animationsEnabled:true});
    const result=drawRasterMonster(ctx,blocked,640,594,{facing,state:{},shadow:true});
    check('Return preview draws its new idle '+facing,result.kind==='raster'&&result.path===SPRITES[blocked.id].frames[0].path&&!result.fallback);
    const row=await capture(canvas,'return-renderer-preview-'+(facing===1?'right':'left')+'.png',{purpose:'renderer-only-role-disabled',fighterId:blocked.id,combatEnabled:false,facing,result});report.rendererPreviews.push(row);
  }
  for(const [path,hashes] of Object.entries(report.sourceHashes)){hashes.after=digest(await readFile(resolve(root,path)));check('Shared source untouched: '+path,hashes.before===hashes.after);}
  for(const frame of descriptors)check('Source PNG remains unchanged: '+frame.path,digest(await readFile(resolve(root,frame.path)))===frame.sha256);
}catch(error){report.failure=String(error.stack||error);if(!report.errors.includes(error.message))report.errors.push(error.message);process.exitCode=1;}
finally{engine?.destroy();report.passed=report.errors.length===0;report.completedAt=new Date().toISOString();await writeFile(join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,cases:report.cases.length,captures:report.captures.length,report:join(out,'report.json'),failed:report.checks.filter(x=>!x.passed),failure:report.failure}));if(!report.passed)process.exitCode=1;}
