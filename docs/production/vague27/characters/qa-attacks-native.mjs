/** Wave27: actual FightEngine attacks through normal key callbacks, native Canvas.
 * No browser/HTTP; no actor positions, clocks, attacks, health, poses or input sets injected.
 * Usage: HALO_QA_ROOT=/checkout node --expose-gc qa-attacks-native.mjs --out=/fresh/evidence
 */
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const root=resolve(process.env.HALO_QA_ROOT||fileURLToPath(new URL('../../../../',import.meta.url)));
const outArg=process.argv.find(x=>x.startsWith('--out='))?.slice(6);
if(!outArg)throw Error('Provide a fresh --out directory.');
const out=resolve(outArg),digest=b=>createHash('sha256').update(b).digest('hex');
try{await access(join(out,'report.json'));throw Error('Existing evidence preserved; choose a new output.');}catch(e){if(e.code!=='ENOENT')throw e;}
await mkdir(out,{recursive:true});
const require=createRequire(import.meta.url),dep=name=>{
 try{return require(name);}catch(original){
  for(const dir of [process.env.HALO_QA_NODE_MODULES,process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES].filter(Boolean)){
   try{return createRequire(join(dir,'__halo_wave27_attack_loader.cjs'))(name);}catch{}
  }
  throw original;
 }
};
const report={schema:1,label:'wave27-static-attack-poses-native',generatedAt:new Date().toISOString(),browserTest:false,httpTest:false,actorStateInjected:false,
 method:'Real FightEngine.update/render and original InputState keydown/keyup callbacks; separate normal P1/P2 duels, no state or held-key-set writes.',
 limits:['Native Canvas with synthetic event delivery is not a browser, HTTP or physical keyboard test.','Static attack frames do not certify an animated clip or original cadence.','Left-facing is engine mirroring, not a separately sourced anatomy.','This checks rendering, input route and recovery; not a full collision/guard/damage/finisher matrix.'],checks:[],errors:[],cases:[],captures:[],assets:[],sourceHashes:{}};
