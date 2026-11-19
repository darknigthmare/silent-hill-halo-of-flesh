/**
 * Native wave17 Nurse movement QA, based on qa-sprite-candidates-native.mjs.
 * No browser, HTTP server, shared-file edit, actor placement or pose injection.
 *
 * HALO_QA_ROOT=/path/to/checkout node qa-nurse-walk-native.mjs --out=/new/output
 * Optional --stage=underground_hc; output report.json is never overwritten.
 * Dependencies: @napi-rs/canvas and sharp via normal lookup,
 * HALO_QA_NODE_MODULES or CODEX_PRIMARY_RUNTIME_NODE_MODULES.
 */
import {createRequire} from 'node:module';
import {mkdir,writeFile,readFile,access} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const require=createRequire(import.meta.url);
const option=(name,fallback='')=>process.argv.find(arg=>arg.startsWith('--'+name+'='))?.slice(name.length+3)||fallback;
if(process.argv.includes('--help')){
  console.log('Native Origins Nurse walk QA. HALO_QA_ROOT selects the checkout; --out is required. Optional --stage=underground_hc. No browser or source edits.');
  process.exit(0);
}
const root=resolve(process.env.HALO_QA_ROOT||fileURLToPath(new URL('../',import.meta.url)));
const outputArgument=option('out',process.env.HALO_QA_OUT);
if(!outputArgument)throw Error('Provide --out=/new/output; prior evidence is preserved.');
const out=resolve(outputArgument),stageId=option('stage','underground_hc');
const fighterId='origins_faceless_nurse',opponentId='sh2_creeper_025';
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
try{
  await access(resolve(out,'report.json'));
  throw Error('Existing report preserved; choose a new output directory: '+out);
}catch(error){if(error.code!=='ENOENT')throw error;}
function dependency(name){
  try{return require(name);}catch(original){
    for(const modulesPath of [process.env.HALO_QA_NODE_MODULES,process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES].filter(Boolean)){
      try{return createRequire(join(modulesPath,'__halo_native_walk_loader.cjs'))(name);}catch{}
    }
    throw Error('Missing native QA dependency '+name+': '+original.message);
  }
}
const report={
  schema:1,label:'wave17-origins-nurse-native-walk',
  generatedAt:new Date().toISOString(),mode:'actual FightEngine with native Canvas',
  browserTest:false,httpTest:false,browserLaunches:0,httpServersStarted:0,
  root,stageId,fighterId,opponentId,
  checks:[],errors:[],assets:[],commands:[],captures:[],walks:[],guards:[],idleReturns:[],
  sourceHashes:{},
  method:{
    inputs:'The event adapter stores the actual keydown/keyup callbacks registered by InputState. Only those original callbacks receive synthetic native key events; held/pressed/released sets are never edited by this harness.',
    simulation:'Public FightEngine.update() and FightEngine.render() run real intros, movement, gravity, body separation, facing, sprite clocks, guard and rendering.',
    observation:'A wrapper calls the real native Canvas drawImage, then records image identity, draw arguments, transform and a read-only actor snapshot.',
    assets:'Exact source PNG file bytes are checked against their manifest. Sharp normalizes PNG encoding only in memory for native decoding, with decoded RGBA equality checked.',
    stateWrites:'No actor position, pose, facing, health, velocity, sprite clock, presentation, camera or phase is assigned by the harness.',
    output:'Only this output directory receives the report and actual native Canvas captures.'
  },
  limits:[
    'Native Canvas is not Chromium. DOM, CSS, browser decoding, real keyboard delivery, HTTP, service workers and CI browser behavior are not exercised.',
    'Synthetic native events are delivered to the actual InputState callbacks. They are not represented as trusted browser events.',
    'Two exact 28-tick versus walk cycles per direction are exercised. The seven-tick timing is authored for this game, not measured source timing.',
    'The opposite view is the engine mirror of the same combat PNGs, not an independently sourced left-side image.',
    'An ordinary jump above Creeper is used only to change sides. Missing jump art may use idle fallback; no dedicated jump animation is claimed.',
    'Source anatomy, textures, scale, weapons, collision fidelity and fidelity 1:1 still require visual/source review.',
    'The chosen room and small parallax are reconstructed versus presentation. This is not source animation certification.',
    'No attack catalogue, mobile, gamepad, offline or browser security workaround is tested.'
  ]
};
function check(name,passed,detail){
  report.checks.push({name,passed:!!passed,...(detail===undefined?{}:{detail})});
  if(!passed){report.errors.push(name);throw Error(name);}
}
const sourceFiles=[
  'art/registry.json','src/sprite-manifest.js','src/stage-bitmap-manifest.js',
  'src/fight.js','src/sprite-animation.js','src/renderers.js','src/stage-bitmap-compositions.js'
];
let engine;
await mkdir(out,{recursive:true});
try{
  const {createCanvas,Image}=dependency('@napi-rs/canvas'),sharp=dependency('sharp');
  report.dependencies={node:process.version,canvas:dependency('@napi-rs/canvas/package.json').version,sharp:sharp.versions.sharp};
  report.harnessSHA256=digest(await readFile(fileURLToPath(import.meta.url)));
  for(const path of sourceFiles)report.sourceHashes[path]={before:digest(await readFile(resolve(root,path)))};

  const events=new Map(),documentEvents=new Map();
  const listen=(map,type,callback)=>{if(!map.has(type))map.set(type,new Set());map.get(type).add(callback);};
  const unlisten=(map,type,callback)=>map.get(type)?.delete(callback);
  globalThis.window={};
  const storage=new Map();
  globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key)};
  globalThis.document={hidden:false,addEventListener:(type,callback)=>listen(documentEvents,type,callback),removeEventListener:(type,callback)=>unlisten(documentEvents,type,callback)};
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{getGamepads:()=>[],vibrate:()=>false,userActivation:{hasBeenActive:false}}});
  globalThis.addEventListener=(type,callback)=>listen(events,type,callback);
  globalThis.removeEventListener=(type,callback)=>unlisten(events,type,callback);
  globalThis.requestAnimationFrame=()=>0;
  globalThis.cancelAnimationFrame=()=>{};

  const mod=name=>import(pathToFileURL(resolve(root,'src',name)).href);
  const [{getFighter,getStage,createCombatProfile,VERSION},{SPRITES},{spriteCache,paintRasterPortrait},
    {stageBitmapCache,stageBitmapFrames,pinCombatAssets,prepareCombatAssets,stageBitmapFor},{FightEngine}]=await Promise.all([
      mod('data.js'),mod('sprite-manifest.js'),mod('sprite-system.js'),mod('stage-bitmaps.js'),mod('fight.js')
    ]);
  report.version=VERSION;
  const fighter=getFighter(fighterId),opponent=getFighter(opponentId),stage=getStage(stageId);
  check('Requested identities and stage resolve exactly',fighter.id===fighterId&&opponent.id===opponentId&&stage.id===stageId);
  report.roles=[fighter,opponent].map(subject=>({id:subject.id,...createCombatProfile(subject).referencePolicy}));
  check('Both normal duel roles are combatEnabled',report.roles.every(role=>role.combatEnabled===true));
  const art=SPRITES[fighterId],stageArt=stageBitmapFor(stage);
  report.stage={id:stage.id,source:stage.source,scene:stageArt?.scene||null};
  report.clips=art.clips;
  check('Exact walk timeline is [0,2,3,2], seven ticks, looping',
    JSON.stringify(art.clips.walk?.frames)==='[0,2,3,2]'&&art.clips.walk?.ticksPerFrame===7&&art.clips.walk?.loop===true&&
    (!art.clips.walk.frameTicks||JSON.stringify(art.clips.walk.frameTicks)==='[7,7,7,7]'));
  check('Idle [0] and guard [1] retain the exact wave16 PNGs',
    JSON.stringify(art.clips.idle.frames)==='[0]'&&JSON.stringify(art.clips.guard.frames)==='[1]'&&
    art.frames[0].sha256==='7875b7b8cc53cf1652cc677b29456ed43f4e737355c767ae5caef1c3eeb1ecfd'&&
    art.frames[1].sha256==='4f0ad91d37c585e4d771c4e8fb54a560776f6239156caf6ace9c6df98ab87f5e');
  check('Historical Origins portrait is preserved and separate',
    art.portrait.sha256==='533898f3a5ea73c86ca90678cdf1e099851441c9c7706b67a4ec4a9aa5c1c2a2'&&
    art.frames.every(frame=>frame.path!==art.portrait.path));
  check('Walk has three distinct file and pixel identities',
    new Set([0,2,3].map(index=>art.frames[index].sha256)).size===3&&
    new Set([0,2,3].map(index=>art.frames[index].pixelSHA256)).size===3);

  const descriptors=[...new Map([
    ...[fighter,opponent].flatMap(subject=>[...SPRITES[subject.id].frames,SPRITES[subject.id].portrait].filter(Boolean)),
    ...stageBitmapFrames([stage])
  ].map(frame=>[frame.path,frame])).values()];
  const bytesByPath=new Map(),imagePaths=new WeakMap(),frameByPath=new Map(descriptors.map(frame=>[frame.path,frame]));
  for(const frame of descriptors){
    const bytes=await readFile(resolve(root,frame.path)),hash=digest(bytes);
    check('Exact source PNG bytes: '+frame.path,bytes.length===frame.bytes&&hash===frame.sha256,{bytes:bytes.length,sha256:hash});
    const normalized=await sharp(bytes).png().toBuffer();
    const originalPixels=await sharp(bytes).ensureAlpha().raw().toBuffer(),normalizedPixels=await sharp(normalized).ensureAlpha().raw().toBuffer();
    check('PNG adapter preserves all decoded RGBA pixels: '+frame.path,originalPixels.equals(normalizedPixels));
    bytesByPath.set(frame.path,normalized);
    report.assets.push({path:frame.path,sha256:hash,bytes:bytes.length,width:frame.width,height:frame.height,rawRGBAHash:digest(originalPixels),adapterLossless:true});
  }
  for(const cache of [spriteCache,stageBitmapCache]){
    cache.createImage=()=>{
      const image=new Image();image.decode=undefined;
      for(const property of ['onload','onerror']){
        let callback;
        Object.defineProperty(image,property,{get:()=>callback,set:value=>{callback=typeof value==='function'?(...args)=>{void value(...args);}:undefined;}});
      }
      return image;
    };
    cache.url=path=>bytesByPath.get(path);
  }
  pinCombatAssets([fighter,opponent],[stage]);
  const preflight=await prepareCombatAssets([fighter,opponent],[stage]);
  check('Actual game asset preflight accepts the registered sprites and room',preflight.ok,preflight);
  for(const subject of [fighter,opponent])await spriteCache.load(SPRITES[subject.id].portrait);
  for(const frame of descriptors){
    const image=spriteCache.peek(frame.path)||stageBitmapCache.peek(frame.path);
    check('Native decoder retains dimensions: '+frame.path,!!image&&image.width===frame.width&&image.height===frame.height);
    imagePaths.set(image,frame.path);
  }

  const captures=async(canvas,filename,detail={})=>{
    const bytes=canvas.toBuffer('image/png');
    await writeFile(resolve(out,filename),bytes);
    const capture={file:filename,sha256:digest(bytes),bytes:bytes.length,width:canvas.width,height:canvas.height,...detail};
    report.captures.push(capture);
    return capture;
  };
  for(const facing of [1,-1]){
    const portrait=createCanvas(500,500);portrait.dataset={};
    const context=portrait.getContext('2d'),draw=context.drawImage.bind(context),seen=[];
    context.drawImage=(image,...args)=>{const result=draw(image,...args);if(imagePaths.has(image))seen.push(imagePaths.get(image));return result;};
    paintRasterPortrait(portrait,fighter,{facing});
    check('Preserved selection is painted facing '+facing,portrait.dataset.artStatus==='raster'&&seen.length>0&&seen.every(path=>path===art.portrait.path));
    await captures(portrait,'portrait-'+(facing>0?'right':'left')+'.png',{purpose:'selection',path:art.portrait.path,facing});
  }

  const canvas=createCanvas(1280,720),context=canvas.getContext('2d');
  let sequence=0,segment='intro';
  const observed=[],last=new Map(),draw=context.drawImage.bind(context);
  context.drawImage=function(image,...args){
    const result=draw(image,...args),path=imagePaths.get(image);
    if(path){
      const m=context.getTransform(),actor=engine?.actors[0];
      const row={sequence:++sequence,segment,path,args,width:image.width,height:image.height,matrix:[m.a,m.b,m.c,m.d,m.e,m.f],
        engineFrame:engine?.frame??null,
        actor:actor?{id:actor.data.id,x:actor.x,y:actor.y,facing:actor.facing,state:actor.state,grounded:actor.grounded,blocking:actor.blocking,spriteTick:actor.spriteClock?.tick??null,spritePose:actor.spriteClock?.pose??null}:null,
        actorX:engine?.actors.map(value=>value.x)||null};
      observed.push(row);last.set(path,row);
    }
    return result;
  };
  engine=new FightEngine(canvas,{p1:fighter,p2:opponent,stage,mode:'local',timeLimit:0,seed:71119,
    artDiagnostic:false,ritualId:'none',stageHazards:false,stageDirector:false,otherworldShift:false,
    fatalities:false,stageFatalities:false,stageTerrain:false,stageAnimations:true,radioWarning:false});
  check('Native harness uses the normal movement, jump and guard bindings',
    engine.bindings.players[0].left==='ArrowLeft'&&engine.bindings.players[0].right==='ArrowRight'&&
    engine.bindings.players[0].jump==='ArrowUp'&&engine.bindings.players[0].guard==='Space');
  check('The real InputState callbacks are registered',
    events.get('keydown')?.has(engine.input.onDown)&&events.get('keyup')?.has(engine.input.onUp));
  const state=()=>{
    const a=engine.actors[0],b=engine.actors[1];
    return {frame:engine.frame,x:a.x,y:a.y,vx:a.vx,vy:a.vy,facing:a.facing,state:a.state,grounded:a.grounded,blocking:a.blocking,opponentX:b.x,spriteTick:a.spriteClock?.tick,spritePose:a.spriteClock?.pose};
  };
  function emit(type,code){
    const event={type,code,repeat:false,defaultPrevented:false,isComposing:false,ctrlKey:false,metaKey:false,altKey:false,
      target:{isContentEditable:false,closest:()=>null},preventDefault(){this.defaultPrevented=true;}};
    const callbacks=[...(events.get(type)||[])];
    check('Original input callback is available for '+type+' '+code,callbacks.includes(type==='keydown'?engine.input.onDown:engine.input.onUp));
    for(const callback of callbacks)callback(event);
    const accepted=type==='keydown'?engine.input.isDown(code):!engine.input.isDown(code);
    report.commands.push({type,code,frame:engine.frame,syntheticNativeEvent:true,originalCallback:true,prevented:event.defaultPrevented,accepted,held:engine.input.isDown(code),pressed:engine.input.wasPressed(code),released:engine.input.wasReleased(code)});
    check('Real input callback accepts '+type+' '+code,accepted&&(type!=='keydown'||event.defaultPrevented));
  }
  function step(label=segment){
    segment=label;
    engine.update();
    engine.render(engine.frame*1000/60);
    return state();
  }
  function gameRow(){
    const nursePaths=new Set(art.frames.map(frame=>frame.path));
    return observed.findLast(row=>row.engineFrame===engine.frame&&nursePaths.has(row.path));
  }
  function geometry(row){
    const frame=row&&frameByPath.get(row.path);
    if(!row||row.args.length!==4||!frame)return {complete:false,row};
    const [dx,dy,dw,dh]=row.args,[a,b,c,d,tx,ty]=row.matrix;
    const transform=([left,top,right,bottom])=>{
      const points=[[left,top],[right,top],[left,bottom],[right,bottom]].map(([u,v])=>{
        const x=dx+u/frame.width*dw,y=dy+v/frame.height*dh;
        return [a*x+c*y+tx,b*x+d*y+ty];
      });
      return [Math.min(...points.map(point=>point[0])),Math.min(...points.map(point=>point[1])),Math.max(...points.map(point=>point[0])),Math.max(...points.map(point=>point[1]))];
    };
    const exterior=transform(frame.framingBounds||frame.visibleBounds),visible=transform(frame.visibleBounds);
    return {exterior,visible,complete:exterior.every(Number.isFinite)&&exterior[0]>=0&&exterior[1]>=0&&exterior[2]<=1280&&exterior[3]<=720,row};
  }
  async function captureGame(filename,detail={}){
    const row=gameRow();
    return captures(canvas,filename,{purpose:'actual-native-FightEngine',state:state(),draw:row,geometry:geometry(row),camera:{...engine.presentationCamera},...detail});
  }
  let introTicks=0;
  while((engine.phase!=='fight'||engine.texts.some(text=>['intro','round','fight'].includes(text.kind))||engine.actors[0].presentation)&&introTicks<1200){
    engine.update();introTicks++;
  }
  check('The real intro completes without phase or clock injection',engine.phase==='fight'&&!engine.paused&&!engine.actors[0].presentation,{introTicks,phase:engine.phase,state:state()});
  step('initial-idle');
  check('Initial active frame paints native idle 0',gameRow()?.path===art.frames[0].path&&state().spritePose==='idle');
  await captureGame('idle-right-before-movement.png',{expectedFrameIndex:0});
  const stageBefore=stageArt.layers.map(layer=>last.get(layer.frames[0].path));

  async function idleAfter(label,facing){
    const rows=[];
    for(let index=0;index<10;index++){step(label);rows.push(gameRow());}
    check(label+': all released ticks paint idle 0',
      rows.every(row=>row?.path===art.frames[0].path&&row.actor.state==='idle'&&!row.actor.blocking&&row.actor.spritePose==='idle'&&row.actor.facing===facing));
    const measured=geometry(rows.at(-1));
    check(label+': idle remains fully visible',measured.complete,measured.exterior);
    report.idleReturns.push({label,facing,ticks:10,first:rows[0],last:rows.at(-1),geometry:measured});
    await captureGame(label+'.png',{expectedFrameIndex:0});
  }
  async function walk(label,code,facing){
    const start=state(),rows=[],steps=[];
    emit('keydown',code);
    try{
      for(let tick=0;tick<56;tick++){
        step(label);const row=gameRow();rows.push(row);
        if([0,7,14,21].includes(tick)){
          const frameIndex=[0,2,3,2][Math.floor(tick/7)];
          steps.push(await captureGame(label+'-step'+Math.floor(tick/7)+'-frame'+frameIndex+'.png',{expectedFrameIndex:frameIndex,expectedWalkTick:tick}));
        }
      }
    }finally{emit('keyup',code);}
    const end=state();
    check(label+': all 56 native simulation ticks retain a walk state and the expected facing',
      rows.length===56&&rows.every((row,index)=>row?.actor.state==='walk'&&row.actor.spritePose==='walk'&&row.actor.spriteTick===index&&row.actor.facing===facing));
    check(label+': each actual Canvas PNG follows [0,2,3,2] at seven ticks per step',
      rows.every((row,index)=>row.path===art.frames[[0,2,3,2][Math.floor(index/7)%4]].path));
    const transitions=[];
    for(const row of rows){
      const frameIndex=art.frames.findIndex(frame=>frame.path===row.path),previous=transitions.at(-1);
      if(previous?.frameIndex===frameIndex){previous.ticks++;previous.lastTick=row.actor.spriteTick;}
      else transitions.push({frameIndex,path:row.path,ticks:1,firstTick:row.actor.spriteTick,lastTick:row.actor.spriteTick});
    }
    check(label+': two complete 28-tick cycles contain exactly eight seven-tick steps',
      JSON.stringify(transitions.map(item=>item.frameIndex))==='[0,2,3,2,0,2,3,2]'&&transitions.every(item=>item.ticks===7),transitions);
    check(label+': all three distinct combat PNGs are observed',new Set(rows.map(row=>row.path)).size===3);
    const geometries=rows.map(geometry);
    check(label+': every drawn silhouette stays inside the native match frame',geometries.every(value=>value.complete));
    check(label+': actual Canvas transforms face the required direction',
      rows.every(row=>Math.sign(row.matrix[0])===facing*(frameByPath.get(row.path).facing||1)));
    check(label+': normal input changes the actor position in the requested direction',
      code==='ArrowRight'?end.x>start.x+35:end.x<start.x-35,{start,end});
    report.walks.push({label,code,facing,start,end,ticks:56,cycles:2,transitions,captures:steps.map(item=>item.file),observations:rows,geometryComplete:geometries.every(value=>value.complete)});
    await idleAfter(label+'-released-idle',facing);
  }
  async function guard(label,facing){
    const rows=[];emit('keydown','Space');
    try{
      for(let tick=0;tick<14;tick++){
        step(label);rows.push(gameRow());
        if(tick===0)await captureGame(label+'.png',{expectedFrameIndex:1});
      }
    }finally{emit('keyup','Space');}
    check(label+': held input paints guard 1 for all 14 ticks',
      rows.every(row=>row?.path===art.frames[1].path&&row.actor.blocking&&row.actor.spritePose==='guard'&&row.actor.facing===facing));
    check(label+': the guard silhouette fits the native canvas',rows.map(geometry).every(value=>value.complete));
    report.guards.push({label,facing,ticks:14,first:rows[0],last:rows.at(-1),geometry:geometry(rows.at(-1))});
    await idleAfter(label+'-released-idle',facing);
  }

  await walk('walk-right','ArrowRight',1);
  const stageAfter=stageArt.layers.map(layer=>last.get(layer.frames[0].path));
  if(stageArt.layers.length===2){
    const delta=stageAfter.map((row,index)=>row.args.at(-4)-stageBefore[index].args.at(-4));
    const expected=stageAfter.map((row,index)=>-(row.actorX.reduce((sum,x)=>sum+x,0)-stageBefore[index].actorX.reduce((sum,x)=>sum+x,0))*(stageArt.layers[index].parallaxX||0));
    check('Both actual scenery planes remain present during movement',stageAfter.every((row,index)=>row?.path===stageArt.layers[index].frames[0].path));
    check('Enabled stage presentation gives the authored differential parallax',
      Math.abs(delta[0]-delta[1])>.1&&delta.every((value,index)=>Math.abs(value-expected[index])<.02),{delta,expected});
    report.stageParallax={stageAnimations:engine.config.stageAnimations,before:stageBefore,after:stageAfter,delta,expected};
  }
  await guard('guard-right',1);

  const beforeCross=state();let approachTicks=0,crossTicks=0,landingTicks=0;
  emit('keydown','ArrowRight');
  try{
    while(engine.actors[1].x-engine.actors[0].x>92&&approachTicks<240){step('approach-opponent');approachTicks++;}
    check('Normal rightward approach reaches the low opponent',engine.actors[1].x>engine.actors[0].x&&engine.actors[1].x-engine.actors[0].x<=92,{approachTicks,state:state()});
    emit('keydown','ArrowUp');
    try{step('jump-start');check('Actual jump input lifts the actor',!engine.actors[0].grounded);}
    finally{emit('keyup','ArrowUp');}
    while(!(engine.actors[0].x>engine.actors[1].x+80&&engine.actors[0].facing===-1)&&crossTicks<120){step('jump-crossing');crossTicks++;}
    check('Actual jump and movement cross the opponent',engine.actors[0].x>engine.actors[1].x+80&&engine.actors[0].facing===-1,{crossTicks,state:state()});
  }finally{emit('keyup','ArrowRight');}
  while((!engine.actors[0].grounded||engine.actors[0].state!=='idle')&&landingTicks<120){step('landing');landingTicks++;}
  check('The actor lands naturally on the opposite side',engine.actors[0].grounded&&engine.actors[0].state==='idle'&&engine.actors[0].facing===-1,{landingTicks,state:state()});
  step('idle-left-after-crossing');
  await captureGame('idle-left-after-normal-jump.png',{expectedFrameIndex:0});
  report.sideChange={before:beforeCross,after:state(),approachTicks,crossTicks,landingTicks,actorStateInjected:false};

  await walk('walk-left','ArrowLeft',-1);
  await guard('guard-left',-1);
  const [right,left]=report.walks;
  check('The two directions use the same three combat PNGs with opposite real Canvas transforms',
    [0,2,3].every(index=>{
      const r=right.observations.find(row=>row.path===art.frames[index].path),l=left.observations.find(row=>row.path===art.frames[index].path);
      return r&&l&&Math.sign(r.matrix[0])===-Math.sign(l.matrix[0]);
    }));
  check('No game draw substitutes the historical portrait',!observed.some(row=>row.path===art.portrait.path));
  check('All requested phases have concrete native captures',
    report.walks.length===2&&report.guards.length===2&&report.idleReturns.length===4&&
    report.walks.every(item=>item.captures.length===4));
  const finalState=state();
  report.completedSimulation={frame:engine.frame,phase:engine.phase,finalState,actorStateInjected:false};
  report.inputsComplete=['ArrowRight','ArrowLeft','ArrowUp','Space'].every(code=>['keydown','keyup'].every(type=>report.commands.some(command=>command.code===code&&command.type===type&&command.accepted)));
  check('All required input presses and releases passed through original callbacks',report.inputsComplete);
  check('No input remains held at completion',engine.input.held.size===0);
  engine.destroy();
  check('Engine teardown removes its original key callbacks',
    !events.get('keydown')?.has(engine.input.onDown)&&!events.get('keyup')?.has(engine.input.onUp));
  for(const path of sourceFiles){
    const after=digest(await readFile(resolve(root,path)));
    report.sourceHashes[path].after=after;
    check('Shared source unchanged by the native run: '+path,report.sourceHashes[path].before===after);
  }
  for(const frame of descriptors)check('Original PNG remains unchanged: '+frame.path,digest(await readFile(resolve(root,frame.path)))===frame.sha256);
}catch(error){
  report.failure=String(error.stack||error);
  if(!report.errors.includes(error.message))report.errors.push(String(error.message||error));
  process.exitCode=1;
}finally{
  engine?.destroy();
  report.passed=report.errors.length===0;
  report.completedAt=new Date().toISOString();
  await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,failed:report.checks.filter(item=>!item.passed),walks:report.walks.length,guards:report.guards.length,captures:report.captures.length,report:resolve(out,'report.json'),failure:report.failure}));
  if(!report.passed)process.exitCode=1;
}
