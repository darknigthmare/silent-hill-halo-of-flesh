/** Stage-only, read-only QA in the actual FightEngine with native Canvas.
 * HALO_QA_ROOT=/checkout node scripts/qa-stage-pass21-native.mjs --stages=id,id --out=/new/evidence
 * No browser, HTTP server, actor-state injection or production image mutation.
 */
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const require=createRequire(import.meta.url);
function diagnostic(phase,details={}){const m=process.memoryUsage();console.error(JSON.stringify({diagnostic:phase,rssBytes:m.rss,heapUsedBytes:m.heapUsed,externalBytes:m.external,arrayBufferBytes:m.arrayBuffers,...details}));}
diagnostic('harness-start',{execArgv:process.execArgv});
const option=name=>process.argv.find(arg=>arg.startsWith('--'+name+'='))?.slice(name.length+3);
if(process.argv.includes('--help')){console.log('Read-only native FightEngine stage QA. Requires --stages=id,id and fresh --out=directory; @napi-rs/canvas and sharp.');process.exit(0);}
const root=resolve(process.env.HALO_QA_ROOT||fileURLToPath(new URL('../',import.meta.url)));
const stageIds=option('stages')?.split(',').filter(Boolean),output=option('out');
if(!stageIds?.length||new Set(stageIds).size!==stageIds.length||!output)throw Error('Unique stage IDs and a fresh output directory are required.');
const out=resolve(output),digest=bytes=>createHash('sha256').update(bytes).digest('hex');
try{await access(join(out,'report.json'));throw Error('Existing evidence is preserved. Choose a fresh --out directory.');}catch(error){if(error.code!=='ENOENT')throw error;}
const dependency=name=>{
  try{return require(name);}catch(original){
    for(const directory of [process.env.HALO_QA_NODE_MODULES,process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES].filter(Boolean)){
      try{return createRequire(join(directory,'__halo_stage21_loader.cjs'))(name);}catch{}
    }
    throw original;
  }
};
const report={schema:1,label:'stage-pass21-native',generatedAt:new Date().toISOString(),root,stageIds,
  browserTest:false,httpTest:false,actorStateInjected:false,checks:[],errors:[],assets:[],cases:[],captures:[],sourceHashes:{},
  method:{renderer:'Actual FightEngine.update/render and the original native Canvas drawImage. Each stage is selected through its normal stage descriptor.',
    inputs:'Only registered InputState keydown/keyup callbacks receive synthetic native events. No actor position, facing, health, phase, presentation or clock is assigned.',
    decoder:'PNG encoding normalized in memory for native decoding; every decoded RGBA byte is compared before/after.',
    scope:'Existing fighters exercise initial stage composition, movement in both directions, release to idle, exact planes, live parallax and cache admission.'},
  limits:['Native Canvas does not exercise Chromium, DOM/CSS, HTTP, actual browser keyboard delivery or service workers.',
    'No new fighter pose, attack, contact, guard, finisher, stage hazard, original timing or 1:1 artistic fidelity is certified.',
    'Two static stage planes and their runtime parallax do not constitute a new source animation.']};