function check(name,passed,detail){report.checks.push({name,passed:!!passed,...(detail===undefined?{}:{detail})});if(!passed)throw Error(name);}
let engine;
try{
 const {createCanvas,Image}=dep('@napi-rs/canvas'),sharp=dep('sharp');
 report.dependencies={node:process.version,canvas:dep('@napi-rs/canvas/package.json').version,sharp:sharp.versions.sharp};
 report.harnessSHA256=digest(await readFile(fileURLToPath(import.meta.url)));
 for(const p of ['art/registry.json','src/sprite-manifest.js','src/stage-bitmap-manifest.js','src/fight.js','src/sprite-animation.js','src/sprite-system.js','src/projectile-bitmaps.js','src/projectile-bitmap-manifest.js'])report.sourceHashes[p]={before:digest(await readFile(resolve(root,p)))};
 const events=new Map(),documentEvents=new Map(),storage=new Map();
 const listen=(map,t,f)=>{if(!map.has(t))map.set(t,new Set());map.get(t).add(f);};
 globalThis.window={};globalThis.document={hidden:false,addEventListener:(t,f)=>listen(documentEvents,t,f),removeEventListener:(t,f)=>documentEvents.get(t)?.delete(f)};
 globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{getGamepads:()=>[],vibrate:()=>false,userActivation:{hasBeenActive:false}}});
 globalThis.addEventListener=(t,f)=>listen(events,t,f);globalThis.removeEventListener=(t,f)=>events.get(t)?.delete(f);
 globalThis.requestAnimationFrame=()=>0;globalThis.cancelAnimationFrame=()=>{};
 const mod=name=>import(pathToFileURL(resolve(root,'src',name)).href);
 const [{getFighter,getStage},{SPRITES},{spriteCache},{stageBitmapCache,stageBitmapFrames,pinCombatAssets,prepareCombatAssets},{projectileBitmapCache,projectileBitmapFrames,prepareProjectileBitmaps},{FightEngine}]=await Promise.all([
  mod('data.js'),mod('sprite-manifest.js'),mod('sprite-system.js'),mod('stage-bitmaps.js'),mod('projectile-bitmaps.js'),mod('fight.js')]);
 const cases=[{id:'sh2_lying_figure_020',pose:'neutralSpecial',directional:false},{id:'sh3_double_head_040',pose:'forwardSpecial',directional:true}];
 const opponent=getFighter('sh2_creeper_025'),stage=getStage('brookhaven_sh2');
 const fighters=[...cases.map(c=>getFighter(c.id)),opponent];
 const descriptors=[...new Map(fighters.flatMap(f=>[...SPRITES[f.id].frames,SPRITES[f.id].portrait]).concat(stageBitmapFrames([stage]),projectileBitmapFrames(fighters)).map(f=>[f.path,f])).values()];
 const frameByPath=new Map(descriptors.map(f=>[f.path,f])),bytesByPath=new Map(),imagePaths=new WeakMap();
 for(const f of descriptors){
  const bytes=await readFile(resolve(root,f.path));check('Exact source bytes: '+f.path,bytes.length===f.bytes&&digest(bytes)===f.sha256);
  const normalized=await sharp(bytes).png().toBuffer();
  const before=await sharp(bytes).ensureAlpha().raw().toBuffer(),after=await sharp(normalized).ensureAlpha().raw().toBuffer();
  check('Lossless in-memory decode adapter: '+f.path,before.equals(after));bytesByPath.set(f.path,normalized);
  report.assets.push({path:f.path,sha256:f.sha256,bytes:f.bytes,width:f.width,height:f.height,rgbaSHA256:digest(before)});
 }
 for(const cache of [spriteCache,stageBitmapCache,projectileBitmapCache]){
  let latest;
  cache.createImage=()=>{const image=new Image();latest=image;image.decode=undefined;
   for(const property of ['onload','onerror']){let callback;Object.defineProperty(image,property,{get:()=>callback,set:value=>{callback=typeof value==='function'?(...args)=>{void value(...args);}:undefined;}});}
   return image;
  };
  cache.url=path=>{imagePaths.set(latest,path);return bytesByPath.get(path);};
 }
 function bounds(row){
  const f=row&&frameByPath.get(row.path);if(!f||row.args.length!==4)return null;
  const [dx,dy,dw,dh]=row.args,[a,b,c,d,tx,ty]=row.matrix,[l,t,r,bt]=f.framingBounds||f.visibleBounds;
  const points=[[l,t],[r,t],[l,bt],[r,bt]].map(([u,v])=>{const x=dx+u/f.width*dw,y=dy+v/f.height*dh;return [a*x+c*y+tx,b*x+d*y+ty];});
  const exterior=[Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))];
  return {exterior,complete:exterior.every(Number.isFinite)&&exterior[0]>=0&&exterior[1]>=0&&exterior[2]<=1280&&exterior[3]<=720};
 }
 for(const candidate of cases)for(const playerIndex of [0,1]){
  const fighter=getFighter(candidate.id),art=SPRITES[candidate.id],clip=art.clips[candidate.pose],facing=playerIndex===0?1:-1;
  const label=candidate.id+'-'+(facing===1?'right':'left'),row={label,fighterId:candidate.id,pose:candidate.pose,playerIndex,facing,commands:[],attackFrames:[],projectileDraws:[],captures:[]};report.cases.push(row);
  check(label+': exact dedicated static clip exists',clip?.frames.length===1&&clip.loop===false&&art.frames[clip.frames[0]].path!==art.frames[art.clips.idle.frames[0]].path);
  const attackFrame=art.frames[clip.frames[0]],idlePath=art.frames[art.clips.idle.frames[0]].path;
  pinCombatAssets([fighter,opponent],[stage]);const preflight=await prepareCombatAssets([fighter,opponent],[stage]);check(label+': normal combat preflight',preflight.ok,preflight);
  const effects=await prepareProjectileBitmaps([fighter,opponent]);check(label+': optional projectile frames decode',effects.ok,effects);
  const canvas=createCanvas(1280,720),ctx=canvas.getContext('2d'),nativeDraw=ctx.drawImage.bind(ctx);let draws=[];
  const state=()=>{const a=engine.actors[playerIndex];return {id:a.data.id,x:a.x,y:a.y,facing:a.facing,state:a.state,grounded:a.grounded,spritePose:a.spriteClock?.pose,attack:a.attack?{key:a.attack.key,frame:a.attack.frame,startup:a.attack.move.startup,active:a.attack.move.active,recovery:a.attack.move.recovery}:null};};
  ctx.drawImage=(image,...args)=>{const result=nativeDraw(image,...args),path=imagePaths.get(image);if(path){const m=ctx.getTransform();draws.push({path,args,matrix:[m.a,m.b,m.c,m.d,m.e,m.f]});}return result;};
  engine=new FightEngine(canvas,{p1:playerIndex===0?fighter:opponent,p2:playerIndex===1?fighter:opponent,stage,mode:'local',timeLimit:0,seed:71124,
   artDiagnostic:false,ritualId:'none',stageHazards:false,stageDirector:false,otherworldShift:false,fatalities:false,stageFatalities:false,stageTerrain:false,stageAnimations:true,radioWarning:false});
  const ownPaths=new Set(art.frames.map(f=>f.path)),ownDraw=()=>draws.findLast(d=>ownPaths.has(d.path));
  function step(){engine.update();draws=[];engine.render(engine.frame*1000/60);return {state:state(),draw:ownDraw()};}
  function emit(type,action){const code=engine.bindings.players[playerIndex][action],event={type,code,repeat:false,defaultPrevented:false,isComposing:false,ctrlKey:false,metaKey:false,altKey:false,target:{isContentEditable:false,closest:()=>null},preventDefault(){this.defaultPrevented=true;}};
   const callbacks=[...(events.get(type)||[])];check(label+': original callback registered '+type+' '+action,callbacks.includes(type==='keydown'?engine.input.onDown:engine.input.onUp));
   for(const fn of callbacks)fn(event);row.commands.push({type,action,code,engineFrame:engine.frame,accepted:type==='keydown'?engine.input.isDown(code):!engine.input.isDown(code)});
   check(label+': ordinary input accepted '+type+' '+action,row.commands.at(-1).accepted);
  }
  async function capture(suffix){const bytes=canvas.toBuffer('image/png'),file=label+'-'+suffix+'.png';await writeFile(join(out,file),bytes);
   const record={file,sha256:digest(bytes),bytes:bytes.length,state:state(),draw:ownDraw(),geometry:bounds(ownDraw()),projectiles:draws.filter(d=>d.path.startsWith('assets/projectiles/'))};report.captures.push(record);row.captures.push(file);
  }
  let intro=0;while((engine.phase!=='fight'||engine.texts.some(t=>['intro','round','fight'].includes(t.kind))||engine.actors[playerIndex].presentation)&&intro<1200){engine.update();intro++;}
  check(label+': intro ends naturally',engine.phase==='fight'&&!engine.actors[playerIndex].presentation,{introTicks:intro});
  step();check(label+': previous idle rendered',ownDraw()?.path===idlePath);
  if(candidate.directional)emit('keydown',facing===1?'right':'left');emit('keydown','special');
  const started=step();check(label+': normal controls choose exact attack',started.state.attack?.key===candidate.pose,started.state);
  check(label+': first attack draw uses new PNG',started.draw?.path===attackFrame.path);await capture('attack-start');
  emit('keyup','special');if(candidate.directional)emit('keyup',facing===1?'right':'left');
  let capturedActive=false,sawAirborne=false;
  for(let tick=0;tick<180;tick++){
   const current=step(),a=current.state.attack;
   for(const draw of draws.filter(d=>d.path.startsWith('assets/projectiles/')))row.projectileDraws.push({engineFrame:engine.frame,...draw});
   if(a?.key===candidate.pose){const g=bounds(current.draw);row.attackFrames.push({engineFrame:engine.frame,...current,geometry:g});if(!current.state.grounded)sawAirborne=true;
    if(!capturedActive&&a.frame>=a.startup&&a.frame<a.startup+a.active){await capture('attack-active');capturedActive=true;}
   }
  }
  check(label+': active phase occurred and captured',capturedActive);
  check(label+': all attack phases keep dedicated PNG',row.attackFrames.length>0&&row.attackFrames.every(r=>r.draw?.path===attackFrame.path));
  check(label+': complete attack silhouettes fit viewport',row.attackFrames.every(r=>r.geometry?.complete));
  check(label+': natural facing agrees with native mirror',row.attackFrames.every(r=>r.state.facing===facing&&Math.sign(r.draw.matrix[0])===facing*attackFrame.facing));
  if(candidate.directional)check(label+': documented short lunge leaves ground through engine',sawAirborne);
  else check(label+': actual standing acid PNG is drawn',row.projectileDraws.some(r=>r.path.startsWith('assets/projectiles/sh2_lying_figure_acid.')));
  check(label+': natural recovery returns to idle',state().attack===null&&state().spritePose==='idle'&&ownDraw()?.path===idlePath,state());
  check(label+': all synthetic keys released',engine.input.held.size===0);await capture('recovered-idle');
  engine.destroy();check(label+': listeners removed',!events.get('keydown')?.has(engine.input.onDown)&&!events.get('keyup')?.has(engine.input.onUp));engine=null;
  console.log(JSON.stringify({case:label,attackFrames:row.attackFrames.length,projectileDraws:row.projectileDraws.length,captures:row.captures.length}));globalThis.gc?.();
 }
 for(const [p,h] of Object.entries(report.sourceHashes)){h.after=digest(await readFile(resolve(root,p)));check('Shared source unchanged during QA: '+p,h.before===h.after);}
 for(const f of descriptors)check('PNG unchanged during QA: '+f.path,digest(await readFile(resolve(root,f.path)))===f.sha256);
}catch(error){report.errors.push(String(error.stack||error));process.exitCode=1;}
finally{engine?.destroy();report.passed=report.errors.length===0;report.completedAt=new Date().toISOString();await writeFile(join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,cases:report.cases.length,captures:report.captures.length,report:join(out,'report.json'),errors:report.errors}));}
