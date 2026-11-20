/** Dedicated Air Screamer animation QA; does not alter qa-characters-native.mjs.
 * Actual FightEngine/InputState/native Canvas, no actor-state injection.
 * HALO_QA_ROOT=/checkout node --expose-gc qa-air-screamer-native.mjs
 *   --landmarks=/reviewed/body-landmarks.json --out=/fresh/evidence
 */
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const require=createRequire(import.meta.url);
const option=(name,fallback='')=>process.argv.find(a=>a.startsWith('--'+name+'='))?.slice(name.length+3)||fallback;
if(process.argv.includes('--help')){console.log('Air Screamer: actual native FightEngine, two 24-tick idle cycles R/L, static walk[3], exact baseline preservation. Requires --landmarks=/file and fresh --out=/dir.');process.exit(0);}
const root=resolve(process.env.HALO_QA_ROOT||fileURLToPath(new URL('../../../',import.meta.url)));
if(!option('out')||!option('landmarks'))throw Error('Explicit --out and --landmarks are required.');
const out=resolve(option('out')),landmarksPath=resolve(option('landmarks'));
const fighterId='sh1_air_screamer_001',opponentId='sh2_creeper_025',stageId=option('stage','hazel_subway');
const baselinePath=resolve(root,'docs/production/vague25/qa-air-screamer-baseline.json');
const digest=x=>createHash('sha256').update(x).digest('hex'),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const close=(a,b,tolerance=.002)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=tolerance;
try{await access(join(out,'report.json'));throw Error('Preserve prior evidence: choose a fresh output.');}catch(e){if(e.code!=='ENOENT')throw e;}
const report={schema:1,label:'wave25-air-screamer-native-animation',generatedAt:new Date().toISOString(),root,
  fighterId,stageId,browserTest:false,httpTest:false,browserLaunches:0,httpServersStarted:0,actorStateInjected:false,
  checks:[],errors:[],cases:[],captures:[],assets:[],roles:[],sourceHashes:{},testedSpriteEntryHashes:{},testedStageEntryHashes:{},
  method:{engine:'Unmodified FightEngine.update/render with native Canvas drawImage observed after the real draw.',
    input:'Only original registered InputState keydown/keyup callbacks receive synthetic events. No writes to actors, input sets, clocks, phase, facing, positions, health or attacks.',
    cadence:'An ordinary 12-tick movement uses existing static walk frame3. Keyup changes the real pose to idle and naturally resets its clock to zero; 48 successive updates/renders observe two complete cycles.',
    orientations:'Separate local duels put Air Screamer in its ordinary player1/player2 spawn. No teleport, actor swap or facing assignment.',
    alignment:'SHA-bound manually reviewed anatomical landmarks are projected through observed drawImage arguments/matrices. Wing extents are not body landmarks.',
    decoder:'Source PNG bytes are verified. Sharp normalizes PNG encoding in memory only, with exact decoded RGBA comparison.'},
  limits:['Native Canvas is not browser/DOM/HTTP/actual physical keyboard validation.',
    'Idle cadence is authored versus timing, not certified timing from the original game. walk[3] is one retained static image, not a multi-frame animation.',
    'Landmarks are manually selected silhouette points and their projection cannot certify canonical anatomy or hidden geometry.',
    'The six named idle pose captures still require manual review for cropping, identity, angle and apparent body stability.',
    'No attack/contact/guard/finisher behavior, role changes or one-to-one fidelity are asserted.']};