function check(name,passed,detail){report.checks.push({name,passed:!!passed,...(detail===undefined?{}:{detail})});if(!passed){report.errors.push(name);throw Error(name);}}
let engine;
await mkdir(out,{recursive:true});
try{
  diagnostic('canvas-load-before');
  const {createCanvas,Image}=dependency('@napi-rs/canvas');
  diagnostic('canvas-load-after');
  diagnostic('sharp-load-before');
  const sharp=dependency('sharp');
  diagnostic('sharp-load-after');
  report.dependencies={node:process.version,canvas:dependency('@napi-rs/canvas/package.json').version,sharp:sharp.versions.sharp};
  report.harnessSHA256=digest(await readFile(fileURLToPath(import.meta.url)));
  for(const path of ['art/registry.json','src/sprite-manifest.js','src/stage-bitmap-manifest.js','src/fight.js','src/renderers.js','src/stage-bitmaps.js','src/stage-bitmap-compositions.js'])report.sourceHashes[path]={before:digest(await readFile(resolve(root,path)))};
  const events=new Map(),documentEvents=new Map(),storage=new Map();
  const listen=(map,type,callback)=>{if(!map.has(type))map.set(type,new Set());map.get(type).add(callback);};
  globalThis.window={};globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key)};
  globalThis.document={hidden:false,addEventListener:(type,callback)=>listen(documentEvents,type,callback),removeEventListener:(type,callback)=>documentEvents.get(type)?.delete(callback)};
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{getGamepads:()=>[],vibrate:()=>false,userActivation:{hasBeenActive:false}}});
  globalThis.addEventListener=(type,callback)=>listen(events,type,callback);globalThis.removeEventListener=(type,callback)=>events.get(type)?.delete(callback);
  globalThis.requestAnimationFrame=()=>0;globalThis.cancelAnimationFrame=()=>{};
  const mod=async name=>{diagnostic('source-import-before',{path:'src/'+name});const result=await import(pathToFileURL(resolve(root,'src',name)).href);diagnostic('source-import-after',{path:'src/'+name});return result;};
  const [{getFighter,getStage,createCombatProfile,VERSION},{SPRITES},{spriteCache},
    {stageBitmapCache,stageBitmapFrames,pinCombatAssets,prepareCombatAssets,stageBitmapFor},{FightEngine}]=await Promise.all([
      mod('data.js'),mod('sprite-manifest.js'),mod('sprite-system.js'),mod('stage-bitmaps.js'),mod('fight.js')]);
  report.version=VERSION;
  const fighters=['bom_pyramid_head_129','bom_butcher_123'].map(getFighter),stages=stageIds.map(getStage);
  check('All selected stage IDs resolve exactly',stages.every((stage,index)=>stage?.id===stageIds[index]));
  check('Existing test fighters retain combat eligibility',fighters.every(fighter=>createCombatProfile(fighter).referencePolicy.combatEnabled));
  const frames=[...new Map(fighters.flatMap(fighter=>SPRITES[fighter.id].frames).concat(stageBitmapFrames(stages)).map(frame=>[frame.path,frame])).values()];
  const bytesByPath=new Map(),imagePaths=new WeakMap();
  for(const frame of frames){
    diagnostic('png-read-before',{path:frame.path});
    const bytes=await readFile(resolve(root,frame.path));check('Exact original file '+frame.path,bytes.length===frame.bytes&&digest(bytes)===frame.sha256);
    diagnostic('png-decode-before',{path:frame.path});
    const normalized=await sharp(bytes).png().toBuffer(),before=await sharp(bytes).ensureAlpha().raw().toBuffer(),after=await sharp(normalized).ensureAlpha().raw().toBuffer();
    diagnostic('png-decode-after',{path:frame.path});
    check('Lossless in-memory decoder adapter '+frame.path,before.equals(after));bytesByPath.set(frame.path,normalized);
    report.assets.push({path:frame.path,sha256:frame.sha256,bytes:bytes.length,width:frame.width,height:frame.height,rgbaSha256:digest(before)});
  }
  for(const cache of [spriteCache,stageBitmapCache]){
    let latest;
    cache.createImage=()=>{const image=new Image();latest=image;image.decode=undefined;
      for(const property of ['onload','onerror']){let callback;Object.defineProperty(image,property,{get:()=>callback,set:value=>{callback=typeof value==='function'?(...args)=>{void value(...args);}:undefined;}});}
      return image;
    };
    cache.url=path=>{imagePaths.set(latest,path);return bytesByPath.get(path);};
  }
  for(const [index,stage] of stages.entries()){
    diagnostic('stage-before',{stageId:stage.id});
    const art=stageBitmapFor(stage),label=stage.id;
    check(label+': active composition has two independent planes',art?.stageId===stage.id&&art.source===stage.source&&art.mode==='replace'&&art.layers.length===2&&new Set(art.layers.flatMap(layer=>layer.frames.map(frame=>frame.path))).size===2);
    check(label+': static background and parallax foreground are declared',art.layers.every(layer=>layer.frames.length===1&&!layer.loop)&&!art.layers[0].parallaxX&&Math.abs(art.layers[1].parallaxX||0)>0);
    pinCombatAssets(fighters,[stage]);const prepared=await prepareCombatAssets(fighters,[stage]);check(label+': ordinary asset preflight succeeds',prepared.ok,prepared);
    const canvas=createCanvas(1280,720),ctx=canvas.getContext('2d'),draw=ctx.drawImage.bind(ctx),latest=new Map(),painted=new Set();
    const record={stageId:label,source:stage.source,scene:art.scene,runtimeSceneId:stage.referencePolicy?.sceneId||null,commands:[],parallax:[]};report.cases.push(record);
    ctx.drawImage=(image,...args)=>{const result=draw(image,...args),path=imagePaths.get(image);if(path){painted.add(path);const m=ctx.getTransform();latest.set(path,{path,args,matrix:[m.a,m.b,m.c,m.d,m.e,m.f],frame:engine?.frame,actorX:engine?.actors.map(actor=>actor.x)});}return result;};
    engine=new FightEngine(canvas,{p1:fighters[0],p2:fighters[1],stage,mode:'local',timeLimit:0,seed:20000+index,
      artDiagnostic:false,ritualId:'none',stageHazards:false,stageDirector:false,otherworldShift:false,fatalities:false,stageFatalities:false,stageTerrain:false,stageAnimations:true,radioWarning:false});
    check(label+': original input callbacks are registered',events.get('keydown')?.has(engine.input.onDown)&&events.get('keyup')?.has(engine.input.onUp));
    const actor=()=>{const a=engine.actors[0];return {x:a.x,y:a.y,state:a.state,facing:a.facing,grounded:a.grounded,spritePose:a.spriteClock?.pose};};
    const step=()=>{engine.update();engine.render(engine.frame*1000/60);};
    let intro=0;while((engine.phase!=='fight'||engine.texts.some(text=>['intro','round','fight'].includes(text.kind))||engine.actors.some(actor=>actor.presentation))&&intro<1200){engine.update();intro++;}
    check(label+': normal intro reaches live fight',engine.phase==='fight'&&!engine.paused&&!engine.actors.some(actor=>actor.presentation),{introTicks:intro});step();
    const snapshot=()=>art.layers.map(layer=>latest.get(layer.frames[0].path));
    const initial=snapshot();check(label+': exact scenery planes are actually drawn',initial.every(row=>row?.frame===engine.frame));
    check(label+': no unrelated stage art is substituted',[...painted].filter(path=>path.startsWith('assets/stages/')).every(path=>art.layers.some(layer=>layer.frames[0].path===path)));
    check(label+': both existing combat idles are painted',fighters.every(fighter=>painted.has(SPRITES[fighter.id].frames[SPRITES[fighter.id].clips.idle.frames[0]].path)));
    const png=canvas.toBuffer('image/png'),file=label+'.png';await writeFile(join(out,file),png);
    report.captures.push({file,stageId:label,sha256:digest(png),bytes:png.length,width:1280,height:720,purpose:'actual-native-FightEngine',frame:engine.frame});
    function emit(type,code){const event={type,code,repeat:false,defaultPrevented:false,isComposing:false,ctrlKey:false,metaKey:false,altKey:false,target:{isContentEditable:false,closest:()=>null},preventDefault(){this.defaultPrevented=true;}};
      const callbacks=[...(events.get(type)||[])];check(label+': original callback available '+type,callbacks.includes(type==='keydown'?engine.input.onDown:engine.input.onUp));
      for(const callback of callbacks)callback(event);const accepted=type==='keydown'?engine.input.isDown(code):!engine.input.isDown(code);check(label+': physical binding accepted '+type,accepted&&(type!=='keydown'||event.defaultPrevented));record.commands.push({type,code,frame:engine.frame,accepted});
    }
    for(const direction of ['right','left']){
      const before=snapshot(),start=actor(),code=engine.bindings.players[0][direction];emit('keydown',code);
      try{for(let tick=0;tick<18;tick++)step();}finally{emit('keyup',code);}
      const after=snapshot(),end=actor();check(label+': ordinary '+direction+' movement advances actor',direction==='right'?end.x>start.x+1:end.x<start.x-1,{start,end});
      const delta=after.map((row,i)=>row.args.at(-4)-before[i].args.at(-4)),expected=after.map((row,i)=>-(row.actorX.reduce((sum,x)=>sum+x,0)-before[i].actorX.reduce((sum,x)=>sum+x,0))*(art.layers[i].parallaxX||0));
      check(label+': '+direction+' parallax matches actual movement',after.every(row=>row.frame===engine.frame)&&delta.every((value,i)=>Math.abs(value-expected[i])<.03)&&Math.abs(delta[0])<.001&&Math.abs(delta[1])>.05,{delta,expected});
      record.parallax.push({direction,start,end,delta,expected,before,after});
      for(let tick=0;tick<10;tick++)step();check(label+': release returns to grounded idle',actor().state==='idle'&&actor().spritePose==='idle'&&actor().grounded);
    }
    check(label+': no selection portrait was drawn as a combat sprite',fighters.every(fighter=>!painted.has(SPRITES[fighter.id].portrait.path)));
    check(label+': no input remains held',engine.input.held.size===0);record.finalActor=actor();record.finalFrame=engine.frame;
    engine.destroy();check(label+': teardown removes callbacks',!events.get('keydown')?.has(engine.input.onDown)&&!events.get('keyup')?.has(engine.input.onUp));engine=null;
    diagnostic('stage-after',{stageId:label});
    console.log(JSON.stringify({stage:label,passed:true,capture:file}));
  }
  for(const [path,hashes] of Object.entries(report.sourceHashes)){hashes.after=digest(await readFile(resolve(root,path)));check('Source unchanged '+path,hashes.before===hashes.after);}
  for(const frame of frames)check('PNG unchanged '+frame.path,digest(await readFile(resolve(root,frame.path)))===frame.sha256);
}catch(error){report.failure=String(error.stack||error);if(!report.errors.includes(error.message))report.errors.push(error.message);process.exitCode=1;}
finally{engine?.destroy();report.passed=report.errors.length===0;report.completedAt=new Date().toISOString();await writeFile(join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,stages:report.cases.length,captures:report.captures.length,report:join(out,'report.json'),failure:report.failure}));if(!report.passed)process.exitCode=1;}