function record(name,passed,detail){report.checks.push({name,passed:!!passed,...(detail===undefined?{}:{detail})});if(!passed)report.errors.push(name);return !!passed;}
function check(name,passed,detail){if(!record(name,passed,detail))throw Error(name);}
const loadDependency=name=>{try{return require(name);}catch(original){for(const folder of [process.env.HALO_QA_NODE_MODULES,process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES].filter(Boolean)){try{return createRequire(join(folder,'__halo_air_qa_loader.cjs'))(name);}catch{}}throw Error('Missing '+name+': '+original.message);}};
let engine,descriptors=[];
await mkdir(out,{recursive:true});
try{
  report.harnessSHA256=digest(await readFile(fileURLToPath(import.meta.url)));
  const baselineBytes=await readFile(baselinePath),baseline=JSON.parse(baselineBytes),before=baseline.entry;
  report.preservationBaseline={path:baselinePath,sha256:digest(baselineBytes),entrySHA256:baseline.entrySHA256,baseCommit:baseline.baseCommit};
  check('Exact preimport Air entry snapshot',baseline.fighterId===fighterId&&digest(JSON.stringify(before))===baseline.entrySHA256);
  const protectedPaths=[...new Set([...baseline.protectedFiles.map(f=>f.path),'art/registry.json','src/sprite-manifest.js','src/stage-bitmap-manifest.js','src/stage-bitmaps.js'])];
  for(const path of protectedPaths)report.sourceHashes[path]={before:digest(await readFile(resolve(root,path)))};
  for(const file of baseline.protectedFiles)check('Core/static harness equals preimport baseline: '+file.path,report.sourceHashes[file.path].before===file.sha256);
  const registry=JSON.parse(await readFile(resolve(root,'art/registry.json'),'utf8')),entry=registry.assets[fighterId];
  check('Exactly four frames retained',entry.frames.length===4&&before.frames.length===4);
  check('Portrait metadata unchanged',same(entry.portrait,before.portrait));
  check('Retained static frame3 metadata unchanged',same(entry.frames[3],before.frames[3]));
  for(const field of ['clips','animatedClips','mirrorPolicy','source'])check('Existing field unchanged: '+field,same(entry[field],before[field]));
  check('Idle contract is exactly 0,1,0,2 at six ticks each',same(entry.clips.idle,{frames:[0,1,0,2],ticksPerFrame:6,frameTicks:[6,6,6,6],loop:true}));
  check('Walk remains the one retained static image',same(entry.clips.walk,before.clips.walk)&&same(entry.clips.walk.frames,[3])&&entry.animatedClips===1);
  check('Three replacement idle PNGs are distinct and new',new Set(entry.frames.slice(0,3).map(f=>f.sha256)).size===3&&entry.frames.slice(0,3).every((f,i)=>f.sha256!==before.frames[i].sha256));
  for(const old of [...before.frames,before.portrait])check('Historical PNG remains intact: '+old.path,digest(await readFile(resolve(root,old.path)))===old.sha256);
  const landmarkBytes=await readFile(landmarksPath),landmarkData=JSON.parse(landmarkBytes),landmarks=new Map(landmarkData.landmarks.map(x=>[x.frameIndex,x]));
  report.landmarkEvidence={path:landmarksPath,sha256:digest(landmarkBytes),method:landmarkData.method,landmarks:landmarkData.landmarks};
  check('Three SHA-bound anatomical landmark sets',landmarks.size===3&&[0,1,2].every(i=>landmarks.has(i)&&landmarks.get(i).sha256===entry.frames[i].sha256));
  const pointKeys=Object.keys(landmarks.get(0).pixels);
  check('Common finite body landmarks, independent of wings',pointKeys.length>=2&&[0,1,2].every(i=>same(Object.keys(landmarks.get(i).pixels),pointKeys)&&Object.values(landmarks.get(i).pixels).every(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite))));
  const {createCanvas,Image}=loadDependency('@napi-rs/canvas'),sharp=loadDependency('sharp');
  report.dependencies={node:process.version,canvas:loadDependency('@napi-rs/canvas/package.json').version,sharp:sharp.versions.sharp};
  const events=new Map(),documentEvents=new Map(),storage=new Map(),listen=(map,t,f)=>{if(!map.has(t))map.set(t,new Set());map.get(t).add(f);};
  globalThis.window={};globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
  globalThis.document={hidden:false,addEventListener:(t,f)=>listen(documentEvents,t,f),removeEventListener:(t,f)=>documentEvents.get(t)?.delete(f)};
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{getGamepads:()=>[],vibrate:()=>false,userActivation:{hasBeenActive:false}}});
  globalThis.addEventListener=(t,f)=>listen(events,t,f);globalThis.removeEventListener=(t,f)=>events.get(t)?.delete(f);
  globalThis.requestAnimationFrame=()=>0;globalThis.cancelAnimationFrame=()=>{};
  const mod=name=>import(pathToFileURL(resolve(root,'src',name)).href);
  const [{getFighter,getStage,ROSTER,createCombatProfile,VERSION},{SPRITES},{spriteCache,paintRasterPortrait},
    {stageBitmapCache,stageBitmapFrames,pinCombatAssets,prepareCombatAssets,stageBitmapFor},{FightEngine},{bodyProfile}]=await Promise.all([
    mod('data.js'),mod('sprite-manifest.js'),mod('sprite-system.js'),mod('stage-bitmaps.js'),mod('fight.js'),mod('combat-geometry.js')]);
  report.version=VERSION;
  const fighter=getFighter(fighterId),opponent=getFighter(opponentId),stage=getStage(stageId),art=SPRITES[fighterId];
  report.testedSpriteEntryHashes=Object.fromEntries([fighterId,opponentId].map(id=>[id,digest(JSON.stringify(SPRITES[id]))]));
  report.testedStageEntryHashes={[stageId]:digest(JSON.stringify(stageBitmapFor(stage)))};
  report.cataloguePolicy='Global catalogues are hashed before/after this run. Later unrelated imports require exact tested entry/module hashes for evidence aggregation.';
  const waveBaseline=JSON.parse(await readFile(resolve(root,'docs/production/vague25/scope-baseline.json'),'utf8'));
  check('Runtime fighter definition unchanged',digest(JSON.stringify(ROSTER.find(f=>f.id===fighterId)))===waveBaseline.roster.find(f=>f.id===fighterId).definitionSHA256);
  report.roles=[fighter,opponent].map(f=>({id:f.id,...createCombatProfile(f).referencePolicy}));
  check('Existing Air role allows ordinary combat/movement',report.roles[0].combatEnabled===true&&report.roles[0].canMove!==false);
  check('Manifest uses exact registry frames/calibration',art.frames.length===4&&art.frames.every((f,i)=>f.path===entry.frames[i].path&&f.sha256===entry.frames[i].sha256&&same(f.anchor,entry.frames[i].anchor)&&f.bodyHeight===entry.frames[i].bodyHeight&&f.facing===entry.frames[i].facing));
  check('Manifest preserves clips and portrait',same(art.clips,entry.clips)&&art.portrait.sha256===before.portrait.sha256&&art.animatedClips===1);
  check('Shared idle body calibration uses no wing-height normalization',art.frames.slice(1,3).every(f=>same(f.anchor,art.frames[0].anchor)&&f.bodyHeight===art.frames[0].bodyHeight&&f.width===art.frames[0].width&&f.height===art.frames[0].height));
  descriptors=[...new Map([fighterId,opponentId].flatMap(id=>[...SPRITES[id].frames,SPRITES[id].portrait]).concat(stageBitmapFrames([stage])).filter(Boolean).map(f=>[f.path,f])).values()];
  const bytesByPath=new Map(),imagePaths=new WeakMap(),frameByPath=new Map(descriptors.map(f=>[f.path,f]));
  for(const frame of descriptors){const bytes=await readFile(resolve(root,frame.path));check('Exact PNG bytes: '+frame.path,bytes.length===frame.bytes&&digest(bytes)===frame.sha256);
    const normalized=await sharp(bytes).png().toBuffer(),rawBefore=await sharp(bytes).ensureAlpha().raw().toBuffer(),rawAfter=await sharp(normalized).ensureAlpha().raw().toBuffer();
    check('Lossless in-memory decoder: '+frame.path,rawBefore.equals(rawAfter));bytesByPath.set(frame.path,normalized);
    report.assets.push({path:frame.path,sha256:frame.sha256,bytes:bytes.length,width:frame.width,height:frame.height,rawRGBAHash:digest(rawBefore),adapterLossless:true});}
  globalThis.gc?.();
  for(const cache of [spriteCache,stageBitmapCache]){let latest;cache.createImage=()=>{const image=new Image();latest=image;image.decode=undefined;
      for(const property of ['onload','onerror']){let callback;Object.defineProperty(image,property,{get:()=>callback,set:value=>{callback=typeof value==='function'?(...args)=>{void value(...args);}:undefined;}});}return image;};
    cache.url=path=>{imagePaths.set(latest,path);return bytesByPath.get(path);};}
  const capture=async(canvas,file,detail)=>{const bytes=canvas.toBuffer('image/png');await writeFile(join(out,file),bytes);const row={file,sha256:digest(bytes),bytes:bytes.length,width:canvas.width,height:canvas.height,...detail};report.captures.push(row);return row;};
  spriteCache.pin([]);await spriteCache.load(art.portrait);const portrait=createCanvas(500,500);portrait.dataset={};paintRasterPortrait(portrait,fighter);
  check('Preserved selection renders natively',portrait.dataset.artStatus==='raster');await capture(portrait,'selection-'+fighterId+'.png',{purpose:'preserved-selection',fighterId,path:art.portrait.path});
  function geometry(row){const frame=frameByPath.get(row.path),[dx,dy,dw,dh]=row.args,[a,b,c,d,tx,ty]=row.matrix;
    const project=([u,v])=>{const x=dx+u/frame.width*dw,y=dy+v/frame.height*dh;return [a*x+c*y+tx,b*x+d*y+ty];};
    const transform=bounds=>{const [l,t,r,bt]=bounds,points=[[l,t],[r,t],[l,bt],[r,bt]].map(project);return [Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))];};
    const exterior=transform(frame.framingBounds||frame.visibleBounds),visible=transform(frame.visibleBounds),anchorScreen=project([frame.anchor[0]*frame.width,frame.anchor[1]*frame.height]);
    const index=art.frames.findIndex(f=>f.path===row.path),points=landmarks.get(index)?.pixels||{};
    const projectedLandmarks=Object.fromEntries(Object.entries(points).map(([name,point])=>{const screen=project(point);return [name,{native:point,screen,actorRelativeNativeOrientationWorld:[(screen[0]-tx)/Math.abs(a)*Math.sign(a),(screen[1]-ty)/d]}];}));
    return {complete:exterior.every(Number.isFinite)&&exterior[0]>=0&&exterior[1]>=0&&exterior[2]<=1280&&exterior[3]<=720,exterior,visible,anchorScreen,anchor:frame.anchor,bodyHeight:frame.bodyHeight,pixelScale:Math.abs(dw/frame.width*a),worldPixelScale:dw/frame.width,declaredBodyHeightWorld:dh*frame.bodyHeight,aspectUndistorted:close(dw/frame.width,dh/frame.height,1e-9),projectedLandmarks};}
  for(const playerIndex of [0,1]){
    const facing=playerIndex===0?1:-1,label=fighterId+'-'+(facing===1?'right':'left'),caseReport={label,fighterId,playerIndex,facing,stageId,clips:art.clips,commands:[],walks:[],idleCycles:[],captures:[],draws:[]};report.cases.push(caseReport);
    console.log(JSON.stringify({progress:'starting',case:label}));pinCombatAssets([fighter,opponent],[stage]);check(label+': actual asset preflight', (await prepareCombatAssets([fighter,opponent],[stage])).ok);
    const canvas=createCanvas(1280,720),ctx=canvas.getContext('2d'),nativeDraw=ctx.drawImage.bind(ctx),owned=new Set(art.frames.map(f=>f.path));let segment='intro';
    const actorState=()=>{const a=engine.actors[playerIndex];return {id:a.data.id,x:a.x,y:a.y,vx:a.vx,vy:a.vy,facing:a.facing,state:a.state,grounded:a.grounded,blocking:a.blocking,spriteTick:a.spriteClock?.tick,spritePose:a.spriteClock?.pose,health:a.health,presentation:a.presentation?.key||null};};
    ctx.drawImage=(image,...args)=>{const result=nativeDraw(image,...args),path=imagePaths.get(image);if(owned.has(path)||path===art.portrait.path){const m=ctx.getTransform();caseReport.draws.push({segment,engineFrame:engine.frame,path,args,matrix:[m.a,m.b,m.c,m.d,m.e,m.f],globalAlpha:ctx.globalAlpha,actor:actorState(),camera:{...engine.presentationCamera}});}return result;};
    engine=new FightEngine(canvas,{p1:playerIndex===0?fighter:opponent,p2:playerIndex===1?fighter:opponent,stage,mode:'local',timeLimit:0,seed:71125,
      artDiagnostic:false,ritualId:'none',stageHazards:false,stageDirector:false,otherworldShift:false,fatalities:false,stageFatalities:false,stageTerrain:false,stageAnimations:true,radioWarning:false});
    const ownRow=()=>caseReport.draws.findLast(r=>r.engineFrame===engine.frame&&owned.has(r.path));
    const step=name=>{segment=name;engine.update();engine.render(engine.frame*1000/60);const row=ownRow();check(label+': actual native draw '+name+' at '+engine.frame,!!row);return row;};
    function emit(type,code){const event={type,code,repeat:false,defaultPrevented:false,isComposing:false,ctrlKey:false,metaKey:false,altKey:false,target:{isContentEditable:false,closest:()=>null},preventDefault(){this.defaultPrevented=true;}};
      const callbacks=[...(events.get(type)||[])];check(label+': original InputState callback '+type,callbacks.includes(type==='keydown'?engine.input.onDown:engine.input.onUp));for(const fn of callbacks)fn(event);
      const accepted=type==='keydown'?engine.input.isDown(code):!engine.input.isDown(code);caseReport.commands.push({type,code,engineFrame:engine.frame,accepted,prevented:event.defaultPrevented,originalCallback:true,syntheticNativeEvent:true});check(label+': input accepted '+type,accepted&&(type!=='keydown'||event.defaultPrevented));}
    const gameCapture=async(name,detail={})=>{const row=ownRow(),record=await capture(canvas,label+'-'+name+'.png',{purpose:'actual-native-FightEngine',fighterId,stageId,playerIndex,facing,state:actorState(),draw:row,geometry:geometry(row),...detail});caseReport.captures.push(record.file);return record;};
    let introTicks=0;while((engine.phase!=='fight'||engine.texts.some(t=>['intro','round','fight'].includes(t.kind))||engine.actors[playerIndex].presentation)&&introTicks<1200){engine.update();introTicks++;}
    check(label+': intro completes naturally',engine.phase==='fight'&&!engine.paused&&!engine.actors[playerIndex].presentation,{introTicks});
    const stationaryIdleRows=[];for(let t=0;t<24;t++)stationaryIdleRows.push(step('stationary-idle-camera'));
    check(label+': stationary idle spans all three poses',new Set(stationaryIdleRows.map(r=>r.path)).size===3&&stationaryIdleRows.every(r=>r.actor.state==='idle'&&close(r.actor.x,stationaryIdleRows[0].actor.x,1e-9)&&close(r.actor.y,stationaryIdleRows[0].actor.y,1e-9)));
    caseReport.stationaryIdleCameraRows=stationaryIdleRows;
    const start=actorState(),walkCode=engine.bindings.players[playerIndex][facing===1?'right':'left'],walkRows=[];emit('keydown',walkCode);
    try{for(let tick=0;tick<12;tick++)walkRows.push(step('retained-static-walk'));await gameCapture('walk-static-frame3',{drawnWalkAnimation:false,retainedFrameIndex:3});}finally{emit('keyup',walkCode);}
    const moved=actorState();check(label+': ordinary movement changes position',facing===1?moved.x>start.x+1:moved.x<start.x-1,{start,moved});
    check(label+': walk uses only unchanged frame3 for all12ticks',walkRows.every((r,t)=>r.path===art.frames[3].path&&r.actor.spritePose==='walk'&&r.actor.state==='walk'&&r.actor.spriteTick===t));
    check(label+': static walk silhouette and mirror',walkRows.every(r=>geometry(r).complete&&r.actor.facing===facing&&Math.sign(r.matrix[0])===facing*art.frames[3].facing));
    caseReport.walks.push({animated:false,retainedFrameIndex:3,ticks:12,start,end:moved,rows:walkRows});
    const idleRows=[],firstByFrame=new Map();
    for(let tick=0;tick<48;tick++){const row=step('released-idle-cycle'),index=[0,1,0,2][Math.floor((tick%24)/6)];idleRows.push(row);
      if(!firstByFrame.has(index)){firstByFrame.set(index,row);await gameCapture('idle-frame'+index+'-tick'+tick,{expectedIdleTick:tick,expectedFrameIndex:index});}
      if(tick===5){const frameBefore=engine.frame,tickBefore=actorState().spriteTick,pathBefore=row.path,pixelsBefore=digest(canvas.toBuffer('image/png'));engine.render(999999);engine.render(-12345);
        check(label+': render-only calls do not advance cadence or pixels',engine.frame===frameBefore&&actorState().spriteTick===tickBefore&&ownRow().path===pathBefore&&digest(canvas.toBuffer('image/png'))===pixelsBefore);}
    }
    check(label+': release naturally starts idle at tick0',idleRows[0].actor.spriteTick===0&&idleRows[0].actor.spritePose==='idle'&&idleRows[0].actor.state==='idle');
    check(label+': two complete idle cycles follow exact PNG/clock sequence',idleRows.every((r,t)=>r.path===art.frames[[0,1,0,2][Math.floor((t%24)/6)]].path&&r.actor.spriteTick===t&&r.actor.spritePose==='idle'&&r.actor.state==='idle'&&r.engineFrame===idleRows[0].engineFrame+t));
    const observedRuns=[];for(const row of idleRows){const i=art.frames.findIndex(f=>f.path===row.path),last=observedRuns.at(-1);if(last?.frameIndex===i)last.ticks++;else observedRuns.push({frameIndex:i,ticks:1});}
    check(label+': observed six-tick holds for every slot in both cycles',same(observedRuns,[0,1,0,2,0,1,0,2].map(frameIndex=>({frameIndex,ticks:6}))));
    check(label+': all48 idle silhouettes complete',idleRows.every(r=>geometry(r).complete));
    const wingClearance=idleRows.map(r=>{const g=geometry(r),floor=r.camera.y+r.actor.y*r.camera.scale;return {spriteTick:r.actor.spriteTick,frameIndex:art.frames.findIndex(f=>f.path===r.path),projectedPhysicalFloorY:floor,visibleBottomY:g.visible[3],framingBottomY:g.exterior[3],visibleBelowFloorPixels:g.visible[3]-floor,framingBelowFloorPixels:g.exterior[3]-floor};});
    caseReport.wingClearance=wingClearance;
    check(label+': all idle wing tips and framing fringe clear the physical floor within2pixels',wingClearance.every(r=>r.visibleBelowFloorPixels<=2&&r.framingBelowFloorPixels<=2),{toleranceScreenPixels:2,maxVisibleBelowFloorPixels:Math.max(...wingClearance.map(r=>r.visibleBelowFloorPixels)),maxFramingBelowFloorPixels:Math.max(...wingClearance.map(r=>r.framingBelowFloorPixels)),violations:wingClearance.filter(r=>r.visibleBelowFloorPixels>2||r.framingBelowFloorPixels>2)});

    check(label+': all48 actual facing/mirror matrices agree',idleRows.every(r=>r.actor.facing===facing&&Math.sign(r.matrix[0])===facing*frameByPath.get(r.path).facing&&close(r.matrix[1],0)&&close(r.matrix[2],0)&&r.matrix[3]>0&&close(Math.abs(r.matrix[0]),r.matrix[3])));
    const body=bodyProfile(fighter),expectedBodyHeight=body.height*body.scale;
    check(label+': actual pose scales share one body height without stretch',idleRows.every(r=>{const g=geometry(r);return g.aspectUndistorted&&close(g.declaredBodyHeightWorld,expectedBodyHeight);}));
    check(label+': actual anchor follows actor with existing flyer offset',idleRows.every(r=>{const g=geometry(r);return close(g.anchorScreen[0],r.camera.x+r.actor.x*r.camera.scale)&&close(g.anchorScreen[1],r.camera.y+(r.actor.y-(body.bottom||0)*body.scale)*r.camera.scale);}));
    const projected=Object.fromEntries([...firstByFrame].map(([i,r])=>[i,geometry(r).projectedLandmarks]));
    const landmarkDrifts=[1,2].flatMap(i=>pointKeys.map(name=>{const a=projected[0][name].actorRelativeNativeOrientationWorld,b=projected[i][name].actorRelativeNativeOrientationWorld;return {frameIndex:i,name,worldDistance:Math.hypot(a[0]-b[0],a[1]-b[1])};}));
    check(label+': anatomical landmarks remain within2worldpixels between poses',landmarkDrifts.every(p=>p.worldDistance<=2),landmarkDrifts);
    const scaleSet=stationaryIdleRows.map(r=>r.camera.scale);check(label+': no stationary idle pose zoom pumping',Math.max(...scaleSet)-Math.min(...scaleSet)<.0001,{min:Math.min(...scaleSet),max:Math.max(...scaleSet)});
    caseReport.idleCycles.push({cycles:2,ticksPerCycle:24,totalTicks:48,expectedSequence:[0,1,0,2],expectedDurations:[6,6,6,6],observedRuns,rows:idleRows,projectedLandmarks:projected,landmarkDrifts,bodyProfile:body});
    check(label+': no portrait substituted in combat',!caseReport.draws.some(r=>r.path===art.portrait.path));
    check(label+': keyup leaves no held input',engine.input.held.size===0);caseReport.finalState=actorState();caseReport.frameCount=engine.frame;
    engine.destroy();check(label+': InputState listeners removed',!events.get('keydown')?.has(engine.input.onDown)&&!events.get('keyup')?.has(engine.input.onUp));engine=null;globalThis.gc?.();
    console.log(JSON.stringify({progress:'completed',case:label,captures:caseReport.captures.length}));
  }
  const right=report.cases[0],left=report.cases[1];
  check('Opposite orientation draws the same PNG sequence',right.idleCycles[0].rows.every((r,i)=>r.path===left.idleCycles[0].rows[i].path));
  check('R/L matrices reverse X only and retain equal scale',right.idleCycles[0].rows.every((r,i)=>{const l=left.idleCycles[0].rows[i];return close(r.matrix[0],-l.matrix[0])&&close(r.matrix[3],l.matrix[3])&&same(r.args,l.args);}));
}catch(error){report.failure=String(error.stack||error);if(!report.errors.includes(error.message))report.errors.push(error.message);process.exitCode=1;}
finally{
  engine?.destroy();
  for(const [path,hashes] of Object.entries(report.sourceHashes)){try{hashes.after=digest(await readFile(resolve(root,path)));record('Shared source untouched: '+path,hashes.before===hashes.after);}catch(e){record('Shared source readable after QA: '+path,false,String(e));}}
  for(const frame of descriptors){try{record('Native asset remains unchanged: '+frame.path,digest(await readFile(resolve(root,frame.path)))===frame.sha256);}catch(e){record('Native asset readable after QA: '+frame.path,false,String(e));}}
  report.passed=report.errors.length===0;report.completedAt=new Date().toISOString();await writeFile(join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,cases:report.cases.length,captures:report.captures.length,report:join(out,'report.json'),failed:report.checks.filter(x=>!x.passed),failure:report.failure}));if(!report.passed)process.exitCode=1;
}
